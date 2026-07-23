# InvitaPro v2.9.2 — Control real por plan

PATCH incremental sobre `InvitaPro-Actual(18)`.

## Nueva lógica
Antes de enviar una solicitud de activación, InvitaPro valida realmente el plan elegido.

### Se valida:
- límite de invitados/pases;
- límite de fotos en galería;
- música incluida o no;
- RSVP/pases incluido o no;
- uso de plantilla Premium;
- datos mínimos: nombre, fecha y plantilla.

Si algo excede el plan:
- no se envía la solicitud;
- se muestra exactamente qué debe corregir el cliente;
- puede quitar la función o elegir un plan superior.

## Snapshot comercial
Al solicitar activación se guarda también:
- plan;
- nombre del plan;
- precio;
- límites;
- funciones habilitadas.

Así, cambios futuros de precios o límites no alteran lo que el cliente contrató.

## Archivo modificado
- `app/mi-cuenta/studio/[id]/page.tsx`

No requiere SQL nuevo si ya ejecutaste v2.8.0.
