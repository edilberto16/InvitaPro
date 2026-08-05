"use client";

import Link from "next/link";

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

export default function EventDashboard({
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
  activities,
  tasks,
  onShare,
}: EventDashboardProps) {
  const responseBase = guestCount || confirmedCount + pendingCount + rejectedCount;
  const confirmationPercent = responseBase
    ? Math.round((confirmedCount / responseBase) * 100)
    : 0;
  const attendancePercent = expectedPeople
    ? Math.round((arrivedPeople / expectedPeople) * 100)
    : 0;

  return (
    <div id="evento" className="event-dashboard">
      <section className="event-dashboard-hero">
        <div>
          <div className="event-dashboard-kicker">
            <span>{eventType}</span>
            <b className={`status-${invitationStatus}`}>{statusLabel(invitationStatus)}</b>
          </div>
          <h2>{eventName}</h2>
          <p>{date} · {venue}</p>
          <small>{modalityLabel}</small>
        </div>
        <div id="compartir" className="event-dashboard-primary-actions">
          {invitationId && (
            <Link className="client-primary" href={`/mi-cuenta/studio/${invitationId}`}>
              Editar invitación
            </Link>
          )}
          {published && invitationSlug && (
            <Link className="client-secondary" href={`/invitacion/${invitationSlug}`} target="_blank">
              Ver publicada
            </Link>
          )}
          <button className="client-secondary" type="button" onClick={onShare} disabled={!published}>
            Compartir
          </button>
        </div>
      </section>

      <section className="event-dashboard-stats" aria-label="Resumen del evento">
        <article>
          <span>Invitados</span>
          <strong>{guestCount}</strong>
          <small>{personalized ? "Con pase asignado" : publicRsvp ? "Respuestas registradas" : "Modalidad sin RSVP"}</small>
        </article>
        <article>
          <span>Confirmados</span>
          <strong>{confirmedCount}</strong>
          <small>{publicRsvp ? `${confirmationPercent}% de confirmación` : "No aplica"}</small>
        </article>
        <article>
          <span>Pendientes</span>
          <strong>{pendingCount}</strong>
          <small>{publicRsvp ? "Por responder" : "No aplica"}</small>
        </article>
        <article>
          <span>Check-in</span>
          <strong>{personalized ? arrivedPeople : "—"}</strong>
          <small>{personalized ? `${attendancePercent}% de ${expectedPeople || 0}` : "Requiere pases"}</small>
        </article>
        <article>
          <span>Álbum</span>
          <strong>{albumCount}</strong>
          <small>Fotos recibidas</small>
        </article>
        <article>
          <span>Mensajes</span>
          <strong>{wishCount}</strong>
          <small>Deseos recibidos</small>
        </article>
      </section>

      <section className="event-dashboard-main-grid">
        <article className="event-dashboard-panel event-dashboard-progress-panel">
          <div className="event-dashboard-panel-heading">
            <div>
              <p className="eyebrow">Avance</p>
              <h3>Estado del evento</h3>
            </div>
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
          ) : (
            <p>Tu invitación utiliza enlace público. Compártela y administra el diseño desde el Studio.</p>
          )}
          <div className="event-dashboard-shortcuts">
            {invitationId && <Link href={`/mi-cuenta/studio/${invitationId}`}>Studio</Link>}
            <Link href="/mi-cuenta/album">Álbum</Link>
            {personalized && <a href="#invitados">Invitados</a>}
            <button type="button" onClick={onShare} disabled={!published}>Compartir</button>
          </div>
        </article>

        <article className="event-dashboard-panel">
          <div className="event-dashboard-panel-heading">
            <div>
              <p className="eyebrow">Siguiente paso</p>
              <h3>Tareas recomendadas</h3>
            </div>
          </div>
          <div className="event-dashboard-task-list">
            {tasks.length ? tasks.map((task) => (
              <div key={task.id} className={task.done ? "is-done" : ""}>
                <span>{task.done ? "✓" : "○"}</span>
                <div><strong>{task.title}</strong><small>{task.detail}</small></div>
                {task.href && <Link href={task.href}>{task.action || "Abrir"}</Link>}
              </div>
            )) : <p className="event-dashboard-empty-copy">Todo está listo para tu evento.</p>}
          </div>
        </article>

        <article className="event-dashboard-panel event-dashboard-activity-panel">
          <div className="event-dashboard-panel-heading">
            <div>
              <p className="eyebrow">En tiempo real</p>
              <h3>Actividad reciente</h3>
            </div>
          </div>
          <div className="event-dashboard-activity-list">
            {activities.length ? activities.map((item) => (
              <div key={item.id}>
                <span
                  className={`event-dashboard-activity-icon ${item.tone || "neutral"}`}
                  aria-hidden="true"
                >
                  {item.kind === "message"
                    ? "✉"
                    : item.kind === "checkin"
                      ? "✓"
                      : item.tone === "warning"
                        ? "!"
                        : "✓"}
                </span>
                <div className="event-dashboard-activity-copy">
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
                <time>{item.time}</time>
              </div>
            )) : <p className="event-dashboard-empty-copy">La actividad del evento aparecerá aquí.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}
