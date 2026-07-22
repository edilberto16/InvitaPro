# InvitaPro v2.7.1 — Activación desde Admin

PATCH incremental: solo archivos modificados.

## Cambios
- Dashboard muestra contador `Por activar`.
- Estado técnico `pendiente_activacion` ahora aparece como `Pendiente de activación`.
- Dashboard muestra botón `Revisar`.
- Admin > Invitaciones incluye `Revisar y activar`.
- Nuevo modal de activación:
  - plan solicitado;
  - cliente/evento/fecha;
  - URL que se habilitará;
  - checklist de revisión/pago;
  - vista previa;
  - `Confirmar y publicar`.
- Al confirmar:
  - estado → `publicada`;
  - fecha_publicacion se establece;
  - `activation_status=approved`;
  - `activation_payment_status=confirmado`;
  - se habilita copiar/compartir el enlace definitivo.

## SQL
No requiere SQL adicional si ya ejecutaste la migración v2.7.0 que agregó `pendiente_activacion`.

## Instalación
Copia este PATCH sobre la raíz de InvitaPro y reemplaza únicamente los archivos incluidos.

Después:
`pnpm run build`
`pnpm dev`

Prueba:
1. Dashboard → Revisar una invitación pendiente.
2. Admin > Invitaciones → filtro Por activar.
3. Revisar y activar → Confirmar y publicar.
4. Regresa al cliente → Mi InvitaPro.
