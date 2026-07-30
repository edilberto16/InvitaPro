# InvitaPro v2.15.8.0 — Experiencia Premium Campamentos de Fe

## Archivos modificados

- `app/invitacion/[slug]/page.tsx`
- `app/globals.css`
- `package.json`

## Archivos nuevos

- `lib/camp-template-profiles.ts`

## Funciones agregadas

- Perfil visual y de contenido específico para las siete plantillas de Campamentos de Fe.
- Versículo destacado con referencia bíblica y mensaje propio por diseño.
- Bloque visual “Qué llevar” con seis elementos esenciales.
- Programa de demostración automático cuando la invitación todavía no tiene itinerario configurado.
- Preguntas frecuentes iniciales cuando el organizador todavía no ha capturado contenido.
- Atmósferas animadas según la plantilla: bosque, fogata, montaña, amanecer, estrellas, sendero y Aviva.
- Mejoras visuales para la portada, itinerario y control de música.
- Respeto a `prefers-reduced-motion` para accesibilidad.

## Comportamiento

- El contenido ingresado por el usuario siempre tiene prioridad sobre los valores iniciales.
- Las mejoras solo se aplican a plantillas de la familia `campamento`.
- No requiere cambios en la base de datos ni migraciones de Supabase.

## Pruebas recomendadas

1. Ejecutar `pnpm run build`.
2. Abrir cada una de las siete plantillas desde Admin y Cliente.
3. Validar escritorio y móvil.
4. Confirmar que un programa o FAQ personalizado sustituye al contenido inicial.
5. Probar música, animaciones y modo de movimiento reducido.

## Git

```bash
git add .
git commit -m "v2.15.8.0 - Experiencia premium Campamentos de Fe"
git push origin main
```
