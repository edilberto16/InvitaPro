# InvitaPro v2.16.1 — Studio 3.0, Fase 1

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/client-portal.css`
- `package.json`

## Funciones agregadas

- Modo **Enfoque** para editar viendo únicamente el canvas de la invitación.
- Controles de zoom de la vista previa entre 60 % y 120 %.
- Selector visible para vista celular, tableta y escritorio.
- Atajos de teclado para cambiar dispositivos y activar el modo enfoque.
- Canvas desplazable que conserva la interacción directa y el drag & drop de bloques.
- Presentación de escritorio ampliada en modo enfoque.

## Atajos

- `1`: vista celular.
- `2`: vista tableta.
- `3`: vista escritorio.
- `F`: activar o desactivar modo enfoque.
- `Esc`: salir del modo enfoque.
- `+` / `-`: aumentar o reducir zoom.
- `Ctrl + Z`: deshacer.
- `Ctrl + Shift + Z`: rehacer.

## Compatibilidad

- No requiere migración de Supabase.
- Conserva el autosave, historial, selector de plantillas y sincronización del preview.
- Versión de paquete actualizada a `2.16.1`.

## Pruebas recomendadas

1. Abrir una invitación en Studio.
2. Cambiar entre celular, tableta y escritorio.
3. Probar zoom de 60 % a 120 %.
4. Activar modo enfoque y salir con `Esc`.
5. Arrastrar un bloque dentro del preview y verificar que el orden cambie también en Estructura.
6. Editar un texto y confirmar actualización inmediata del preview.
7. Ejecutar `pnpm run build`.
