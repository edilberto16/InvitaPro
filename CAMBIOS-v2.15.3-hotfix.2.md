# InvitaPro v2.15.3-hotfix.2

## Corrección principal

Se separó correctamente el flujo **crear invitación** del flujo **cambiar plantilla**.

Cuando un cliente abre una demo desde el Studio de una invitación existente y pulsa **Elegir esta plantilla**:

- regresa al Studio de la misma invitación;
- abre la confirmación para aplicar únicamente el nuevo diseño;
- conserva textos, fecha, lugar, invitados, bloques, RSVP y configuración;
- no abre el asistente «Paso 3 de 3»;
- mantiene el cambio como borrador hasta publicar.

## Archivos modificados

- `app/preview/plantilla/page.tsx`
- `app/mi-cuenta/studio/[id]/page.tsx`
- `package.json`

## Parámetros del flujo

La demo conserva:

- `context=change`
- `eventId`
- `returnTo`

Las variantes de una misma familia mantienen también estos parámetros.

## Pruebas recomendadas

1. Abrir una invitación existente en Studio.
2. Pulsar **Cambiar plantilla**.
3. Abrir **Vista previa** en una plantilla diferente.
4. Cambiar entre variantes dentro de la demo.
5. Pulsar **Elegir esta plantilla**.
6. Confirmar que vuelve al mismo Studio y abre el modal para aplicar el diseño.
7. Verificar que el contenido y los invitados no cambian.
8. Guardar y publicar cuando corresponda.

## Git

```bash
git status
git add .
git commit -m "InvitaPro v2.15.3 hotfix flujo cambiar plantilla"
git push origin main
```
