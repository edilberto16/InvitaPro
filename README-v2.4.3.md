# InvitaPro v2.4.3 — Corrección Home + Inspiración

Corrige exactamente lo observado en producción:

- El Home ya NO usa los SVG placeholder.
- Usa las mismas imágenes WebP reales del módulo Inspiración.
- “Ver demo” cambia a “Ver experiencia”.
- Cada tarjeta abre su experiencia correcta:
  - Romantic Garden
  - Princess Rose
  - Dino Adventure
- Añade “Quiero una como esta”, enviando plantilla/categoría a `/solicitar`.
- Incluye completo el flujo comercial administrado de v2.4.2.
- `globals.css` ya viene integrado: NO hay que copiar CSS manualmente.

## Aplicación
Copia todo el patch sobre el proyecto y reemplaza archivos.

En `.env.local`:
NEXT_PUBLIC_WHATSAPP_NUMBER=52XXXXXXXXXX

Luego:
pnpm run build
pnpm dev

Para Vercel agrega la misma variable en Settings > Environment Variables y vuelve a desplegar.
