# InvitaPro v2.15.6.1 — Categorías dinámicas en Admin y Cliente

## Objetivo

Completar la integración del catálogo maestro para que las categorías nuevas aparezcan automáticamente en el selector de plantillas del cliente, igual que en el catálogo del administrador.

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `package.json`

## Funciones agregadas y mejoras

- El selector **Cambiar plantilla** del cliente ya no mantiene una lista manual de categorías.
- Las pestañas se generan directamente desde `TEMPLATE_COLLECTIONS`.
- La categoría **Campamentos y retiros** aparece automáticamente en el cliente.
- Cada categoría muestra el número real de diseños disponibles.
- Las futuras categorías añadidas al catálogo maestro aparecerán sin modificar nuevamente el Studio.
- El catálogo del administrador y el selector del cliente comparten la misma definición central.

## Errores corregidos

- Se corrigió la ausencia de **Campamentos y retiros** en el modal del cliente.
- Se eliminó la diferencia entre las categorías visibles en Admin y Cliente.

## Migraciones

No requiere migraciones de Supabase.

## Pruebas recomendadas

1. Ejecutar `pnpm run build`.
2. Entrar como administrador y confirmar que aparece **Campamentos y retiros**.
3. Entrar como cliente, abrir una invitación y seleccionar **Cambiar plantilla**.
4. Confirmar que aparece **Campamentos y retiros** con su contador.
5. Abrir la categoría y verificar que se muestra **Campamento Bosque**.
6. Buscar `campamento`, `cristiano` o `fogata` y validar el resultado.

## Git

```bash
git status
git add .
git commit -m "v2.15.6.1 - Categorías dinámicas en Admin y Cliente"
git push origin main
```
