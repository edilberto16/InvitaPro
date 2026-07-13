import Link from "next/link";

const stats = [
  { label: "Invitaciones activas", value: "1", detail: "+1 este mes" },
  { label: "Confirmaciones", value: "0", detail: "Sin respuestas todavía" },
  { label: "Clientes", value: "1", detail: "1 cliente registrado" },
  { label: "Plantillas", value: "1", detail: "Plantilla disponible" },
];

export default function AdminPage() {
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Resumen general</p>
          <h1>Dashboard</h1>
          <p>Administra tus eventos, invitaciones y confirmaciones desde un solo lugar.</p>
        </div>
        <Link href="/admin/invitaciones/nueva" className="button button-primary">Crear invitación</Link>
      </section>

      <section className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel-card panel-card-wide">
          <div className="panel-header">
            <div>
              <h2>Invitaciones recientes</h2>
              <p>Últimos eventos creados en el sistema.</p>
            </div>
            <Link href="/admin/invitaciones" className="text-link">Ver todas</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Evento</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>XV de Valeria</strong><span>demo-valeria</span></td>
                  <td>XV años</td>
                  <td>12 dic 2026</td>
                  <td><span className="badge badge-success">Publicada</span></td>
                  <td><Link href="/invitacion/demo-valeria" className="text-link">Vista previa</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header"><div><h2>Actividad</h2><p>Resumen de acciones recientes.</p></div></div>
          <div className="activity-list">
            <div><span className="activity-dot"></span><p><strong>Invitación publicada</strong><small>XV de Valeria · hoy</small></p></div>
            <div><span className="activity-dot"></span><p><strong>Plantilla creada</strong><small>Elegante XV · hoy</small></p></div>
            <div><span className="activity-dot muted"></span><p><strong>Sistema preparado</strong><small>InvitaPro v0.2.0</small></p></div>
          </div>
        </article>
      </section>
    </div>
  );
}
