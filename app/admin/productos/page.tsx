'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Prod = {
  id: string;
  sku: string;
  name: string;
  size: string | null;
  color: string | null;
  price: number;
  current_cost: number;
  image_url: string | null;
};

// Genera un nombre único sin depender de librerías
function uniqueName(ext: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${crypto.randomUUID()}.${ext}`;
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
}

export default function AdminProductos() {
  const [list, setList] = useState<Prod[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from('product')
      .select('id,sku,name,size,color,price,current_cost,image_url')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (!error && data) setList(data as any);
  }
  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const sku = String(fd.get('sku') || '').trim();
    const name = String(fd.get('name') || '').trim();
    const size = String(fd.get('size') || '').trim();
    const color = String(fd.get('color') || '').trim();
    const price = Number(fd.get('price') || '0');
    const cost = Number(fd.get('current_cost') || '0');
    const file = (fd.get('image') as File | null) || null;

    if (!sku || !name || !price) {
      alert('SKU, nombre y precio son obligatorios');
      return;
    }
    setLoading(true);

    let image_url: string | null = null;
    if (file && file.size > 0) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const storagePath = `productos/${uniqueName(ext)}`;
      const up = await supabase.storage.from('productos').upload(storagePath, file, { upsert: false });
      if (up.error) {
        alert('Error subiendo imagen: ' + up.error.message);
        setLoading(false);
        return;
      }
      const pub = supabase.storage.from('productos').getPublicUrl(storagePath);
      image_url = pub.data.publicUrl;
    }

    const { error } = await supabase.from('product').insert({
      sku,
      name,
      size: size || null,
      color: color || null,
      price,
      current_cost: cost,
      image_url
    });

    if (error) {
      alert('Error guardando producto: ' + error.message);
    } else {
      (e.target as HTMLFormElement).reset();
      await load();
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Admin · Productos</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(6,1fr)', alignItems: 'end' }}>
        <input className="input" name="sku" placeholder="SKU" required />
        <input className="input" name="name" placeholder="Nombre" required />
        <input className="input" name="size" placeholder="Talla (ej: 30–36)" />
        <input className="input" name="color" placeholder="Color" />
        <input className="input" name="price" type="number" step="0.01" placeholder="Precio" required />
        <input className="input" name="current_cost" type="number" step="0.01" placeholder="Costo" />
        <input className="input" name="image" type="file" accept="image/*" />
        <button className="btn" disabled={loading} style={{ gridColumn: 'span 2' }}>
          {loading ? 'Guardando…' : 'Guardar'}
        </button>
      </form>

      <div style={{ marginTop: 24 }} />
      <table className="table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Talla</th>
            <th>Color</th>
            <th>Precio</th>
            <th>Costo</th>
            <th>Foto</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td>{p.sku}</td>
              <td>{p.name}</td>
              <td>{p.size || '-'}</td>
              <td>{p.color || '-'}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>${Number(p.current_cost).toFixed(2)}</td>
              <td>{p.image_url ? <a className="badge" href={p.image_url} target="_blank" rel="noreferrer">ver</a> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
