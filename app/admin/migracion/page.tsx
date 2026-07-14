"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type LocalRecord = Record<string, unknown>;
type LocalData = {
  clientes: LocalRecord[];
  eventos: LocalRecord[];
  invitaciones: LocalRecord[];
  invitados: LocalRecord[];
  confirmaciones: LocalRecord[];
};

type Estado = "pendiente" | "migrando" | "completo" | "error";
type MigrationCounts = Record<keyof LocalData, number>;

const KEYS = {
  clientes: "invitapro_clientes_v1",
  eventos: "invitapro_eventos_v1",
  invitaciones: "invitapro_invitaciones_v1",
  invitados: "invitapro_invitados_v1",
  confirmaciones: "invitapro_confirmaciones_v1",
} as const;

const MAP_KEY = "invitapro_supabase_id_map_v1";
const MIGRATION_KEY = "invitapro_migracion_supabase_v1";
const EMPTY_COUNTS: MigrationCounts = {
  clientes: 0,
  eventos: 0,
  invitaciones: 0,
  invitados: 0,
  confirmaciones: 0,
};

function readArray(key: string): LocalRecord[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? (value as LocalRecord[]) : [];
  } catch {
    return [];
  }
}

function readIdMap(): Record<string, string> {
  try {
    const value = JSON.parse(localStorage.getItem(MAP_KEY) || "{}");
    return value && typeof value === "object" ? (value as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function textOrNull(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return text || null;
}

function isoOrNow(value: unknown): string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
    ? value
    : new Date().toISOString();
}

function validDate(value: unknown): string {
  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? text
    : new Date().toISOString().slice(0, 10);
}

function validTime(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return /^\d{2}:\d{2}(?::\d{2})?$/.test(text) ? text : null;
}

function validEventStatus(value: unknown) {
  const status = String(value ?? "borrador");
  return ["borrador", "confirmado", "finalizado", "cancelado"].includes(status)
    ? status
    : "borrador";
}

function validInvitationStatus(value: unknown) {
  const status = String(value ?? "borrador");
  return ["borrador", "publicada", "pausada", "vencida"].includes(status)
    ? status
    : "borrador";
}

function validGuestStatus(value: unknown) {
  const status = String(value ?? "pendiente");
  if (status === "declinado") return "no_asistira";
  return ["pendiente", "confirmado", "no_asistira"].includes(status)
    ? status
    : "pendiente";
}

function normalizeSlug(value: unknown): string {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || `invitacion-${crypto.randomUUID().slice(0, 8)}`;
}

export default function MigracionPage() {
  const [datos, setDatos] = useState<LocalData>({
    clientes: [],
    eventos: [],
    invitaciones: [],
    invitados: [],
    confirmaciones: [],
  });
  const [estado, setEstado] = useState<Estado>("pendiente");
  const [mensaje, setMensaje] = useState("Comprueba la conexión antes de iniciar la migración.");
  const [progreso, setProgreso] = useState<MigrationCounts>(EMPTY_COUNTS);

  useEffect(() => {
    setDatos({
      clientes: readArray(KEYS.clientes),
      eventos: readArray(KEYS.eventos),
      invitaciones: readArray(KEYS.invitaciones),
      invitados: readArray(KEYS.invitados),
      confirmaciones: readArray(KEYS.confirmaciones),
    });
  }, []);

  const total = useMemo(
    () => Object.values(datos).reduce((sum, lista) => sum + lista.length, 0),
    [datos],
  );

  async function comprobarConexion() {
    setEstado("migrando");
    setMensaje("Comprobando la conexión y el acceso a la base de datos…");
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No hay una sesión activa. Inicia sesión primero.");

      const { error: tableError } = await supabase.from("clientes").select("id").limit(1);
      if (tableError) throw tableError;

      setEstado("completo");
      setMensaje(`Conexión correcta. Usuario: ${user.email ?? user.id}`);
    } catch (error) {
      setEstado("error");
      setMensaje(error instanceof Error ? error.message : "No fue posible conectar con Supabase.");
    }
  }

  async function migrar() {
    setEstado("migrando");
    setProgreso(EMPTY_COUNTS);
    setMensaje("Preparando relaciones e identificadores…");

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Inicia sesión antes de migrar los datos.");

      const persistentMap = readIdMap();
      const mappedId = (entity: string, value: unknown) => {
        const original = String(value ?? "").trim();
        const key = `${entity}:${original || "missing"}`;
        if (!persistentMap[key]) {
          persistentMap[key] = isUuid(original) ? original : crypto.randomUUID();
        }
        return persistentMap[key];
      };

      const guestByLocalId = new Map(datos.invitados.map((item) => [String(item.id ?? ""), item]));
      const guestsByInvitation = new Map<string, number>();
      for (const item of datos.invitados) {
        const localInvitationId = String(item.invitacionId ?? "");
        guestsByInvitation.set(localInvitationId, (guestsByInvitation.get(localInvitationId) ?? 0) + 1);
      }

      const clientes = datos.clientes.map((item) => ({
        id: mappedId("cliente", item.id),
        owner_id: user.id,
        nombre: String(item.nombre ?? "Sin nombre").trim() || "Sin nombre",
        telefono: textOrNull(item.telefono),
        correo: textOrNull(item.correo),
        notas: textOrNull(item.notas),
        estado: "activo",
        created_at: isoOrNow(item.creadoEn),
        updated_at: new Date().toISOString(),
      }));

      if (clientes.length) {
        setMensaje(`Migrando ${clientes.length} clientes…`);
        const { error } = await supabase.from("clientes").upsert(clientes, { onConflict: "id" });
        if (error) throw new Error(`Clientes: ${error.message}`);
      }
      setProgreso((current) => ({ ...current, clientes: clientes.length }));

      const eventos = datos.eventos.map((item) => ({
        id: mappedId("evento", item.id),
        cliente_id: mappedId("cliente", item.clienteId),
        nombre: String(item.nombre ?? "Evento").trim() || "Evento",
        tipo: String(item.tipo ?? "Otro").trim() || "Otro",
        fecha: validDate(item.fecha),
        hora: validTime(item.hora),
        zona_horaria: "America/Mexico_City",
        lugar: textOrNull(item.lugar),
        direccion: textOrNull(item.direccion),
        maps_url: textOrNull(item.mapaUrl),
        estado: validEventStatus(item.estado),
        notas: textOrNull(item.notas),
        created_at: isoOrNow(item.creadoEn),
        updated_at: new Date().toISOString(),
      }));

      if (eventos.length) {
        setMensaje(`Migrando ${eventos.length} eventos…`);
        const { error } = await supabase.from("eventos").upsert(eventos, { onConflict: "id" });
        if (error) throw new Error(`Eventos: ${error.message}`);
      }
      setProgreso((current) => ({ ...current, eventos: eventos.length }));

      const invitaciones = datos.invitaciones.map((item) => {
        const localId = String(item.id ?? "");
        const status = validInvitationStatus(item.estado);
        const requestedMode = String(item.modalidad ?? "");
        const modalidad = ["simple", "rsvp", "pases"].includes(requestedMode)
          ? requestedMode
          : (guestsByInvitation.get(localId) ?? 0) > 0
            ? "pases"
            : "simple";

        return {
          id: mappedId("invitacion", item.id),
          evento_id: mappedId("evento", item.eventoId),
          titulo: String(item.titulo ?? "Invitación").trim() || "Invitación",
          slug: normalizeSlug(item.slug ?? item.titulo),
          modalidad,
          estado: status,
          design_json: {
            version: 1,
            origen: "localStorage",
            plantilla: String(item.plantilla ?? "elegante"),
            mensaje: String(item.mensaje ?? ""),
            vestimenta: String(item.vestimenta ?? ""),
            mapaUrl: String(item.mapaUrl ?? ""),
            componentes: [],
          },
          color_principal: textOrNull(item.colorPrincipal),
          whatsapp: textOrNull(item.whatsapp),
          fecha_publicacion: status === "publicada" ? isoOrNow(item.creadoEn) : null,
          created_at: isoOrNow(item.creadoEn),
          updated_at: new Date().toISOString(),
        };
      });

      if (invitaciones.length) {
        setMensaje(`Migrando ${invitaciones.length} invitaciones…`);
        const { error } = await supabase.from("invitaciones").upsert(invitaciones, { onConflict: "id" });
        if (error) throw new Error(`Invitaciones: ${error.message}`);
      }
      setProgreso((current) => ({ ...current, invitaciones: invitaciones.length }));

      const invitados = datos.invitados.map((item) => ({
        id: mappedId("invitado", item.id),
        invitacion_id: mappedId("invitacion", item.invitacionId),
        nombre: String(item.nombre ?? "Invitado").trim() || "Invitado",
        telefono: textOrNull(item.telefono),
        correo: textOrNull(item.correo),
        adultos_permitidos: Math.max(0, Number(item.adultos ?? 0)),
        ninos_permitidos: Math.max(0, Number(item.ninos ?? 0)),
        mesa: textOrNull(item.mesa),
        codigo: String(item.codigo ?? crypto.randomUUID().slice(0, 8))
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "") || crypto.randomUUID().slice(0, 8).toUpperCase(),
        estado: validGuestStatus(item.estado),
        notas: textOrNull(item.notas),
        created_at: isoOrNow(item.creadoEn),
        updated_at: new Date().toISOString(),
      }));

      if (invitados.length) {
        setMensaje(`Migrando ${invitados.length} invitados y pases…`);
        const { error } = await supabase.from("invitados").upsert(invitados, { onConflict: "id" });
        if (error) throw new Error(`Invitados: ${error.message}`);
      }
      setProgreso((current) => ({ ...current, invitados: invitados.length }));

      const confirmaciones = datos.confirmaciones.map((item) => {
        const localGuestId = String(item.invitadoId ?? "");
        const localGuest = guestByLocalId.get(localGuestId);
        const willAttend = String(item.asistencia ?? "declinado") === "confirmado";

        return {
          id: mappedId("confirmacion", item.id),
          invitacion_id: mappedId("invitacion", item.invitacionId),
          invitado_id: localGuestId ? mappedId("invitado", localGuestId) : null,
          nombre: textOrNull(localGuest?.nombre),
          asistira: willAttend,
          adultos: willAttend ? Math.max(0, Number(item.adultosConfirmados ?? 0)) : 0,
          ninos: willAttend ? Math.max(0, Number(item.ninosConfirmados ?? 0)) : 0,
          mensaje: textOrNull(item.mensaje),
          telefono: textOrNull(localGuest?.telefono),
          created_at: isoOrNow(item.respondidoEn),
          updated_at: isoOrNow(item.respondidoEn),
        };
      });

      if (confirmaciones.length) {
        setMensaje(`Migrando ${confirmaciones.length} confirmaciones…`);
        const { error } = await supabase
          .from("confirmaciones")
          .upsert(confirmaciones, { onConflict: "id" });
        if (error) throw new Error(`Confirmaciones: ${error.message}`);
      }
      setProgreso((current) => ({ ...current, confirmaciones: confirmaciones.length }));

      localStorage.setItem(MAP_KEY, JSON.stringify(persistentMap));
      localStorage.setItem(
        MIGRATION_KEY,
        JSON.stringify({ migratedAt: new Date().toISOString(), userId: user.id, counts: {
          clientes: clientes.length,
          eventos: eventos.length,
          invitaciones: invitaciones.length,
          invitados: invitados.length,
          confirmaciones: confirmaciones.length,
        } }),
      );

      setEstado("completo");
      setMensaje(
        `Migración terminada: ${total} registros guardados en Supabase. Puedes repetirla sin duplicar registros.`,
      );
    } catch (error) {
      setEstado("error");
      setMensaje(error instanceof Error ? error.message : "Ocurrió un error durante la migración.");
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Supabase</p>
          <h1>Migración de datos</h1>
          <p>Mueve la información guardada en este navegador a la base de datos compartida.</p>
        </div>
      </section>

      <section className="migration-grid">
        {Object.entries(datos).map(([nombre, lista]) => (
          <article className="stat-card" key={nombre}>
            <span>{nombre}</span>
            <strong>{lista.length}</strong>
            <small>{progreso[nombre as keyof LocalData]} migrados en esta ejecución</small>
          </article>
        ))}
      </section>

      <section className="panel-card migration-panel">
        <div>
          <span className={`migration-status migration-${estado}`}>
            {estado === "migrando"
              ? "Trabajando"
              : estado === "completo"
                ? "Correcto"
                : estado === "error"
                  ? "Requiere atención"
                  : "Pendiente"}
          </span>
          <h2>Transferencia inicial a Supabase</h2>
          <p>{mensaje}</p>
        </div>

        <ol className="migration-steps">
          <li>Comprueba que la sesión y las tablas estén disponibles.</li>
          <li>Migra clientes, eventos, invitaciones, invitados y confirmaciones en ese orden.</li>
          <li>Los identificadores se conservan en un mapa local para evitar duplicados.</li>
          <li>La información local se conserva hasta validar la migración.</li>
        </ol>

        <div className="migration-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={comprobarConexion}
            disabled={estado === "migrando"}
          >
            Comprobar conexión
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={migrar}
            disabled={estado === "migrando" || total === 0}
          >
            {estado === "migrando" ? "Migrando…" : `Migrar ${total} registros`}
          </button>
        </div>

        <div className="delete-warning">
          <strong>Esta fase no borra localStorage.</strong>
          <span>Después validaremos los registros en Supabase y migraremos cada pantalla para leer desde la nube.</span>
        </div>
      </section>
    </div>
  );
}
