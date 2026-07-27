# InvitaPro v2.15.3-hotfix.1

## Corrección

- La demo completa del catálogo administrativo ya no abre una ruta bajo `/mi-cuenta`.
- Se agregó la ruta neutral `/preview/plantilla` para evitar la redirección del middleware por rol.
- El administrador puede abrir la demo en una pestaña nueva y regresar a `Admin → Plantillas`.
- Las variantes de familia conservan el contexto de administrador o cliente.
- El botón `Elegir esta plantilla` dirige al flujo correspondiente según el origen.

## Archivos

- `app/admin/plantillas/page.tsx`
- `app/preview/plantilla/page.tsx`

## Pruebas

1. Entrar como administrador a `Plantillas`.
2. Abrir `Vista previa` de cualquier diseño.
3. Pulsar `Ver demo completa`.
4. Confirmar que abre `/preview/plantilla?...&origen=admin` en una pestaña nueva.
5. Cambiar entre variantes y regresar al catálogo.
6. Ejecutar `pnpm run build`.
