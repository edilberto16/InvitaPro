# InvitaPro v2.15.5.1 — Catálogo maestro de plantillas

## Cambios

- El panel administrativo continúa usando `lib/template-catalog.ts` como fuente única del catálogo.
- La búsqueda ahora reconoce nombre, familia, variante, descripción, diseño, funciones, categoría y plan.
- Buscar `Luxury` muestra también las variantes de la familia `Luxury Night`, aunque su nombre sea `Midnight Gold`, `Midnight Platinum` o `Midnight Sapphire`.
- La búsqueda ignora mayúsculas, minúsculas y acentos.
- Las búsquedas con varias palabras requieren que todos los términos estén presentes.
- El texto de ayuda del buscador explica que también admite familias y variantes.
- Versión actualizada a `2.15.5.1`.

## Archivos modificados

- `lib/template-catalog.ts`
- `app/admin/plantillas/page.tsx`
- `package.json`

## Migraciones

No requiere migración de Supabase.

## Pruebas recomendadas

1. Abrir `Admin → Plantillas`.
2. Buscar `Luxury`.
3. Confirmar que aparezcan `Luxury Black`, `Luxury Pink`, `Midnight Gold`, `Midnight Platinum` y `Midnight Sapphire`.
4. Buscar `Luxury Night` y confirmar que aparezcan las tres variantes Midnight.
5. Buscar `platino`, `zafiro`, `Signature`, `Bodas` y `RSVP`.
6. Ejecutar `pnpm run build`.

## Git

```bash
git status
git add .
git commit -m "InvitaPro v2.15.5.1 catalogo maestro de plantillas"
git push origin main
```
