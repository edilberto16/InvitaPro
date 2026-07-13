import Link from 'next/link';

const invitaciones = [
  { nombre: 'XV de Valeria', tipo: 'XV años', fecha: '12 dic 2026', estado: 'Publicada', slug: 'demo-valeria' }
];

export default function AdminPage() {
  return (
    <main className="shell">
      <header className="topbar">
        <div><span className="badge">InvitaPro</span><h1>Panel administrativo</h1></div>
        <Link className="button" href="/admin/invitaciones/nueva">+ Nueva invitación</Link>
      </header>

      <section className="stats">
        <article className="card"><strong>1</strong><span>Invitación activa</span></article>
        <article className="card"><strong>0</strong><span>Confirmaciones</span></article>
        <article className="card"><strong>1</strong><span>Plantilla disponible</span></article>
      </section>

      <section className="card tableCard">
        <h2>Invitaciones</h2>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Evento</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {invitaciones.map((item) => (
                <tr key={item.slug}>
                  <td>{item.nombre}</td><td>{item.tipo}</td><td>{item.fecha}</td><td><span className="status">{item.estado}</span></td>
                  <td><Link href={`/invitacion/${item.slug}`}>Ver</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
