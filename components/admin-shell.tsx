import Link from "next/link";

const menu = [
  ["Dashboard", "/admin", "⌂"],
  ["Clientes", "/admin/clientes", "♙"],
  ["Eventos", "/admin/eventos", "◷"],
  ["Invitaciones", "/admin/invitaciones", "✉"],
  ["Plantillas", "/admin/plantillas", "▦"],
  ["Invitados", "/admin/invitados", "♚"],
  ["Confirmaciones", "/admin/confirmaciones", "✓"],
  ["Configuración", "/admin/configuracion", "⚙"],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand-block">
          <div className="brand-mark">IP</div>
          <div>
            <strong>InvitaPro</strong>
            <span>Panel administrativo</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Navegación principal">
          {menu.map(([label, href, icon]) => (
            <Link key={href} href={href} className="admin-nav-link">
              <span aria-hidden="true">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">EM</div>
          <div>
            <strong>Edilberto May</strong>
            <span>Administrador</span>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">InvitaPro CMS</p>
            <strong>Centro de administración</strong>
          </div>
          <div className="topbar-actions">
            <button type="button" className="icon-button" aria-label="Notificaciones">🔔</button>
            <Link href="/admin/invitaciones" className="button button-primary">+ Nueva invitación</Link>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
