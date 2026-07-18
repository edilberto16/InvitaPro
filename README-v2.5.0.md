# InvitaPro v2.5.0 — Self-Service Foundation

Construido sobre `InvitaPro-Actual(13).zip`.

## Incluye
- Mi InvitaPro ahora muestra dos caminos cuando el cliente no tiene evento:
  - Quiero que InvitaPro la diseñe → `/solicitar`
  - Prefiero crearla yo → `/mi-cuenta/crear`
- Wizard de autoservicio de 3 pasos:
  1. Tipo de evento.
  2. Plantilla del catálogo real.
  3. Datos básicos del evento.
- Crea evento + invitación como BORRADOR.
- Vincula el borrador al cliente autenticado.
- Guarda `plantilla_id`, contenido inicial y modalidad `autoservicio`.
- No publica ni cobra todavía.

## Instalación
1. Copia el contenido del ZIP sobre la raíz de InvitaPro y reemplaza archivos.
2. Ejecuta en Supabase SQL Editor:
   `supabase/migrations/20260718_v2_5_0_self_service_foundation.sql`
3. Ejecuta:
   `pnpm run build`
4. Si compila:
   `pnpm dev`
5. Inicia sesión con una cuenta cliente SIN evento y prueba:
   `/mi-cuenta`

## Siguiente fase
v2.6: Editor guiado del borrador, fotografías, portada, ubicación, música y preview real.
