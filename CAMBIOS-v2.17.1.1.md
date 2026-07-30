# InvitaPro v2.17.1.1

## Archivos modificados

- `app/client-portal.css`
- `package.json`

## Error corregido

- El control de zoom de la vista previa se recortaba cuando el encabezado intentaba colocar el título y todos los controles en una sola fila dentro del panel lateral.

## Ajustes aplicados

- El encabezado lateral mantiene el título y la barra de controles en dos filas.
- El control de zoom puede reducirse sin ocultar los botones `−`, `+` ni el porcentaje.
- La distribución horizontal se reserva para el modo enfoque, donde existe espacio suficiente.
- Se agregaron ajustes compactos para pantallas muy angostas.

## Migraciones

No requiere migraciones de base de datos.

## Validación recomendada

1. Abrir Studio en vista normal.
2. Probar celular, tableta y escritorio.
3. Confirmar que se vean `−`, porcentaje, `+` y enfoque.
4. Probar zoom de 60 % a 120 %.
5. Activar modo enfoque y verificar la distribución horizontal.
6. Ejecutar:

```bash
pnpm run build
```

## Comandos Git

```bash
git status
git add .
git commit -m "v2.17.1.1 - Hotfix controles de zoom"
git push origin main
```
