# InvitaPro v2.15.3

## Plantillas Premium con demo real y variantes

### Archivos modificados
- `lib/template-catalog.ts`
- `app/mi-cuenta/crear/preview/page.tsx`
- `app/admin/plantillas/page.tsx`
- `app/mi-cuenta/studio/[id]/page.tsx`
- `app/globals.css`
- `package.json`

### Funciones agregadas
- Demo completa desplazable para cada plantilla.
- Selector visual de variantes dentro de una misma familia Signature.
- Enlace de demo completa desde Administración.
- Selector de variantes en la confirmación de cambio de plantilla en Studio.
- Estilos reales diferenciados para Luxury Night, Editorial Romance y Royal XV.
- Mejoras visuales en invitaciones publicadas para las tres familias.

### Compatibilidad
- El contenido de la invitación se conserva al cambiar de plantilla.
- El bloqueo por plan Clásico, Premium y Signature permanece activo.
- RSVP, galería, itinerario, ubicación y álbum continúan usando el renderizador central.

### Migraciones
No requiere migración de Supabase.

### Pruebas recomendadas
1. Abrir Administración → Plantillas y seleccionar una plantilla Signature.
2. Pulsar `Ver demo completa`.
3. Cambiar entre las variantes de la familia.
4. Entrar al Studio y aplicar una variante diferente.
5. Confirmar que textos, imágenes y bloques se conservan.
6. Verificar la invitación en celular, tableta y escritorio.

### Git
```bash
git status
git add .
git commit -m "InvitaPro v2.15.3 demos reales y variantes Signature"
git push origin main
```
