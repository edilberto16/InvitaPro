# InvitaPro v2.11.2-fix2

Corrige el segundo error de TypeScript detectado durante `pnpm run build`.

## Error

`Property 'faq' does not exist on type ...`

## Causa

`toggleSection()` tenía el mismo patrón de indexación que ya se había corregido en `sectionEnabled()`.

## Corrección

- `toggleSection()` ahora usa `Partial<Record<TemplateSectionId, keyof FormState>>`.
- Los nuevos bloques opcionales (`history`, `lodging`, `gifts`, `video`, `faq`) siguen gestionándose fuera del mapa legado.
- No requiere cambios en Supabase ni migración SQL.
