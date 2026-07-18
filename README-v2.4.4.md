# InvitaPro v2.4.4 HOTFIX — /solicitar

Corrige el error de build de Next.js 15:

`useSearchParams() should be wrapped in a suspense boundary at page "/solicitar"`

La solución:
- mueve `useSearchParams()` a `solicitar-form.tsx` (Client Component)
- `page.tsx` lo envuelve en `<Suspense>`

No requiere SQL ni cambios de CSS.

Después de aplicar:
pnpm run build
