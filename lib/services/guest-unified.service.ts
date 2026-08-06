import type { ConfirmationRecord } from "../../components/guests/confirmations-center";

export type BaseGuestRecord = {
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
  notas: string | null;
};

export type UnifiedGuestRecord = BaseGuestRecord & {
  source: "guest" | "confirmation";
  guest_id: string | null;
  confirmation_id: string | null;
  mensaje: string | null;
  updated_at: string | null;
  readonly_record: boolean;
  adultos_confirmados: number;
  ninos_confirmados: number;
  confirmacion_at: string | null;
};

function normalizePhone(value: string | null | undefined) {
  return (value || "").replace(/\D/g, "");
}

function normalizeText(value: string | null | undefined) {
  return (value || "").trim().toLocaleLowerCase("es-MX");
}

function confirmationName(item: ConfirmationRecord) {
  return item.invitados?.nombre || item.nombre || "Invitado";
}

function confirmationPhone(item?: ConfirmationRecord | null) {
  return item?.telefono || item?.invitados?.telefono || null;
}

function findGuestMatch(guests: BaseGuestRecord[], confirmation: ConfirmationRecord) {
  if (confirmation.invitado_id) {
    const byId = guests.find((guest) => guest.id === confirmation.invitado_id);
    if (byId) return byId;
  }

  const phone = normalizePhone(confirmationPhone(confirmation));
  if (phone) {
    const byPhone = guests.find((guest) => normalizePhone(guest.telefono) === phone);
    if (byPhone) return byPhone;
  }

  const name = normalizeText(confirmationName(confirmation));
  if (name) {
    const sameName = guests.filter((guest) => normalizeText(guest.nombre) === name);
    if (sameName.length === 1) return sameName[0];
  }

  return null;
}

function statusFromConfirmation(item: ConfirmationRecord) {
  return item.asistira ? "confirmado" : "no_asistira";
}

export function buildUnifiedGuests(
  guests: BaseGuestRecord[],
  confirmations: ConfirmationRecord[]
): UnifiedGuestRecord[] {
  const latestConfirmationByGuest = new Map<string, ConfirmationRecord>();
  const unmatchedConfirmations: ConfirmationRecord[] = [];

  for (const confirmation of confirmations) {
    const match = findGuestMatch(guests, confirmation);
    if (!match) {
      unmatchedConfirmations.push(confirmation);
      continue;
    }

    const current = latestConfirmationByGuest.get(match.id);
    if (!current || new Date(confirmation.updated_at).getTime() > new Date(current.updated_at).getTime()) {
      latestConfirmationByGuest.set(match.id, confirmation);
    }
  }

  const mergedGuests = guests.map<UnifiedGuestRecord>((guest) => {
    const confirmation = latestConfirmationByGuest.get(guest.id);
    return {
      ...guest,
      source: "guest",
      guest_id: guest.id,
      confirmation_id: confirmation?.id || null,
      mensaje: confirmation?.mensaje || null,
      updated_at: confirmation?.updated_at || null,
      readonly_record: false,
      estado: confirmation ? statusFromConfirmation(confirmation) : guest.estado,
      adultos_confirmados: confirmation?.asistira ? confirmation.adultos || 0 : 0,
      ninos_confirmados: confirmation?.asistira ? confirmation.ninos || 0 : 0,
      confirmacion_at: confirmation?.updated_at || confirmation?.created_at || null,
      telefono: guest.telefono || confirmationPhone(confirmation),
    };
  });

  const publicResponses = unmatchedConfirmations.map<UnifiedGuestRecord>((confirmation) => ({
    id: `confirmation:${confirmation.id}`,
    invitacion_id: confirmation.invitacion_id,
    nombre: confirmationName(confirmation),
    telefono: confirmationPhone(confirmation),
    correo: confirmation.invitados?.correo || null,
    estado: statusFromConfirmation(confirmation),
    adultos_permitidos: confirmation.adultos || 0,
    ninos_permitidos: confirmation.ninos || 0,
    mesa: confirmation.invitados?.mesa || null,
    codigo: confirmation.invitados?.codigo || "",
    checkin_adultos: 0,
    checkin_ninos: 0,
    checkin_at: null,
    ultimo_checkin_at: null,
    notas: null,
    source: "confirmation",
    guest_id: null,
    confirmation_id: confirmation.id,
    mensaje: confirmation.mensaje || null,
    updated_at: confirmation.updated_at,
    readonly_record: true,
    adultos_confirmados: confirmation.asistira ? confirmation.adultos || 0 : 0,
    ninos_confirmados: confirmation.asistira ? confirmation.ninos || 0 : 0,
    confirmacion_at: confirmation.updated_at || confirmation.created_at || null,
  }));

  return [...mergedGuests, ...publicResponses].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es-MX", { sensitivity: "base" })
  );
}
