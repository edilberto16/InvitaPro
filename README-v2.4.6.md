# InvitaPro v2.4.6 — Solicitudes y Leads

## Qué cambia
- `/solicitar` pide WhatsApp/teléfono obligatorio y correo opcional.
- Antes de abrir WhatsApp, guarda la solicitud en Supabase.
- Crea o actualiza automáticamente un prospecto en `clientes`.
- Nueva tabla `solicitudes`.
- Nueva sección CMS: `/admin/solicitudes`.
- El administrador ve teléfono, correo, evento, fecha y plantilla elegida.
- Botón WhatsApp directo para responder.
- Notificación interna al administrador cuando llega una solicitud.

## Instalación
1. Copia el PATCH sobre el proyecto actual.
2. Ejecuta en Supabase SQL Editor:
   `supabase/migrations/20260718_v2_4_6_solicitudes_leads.sql`
3. Copia el contenido de `app/globals-v2.4.6.css` al FINAL de `app/globals.css`.
4. Reinicia `pnpm dev`.
5. Prueba `/solicitar` con un número real y luego revisa `/admin/solicitudes`.

No olvides:
NEXT_PUBLIC_WHATSAPP_NUMBER=52XXXXXXXXXX
