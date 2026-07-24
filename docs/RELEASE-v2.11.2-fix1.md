# InvitaPro v2.11.2-fix1

Corrige el error de TypeScript detectado durante `pnpm run build`.

## Error

`Property 'faq' does not exist on type ...`

## Causa

`TemplateSectionId` ahora incluye nuevos bloques (`history`, `lodging`, `gifts`, `video`, `faq`), pero el mapa usado por `sectionEnabled()` solo contenía los bloques antiguos.

## Corrección

- Se filtran primero los nuevos bloques opcionales.
- El mapa de campos de visibilidad usa `Partial<Record<TemplateSectionId, keyof FormState>>`.
- No requiere cambios en Supabase ni migración SQL.
