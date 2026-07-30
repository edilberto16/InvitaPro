# InvitaPro v2.17.1 — Preview Header Refresh

## Versión

- **Versión anterior:** 2.17.0
- **Versión nueva:** 2.17.1

## Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/client-portal.css`
- `package.json`

## Mejoras agregadas

- Se reemplazó el título partido “Vista previa real” por **Vista previa** en una sola línea.
- Se agregó indicador discreto **EN VIVO** con punto de estado.
- Los controles de dispositivo, zoom y enfoque ahora ocupan una fila propia cuando el panel es angosto.
- El control de zoom se adapta al ancho disponible sin empujar ni cortar el título.
- En pantallas amplias, título y controles vuelven a compartir una sola fila.
- Se redujo el espacio superior para aprovechar mejor el lienzo.
- Se eliminó el texto auxiliar permanente que saturaba el encabezado.

## Errores corregidos

- El título ya no se divide en tres líneas.
- Los controles ya no se enciman ni desbordan el panel de vista previa.
- El encabezado deja de verse cortado en resoluciones intermedias.

## Migraciones

- No requiere migraciones de base de datos.

## Comandos Git

```bash
pnpm run build
git status
git add .
git commit -m "v2.17.1 - Preview Header Refresh"
git push origin main
```

## Pruebas recomendadas

1. Abrir Studio con el navegador entre 1200 y 1450 px de ancho.
2. Confirmar que “Vista previa” permanezca en una sola línea.
3. Probar celular, tableta y escritorio.
4. Probar zoom de 60 % a 120 %.
5. Activar y salir del modo enfoque.
6. Verificar que ningún control se corte o se superponga.
7. Ejecutar `pnpm run build`.
