-- v2.12.1: la landing pública puede leer únicamente planes activos.
drop policy if exists "planes publicos activos" on public.planes_comerciales;
create policy "planes publicos activos"
on public.planes_comerciales
for select
to anon
using (activo = true);
