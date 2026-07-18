-- InvitaPro v2.3.0 - Cuentas de clientes + Mi InvitaPro
-- Ejecutar UNA VEZ en Supabase > SQL Editor.
begin;

-- Asegura que los nuevos registros públicos sean clientes.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id,nombre,telefono,avatar_url,rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre',split_part(coalesce(new.email,''),'@',1)),
    new.raw_user_meta_data ->> 'telefono',
    new.raw_user_meta_data ->> 'avatar_url',
    'cliente'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- El cliente puede leer sus datos y todo lo relacionado mediante las políticas
-- ya existentes basadas en clientes.user_id.
-- Bloqueamos escrituras estructurales del cliente: solo admin/owner administra eventos.
drop policy if exists eventos_insert on public.eventos;
create policy eventos_insert on public.eventos for insert to authenticated
with check (
  exists(select 1 from public.clientes c where c.id=cliente_id and (c.owner_id=(select auth.uid()) or private.is_admin()))
);
drop policy if exists eventos_update on public.eventos;
create policy eventos_update on public.eventos for update to authenticated
using (exists(select 1 from public.clientes c where c.id=cliente_id and (c.owner_id=(select auth.uid()) or private.is_admin())))
with check (exists(select 1 from public.clientes c where c.id=cliente_id and (c.owner_id=(select auth.uid()) or private.is_admin())));
drop policy if exists eventos_delete on public.eventos;
create policy eventos_delete on public.eventos for delete to authenticated
using (exists(select 1 from public.clientes c where c.id=cliente_id and (c.owner_id=(select auth.uid()) or private.is_admin())));

-- Vinculación segura: un usuario cliente puede reclamar un registro existente
-- solo si su email autenticado coincide con el correo del cliente y aún no tiene cuenta.
create or replace function public.vincular_mi_cuenta_cliente()
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare v_id uuid; v_email text;
begin
  select email into v_email from auth.users where id=(select auth.uid());
  if v_email is null then return null; end if;
  update public.clientes
     set user_id=(select auth.uid()), updated_at=now()
   where id=(
     select c.id from public.clientes c
     where c.user_id is null and lower(trim(coalesce(c.correo,'')))=lower(trim(v_email))
     order by c.created_at desc limit 1
   )
   returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.vincular_mi_cuenta_cliente() from public;
grant execute on function public.vincular_mi_cuenta_cliente() to authenticated;

commit;
