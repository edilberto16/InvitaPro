export type Cliente = {
  id: string; owner_id: string; user_id: string | null; nombre: string; empresa: string | null;
  telefono: string | null; correo: string | null; direccion: string | null; notas: string | null;
  estado: 'activo' | 'inactivo'; created_at: string; updated_at: string;
};
export type Evento = {
  id: string; cliente_id: string; nombre: string; tipo: string; fecha: string; hora: string | null;
  zona_horaria: string; lugar: string | null; direccion: string | null; maps_url: string | null;
  estado: 'borrador' | 'confirmado' | 'finalizado' | 'cancelado'; notas: string | null;
  created_at: string; updated_at: string; clientes?: { id: string; nombre: string } | null;
};
export type Invitacion = {
  id: string; evento_id: string; plantilla_id: string | null; titulo: string; slug: string;
  modalidad: 'simple' | 'rsvp' | 'pases'; estado: 'borrador' | 'pendiente_activacion' | 'publicada' | 'pausada' | 'vencida' | 'archivada';
  design_json: Record<string, unknown>; color_principal: string | null; musica_url: string | null;
  whatsapp: string | null; fecha_publicacion: string | null; fecha_expiracion: string | null;
  review_token?: string | null; review_enabled?: boolean;
  created_at: string; updated_at: string;
  eventos?: ({ id: string; nombre: string; tipo: string; fecha: string; hora: string | null; lugar: string | null; direccion: string | null; maps_url: string | null; cliente_id: string; clientes?: { id: string; nombre: string } | null }) | null;
};
export type Invitado = {
  id: string; invitacion_id: string; nombre: string; telefono: string | null; correo: string | null;
  adultos_permitidos: number; ninos_permitidos: number; mesa: string | null; codigo: string;
  estado: 'pendiente' | 'confirmado' | 'no_asistira'; notas: string | null; created_at: string; updated_at: string;
  invitaciones?: { id: string; titulo: string; slug: string; estado: string } | null;
};
export type Confirmacion = {
  id: string; invitacion_id: string; invitado_id: string | null; nombre: string | null; asistira: boolean;
  adultos: number; ninos: number; mensaje: string | null; telefono: string | null; created_at: string; updated_at: string;
  invitados?: { nombre: string; codigo: string } | null; invitaciones?: { titulo: string; slug: string } | null;
};
export type Plantilla = {
  id: string; owner_id: string | null; nombre: string; categoria: string; descripcion: string | null;
  preview_url: string | null; design_json: Record<string, unknown>; premium: boolean; activa: boolean;
  created_at: string; updated_at: string;
};

export function messageFromError(error: unknown) {
  if (!error || typeof error !== 'object') return 'Ocurrió un error inesperado.';
  const value = error as { message?: string; details?: string; hint?: string; code?: string };
  if (value.code === '23503') return 'No se puede eliminar porque existen registros relacionados.';
  if (value.code === '23505') return 'Ya existe otro registro con ese valor único.';
  return value.message || value.details || value.hint || 'Ocurrió un error inesperado.';
}
export function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export function formatDate(value?: string | null) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
export function initials(value: string) {
  return value.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'IP';
}
export function designValue<T>(invite: Pick<Invitacion, 'design_json'>, key: string, fallback: T): T {
  const value = invite.design_json?.[key];
  return (value === undefined || value === null ? fallback : value) as T;
}
export function randomCode() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 7).toUpperCase();
}
