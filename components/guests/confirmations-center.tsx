"use client";

import { useMemo, useState } from "react";

export type ConfirmationRecord = {
  id: string;
  invitacion_id: string;
  invitado_id: string | null;
  nombre: string | null;
  asistira: boolean;
  adultos: number;
  ninos: number;
  mensaje: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
  invitados?: {
    id: string;
    nombre: string;
    codigo: string;
    correo: string | null;
    mesa: string | null;
    telefono: string | null;
  } | null;
};

type ConfirmationFilter = "todas" | "confirmadas" | "rechazadas" | "comentarios";

type Props = {
  invitationTitle: string;
  invitationSlug: string;
  confirmations: ConfirmationRecord[];
  personalized: boolean;
  onOpenGuest?: (guestId: string) => void;
};

function responseName(item: ConfirmationRecord) {
  return item.invitados?.nombre || item.nombre || "Invitado";
}

function responsePhone(item: ConfirmationRecord) {
  return item.telefono || item.invitados?.telefono || "";
}

function responsePeople(item: ConfirmationRecord) {
  return item.asistira ? (item.adultos || 0) + (item.ninos || 0) : 0;
}

function initials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "IP"
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function quoteCsv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function ConfirmationsCenter({
  invitationTitle,
  invitationSlug,
  confirmations,
  personalized,
  onOpenGuest,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConfirmationFilter>("todas");

  const summary = useMemo(() => {
    const yes = confirmations.filter((item) => item.asistira);
    const no = confirmations.filter((item) => !item.asistira);
    const people = yes.reduce((total, item) => total + responsePeople(item), 0);
    const comments = confirmations.filter((item) => item.mensaje?.trim()).length;
    return { yes: yes.length, no: no.length, people, comments };
  }, [confirmations]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return confirmations.filter((item) => {
      if (filter === "confirmadas" && !item.asistira) return false;
      if (filter === "rechazadas" && item.asistira) return false;
      if (filter === "comentarios" && !item.mensaje?.trim()) return false;
      if (!query) return true;
      return [
        responseName(item),
        responsePhone(item),
        item.mensaje,
        item.invitados?.codigo,
        item.invitados?.mesa,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [confirmations, filter, search]);

  function exportCsv() {
    const headers = [
      "Nombre",
      "Teléfono",
      "Respuesta",
      "Adultos",
      "Niños",
      "Total personas",
      "Mensaje",
      "Código",
      "Mesa",
      "Fecha",
    ];
    const rows = confirmations.map((item) => [
      responseName(item),
      responsePhone(item),
      item.asistira ? "Sí asistirá" : "No asistirá",
      item.adultos,
      item.ninos,
      responsePeople(item),
      item.mensaje || "",
      item.invitados?.codigo || "",
      item.invitados?.mesa || "",
      item.updated_at,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(quoteCsv).join(",")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `confirmaciones-${invitationSlug}.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  function openWhatsApp(item: ConfirmationRecord) {
    const phone = responsePhone(item).replace(/\D/g, "");
    if (!phone) return;
    const text = encodeURIComponent(
      `Hola ${responseName(item)}, gracias por responder la invitación "${invitationTitle}".`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="confirmaciones" className="confirmation-center">
      <div className="confirmation-center-heading">
        <div>
          <p className="eyebrow">RSVP en tiempo real</p>
          <h2>Centro de confirmaciones</h2>
          <p>Consulta quién respondió, cuántas personas asistirán y los mensajes recibidos.</p>
        </div>
        <button
          type="button"
          className="client-secondary"
          onClick={exportCsv}
          disabled={!confirmations.length}
        >
          Exportar CSV
        </button>
      </div>

      <div className="confirmation-center-stats">
        <article>
          <span>Respuestas</span>
          <strong>{confirmations.length}</strong>
          <small>Registradas</small>
        </article>
        <article className="is-success">
          <span>Confirmaron</span>
          <strong>{summary.yes}</strong>
          <small>Respuestas positivas</small>
        </article>
        <article>
          <span>Personas</span>
          <strong>{summary.people}</strong>
          <small>Adultos y niños</small>
        </article>
        <article className="is-warning">
          <span>No asistirán</span>
          <strong>{summary.no}</strong>
          <small>Respuestas negativas</small>
        </article>
        <article>
          <span>Comentarios</span>
          <strong>{summary.comments}</strong>
          <small>Mensajes recibidos</small>
        </article>
      </div>

      <div className="confirmation-center-toolbar">
        <label className="confirmation-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, teléfono, comentario, código o mesa"
          />
        </label>
        <div className="confirmation-filters" role="group" aria-label="Filtrar confirmaciones">
          {([
            ["todas", "Todas"],
            ["confirmadas", "Confirmaron"],
            ["rechazadas", "No asistirán"],
            ["comentarios", "Con comentarios"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "is-active" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="confirmation-list">
          {filtered.map((item) => {
            const name = responseName(item);
            const phone = responsePhone(item);
            return (
              <article key={item.id} className={item.asistira ? "is-confirmed" : "is-declined"}>
                <span className="confirmation-avatar">{initials(name)}</span>
                <div className="confirmation-person">
                  <div>
                    <strong>{name}</strong>
                    <span className={item.asistira ? "status-confirmed" : "status-declined"}>
                      {item.asistira ? "Sí asistirá" : "No asistirá"}
                    </span>
                  </div>
                  <small>
                    {phone || "Sin teléfono"}
                    {item.invitados?.codigo ? ` · Código ${item.invitados.codigo}` : ""}
                    {item.invitados?.mesa ? ` · ${item.invitados.mesa}` : ""}
                  </small>
                  <p>{item.mensaje?.trim() || "Sin comentario"}</p>
                </div>
                <div className="confirmation-attendance">
                  <strong>{responsePeople(item)}</strong>
                  <span>
                    {item.asistira
                      ? `${item.adultos} adulto(s) · ${item.ninos} niño(s)`
                      : "No asistirá"}
                  </span>
                  <time>{formatDate(item.updated_at)}</time>
                </div>
                <div className="confirmation-actions">
                  {personalized && item.invitado_id && onOpenGuest && (
                    <button type="button" onClick={() => onOpenGuest(item.invitado_id!)}>
                      Ver ficha
                    </button>
                  )}
                  <button type="button" disabled={!phone} onClick={() => openWhatsApp(item)}>
                    WhatsApp
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="confirmation-empty">
          <span>✓</span>
          <strong>{confirmations.length ? "No hay coincidencias" : "Aún no hay confirmaciones"}</strong>
          <p>
            {confirmations.length
              ? "Prueba otro término o cambia el filtro."
              : "Las respuestas RSVP aparecerán aquí automáticamente."}
          </p>
        </div>
      )}
    </section>
  );
}
