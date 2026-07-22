# InvitaPro v2.7.4 — Botón Revisar y activar

PATCH incremental.

Corrige el botón **Revisar y activar** en Admin → Invitaciones:

- Icono blanco visible.
- Texto blanco con alto contraste.
- Texto puede usar dos líneas sin cortarse.
- Fondo verde más sólido.
- Mejor estado hover.
- No cambia ninguna lógica.

Archivo modificado:
- `app/admin/activation-v2.7.1.css`

No requiere SQL.

Después de copiar el PATCH:
`pnpm run build`
`pnpm dev`
