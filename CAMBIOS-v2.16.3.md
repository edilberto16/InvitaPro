# InvitaPro v2.16.3 — Studio UI Refresh

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/client-portal.css`
- `package.json`

## Cambios

- Se retiraron los botones visibles de Deshacer y Rehacer del encabezado.
- Se retiró el atajo `Ctrl/Cmd + Z` del Studio mientras se diseña un historial completo.
- Se reorganizó la barra superior para evitar desbordamientos y superposiciones.
- Los controles de dispositivo, zoom y enfoque permanecen dentro del panel de vista previa.
- La barra de controles de la vista previa ahora tiene espacio propio y comportamiento estable.
- Las notificaciones de cambio de plantilla aparecen en la esquina inferior derecha y ya no cubren controles.
- Se mejoró el comportamiento responsive del encabezado y del panel de vista previa.

## Migraciones

No requiere migraciones de Supabase.

## Prueba recomendada

```bash
pnpm run build
```

Validar el Studio en escritorio y celular, cambiar de plantilla y comprobar que el aviso no cubra la vista previa.
