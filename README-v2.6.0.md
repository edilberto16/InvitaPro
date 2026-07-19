# InvitaPro v2.6.0 — Mi InvitaPro Studio

Construido para continuar desde v2.5.1.

## Cambios
- El borrador de autoservicio ahora muestra **Continuar editando** en Mi InvitaPro.
- Nuevo editor `/mi-cuenta/studio/[id]`.
- Interfaz inspirada en el constructor Admin:
  - secciones a la izquierda;
  - configuración al centro;
  - preview móvil en vivo a la derecha.
- Catálogo completo de plantillas según el tipo de evento.
- Cambio de plantilla sin perder contenido.
- Secciones:
  Portada, Fecha, Ubicación, Galería, Música, Itinerario, Dress code, Regalos y RSVP.
- Visibilidad por sección.
- Progreso de completitud.
- Guardado del contenido en `design_json`.
- Preview visual en vivo.
- Admin conserva su constructor completo; cliente usa Studio simplificado.

## Importante
La galería todavía aparece como placeholder visual. En v2.6.1 se conecta con Biblioteca Multimedia para subir/seleccionar imágenes.

## Instalación
1. Copia el patch sobre el proyecto actual.
2. Ejecuta en Supabase:
   `supabase/migrations/20260718_v2_6_0_mi_invitapro_studio.sql`
3. `pnpm run build`
4. `pnpm dev`
5. Entra con cliente → Mi InvitaPro → Continuar editando.

## Nota
Esta migración también deja versionado el cambio manual de modalidad `autoservicio`.
