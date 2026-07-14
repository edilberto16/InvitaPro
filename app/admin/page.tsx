"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Cliente = { id: string };
type Evento = { id: string; nombre: string; tipo: string; fecha: string };
type Invitacion = { id: string; eventoId: string; titulo: string; slug: string; estado: "borrador" | "publicada" | "pausada" };
type Invitado = { id: string; invitacionId: string; nombre: string; adultos: number; ninos: number; estado: "pendiente" | "confirmado" | "declinado" };
type Confirmacion = { id: string; invitadoId: string; invitacionId: string; asistencia: "confirmado" | "declinado"; adultosConfirmados: number; ninosConfirmados: number; respondidoEn: string };

const CLIENTES_KEY = "invitapro_clientes_v1";
const EVENTOS_KEY = "invitapro_eventos_v1";
const INVITACIONES_KEY = "invitapro_invitaciones_v1";
const INVITADOS_KEY = "invitapro_invitados_v1";
const CONFIRMACIONES_KEY = "invitapro_confirmaciones_v1";

function formatDate(value: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "recientemente";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} días`;
}

export default function AdminPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [confirmaciones, setConfirmaciones] = useState<Confirmacion[]>([]);
  const [loaded, setLoaded] = useState(false);

  function loadData() {
    try { setClientes(JSON.parse(localStorage.getItem(CLIENTES_KEY) || "[]")); } catch { setClientes([]); }
    try { setEventos(JSON.parse(localStorage.getItem(EVENTOS_KEY) || "[]")); } catch { setEventos([]); }
    try { setInvitaciones(JSON.parse(localStorage.getItem(INVITACIONES_KEY) || "[]")); } catch { setInvitaciones([]); }
    try { setInvitados(JSON.parse(localStorage.getItem(INVITADOS_KEY) || "[]")); } catch { setInvitados([]); }
    try { setConfirmaciones(JSON.parse(localStorage.getItem(CONFIRMACIONES_KEY) || "[]")); } catch { setConfirmaciones([]); }
    setLoaded(true);
  }

  useEffect(() => {
    loadData();
    const refresh = () => loadData();
    window.addEventListener("storage", refresh);
    window.addEventListener("invitapro:confirmacion", refresh);
    const interval = window.setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("invitapro:confirmacion", refresh);
      window.clearInterval(interval);
    };
  }, []);

  const invitationById = useMemo(() => new Map(invitaciones.map((item) => [item.id, item])), [invitaciones]);
  const guestById = useMemo(() => new Map(invitados.map((item) => [item.id, item])), [invitados]);
  const eventById = useMemo(() => new Map(eventos.map((item) => [item.id, item])), [eventos]);

  const published = invitaciones.filter((item) => item.estado === "publicada").length;
  const confirmedResponses = confirmaciones.filter((item) => item.asistencia === "confirmado");
  const declinedResponses = confirmaciones.filter((item) => item.asistencia === "declinado").length;
  const confirmedPeople = confirmedResponses.reduce((sum, item) => sum + item.adultosConfirmados + item.ninosConfirmados, 0);
  const assignedPasses = invitados.reduce((sum, item) => sum + item.adultos + item.ninos, 0);
  const pending = Math.max(invitados.length - confirmaciones.length, 0);
  const responseRate = invitados.length ? Math.round((confirmaciones.length / invitados.length) * 100) : 0;

  const recentInvitations = invitaciones.slice().reverse().slice(0, 5);
  const recentActivity = confirmaciones.slice().sort((a, b) => new Date(b.respondidoEn).getTime() - new Date(a.respondidoEn).getTime()).slice(0, 6);

  if (!loaded) return <div className="dashboard-loading">Preparando dashboard…</div>;

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Resumen general</p>
          <h1>Dashboard</h1>
          <p>Consulta el avance de tus eventos y las respuestas de los invitados.</p>
        </div>
        <Link href="/admin/invitaciones" className="button button-primary">Crear invitación</Link>
      </section>

      <section className="stats-grid dashboard-live-stats">
        <article className="stat-card"><span>Invitaciones activas</span><strong>{published}</strong><small>{invitaciones.length} invitaciones registradas</small></article>
        <article className="stat-card"><span>Personas confirmadas</span><strong>{confirmedPeople}</strong><small>De {assignedPasses} pases asignados</small></article>
        <article className="stat-card"><span>Respuestas recibidas</span><strong>{confirmaciones.length}</strong><small>{pending} invitados pendientes</small></article>
        <article className="stat-card"><span>Clientes</span><strong>{clientes.length}</strong><small>{eventos.length} eventos registrados</small></article>
      </section>

      <section className="dashboard-progress-grid">
        <article className="panel-card confirmation-progress-card">
          <div className="panel-header"><div><h2>Avance de confirmaciones</h2><p>Porcentaje de invitados que ya respondieron.</p></div><strong className="progress-percentage">{responseRate}%</strong></div>
          <div className="progress-track"><span style={{ width: `${responseRate}%` }} /></div>
          <div className="progress-legend"><span><i className="legend-dot confirmed" />{confirmedResponses.length} confirmaron</span><span><i className="legend-dot declined" />{declinedResponses} no asistirán</span><span><i className="legend-dot pending" />{pending} pendientes</span></div>
        </article>
        <article className="panel-card quick-actions-card">
          <div className="panel-header"><div><h2>Acciones rápidas</h2><p>Continúa administrando el evento.</p></div></div>
          <div className="quick-action-grid"><Link href="/admin/invitados"><span>＋</span><strong>Agregar invitados</strong><small>Generar nuevos pases</small></Link><Link href="/admin/confirmaciones"><span>✓</span><strong>Ver respuestas</strong><small>Revisar RSVP</small></Link><Link href="/admin/eventos"><span>◷</span><strong>Administrar eventos</strong><small>Fechas y ubicaciones</small></Link></div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel-card panel-card-wide">
          <div className="panel-header">
            <div><h2>Invitaciones recientes</h2><p>Últimos proyectos disponibles en el sistema.</p></div>
            <Link href="/admin/invitaciones" className="text-link">Ver todas</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Evento</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {recentInvitations.map((item) => {
                  const event = eventById.get(item.eventoId);
                  return <tr key={item.id}><td><strong>{item.titulo}</strong><span>{item.slug}</span></td><td>{event?.tipo || "Evento"}</td><td>{formatDate(event?.fecha || "")}</td><td><span className={`badge ${item.estado === "publicada" ? "badge-success" : "badge-neutral"}`}>{item.estado}</span></td><td>{item.estado === "publicada" && <Link href={`/invitacion/${item.slug}`} className="text-link">Vista previa</Link>}</td></tr>;
                })}
                {!recentInvitations.length && <tr><td colSpan={5}><div className="table-empty-inline">Aún no hay invitaciones. <Link href="/admin/invitaciones">Crear la primera</Link></div></td></tr>}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel-card activity-live-card">
          <div className="panel-header"><div><h2>Actividad RSVP</h2><p>Respuestas más recientes.</p></div><Link href="/admin/confirmaciones" className="text-link">Ver todas</Link></div>
          <div className="activity-list live-activity-list">
            {recentActivity.map((item) => {
              const guest = guestById.get(item.invitadoId);
              const invitation = invitationById.get(item.invitacionId);
              const total = item.adultosConfirmados + item.ninosConfirmados;
              return <div key={item.id}><span className={`activity-icon ${item.asistencia === "confirmado" ? "success" : "declined"}`}>{item.asistencia === "confirmado" ? "✓" : "×"}</span><p><strong>{guest?.nombre || "Invitado"} {item.asistencia === "confirmado" ? "confirmó" : "no asistirá"}</strong><small>{item.asistencia === "confirmado" ? `${total} persona${total === 1 ? "" : "s"} · ` : ""}{invitation?.titulo || "Invitación"}</small><em>{relativeTime(item.respondidoEn)}</em></p></div>;
            })}
            {!recentActivity.length && <div className="activity-empty"><span>✓</span><p><strong>Esperando respuestas</strong><small>Las confirmaciones aparecerán automáticamente aquí.</small></p></div>}
          </div>
        </article>
      </section>
    </div>
  );
}
