# InvitaPro v2.15.7.0 — Colección Campamentos de Fe

## Archivos modificados

- `lib/template-catalog.ts`
- `lib/template-engine.ts`
- `components/templates/template-preview-artwork.tsx`
- `app/admin/plantillas/page.tsx`
- `app/globals.css`
- `package.json`

## Funciones agregadas

Se amplió la categoría **Campamentos y retiros** de 1 a 6 diseños:

1. Campamento Bosque
2. Noche de Fogata
3. Retiro en la Montaña
4. Amanecer con Dios
5. Bajo las Estrellas
6. Senderos de Fe
7. Aviva

> La categoría queda con 7 diseños en total porque se conserva Campamento Bosque y se agregan seis variantes nuevas.

Cada plantilla incluye:

- Miniatura visual propia en Admin y Cliente.
- Paleta y configuración del motor de plantillas.
- Familia, variante, descripción y términos de búsqueda.
- Secciones recomendadas según el tipo de retiro o campamento.
- Integración automática con el catálogo maestro, Studio y selector del cliente.

## Errores corregidos

- Se evita que las nuevas plantillas de campamento aparezcan con tarjetas genéricas o vacías.
- Admin y Cliente usan el mismo arte de miniatura mediante `TemplatePreviewArtwork`.

## Migraciones

No requiere migraciones de Supabase.

## Pruebas recomendadas

1. Ejecutar `pnpm run build`.
2. Abrir Admin → Plantillas → Campamentos y retiros y confirmar 7 diseños.
3. Abrir Cliente → Cambiar plantilla y confirmar las mismas 7 plantillas.
4. Probar Vista previa y Aplicar plantilla en cada diseño.
5. Buscar: `fogata`, `montaña`, `estrellas`, `senderos` y `aviva`.

## Git

```bash
git status
git add .
git commit -m "v2.15.7.0 - Colección Campamentos de Fe"
git push origin main
```
