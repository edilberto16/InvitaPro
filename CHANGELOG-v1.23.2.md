# InvitaPro v1.23.2 — Selector de Biblioteca Multimedia

## Nuevo
- Componente reutilizable `MediaLibraryPicker`.
- Selección de portada desde la Biblioteca Multimedia.
- Selección múltiple de fotografías para la galería.
- Selección de música desde archivos previamente cargados.
- Filtrado automático por el evento activo de la invitación.
- Búsqueda por nombre, contador de selección y vista previa.
- La carga directa desde el equipo continúa disponible.

## Datos
No requiere SQL ni columnas nuevas. Reutiliza la tabla `media` y los buckets `event-media` y `event-audio`.

## Validación
```bash
pnpm install
pnpm run build
```
