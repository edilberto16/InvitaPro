# InvitaPro v2.15.1-hotfix.1

## Archivos modificados
- `lib/commercial-plans.ts`
- `app/admin/invitaciones/page.tsx`
- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/globals.css`
- `package.json`

## Correcciones
- Unifica la resolución del plan comercial entre Administración y Studio.
- Prioriza `commercial_plan_key` como plan contratado.
- Usa `activation_plan` únicamente como respaldo cuando no existe un plan comercial guardado.
- Inicializa el modal de publicación con el plan real de la invitación.
- Evita que una plantilla Signature cambie silenciosamente el plan contratado.
- Restaura el diseño de las tarjetas de planes en el editor administrativo.
- Conserva la plantilla y el plan como datos independientes.

## Migraciones
No requiere migraciones de Supabase.

## Pruebas recomendadas
1. Abrir una invitación Premium desde Administración y confirmar que muestra Premium · $599.
2. Abrir la misma invitación en Studio y revisar que el modal de publicación seleccione Premium.
3. Aplicar una plantilla Signature desde una cuenta Premium y confirmar que se solicita mejorar el plan, sin cambiarlo automáticamente.
4. Guardar un cambio explícito de plan desde Administración y volver a abrir ambos lados.

## Git
```bash
git status
git add .
git commit -m "InvitaPro v2.15.1 hotfix sincroniza planes"
git push origin main
```
