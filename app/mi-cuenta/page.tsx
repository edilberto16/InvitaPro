"use client";

import { useEffect, useMemo, useState } from "react";
import ShareInvitationModal from "../../components/share-invitation-modal";
import GuestCsvImportModal from "../../components/guests/guest-csv-import-modal";
import { createClient } from "../../lib/supabase/client";
import type { Invitacion } from "../../lib/invitapro";

type Event = {
  id: string;
  nombre: string;
  tipo: string;
  fecha: string;
  estado: string;
  lugar: string | null;
};

type Invite = {
  id: string;
  evento_id: string;
  titulo: string;
  slug: string;
  estado: string;
  modalidad: string;
  template_key?: string | null;
  design_json?: Record<string, unknown>;
};

type Guest = {
  id: string;
  invitacion_id: string;
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
};

function initials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "IP";
}

export default function MiCuenta() {
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharingPublic, setSharingPublic] = useState(false);
  const [sharingGuest, setSharingGuest] = useState<Guest | null>(null);
  const [csvImport, setCsvImport] = useState(false);
  const [guestSearch, setGuestSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", user.id)
      .maybeSingle();

    setName(profile?.nombre || user.email?.split("@")[0] || "");

    const { data: client } = await supabase
      .from("clientes")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!client) {
      setLoading(false);
      return;
    }

    const { data: eventRows, error: eventError } = await supabase
      .from("eventos")
      .select("id,nombre,tipo,fecha,estado,lugar")
      .eq("cliente_id", client.id)
      .order("fecha", { ascending: true });

    if (eventError) {
      setError(eventError.message);
      setLoading(false);
      return;
    }

    const currentEvents = (eventRows || []) as Event[];
    setEvents(currentEvents);

    if (!currentEvents.length) {
      setInvites([]);
      setGuests([]);
      setLoading(false);
      return;
    }

    const { data: invitationRows, error: invitationError } = await supabase
      .from("invitaciones")
      .select("id,evento_id,titulo,slug,estado,modalidad,template_key,design_json")
      .in(
        "evento_id",
        currentEvents.map((item) => item.id)
      );

    if (invitationError) {
      setError(invitationError.message);
      setLoading(false);
      return;
    }

    const currentInvites = (invitationRows || []) as Invite[];
    setInvites(currentInvites);

    if (!currentInvites.length) {
      setGuests([]);
      setLoading(false);
      return;
    }

    const { data: guestRows, error: guestError } = await supabase
      .from("invitados")
      .select(
        "id,invitacion_id,nombre,telefono,correo,estado,adultos_permitidos,ninos_permitidos,mesa,codigo,checkin_adultos,checkin_ninos,checkin_at,ultimo_checkin_at"
      )
      .in(
        "invitacion_id",
        currentInvites.map((item) => item.id)
      )
      .order("nombre", { ascending: true });

    if (guestError) setError(guestError.message);
    setGuests((guestRows || []) as Guest[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [supabase]);

  async function salir() {
    await supabase.auth.signOut();
    location.href = "/login";
  }

  const next = events[0];
  const invite = invites.find((item) => item.evento_id === next?.id);
  const related = guests.filter((item) => item.invitacion_id === invite?.id);
  const confirmed = related.filter((item) => item.estado === "confirmado").length;
  const pending = related.filter((item) => item.estado === "pendiente").length;
  const filteredGuests = related.filter((item) =>
    [item.nombre, item.telefono, item.correo, item.codigo]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(guestSearch.trim().toLowerCase())
  );
  const personalized = invite?.modalidad === "pases" || invite?.modalidad === "codigo";
  const expectedPeople = related.reduce(
    (total, item) => total + (item.adultos_permitidos || 0) + (item.ninos_permitidos || 0),
    0
  );
  const arrivedPeople = related.reduce(
    (total, item) => total + (item.checkin_adultos || 0) + (item.checkin_ninos || 0),
    0
  );
  const attendancePercent = expectedPeople
    ? Math.round((arrivedPeople / expectedPeople) * 100)
    : 0;

  function exportGuestReport() {
    if (!invite || !related.length) return;
    const headers = [
      "Invitado",
      "Teléfono",
      "Código",
      "Mesa",
      "Estado RSVP",
      "Adultos permitidos",
      "Niños permitidos",
      "Adultos ingresaron",
      "Niños ingresaron",
      "Última llegada",
    ];
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = related.map((guest) => [
      guest.nombre,
      guest.telefono || "",
      guest.codigo,
      guest.mesa || "",
      guest.estado,
      guest.adultos_permitidos,
      guest.ninos_permitidos,
      guest.checkin_adultos,
      guest.checkin_ninos,
      guest.ultimo_checkin_at || guest.checkin_at || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.map(quote).join(",")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `asistencia-${invite.slug}.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  if (loading) {
    return (
      <main className="client-portal">
        <div className="client-loading">Preparando Mi InvitaPro…</div>
      </main>
    );
  }

  return (
    <main className="client-portal">
      <header className="client-topbar">
        <a href="/" className="client-logo">
          <span>IP</span>
          <strong>InvitaPro</strong>
        </a>
        <nav>
          <a href="#evento">Mi evento</a>
          <a href="#invitados">Invitados</a>
          <a href="/mi-cuenta/biblioteca">Biblioteca</a>
          <a href="#compartir">Compartir</a>
          <button onClick={salir}>Salir</button>
        </nav>
      </header>

      <section className="client-hero">
        <p className="eyebrow">Mi InvitaPro</p>
        <h1>Hola{name ? `, ${name}` : ""} 👋</h1>
        <p>Todo lo importante de tu evento, en un solo lugar.</p>
      </section>

      {error && <p className="client-error">{error}</p>}

      {!next ? (
        <section className="client-empty">
          <span>✦</span>
          <h2>¿Cómo quieres crear tu invitación?</h2>
          <p>
            Elige el camino que mejor se adapte a ti. Podemos encargarnos del diseño o puedes
            comenzar tu invitación ahora mismo desde Mi InvitaPro.
          </p>
          <div className="client-choice-grid">
            <article>
              <span className="client-choice-icon">✦</span>
              <h3>Quiero que InvitaPro la diseñe</h3>
              <p>
                Cuéntanos sobre tu evento y nuestro equipo te ayudará con diseño, contenido y
                configuración.
              </p>
              <a className="client-secondary" href="/solicitar">
                Solicitar ayuda
              </a>
            </article>
            <article className="is-featured">
              <span className="client-choice-icon">✎</span>
              <h3>Prefiero crearla yo</h3>
              <p>
                Elige una plantilla profesional, agrega los datos de tu evento y guarda tu primera
                versión como borrador.
              </p>
              <a className="client-primary" href="/mi-cuenta/crear">
                Crear mi invitación →
              </a>
            </article>
          </div>
          <a className="client-inspiration-link" href="/inspiracion">
            Explorar inspiración antes de decidir
          </a>
        </section>
      ) : (
        <>
          <section id="evento" className="client-event-card">
            <div>
              <span className="client-pill">{next.tipo}</span>
              <h2>{next.nombre}</h2>
              <p>
                {next.fecha} · {next.lugar || "Ubicación por definir"}
              </p>
              <div className="client-actions">
                {invite && next.estado !== "finalizado" && (
                  <a className="client-primary" href={`/mi-cuenta/studio/${invite.id}`}>
                    {invite.estado === "publicada" ? "Editar invitación" : "Continuar editando"}
                  </a>
                )}
                {invite?.estado === "publicada" && (
                  <a className="client-secondary" href={`/invitacion/${invite.slug}`} target="_blank">
                    Ver invitación
                  </a>
                )}
                {invite && (
                  <a className="client-secondary" href="/mi-cuenta/album">
                    Álbum
                  </a>
                )}
                {invite?.estado === "pendiente_activacion" && (
                  <span className="client-pending-activation">⏳ Activación solicitada</span>
                )}
                {next.estado !== "finalizado" ? (
                  <button
                    type="button"
                    className="client-secondary client-share-trigger"
                    onClick={() => setSharingPublic(true)}
                    disabled={!invite || invite.estado !== "publicada"}
                  >
                    Compartir
                  </button>
                ) : (
                  <span className="client-finished-pill">✓ Evento finalizado</span>
                )}
              </div>
            </div>
            <div className="client-event-side">
              <small>Estado</small>
              <strong>{invite?.estado || next.estado}</strong>
              <span>{invite?.modalidad ? `Modalidad ${invite.modalidad}` : ""}</span>
            </div>
          </section>

          <section id="invitados" className="client-stats">
            <article>
              <span>Invitados</span>
              <strong>{related.length}</strong>
              <small>Registros</small>
            </article>
            <article>
              <span>Confirmados</span>
              <strong>{confirmed}</strong>
              <small>RSVP recibidos</small>
            </article>
            <article>
              <span>Pendientes</span>
              <strong>{pending}</strong>
              <small>Por responder</small>
            </article>
          </section>

          {personalized && (
            <section className="client-checkin-summary">
              <div>
                <p className="eyebrow">Check-in</p>
                <h2>Asistencia del evento</h2>
                <p>Consulta cuántas personas han ingresado y descarga el reporte para recepción.</p>
              </div>
              <div className="client-checkin-metrics">
                <article><span>Esperados</span><strong>{expectedPeople}</strong></article>
                <article><span>Han llegado</span><strong>{arrivedPeople}</strong></article>
                <article><span>Asistencia</span><strong>{attendancePercent}%</strong></article>
              </div>
              <div className="client-checkin-progress"><span style={{ width: `${attendancePercent}%` }} /></div>
              <div className="client-checkin-actions">
                <button type="button" className="client-secondary" onClick={exportGuestReport} disabled={!related.length}>Exportar CSV</button>
                <button type="button" className="client-secondary" onClick={() => window.print()} disabled={!related.length}>Imprimir lista</button>
              </div>
            </section>
          )}

          <section className="client-grid">
            <article>
              <p className="eyebrow">Control</p>
              <h3>Invitados y confirmaciones</h3>
              <p>Consulta el avance de las respuestas de tus invitados.</p>
              <div className="client-progress">
                <span
                  style={{
                    width: `${related.length ? Math.round((confirmed / related.length) * 100) : 0}%`,
                  }}
                />
              </div>
              <small>
                {related.length ? Math.round((confirmed / related.length) * 100) : 0}% de registros
                confirmados
              </small>
            </article>

            <article id="compartir">
              <p className="eyebrow">Compartir</p>
              <h3>Tu invitación</h3>
              {invite?.estado === "publicada" ? (
                <>
                  <p>
                    {personalized
                      ? "Comparte el enlace general o envía el pase individual de cada invitado."
                      : "Comparte el mismo enlace público por WhatsApp, correo o redes sociales."}
                  </p>
                  <div className="client-link">/invitacion/{invite.slug}</div>
                  <div className="client-share-actions">
                    <button className="client-primary" onClick={() => setSharingPublic(true)}>
                      Compartir por WhatsApp
                    </button>
                    <button
                      className="client-secondary"
                      onClick={() =>
                        navigator.clipboard.writeText(`${location.origin}/invitacion/${invite.slug}`)
                      }
                    >
                      Copiar enlace
                    </button>
                  </div>
                </>
              ) : (
                <p>
                  {invite?.estado === "pendiente_activacion"
                    ? "Tu solicitud de activación fue recibida. En cuanto sea aprobada, aquí aparecerá el enlace definitivo para compartir."
                    : "Tu invitación todavía no está publicada. Cuando esté lista, aquí aparecerá el enlace para compartir."}
                </p>
              )}
            </article>
          </section>

          {invite && (
            <section className="client-guests-panel">
              <div className="client-guests-heading">
                <div>
                  <p className="eyebrow">Distribución</p>
                  <h2>{personalized ? "Pases personalizados" : "Lista de invitados"}</h2>
                  <p>
                    Importa tu lista desde CSV y comparte la invitación con cada invitado por
                    WhatsApp.
                  </p>
                </div>
                <div className="client-guests-actions">
                  <button className="client-secondary" onClick={() => setCsvImport(true)}>
                    Importar CSV
                  </button>
                  <button className="client-primary" onClick={() => setSharingPublic(true)}>
                    Compartir enlace general
                  </button>
                </div>
              </div>

              <label className="client-guest-search">
                <span>⌕</span>
                <input
                  value={guestSearch}
                  onChange={(event) => setGuestSearch(event.target.value)}
                  placeholder="Buscar invitado, teléfono o código"
                />
              </label>

              {filteredGuests.length ? (
                <div className="client-guest-list">
                  {filteredGuests.map((guest) => (
                    <article key={guest.id}>
                      <span className="client-guest-avatar">{initials(guest.nombre)}</span>
                      <div className="client-guest-info">
                        <strong>{guest.nombre}</strong>
                        <small>
                          {guest.telefono || "Sin teléfono"}
                          {personalized ? ` · Código ${guest.codigo}` : ""}
                        </small>
                        <span>
                          {guest.adultos_permitidos} adulto(s) · {guest.ninos_permitidos} niño(s)
                          {guest.mesa ? ` · ${guest.mesa}` : ""}
                        </span>
                      </div>
                      <span className={`client-guest-status status-${guest.estado}`}>
                        {guest.estado.replace("_", " ")}
                      </span>
                      <button
                        type="button"
                        className="client-secondary"
                        onClick={() => setSharingGuest(guest)}
                      >
                        WhatsApp
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="client-guest-empty">
                  <strong>No hay invitados cargados</strong>
                  <p>Importa un CSV para crear la lista y compartir los enlaces.</p>
                  <button className="client-primary" onClick={() => setCsvImport(true)}>
                    Importar invitados
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {invite && (
        <ShareInvitationModal
          open={sharingPublic}
          onClose={() => setSharingPublic(false)}
          title={invite.titulo}
          path={`/invitacion/${invite.slug}`}
        />
      )}

      {invite && sharingGuest && (
        <ShareInvitationModal
          open={Boolean(sharingGuest)}
          onClose={() => setSharingGuest(null)}
          title={invite.titulo}
          recipient={sharingGuest.nombre}
          phone={sharingGuest.telefono}
          path={
            personalized
              ? `/invitacion/${invite.slug}/${sharingGuest.codigo}`
              : `/invitacion/${invite.slug}`
          }
          personalized={personalized}
        />
      )}

      {invite && csvImport && (
        <GuestCsvImportModal
          open={csvImport}
          invitations={[invite as unknown as Invitacion]}
          onClose={() => setCsvImport(false)}
          onImported={load}
        />
      )}
    </main>
  );
}
