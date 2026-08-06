"use client";

import { useEffect, useMemo, useState } from "react";

type GuestCrmRecord = {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  estado: string;
  adultos_permitidos: number;
  ninos_permitidos: number;
  mesa: string | null;
  codigo: string;
  checkin_adultos: number;
  checkin_ninos: number;
  checkin_at: string | null;
  ultimo_checkin_at: string | null;
  notas: string | null;
  adultos_confirmados?: number;
  ninos_confirmados?: number;
  confirmacion_at?: string | null;
  mensaje?: string | null;
};

type Props = {
  guest: GuestCrmRecord;
  open: boolean;
  invitationTitle: string;
  personalized: boolean;
  saving: boolean;
  onClose: () => void;
  onShare: () => void;
  onSaveNotes: (notes: string) => void | Promise<void>;
};

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    pendiente: "Pendiente",
    confirmado: "Confirmado",
    no_asistira: "No asistirá",
    rechazado: "Rechazado",
    declinado: "No asistirá",
  };
  return labels[value] || value.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  if (!value) return "Sin registro";
  return new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GuestCrmDrawer({
  guest,
  open,
  invitationTitle,
  personalized,
  saving,
  onClose,
  onShare,
  onSaveNotes,
}: Props) {
  const [notes, setNotes] = useState(guest.notas || "");

  useEffect(() => {
    setNotes(guest.notas || "");
  }, [guest.id, guest.notas]);

  const expected = (guest.adultos_permitidos || 0) + (guest.ninos_permitidos || 0);
  const confirmedAdults = guest.adultos_confirmados || 0;
  const confirmedChildren = guest.ninos_confirmados || 0;
  const confirmedPeople = confirmedAdults + confirmedChildren;
  const arrived = (guest.checkin_adultos || 0) + (guest.checkin_ninos || 0);
  const timeline = useMemo(() => {
    const items = [
      {
        title: statusLabel(guest.estado),
        detail: guest.estado === "confirmado"
          ? `${confirmedAdults} adulto(s) · ${confirmedChildren} niño(s) confirmados`
          : "Estado actual del RSVP",
        time: guest.confirmacion_at ? formatDate(guest.confirmacion_at) : "Actual",
        tone: guest.estado === "confirmado" ? "success" : guest.estado === "pendiente" ? "neutral" : "warning",
      },
    ];
    if (guest.checkin_at) {
      items.push({
        title: "Primer ingreso registrado",
        detail: `${arrived} de ${expected || arrived} persona(s)`,
        time: formatDate(guest.checkin_at),
        tone: "success",
      });
    }
    if (guest.ultimo_checkin_at && guest.ultimo_checkin_at !== guest.checkin_at) {
      items.push({
        title: "Última actualización de check-in",
        detail: `${guest.checkin_adultos} adulto(s) · ${guest.checkin_ninos} niño(s)`,
        time: formatDate(guest.ultimo_checkin_at),
        tone: "neutral",
      });
    }
    return items;
  }, [arrived, confirmedAdults, confirmedChildren, expected, guest]);

  if (!open) return null;

  return (
    <div className="guest-crm-backdrop" onMouseDown={onClose}>
      <aside className="guest-crm-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <header className="guest-crm-header">
          <div>
            <p className="eyebrow">CRM de invitados</p>
            <h2>{guest.nombre}</h2>
            <span className={`guest-crm-status status-${guest.estado}`}>{statusLabel(guest.estado)}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar ficha">×</button>
        </header>

        <section className="guest-crm-summary">
          <article><span>Pases asignados</span><strong>{expected}</strong><small>{guest.adultos_permitidos} adultos · {guest.ninos_permitidos} niños</small></article>
          <article><span>Confirmados</span><strong>{guest.estado === "confirmado" ? confirmedPeople : "—"}</strong><small>{guest.estado === "confirmado" ? `${confirmedAdults} adultos · ${confirmedChildren} niños` : "Sin confirmación positiva"}</small></article>
          <article><span>Check-in</span><strong>{personalized ? arrived : "—"}</strong><small>{personalized ? `${guest.checkin_adultos} adultos · ${guest.checkin_ninos} niños` : "No aplica"}</small></article>
          <article><span>Mesa</span><strong>{guest.mesa || "—"}</strong><small>{guest.codigo ? `Código ${guest.codigo}` : "Sin código"}</small></article>
        </section>

        {guest.mensaje?.trim() && (
          <section className="guest-crm-section">
            <div className="guest-crm-section-heading"><h3>Comentario RSVP</h3></div>
            <p className="guest-crm-rsvp-message">“{guest.mensaje.trim()}”</p>
          </section>
        )}

        <section className="guest-crm-section">
          <div className="guest-crm-section-heading"><h3>Información de contacto</h3><button type="button" onClick={onShare}>WhatsApp</button></div>
          <dl className="guest-crm-details">
            <div><dt>Teléfono</dt><dd>{guest.telefono || "Sin teléfono"}</dd></div>
            <div><dt>Correo</dt><dd>{guest.correo || "Sin correo"}</dd></div>
            <div><dt>Invitación</dt><dd>{invitationTitle}</dd></div>
            <div><dt>Enlace</dt><dd>{personalized ? "Pase personalizado" : "Enlace general"}</dd></div>
          </dl>
        </section>

        <section className="guest-crm-section">
          <div className="guest-crm-section-heading"><h3>Actividad</h3></div>
          <div className="guest-crm-timeline">
            {timeline.map((item, index) => (
              <div key={`${item.title}-${index}`}>
                <i className={item.tone} />
                <div><strong>{item.title}</strong><small>{item.detail}</small></div>
                <time>{item.time}</time>
              </div>
            ))}
          </div>
        </section>

        <section className="guest-crm-section guest-crm-notes">
          <div className="guest-crm-section-heading"><h3>Notas internas</h3><small>Solo visibles para el equipo del evento</small></div>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Alergias, preferencias, transporte, ubicación de mesa o cualquier detalle importante…" />
          <div className="guest-crm-note-actions">
            <span>{notes.length} caracteres</span>
            <button type="button" className="client-primary" disabled={saving || notes === (guest.notas || "")} onClick={() => onSaveNotes(notes)}>
              {saving ? "Guardando…" : "Guardar notas"}
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}
