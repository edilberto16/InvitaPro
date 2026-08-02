"use client";

import { useEffect, useMemo, useState } from "react";
import ShareInvitationModal from "../../components/share-invitation-modal";
import GuestCsvImportModal from "../../components/guests/guest-csv-import-modal";
import GuestCrmDrawer from "../../components/guests/guest-crm-drawer";
import GuestManagementCenter, { type ManagedGuest } from "../../components/guests/guest-management-center";
import ConfirmationsCenter, { type ConfirmationRecord } from "../../components/guests/confirmations-center";
import EventDashboard, { type DashboardActivity, type DashboardTask } from "../../components/client/event-dashboard";
import { createClient } from "../../lib/supabase/client";
import type { Invitacion } from "../../lib/invitapro";
import {
  invitationModalityLabel,
  modalityCapabilities,
  normalizeInvitationModality,
} from "../../lib/invitation-modality";

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

type ActivityRow = {
  id: string;
  accion: string;
  detalles: Record<string, unknown> | null;
  created_at: string;
};

type Guest = ManagedGuest;


export default function MiCuenta() {
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharingPublic, setSharingPublic] = useState(false);
  const [sharingGuest, setSharingGuest] = useState<Guest | null>(null);
  const [csvImport, setCsvImport] = useState(false);
  const [guestsToDelete, setGuestsToDelete] = useState<Guest[]>([]);
  const [deletingGuests, setDeletingGuests] = useState(false);
  const [activityRows, setActivityRows] = useState<ActivityRow[]>([]);
  const [albumCount, setAlbumCount] = useState(0);
  const [crmGuest, setCrmGuest] = useState<Guest | null>(null);
  const [savingGuestNotes, setSavingGuestNotes] = useState(false);

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
      setConfirmations([]);
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
      setConfirmations([]);
      setActivityRows([]);
      setAlbumCount(0);
      setLoading(false);
      return;
    }

    const activeEventId = currentEvents[0]?.id;
    const activeInvite = currentInvites.find((item) => item.evento_id === activeEventId);
    const [activityResult, albumResult] = await Promise.all([
      activeEventId
        ? supabase
            .from("actividad")
            .select("id,accion,detalles,created_at")
            .eq("evento_id", activeEventId)
            .order("created_at", { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [], error: null }),
      activeInvite
        ? supabase
            .from("album_colaborativo_fotos")
            .select("id", { count: "exact", head: true })
            .eq("invitacion_id", activeInvite.id)
        : Promise.resolve({ count: 0, error: null }),
    ]);
    setActivityRows(((activityResult.data || []) as ActivityRow[]));
    setAlbumCount(albumResult.count || 0);

    const [guestResult, confirmationResult] = await Promise.all([
      supabase
        .from("invitados")
        .select(
          "id,invitacion_id,nombre,telefono,correo,estado,adultos_permitidos,ninos_permitidos,mesa,codigo,checkin_adultos,checkin_ninos,checkin_at,ultimo_checkin_at,notas"
        )
        .in(
          "invitacion_id",
          currentInvites.map((item) => item.id)
        )
        .order("nombre", { ascending: true }),
      supabase
        .from("confirmaciones")
        .select(
          "id,invitacion_id,invitado_id,nombre,asistira,adultos,ninos,mensaje,telefono,created_at,updated_at,invitados(id,nombre,codigo,correo,mesa,telefono)"
        )
        .in(
          "invitacion_id",
          currentInvites.map((item) => item.id)
        )
        .order("updated_at", { ascending: false }),
    ]);

    if (guestResult.error) setError(guestResult.error.message);
    if (confirmationResult.error) setError(confirmationResult.error.message);
    setGuests((guestResult.data || []) as Guest[]);
    setConfirmations((confirmationResult.data || []) as unknown as ConfirmationRecord[]);
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
  const relatedConfirmations = confirmations.filter((item) => item.invitacion_id === invite?.id);
  const personalizedConfirmed = related.filter((item) => item.estado === "confirmado").length;
  const personalizedPending = related.filter((item) => item.estado === "pendiente").length;
  const personalizedRejected = related.filter((item) => ["no_asistira", "rechazado"].includes(item.estado)).length;
  const publicConfirmed = relatedConfirmations.filter((item) => item.asistira).length;
  const publicRejected = relatedConfirmations.filter((item) => !item.asistira).length;
  const modality = normalizeInvitationModality(invite?.modalidad);
  const modalityFeatures = modalityCapabilities(modality);
  const personalized = modalityFeatures.personalizedPasses;
  const confirmed = personalized ? personalizedConfirmed : publicConfirmed;
  const pending = personalized ? personalizedPending : 0;
  const rejected = personalized ? personalizedRejected : publicRejected;
  const responseCount = relatedConfirmations.length;
  const confirmedPeople = relatedConfirmations
    .filter((item) => item.asistira)
    .reduce((total, item) => total + (item.adultos || 0) + (item.ninos || 0), 0);
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

  useEffect(() => {
    if (!invite?.id) return;
    const channel = supabase
      .channel(`client-confirmations-${invite.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "confirmaciones",
          filter: `invitacion_id=eq.${invite.id}`,
        },
        () => void load()
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [invite?.id, supabase]);


  const dashboardActivities: DashboardActivity[] = activityRows.map((item) => {
    const details = item.detalles || {};
    const person = typeof details.nombre === "string" ? details.nombre : "Un invitado";
    const labels: Record<string, { title: string; detail: string; tone: DashboardActivity["tone"] }> = {
      rsvp_confirmado: { title: `${person} confirmó asistencia`, detail: "Nueva respuesta RSVP", tone: "success" },
      rsvp_rechazado: { title: `${person} no asistirá`, detail: "Respuesta RSVP actualizada", tone: "warning" },
      checkin: { title: `${person} ingresó al evento`, detail: "Check-in registrado", tone: "success" },
      checkin_revertido: { title: `Se revirtió un check-in`, detail: person, tone: "warning" },
    };
    const fallback = { title: item.accion.replaceAll("_", " "), detail: person, tone: "neutral" as const };
    const copy = labels[item.accion] || fallback;
    return {
      id: item.id,
      ...copy,
      time: new Date(item.created_at).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    };
  });

  const dashboardTasks: DashboardTask[] = invite ? [
    {
      id: "publish",
      title: invite.estado === "publicada" ? "Invitación publicada" : "Publicar invitación",
      detail: invite.estado === "publicada" ? "Tu enlace ya está disponible para los invitados." : "Termina el diseño y publica cuando esté listo.",
      href: `/mi-cuenta/studio/${invite.id}`,
      action: invite.estado === "publicada" ? "Editar" : "Continuar",
      done: invite.estado === "publicada",
    },
    ...(modalityFeatures.publicRsvp ? [{
      id: "responses",
      title: personalized
        ? pending
          ? `${pending} invitado${pending === 1 ? "" : "s"} por responder`
          : "RSVP al día"
        : `${responseCount} respuesta${responseCount === 1 ? "" : "s"} recibida${responseCount === 1 ? "" : "s"}`,
      detail: personalized
        ? pending
          ? "Comparte o reenvía la invitación a los pendientes."
          : "No tienes respuestas pendientes."
        : "Consulta confirmados, asistentes y comentarios en tiempo real.",
      href: "#confirmaciones",
      action: "Ver",
      done: personalized ? pending === 0 && related.length > 0 : responseCount > 0,
    }] : []),
    {
      id: "album",
      title: albumCount ? `${albumCount} foto${albumCount === 1 ? "" : "s"} en el álbum` : "Activar el álbum",
      detail: albumCount ? "Revisa y modera los recuerdos compartidos." : "Comparte el QR para comenzar a recibir fotografías.",
      href: "/mi-cuenta/album",
      action: albumCount ? "Revisar" : "Abrir",
      done: albumCount > 0,
    },
  ] : [];

  function requestDeleteGuests(items: Guest[]) {
    if (!items.length) return;
    setGuestsToDelete(items);
  }

  async function deleteGuests() {
    if (!guestsToDelete.length || !invite) return;

    setDeletingGuests(true);
    setError("");

    const ids = guestsToDelete.map((guest) => guest.id);
    const { error: deleteError } = await supabase
      .from("invitados")
      .delete()
      .in("id", ids)
      .eq("invitacion_id", invite.id);

    setDeletingGuests(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setGuestsToDelete([]);
    await load();
  }

  async function saveGuestNotes(guestId: string, notes: string) {
    if (!invite) return;
    setSavingGuestNotes(true);
    setError("");

    const { error: notesError } = await supabase
      .from("invitados")
      .update({ notas: notes })
      .eq("id", guestId)
      .eq("invitacion_id", invite.id);

    setSavingGuestNotes(false);
    if (notesError) {
      setError(notesError.message);
      return;
    }

    setGuests((current) =>
      current.map((guest) => (guest.id === guestId ? { ...guest, notas: notes } : guest))
    );
    setCrmGuest((current) => (current?.id === guestId ? { ...current, notas: notes } : current));
  }

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
          {invite && <a href="#invitados">Invitados</a>}
          {modalityFeatures.publicRsvp && <a href="#confirmaciones">Confirmaciones</a>}
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
          {invite && (
            <EventDashboard
              eventName={next.nombre}
              eventType={next.tipo}
              date={next.fecha}
              venue={next.lugar || "Ubicación por definir"}
              invitationStatus={invite.estado || next.estado}
              modalityLabel={invitationModalityLabel(modality)}
              invitationId={invite.id}
              invitationSlug={invite.slug}
              published={invite.estado === "publicada"}
              publicRsvp={modalityFeatures.publicRsvp}
              personalized={personalized}
              guestCount={personalized ? related.length : responseCount}
              confirmedCount={confirmed}
              pendingCount={pending}
              rejectedCount={rejected}
              expectedPeople={personalized ? expectedPeople : confirmedPeople}
              arrivedPeople={arrivedPeople}
              albumCount={albumCount}
              activities={dashboardActivities}
              tasks={dashboardTasks}
              onShare={() => setSharingPublic(true)}
            />
          )}

          {invite && modalityFeatures.publicRsvp && (
            <ConfirmationsCenter
              invitationTitle={invite.titulo}
              invitationSlug={invite.slug}
              confirmations={relatedConfirmations}
              personalized={personalized}
              onOpenGuest={(guestId) => {
                const guest = related.find((item) => item.id === guestId);
                if (guest) setCrmGuest(guest);
              }}
            />
          )}

          {invite && (
            <GuestManagementCenter
              invitationTitle={invite.titulo}
              guests={related}
              onImport={() => setCsvImport(true)}
              onShareGeneral={() => setSharingPublic(true)}
              onOpenGuest={(guest) => setCrmGuest(guest)}
              onShareGuest={(guest) => setSharingGuest(guest)}
              onDeleteGuests={requestDeleteGuests}
              onExport={exportGuestReport}
            />
          )}
        </>
      )}

      {guestsToDelete.length > 0 && (
        <div className="client-modal-backdrop" onMouseDown={() => !deletingGuests && setGuestsToDelete([])}>
          <section className="client-delete-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="client-delete-icon">✕</div>
            <p className="eyebrow">Eliminar invitados</p>
            <h2>¿Eliminar {guestsToDelete.length === 1 ? guestsToDelete[0].nombre : `${guestsToDelete.length} invitados`}?</h2>
            <p>Esta acción eliminará sus pases y confirmaciones asociadas. No se puede deshacer.</p>
            <div className="client-delete-list">
              {guestsToDelete.slice(0, 5).map((guest) => (
                <span key={guest.id}>{guest.nombre}</span>
              ))}
              {guestsToDelete.length > 5 && <span>y {guestsToDelete.length - 5} más…</span>}
            </div>
            <div className="client-delete-actions">
              <button type="button" className="client-secondary" disabled={deletingGuests} onClick={() => setGuestsToDelete([])}>
                Cancelar
              </button>
              <button type="button" className="client-danger" disabled={deletingGuests} onClick={deleteGuests}>
                {deletingGuests ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </section>
        </div>
      )}

      {invite && crmGuest && (
        <GuestCrmDrawer
          guest={crmGuest}
          open={Boolean(crmGuest)}
          invitationTitle={invite.titulo}
          personalized={personalized}
          saving={savingGuestNotes}
          onClose={() => setCrmGuest(null)}
          onShare={() => {
            setSharingGuest(crmGuest);
          }}
          onSaveNotes={(notes) => saveGuestNotes(crmGuest.id, notes)}
        />
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

      {invite && csvImport && modalityFeatures.csvImport && (
        <GuestCsvImportModal
          open={csvImport}
          invitations={[invite as unknown as Invitacion]}
          existingGuests={related}
          onClose={() => setCsvImport(false)}
          onImported={load}
        />
      )}
    </main>
  );
}
