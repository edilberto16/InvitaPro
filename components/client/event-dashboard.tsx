"use client";

import Link from "next/link";
import { AccountAvatar } from "../account/avatar";

export type DashboardActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone?: "success" | "warning" | "neutral";
  kind?: "rsvp" | "message" | "checkin" | "neutral";
};

export type DashboardTask = {
  id: string;
  title: string;
  detail: string;
  href?: string;
  action?: string;
  done?: boolean;
};

type EventDashboardProps = {
  userName: string;
  avatarUrl: string | null;
  planName: string;
  eventName: string;
  eventType: string;
  date: string;
  venue: string;
  invitationStatus: string;
  modalityLabel: string;
  invitationId?: string;
  invitationSlug?: string;
  published: boolean;
  publicRsvp: boolean;
  personalized: boolean;
  guestCount: number;
  confirmedCount: number;
  pendingCount: number;
  rejectedCount: number;
  expectedPeople: number;
  arrivedPeople: number;
  albumCount: number;
  wishCount: number;
  pendingWishCount: number;
  activities: DashboardActivity[];
  tasks: DashboardTask[];
  onShare: () => void;
};

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    publicada: "Publicada",
    borrador: "Borrador",
    pendiente_activacion: "Pendiente de activación",
    activa: "Activa",
    finalizado: "Finalizado",
  };
  return labels[value] || value.replaceAll("_", " ");
}

function activityIcon(item: DashboardActivity) {
  if (item.kind === "message") return "✉";
  if (item.kind === "checkin") return "✓";
  if (item.tone === "warning") return "!";
  return "✓";
}

