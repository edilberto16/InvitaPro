# InvitaPro v2.15.6.1.3

## Hotfix: contadores del catálogo del cliente

### Archivos modificados

- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/client-portal.css`
- `package.json`

### Correcciones

- Se agregaron clases explícitas al nombre y al contador de cada categoría.
- El contador ahora se muestra como una insignia independiente, igual que en el catálogo del administrador.
- Se reforzó el espaciado y la alineación para evitar que textos como `Bodas14` o `Campamentos y retiros1` aparezcan unidos.
- Se mantiene el contraste correcto en categorías activas y al pasar el cursor.

### Migraciones

No requiere migración de Supabase.

### Prueba recomendada

1. Abrir una invitación desde Mi cuenta.
2. Entrar a Studio y seleccionar `Cambiar plantilla`.
3. Confirmar que las categorías muestran el contador separado dentro de una insignia.
4. Ejecutar `pnpm run build`.
