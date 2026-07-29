# InvitaPro v2.15.3-hotfix.3

## Corrección

- Corrige el error de TypeScript `currentPlanKey used before its declaration`.
- El flujo para aplicar una plantilla desde la demo calcula el plan de la invitación dentro del efecto.
- Conserva el comportamiento de bloqueo por plan y el regreso al Studio.

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `package.json`

## Validación

```bash
pnpm run build
```

## Git

```bash
git status
git add .
git commit -m "InvitaPro v2.15.3 hotfix build cambio de plantilla"
git push origin main
```