export default function EventDashboard({
  userName,
  avatarUrl,
  planName,
  eventName,
  eventType,
  date,
  venue,
  invitationStatus,
  modalityLabel,
  invitationId,
  invitationSlug,
  published,
  publicRsvp,
  personalized,
  guestCount,
  confirmedCount,
  pendingCount,
  rejectedCount,
  expectedPeople,
  arrivedPeople,
  albumCount,
  wishCount,
  pendingWishCount,
  activities,
  tasks,
  onShare,
}: EventDashboardProps) {
  const responseBase = guestCount || confirmedCount + pendingCount + rejectedCount;
  const confirmationPercent = responseBase ? Math.round((confirmedCount / responseBase) * 100) : 0;
  const attendancePercent = expectedPeople ? Math.round((arrivedPeople / expectedPeople) * 100) : 0;
  const primaryTask = tasks.find((task) => !task.done) || tasks[0];

  return (
    <div id="evento" className="smart-dashboard">
      <section className="smart-dashboard-welcome">
        <div className="smart-dashboard-user">
          <AccountAvatar name={userName} value={avatarUrl} className="smart-dashboard-avatar" />
          <div>
            <p className="eyebrow">Mi InvitaPro</p>
            <h1>Hola{userName ? `, ${userName}` : ""} 👋</h1>
            <p>Todo lo importante de tu evento, en un solo lugar.</p>
          </div>
        </div>
        <span className="smart-dashboard-plan">{planName} · {published ? "Activo" : "En preparación"}</span>
      </section>

      <section className="smart-dashboard-event-card">
        <div className="smart-dashboard-event-copy">
          <div className="event-dashboard-kicker">
            <span>{eventType}</span>
            <b className={`status-${invitationStatus}`}>{statusLabel(invitationStatus)}</b>
          </div>
          <h2>{eventName}</h2>
          <p>{date} · {venue}</p>
          <small>{modalityLabel}</small>
        </div>
        <div id="compartir" className="smart-dashboard-primary-actions">
          {invitationId && <Link className="client-primary" href={`/mi-cuenta/studio/${invitationId}`}>Editar invitación</Link>}
          {published && invitationSlug && <Link className="client-secondary" href={`/invitacion/${invitationSlug}`} target="_blank">Ver publicada</Link>}
          <button className="client-secondary" type="button" onClick={onShare} disabled={!published}>Compartir</button>
        </div>
      </section>

      <section className="smart-dashboard-stats" aria-label="Resumen del evento">
        <article><span>Invitados</span><strong>{guestCount}</strong><small>{personalized ? `${expectedPeople} personas esperadas` : publicRsvp ? "Respuestas registradas" : "Sin RSVP"}</small></article>
        <article className="is-positive"><span>Confirmados</span><strong>{confirmedCount}</strong><small>{publicRsvp ? `${confirmationPercent}% de confirmación` : "No aplica"}</small></article>
        <article className="is-warning"><span>Pendientes</span><strong>{pendingCount}</strong><small>{publicRsvp ? "Por responder" : "No aplica"}</small></article>
        <article className="is-danger"><span>No asistirán</span><strong>{rejectedCount}</strong><small>Respuestas negativas</small></article>
        <article><span>Mensajes</span><strong>{wishCount}</strong><small>{pendingWishCount ? `${pendingWishCount} pendientes` : "Todo revisado"}</small></article>
        <article><span>Fotografías</span><strong>{albumCount}</strong><small>Recibidas en el álbum</small></article>
        <article><span>Check-in</span><strong>{personalized ? arrivedPeople : "—"}</strong><small>{personalized ? `${attendancePercent}% de ${expectedPeople || 0}` : "No aplica en RSVP público"}</small></article>
      </section>

      {primaryTask && (
        <section className="smart-dashboard-next-step">
          <div className="smart-dashboard-next-icon">{primaryTask.done ? "✓" : "→"}</div>
          <div>
            <p className="eyebrow">Siguiente paso recomendado</p>
            <h3>{primaryTask.title}</h3>
            <p>{primaryTask.detail}</p>
          </div>
          {primaryTask.href && <Link href={primaryTask.href}>{primaryTask.action || "Continuar"}</Link>}
        </section>
      )}

      <section className="smart-dashboard-grid">
        <article className="smart-dashboard-panel smart-dashboard-progress-panel">
          <div className="smart-dashboard-panel-heading">
            <div><p className="eyebrow">Avance</p><h3>Estado del evento</h3></div>
            <span>{publicRsvp ? `${confirmationPercent}%` : published ? "En línea" : "Borrador"}</span>
          </div>
          {publicRsvp ? (
            <>
              <div className="event-dashboard-progress"><span style={{ width: `${confirmationPercent}%` }} /></div>
              <div className="event-dashboard-progress-legend">
                <span><i className="confirmed" /> {confirmedCount} confirmados</span>
                <span><i className="pending" /> {pendingCount} pendientes</span>
                <span><i className="rejected" /> {rejectedCount} rechazados</span>
              </div>
            </>
          ) : <p>Tu invitación está publicada y lista para compartirse.</p>}
          <div className="smart-dashboard-progress-actions">
            <a href="#confirmaciones">Ver confirmaciones</a>
            <a href="#invitados">Gestionar invitados</a>
          </div>
        </article>

        <article className="smart-dashboard-panel">
          <div className="smart-dashboard-panel-heading"><div><p className="eyebrow">Accesos</p><h3>Acciones rápidas</h3></div></div>
          <div className="smart-dashboard-quick-actions">
            {invitationId && <Link href={`/mi-cuenta/studio/${invitationId}`}><b>✎</b><span>Editar</span></Link>}
            <a href="#invitados"><b>👥</b><span>Invitados</span></a>
            <a href="#confirmaciones"><b>✓</b><span>Confirmaciones</span></a>
            <a href="#mensajes"><b>✉</b><span>Mensajes</span></a>
            <Link href="/mi-cuenta/album"><b>▧</b><span>Álbum</span></Link>
            <button type="button" onClick={onShare} disabled={!published}><b>↗</b><span>Compartir</span></button>
            <Link className={!personalized ? "is-disabled" : ""} href={personalized ? "/mi-cuenta/check-in" : "#"} aria-disabled={!personalized}><b>🎟</b><span>Check-in</span><small>{personalized ? "Abrir" : "No aplica"}</small></Link>
            <Link href="/mi-cuenta/biblioteca"><b>▣</b><span>Biblioteca</span></Link>
          </div>
        </article>

        <article className="smart-dashboard-panel smart-dashboard-activity-panel">
          <div className="smart-dashboard-panel-heading"><div><p className="eyebrow">En tiempo real</p><h3>Actividad reciente</h3></div></div>
          <div className="smart-dashboard-activity-list">
            {activities.length ? activities.map((item) => (
              <div key={item.id}>
                <span className={`smart-dashboard-activity-icon ${item.tone || "neutral"}`} aria-hidden="true">{activityIcon(item)}</span>
                <div><strong>{item.title}</strong><small>{item.detail}</small></div>
                <time>{item.time}</time>
              </div>
            )) : <p className="event-dashboard-empty-copy">La actividad del evento aparecerá aquí.</p>}
          </div>
        </article>

        <article className="smart-dashboard-panel smart-dashboard-share-panel">
          <div><p className="eyebrow">Comparte tu invitación</p><h3>{published ? "Tu enlace está listo" : "Publica para compartir"}</h3><p>{published && invitationSlug ? `/invitacion/${invitationSlug}` : "Cuando publiques, podrás compartir por enlace, QR y WhatsApp."}</p></div>
          <button className="client-primary" type="button" onClick={onShare} disabled={!published}>{published ? "Abrir Centro de Compartir" : "Aún no disponible"}</button>
        </article>
      </section>
    </div>
  );
}
