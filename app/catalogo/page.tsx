import { supabase } from '@/lib/supabaseClient';

function formatMoney(n:number){
  return n.toLocaleString('es-EC',{style:'currency',currency:'USD'});
}

export default async function Catalogo(){
  const { data: products, error } = await supabase
    .from('product')
    .select('id, sku, name, size, color, price, image_url')
    .order('created_at', { ascending: false })
    .limit(1000);

  if(error) return <p>Error cargando productos: {error.message}</p>;

  const phone = process.env.NEXT_PUBLIC_WHATSAPP || '';

  return (
    <div>
      <h1 style={{marginBottom:16}}>Catálogo</h1>
      <div className="grid">
        {(products||[]).map((p)=>{
          const msg = encodeURIComponent(`Hola! Me interesa el ${p.sku} - ${p.name} (talla ${p.size||'-'}, color ${p.color||'-'})`);
          const wa = phone ? `https://wa.me/${phone}?text=${msg}` : '#';
          return (
            <div key={p.id} className="card">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name} />
              ) : (
                <div style={{height:220,display:'grid',placeItems:'center',background:'#f3f4f6'}}>Sin foto</div>
              )}
              <div className="bx">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                  <strong>{p.name}</strong>
                  <span className="badge">{p.sku}</span>
                </div>
                <div style={{opacity:.8,margin:'6px 0'}}>Talla: {p.size||'-'} · Color: {p.color||'-'}</div>
                <div style={{fontSize:18,margin:'8px 0'}}>{formatMoney(Number(p.price))}</div>
                <a className="btn" href={wa} target="_blank" rel="noreferrer">Me interesa</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
