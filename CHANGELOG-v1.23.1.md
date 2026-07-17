# InvitaPro v1.23.1 — Biblioteca multimedia

## Nuevo

- Módulo `/admin/biblioteca` accesible desde el menú lateral.
- Galería centralizada de imágenes, música, videos y documentos.
- Filtros por tipo de archivo y evento.
- Búsqueda por nombre, evento, invitación o tipo MIME.
- Subida múltiple directamente a Supabase Storage.
- Registro automático en la tabla `media`.
- Reproductor integrado para música y videos.
- Vista previa de imágenes y apertura de documentos.
- Copiar URL pública de cualquier recurso.
- Eliminación coordinada de Storage y de la tabla `media`.
- Diseño responsive para escritorio, tableta y teléfono.

## Compatibilidad

Esta versión utiliza la tabla `media` y los buckets `event-media` y `event-audio` que ya forman parte de `supabase/schema-v1.sql`. No agrega columnas nuevas.

## Validación

```bash
pnpm run build
```
