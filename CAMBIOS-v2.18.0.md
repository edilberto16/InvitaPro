# InvitaPro v2.18.0 — Studio Visual, fase 1

## Versión

`2.18.0`

## Archivos modificados

- `app/invitacion/[slug]/page.tsx`
- `app/client-portal.css`
- `package.json`
- `CAMBIOS-v2.18.0.md`

## Funciones agregadas

- Etiqueta visual con el nombre de cada bloque al pasar el cursor.
- Resaltado profesional para bloques en hover y seleccionados.
- Barra flotante contextual dentro de la vista previa.
- Botón **Editar** visible que abre el editor correspondiente en Studio.
- Acciones rápidas para subir, bajar y ocultar bloques.
- Ajustes responsivos para que las herramientas no cubran el contenido en móvil.

## Errores corregidos

- Se eliminó la etiqueta genérica “Editar sección”, que competía con los controles.
- Se mejoró la identificación del bloque activo.
- Se redujo el riesgo de que la barra flotante quede fuera del ancho visible.

## Migraciones

No requiere migraciones de base de datos.

## Pruebas recomendadas

1. Abrir Studio y pasar el cursor sobre varios bloques.
2. Verificar que aparezca el nombre correcto del bloque.
3. Seleccionar Introducción y confirmar que se abra su editor.
4. Probar subir, bajar y ocultar un bloque distinto de Portada.
5. Validar la vista previa en celular, tableta y escritorio.
6. Ejecutar `pnpm run build`.

## Comandos Git

```bash
git status
git add .
git commit -m "v2.18.0 - Studio Visual fase 1"
git push origin main
```
