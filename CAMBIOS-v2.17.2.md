# InvitaPro v2.17.2 — Editor de Introducción

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `package.json`

## Funciones agregadas

- Se agregó **Introducción** como sección editable independiente en el menú lateral del Studio.
- El bloque `intro` ahora abre directamente su editor al pulsar **Editar contenido** desde Estructura.
- El mensaje de bienvenida puede modificarse desde un campo dedicado.
- Los cambios utilizan el mismo valor `design_json.mensaje`, por lo que se reflejan en la vista previa, el borrador y la invitación publicada.
- La visibilidad de Introducción queda sincronizada entre el menú lateral y el constructor de bloques.

## Ajustes de interfaz

- La sección Portada conserva el título, la frase de portada, el color y la imagen.
- El mensaje largo de bienvenida se movió a la nueva sección Introducción para evitar confusión.
- Se agregó una nota indicando dónde se mostrará el contenido editado.

## Migraciones

No requiere migraciones de base de datos.

## Validación recomendada

1. Abrir Studio y entrar en **Introducción** desde el menú lateral.
2. Cambiar el mensaje y comprobar que se actualiza en la vista previa.
3. Entrar en **Estructura**, seleccionar Introducción y pulsar **Editar contenido**.
4. Ocultar y volver a mostrar el bloque para validar la sincronización.
5. Guardar y volver a abrir la invitación para confirmar la persistencia.
6. Ejecutar `pnpm run build`.

## Comandos Git

```bash
pnpm run build
git status
git add .
git commit -m "v2.17.2 - Editor de introduccion"
git push origin main
```
