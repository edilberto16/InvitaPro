# InvitaPro v2.15.6.0 — Campamentos y retiros

## Nueva categoría
- Se agregó **Campamentos y retiros** al catálogo maestro.
- La categoría aparece en Admin, Cliente, Studio y flujo de creación.
- Se agregaron términos de búsqueda: campamento, retiro, cristiano, iglesia, jóvenes, bosque y montaña.

## Nueva plantilla
- **Campamento Bosque**, familia **Campamentos de Fe**.
- Plan Premium.
- Estética de bosque, montaña y fogata.
- Preparada para programa por días, qué llevar, ubicación, transporte y registro RSVP.
- Demo contextual con contenido de campamento cristiano.

## Archivos modificados
- `lib/template-catalog.ts`
- `lib/template-engine.ts`
- `components/templates/template-preview-artwork.tsx`
- `app/mi-cuenta/crear/page.tsx`
- `app/mi-cuenta/crear/preview/page.tsx`
- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/admin/plantillas/page.tsx`
- `globals.css`
- `package.json`

## Migraciones
No requiere migración de Supabase.

## Pruebas recomendadas
1. Buscar `campamento`, `cristiano` y `retiro` en Admin y Studio.
2. Crear invitación → seleccionar **Campamento o retiro**.
3. Abrir la demo de **Campamento Bosque**.
4. Elegir la plantilla y confirmar que vuelve al flujo correcto.
5. Ejecutar `pnpm run build`.

## Git
```bash
git status
git add .
git commit -m "v2.15.6.0 - Campamentos y retiros"
git push origin main
```
