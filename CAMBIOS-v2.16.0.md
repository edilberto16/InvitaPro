# InvitaPro v2.16.0 — Studio Sync Engine (Fase 1)

## Objetivo
Sincronizar inmediatamente la plantilla seleccionada en Studio con la vista previa real, sin depender de recargar manualmente la página.

## Archivos modificados
- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/invitacion/[slug]/page.tsx`
- `package.json`

## Cambios realizados
- El estado enviado por Studio a la vista previa ahora incluye `templateKey`.
- La invitación en modo Studio usa el `templateKey` recibido para resolver el motor visual, la paleta y el perfil de la plantilla.
- Al aplicar una plantilla se actualiza el estado local de Studio y se reinicia de forma controlada el iframe de vista previa como respaldo.
- El canal `postMessage` sigue sincronizando título, color, contenido, secciones, variantes y ahora también la plantilla.
- Versión actualizada a `2.16.0`.

## Resultado esperado
Al aplicar, por ejemplo, `Campamento Bosque`, `Noche de Fogata` o cualquier otra plantilla:

1. La tarjeta lateral cambia.
2. El color principal se actualiza.
3. La vista previa real cambia al nuevo diseño.
4. No es necesario guardar, cerrar el modal ni recargar el navegador para ver la nueva plantilla.

## Migraciones
No requiere migraciones de Supabase.

## Pruebas recomendadas
1. Ejecutar `pnpm run build`.
2. Abrir una invitación en Studio.
3. Cambiar entre dos plantillas de familias distintas.
4. Confirmar que la vista previa cambia inmediatamente.
5. Editar título, color y visibilidad de una sección para confirmar que la sincronización existente continúa funcionando.
6. Recargar Studio y comprobar que la última plantilla aplicada permanece guardada.

## Git
```bash
git status
git add .
git commit -m "v2.16.0 - Studio Sync Engine fase 1"
git push origin main
```
