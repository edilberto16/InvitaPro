# InvitaPro v2.15.4

## Animaciones Premium y pulido visual Signature

### Archivos modificados
- `app/invitacion/[slug]/page.tsx`
- `app/globals.css`
- `package.json`

### Mejoras
- Revelado progresivo de bloques al entrar en pantalla mediante `IntersectionObserver`.
- El Studio conserva todos los bloques visibles para no interferir con la edición.
- Luxury Night incorpora entrada cinematográfica, profundidad y destellos sutiles.
- Editorial Romance incorpora ritmo lateral tipo revista y transiciones más limpias.
- Royal XV incorpora corona flotante y brillo elegante en la cuenta regresiva.
- Las demos Signature tienen entrada progresiva por sección.
- Animaciones optimizadas usando principalmente `opacity`, `transform` y `filter`.
- Ajustes móviles para reducir desenfoques y movimiento excesivo.
- Compatibilidad con `prefers-reduced-motion`.
- No requiere migración de Supabase.

### Validación recomendada
- Probar una plantilla de cada familia Signature en celular y escritorio.
- Confirmar que el Studio no oculta bloques durante la edición.
- Confirmar que las animaciones se desactivan al habilitar reducción de movimiento en el sistema.
- Ejecutar `pnpm run build` con Node.js 22.x.

### Git
```bash
git status
git add .
git commit -m "InvitaPro v2.15.4 animaciones premium Signature"
git push origin main
```
