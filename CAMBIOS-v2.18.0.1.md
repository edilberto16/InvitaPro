# InvitaPro v2.18.0.1 — Sincronización inmediata de plantilla

## Versión

`2.18.0.1`

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `package.json`
- `CAMBIOS-v2.18.0.1.md`

## Funciones agregadas

- El estado enviado al iframe de vista previa ahora incluye explícitamente `templateKey`.
- La vista previa administrativa se recarga al aplicar una plantilla para garantizar que el motor visual use el nuevo diseño.

## Errores corregidos

- Al pulsar **Aplicar plantilla**, el catálogo y el resumen lateral cambiaban, pero la vista previa podía conservar la plantilla anterior.
- La función que sincroniza el Studio con el iframe no reaccionaba a cambios de `template_key` porque esa propiedad no formaba parte de sus dependencias.

## Migraciones

No requiere migraciones de base de datos.

## Pruebas recomendadas

1. Abrir una invitación en Studio.
2. Pulsar **Cambiar plantilla**.
3. Elegir una plantilla distinta y pulsar **Aplicar plantilla**.
4. Confirmar que el modal se cierre y la vista previa cambie inmediatamente.
5. Cambiar nuevamente a otra familia de plantilla para verificar colores, tipografía y composición.
6. Recargar la página y confirmar que la plantilla seleccionada permanezca guardada.
7. Ejecutar `pnpm run build`.

## Comandos Git

```bash
pnpm run build
git status
git add .
git commit -m "v2.18.0.1 - Sincronizacion inmediata de plantilla"
git push origin main
```
