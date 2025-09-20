export const metadata = { title: 'LoveMe – Catálogo' };
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="header">
          <div className="inner">
            <strong>LoveMe</strong>
            <nav style={{display:'flex',gap:12}}>
              <a href="/catalogo">Catálogo</a>
              <a href="/admin/productos">Admin productos</a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
