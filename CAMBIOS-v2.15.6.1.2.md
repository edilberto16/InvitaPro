# InvitaPro v2.15.6.1.2

## Hotfix — miniatura de Campamento Bosque

### Archivos modificados

- `app/globals.css`
- `package.json`

### Correcciones

- Se agregó el estilo visual de `camp-forest` al archivo global realmente cargado por Next.js.
- `Campamento Bosque` ahora muestra una portada completa en Cliente, Admin y Studio, igual que las demás plantillas.
- La miniatura incluye bosque, montañas, cielo nocturno, fogata y tipografía visible.
- Se conserva el mismo componente `TemplatePreviewArtwork`, evitando imágenes o catálogos separados.

### Migraciones

No requiere migración de Supabase.

### Prueba recomendada

1. Ejecutar `pnpm run build`.
2. Abrir Admin → Plantillas y Cliente → Cambiar plantilla.
3. Confirmar que `Campamento Bosque` muestre la misma miniatura visual en ambos catálogos.
