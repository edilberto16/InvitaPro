import type { TemplateSectionId } from "@/lib/template-engine";

export type StudioBlockCategory =
  | "todos"
  | "evento"
  | "multimedia"
  | "invitados"
  | "premium";

export type StudioBlockVariant = {
  value: string;
  label: string;
};

export type StudioBlockDefinition = {
  id: TemplateSectionId;
  label: string;
  description: string;
  icon: string;
  category: Exclude<StudioBlockCategory, "todos">;
  editorId?: string;
  locked?: boolean;
  variants?: StudioBlockVariant[];
};

const definitions: StudioBlockDefinition[] = [
  { id: "hero", label: "Portada", description: "Primera impresión de tu invitación", icon: "✦", category: "evento", editorId: "portada", locked: true },
  { id: "intro", label: "Introducción", description: "Mensaje de bienvenida", icon: "❦", category: "evento", editorId: "introduccion" },
  { id: "countdown", label: "Cuenta regresiva", description: "Días, horas y minutos para el evento", icon: "◷", category: "evento", editorId: "fecha" },
  { id: "details", label: "Detalles del evento", description: "Fecha, lugar y código de vestimenta", icon: "◇", category: "evento", editorId: "vestimenta" },
  { id: "program", label: "Itinerario", description: "Horarios y actividades", icon: "☷", category: "evento", editorId: "programa", variants: [{ value: "timeline", label: "Línea de tiempo" }, { value: "cards", label: "Tarjetas" }, { value: "compact", label: "Compacto" }] },
  { id: "gallery", label: "Galería", description: "Fotografías y recuerdos", icon: "▧", category: "multimedia", editorId: "galeria", variants: [{ value: "grid", label: "Cuadrícula" }, { value: "editorial", label: "Editorial" }, { value: "carousel", label: "Carrusel" }] },
  { id: "history", label: "Nuestra historia", description: "Una sección narrativa para contar su historia", icon: "♡", category: "evento", editorId: "historia", variants: [{ value: "classic", label: "Clásica" }, { value: "quote", label: "Editorial" }, { value: "split", label: "Dividida" }] },
  { id: "lodging", label: "Hospedaje", description: "Hoteles, tarifas y recomendaciones para invitados", icon: "⌂", category: "evento", editorId: "hospedaje" },
  { id: "gifts", label: "Mesa de regalos", description: "Regalos, transferencias o lluvia de sobres", icon: "♢", category: "evento", editorId: "regalos" },
  { id: "video", label: "Video", description: "Video especial, bienvenida o recuerdo", icon: "▶", category: "multimedia", editorId: "video" },
  { id: "faq", label: "Preguntas frecuentes", description: "Respuestas rápidas para tus invitados", icon: "?", category: "invitados", editorId: "faq" },
  { id: "special_people", label: "Personas especiales", description: "Padrinos, damas, corte, familia o equipo", icon: "♙", category: "evento", editorId: "personas" },
  { id: "hashtag", label: "Hashtag y redes", description: "Hashtag oficial e indicaciones para compartir", icon: "#", category: "multimedia", editorId: "hashtag" },
  { id: "wishes", label: "Buzón de deseos", description: "Recibe mensajes especiales de tus invitados", icon: "💌", category: "invitados", editorId: "deseos" },
  { id: "album", label: "Álbum colaborativo QR", description: "Los invitados pueden subir fotografías del evento", icon: "▧", category: "premium", editorId: "album" },
  { id: "location", label: "Ubicación", description: "Dirección, mapa y cómo llegar", icon: "⌖", category: "evento", editorId: "ubicacion", variants: [{ value: "card", label: "Tarjeta" }, { value: "full", label: "Destacada" }, { value: "minimal", label: "Minimal" }] },
  { id: "rsvp", label: "Confirmación RSVP", description: "Respuesta de asistencia de invitados", icon: "✓", category: "invitados", editorId: "rsvp", variants: [{ value: "card", label: "Tarjeta" }, { value: "featured", label: "Destacada" }, { value: "minimal", label: "Minimal" }] },
];

export const STUDIO_BLOCK_REGISTRY = Object.fromEntries(
  definitions.map((definition) => [definition.id, definition]),
) as Record<TemplateSectionId, StudioBlockDefinition>;

export const STUDIO_BLOCK_DEFINITIONS = definitions;

export const STUDIO_EDITOR_TO_BLOCK = Object.fromEntries(
  definitions
    .filter((definition) => definition.editorId)
    .map((definition) => [definition.editorId as string, definition.id]),
) as Partial<Record<string, TemplateSectionId>>;

export const STUDIO_BLOCK_TO_EDITOR = Object.fromEntries(
  definitions
    .filter((definition) => definition.editorId)
    .map((definition) => [definition.id, definition.editorId as string]),
) as Partial<Record<TemplateSectionId, string>>;

export const STUDIO_EDITOR_BLOCKS = Object.fromEntries(
  definitions
    .filter((definition) => definition.editorId)
    .map((definition) => [definition.editorId as string, [definition.id]]),
) as Partial<Record<string, TemplateSectionId[]>>;

export const STUDIO_BLOCK_VARIANTS = Object.fromEntries(
  definitions
    .filter((definition) => definition.variants?.length)
    .map((definition) => [definition.id, definition.variants]),
) as Partial<Record<TemplateSectionId, StudioBlockVariant[]>>;

export const STUDIO_BLOCK_CATEGORY = Object.fromEntries(
  definitions.map((definition) => [definition.id, definition.category]),
) as Record<TemplateSectionId, Exclude<StudioBlockCategory, "todos">>;

export type StudioBlockVariantMap = Partial<Record<TemplateSectionId, string>>;

export function getStudioBlock(sectionId: TemplateSectionId) {
  return STUDIO_BLOCK_REGISTRY[sectionId];
}
