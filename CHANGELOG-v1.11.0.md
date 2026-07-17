# InvitaPro v1.11.0 — Motor y catálogo visual de plantillas

## Cambios

- Catálogo centralizado en `lib/template-catalog.ts`.
- La pantalla Plantillas ahora muestra tarjetas visuales, categorías, búsqueda y filtros.
- Se añadieron estados Disponible / Próximamente y niveles Esencial / Premium.
- Cada diseño declara color, descripción y funciones principales.
- El constructor de invitaciones utiliza el mismo catálogo central para evitar duplicados.
- Se retiraron referencias técnicas visibles en la cabecera de Invitaciones.
- Versión del proyecto actualizada a 1.11.0.

## Instalación

1. Copiar el contenido del PATCH sobre el proyecto principal.
2. Ejecutar `pnpm dev` y revisar `/admin/plantillas`.
3. Ejecutar `pnpm run build`.
4. Confirmar y publicar con Git.

Esta versión no necesita migración SQL.
