# InvitaPro v2.15.5.2 — Sincronización completa del catálogo

## Cambios incluidos

- La landing obtiene sus plantillas destacadas desde `lib/template-catalog.ts`; se eliminó el arreglo local duplicado.
- El catálogo maestro incorpora metadatos públicos de vista previa (`previewImage`, `inspirationSlug` y `publicFeatured`).
- Las vistas previas públicas y del flujo de creación ya no permiten abrir plantillas deshabilitadas.
- La categoría mostrada en las demos se obtiene de la plantilla real y no de un parámetro manipulable de la URL.
- El selector del flujo de creación utiliza el helper central `getAvailableTemplates`.
- Studio incorpora búsqueda por nombre, familia, variante, descripción, funciones, categoría y plan.
- Se agregó un estado vacío cuando la búsqueda de Studio no encuentra diseños.
- Se conservan el retorno a Studio y el contexto de cambio de plantilla en `/preview/plantilla`.

## Archivos modificados

- `lib/template-catalog.ts`
- `app/page.tsx`
- `app/preview/plantilla/page.tsx`
- `app/mi-cuenta/crear/plantilla/page.tsx`
- `app/mi-cuenta/crear/preview/page.tsx`
- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/client-portal.css`
- `package.json`

No requiere migración de Supabase.
