"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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

type Invitacion = { id: string; titulo: string };
type Invitado = { id: string; nombre: string };
type Confirmacion = {
  id: string;
  invitadoId: string;
  invitacionId: string;
  asistencia: "confirmado" | "declinado";
  adultosConfirmados: number;
  ninosConfirmados: number;
  respondidoEn: string;
};

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  date: string;
  positive: boolean;
};

const INVITACIONES_KEY = "invitapro_invitaciones_v1";
const INVITADOS_KEY = "invitapro_invitados_v1";
const CONFIRMACIONES_KEY = "invitapro_confirmaciones_v1";
const LAST_SEEN_KEY = "invitapro_notificaciones_vistas_en";

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "recientemente";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days === 1 ? "" : "s"}`;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastSeen, setLastSeen] = useState("");
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  function loadNotifications() {
    try {
      const invitaciones = JSON.parse(localStorage.getItem(INVITACIONES_KEY) || "[]") as Invitacion[];
      const invitados = JSON.parse(localStorage.getItem(INVITADOS_KEY) || "[]") as Invitado[];
      const confirmaciones = JSON.parse(localStorage.getItem(CONFIRMACIONES_KEY) || "[]") as Confirmacion[];
      const invitationsById = new Map(invitaciones.map((item) => [item.id, item]));
      const guestsById = new Map(invitados.map((item) => [item.id, item]));

      const items = confirmaciones
        .map((item): NotificationItem => {
          const guest = guestsById.get(item.invitadoId);
          const invitation = invitationsById.get(item.invitacionId);
          const total = item.adultosConfirmados + item.ninosConfirmados;
          const positive = item.asistencia === "confirmado";
          return {
            id: item.id,
            title: positive ? `${guest?.nombre || "Un invitado"} confirmó` : `${guest?.nombre || "Un invitado"} no asistirá`,
            detail: positive
              ? `${total} persona${total === 1 ? "" : "s"} · ${invitation?.titulo || "Invitación"}`
              : invitation?.titulo || "Invitación",
            date: item.respondidoEn,
            positive,
          };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setNotifications(items);
      setLastSeen(localStorage.getItem(LAST_SEEN_KEY) || "");
    } catch {
      setNotifications([]);
    }
  }

  useEffect(() => {
    loadNotifications();
    const refresh = () => loadNotifications();
    window.addEventListener("storage", refresh);
    window.addEventListener("invitapro:confirmacion", refresh);
    const interval = window.setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("invitapro:confirmacion", refresh);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  const unread = useMemo(() => {
    const seen = lastSeen ? new Date(lastSeen).getTime() : 0;
    return notifications.filter((item) => new Date(item.date).getTime() > seen).length;
  }, [notifications, lastSeen]);

  function toggleNotifications() {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = new Date().toISOString();
      localStorage.setItem(LAST_SEEN_KEY, now);
      setLastSeen(now);
    }
  }

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
            <div className="notification-center" ref={panelRef}>
              <button type="button" className="icon-button notification-button" aria-label="Notificaciones" aria-expanded={open} onClick={toggleNotifications}>
                <span aria-hidden="true">🔔</span>
                {unread > 0 && <strong className="notification-count">{unread > 9 ? "9+" : unread}</strong>}
              </button>
              {open && (
                <section className="notification-popover" aria-label="Notificaciones recientes">
                  <div className="notification-popover-header">
                    <div><strong>Actividad reciente</strong><span>{notifications.length ? `${notifications.length} respuestas registradas` : "Sin respuestas todavía"}</span></div>
                    {unread > 0 && <span className="notification-new-label">Nuevas</span>}
                  </div>
                  <div className="notification-list">
                    {notifications.slice(0, 6).map((item) => (
                      <Link href="/admin/confirmaciones" className="notification-item" key={item.id} onClick={() => setOpen(false)}>
                        <span className={`notification-status ${item.positive ? "positive" : "negative"}`}>{item.positive ? "✓" : "×"}</span>
                        <span><strong>{item.title}</strong><small>{item.detail}</small><em>{relativeTime(item.date)}</em></span>
                      </Link>
                    ))}
                    {!notifications.length && <div className="notification-empty"><span>🔔</span><strong>Aún no hay confirmaciones</strong><p>Las respuestas de los invitados aparecerán aquí.</p></div>}
                  </div>
                  <Link href="/admin/confirmaciones" className="notification-footer-link" onClick={() => setOpen(false)}>Ver todas las confirmaciones</Link>
                </section>
              )}
            </div>
            <Link href="/admin/invitaciones" className="button button-primary">+ Nueva invitación</Link>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
