# InvitaPro v2.3.1 HOTFIX

Corrige dos problemas detectados en v2.3.0:

1. El portal `/mi-cuenta` se mostraba sin estilos porque `client-portal.css` no quedó importado en `app/layout.tsx`.
2. El login/middleware ahora reconoce roles administrativos `admin`, `administrador` y `super_admin`, y redirige correctamente a `/admin`.

No requiere SQL adicional.

Después de copiar el patch:
- detén `pnpm dev`
- ejecuta `pnpm dev`
- cierra sesión y vuelve a iniciar sesión
- haz Ctrl+F5
