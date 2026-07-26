-- InvitaPro v2.13.1 hotfix 1
-- Permite que el cliente vinculado edite su invitación y los datos de su evento,
-- sin convertir al administrador en propietario del registro.
begin;

-- Eventos: el owner administrativo, el cliente vinculado y los administradores
-- pueden actualizar el evento relacionado.
drop policy if exists eventos_update on public.eventos;
create policy eventos_update on public.eventos
for update to authenticated
using (
  exists (
    select 1 from public.clientes c
    where c.id = cliente_id
      and (
        c.owner_id = (select auth.uid())
        or c.user_id = (select auth.uid())
        or private.is_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.clientes c
    where c.id = cliente_id
      and (
        c.owner_id = (select auth.uid())
        or c.user_id = (select auth.uid())
        or private.is_admin()
      )
  )
);

-- Invitaciones: conserva el acceso por la relación evento -> cliente.
drop policy if exists invitaciones_select_authenticated on public.invitaciones;
create policy invitaciones_select_authenticated on public.invitaciones
for select to authenticated
using (private.owns_evento(evento_id));

drop policy if exists invitaciones_update on public.invitaciones;
create policy invitaciones_update on public.invitaciones
for update to authenticated
using (private.owns_evento(evento_id))
with check (private.owns_evento(evento_id));

commit;
