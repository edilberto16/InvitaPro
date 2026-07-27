# InvitaPro v2.15.2-hotfix.1

## Corrección

- Se agregó la importación faltante de `normalizeInvitationModality` en la página de pases personalizados.
- Corrige el error de TypeScript durante `pnpm run build`:
  `Cannot find name 'normalizeInvitationModality'`.

## Archivos modificados

- `app/invitacion/[slug]/[codigo]/page.tsx`
- `package.json`

## Migraciones

No requiere migración de Supabase.

## Validación recomendada

```bash
pnpm run build
```

## Git

```bash
git status
git add .
git commit -m "InvitaPro v2.15.2 hotfix import modalidad"
git push origin main
```
