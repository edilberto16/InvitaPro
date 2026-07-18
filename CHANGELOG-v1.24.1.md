# InvitaPro v1.24.1 — Visual Builder Pro

## Nuevo
- Navegador lateral profesional de componentes dentro del editor.
- Estado visual inmediato para distinguir bloques visibles y ocultos.
- Contador de componentes activos.
- Selección rápida de cualquier sección para abrir sus propiedades.
- Layout de tres columnas: componentes, configuración y vista previa.
- Navegador y vista previa fijos durante el desplazamiento en pantallas amplias.
- Adaptación responsive para laptop, tablet y móvil.

## Arquitectura
- Nuevo componente reutilizable `components/editor/section-navigator.tsx`.
- Metadatos de secciones centralizados para preparar las siguientes entregas del constructor visual.
- Sin cambios de base de datos ni migraciones SQL.
