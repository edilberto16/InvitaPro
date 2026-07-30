# InvitaPro v2.15.8.1

## Hotfix — modal de cambio de plantilla

### Error corregido
- El modal de confirmación podía superar la altura visible de la pantalla.
- Los botones **Cancelar** y **Aplicar plantilla** quedaban fuera del área visible en pantallas con poca altura.

### Mejoras
- El modal ahora respeta la altura disponible del navegador.
- El contenido central tiene desplazamiento vertical independiente.
- La portada y las acciones permanecen visibles.
- Se reducen automáticamente la portada, títulos y espacios en pantallas bajas.
- Se mejoró la adaptación para teléfonos.

### Archivos modificados
- `app/client-portal.css`
- `package.json`

### Migraciones
No requiere migración de Supabase.

### Prueba recomendada
1. Abrir Studio.
2. Seleccionar **Cambiar plantilla**.
3. Aplicar una variante de Campamentos y retiros.
4. Confirmar que los botones inferiores sean visibles.
5. Reducir la altura de la ventana y comprobar que el contenido central se pueda desplazar.
6. Ejecutar `pnpm run build`.
