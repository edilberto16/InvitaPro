-- InvitaPro v2.4.0 — Activación administrativa de clientes
-- Ejecutar UNA VEZ en Supabase > SQL Editor.
begin;

-- A partir de v2.4 la vinculación la controla el administrador.
revoke execute on function public.vincular_mi_cuenta_cliente() from authenticated;

create or replace function public.activar_acceso_cliente(p_cliente_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cliente public.clientes%rowtype;
  v_user_id uuid;
  v_email text;
begin
  if not private.is_admin() then
    raise exception 'No autorizado';
  end if;

  select * into v_cliente
  from public.clientes
  where id = p_cliente_id;

  if v_cliente.id is null then
    return jsonb_build_object('status','error','message','El cliente no existe.');
  end if;

  if v_cliente.user_id is not null then
    return jsonb_build_object(
      'status','already_active',
      'message','Este cliente ya tiene acceso a Mi InvitaPro.',
      'email',v_cliente.correo
    );
  end if;

  v_email := lower(trim(coalesce(v_cliente.correo,'')));
  if v_email = '' then
    return jsonb_build_object('status','missing_email','message','El cliente no tiene correo electrónico.');
  end if;

  select u.id into v_user_id
  from auth.users u
  where lower(trim(coalesce(u.email,''))) = v_email
  order by u.created_at desc
  limit 1;

  if v_user_id is null then
    return jsonb_build_object(
      'status','account_not_found',
      'message','Todavía no existe una cuenta con ese correo. Pide al cliente que se registre en InvitaPro usando el mismo correo y vuelve a pulsar Activar.',
      'email',v_cliente.correo
    );
  end if;

  -- Solo cuentas con perfil cliente pueden vincularse.
  if not exists (
    select 1 from public.profiles p
    where p.id=v_user_id and p.rol='cliente' and p.activo=true
  ) then
    return jsonb_build_object(
      'status','invalid_role',
      'message','La cuenta encontrada no es una cuenta de cliente activa.',
      'email',v_cliente.correo
    );
  end if;

  if exists(select 1 from public.clientes c where c.user_id=v_user_id and c.id<>p_cliente_id) then
    return jsonb_build_object(
      'status','already_linked_elsewhere',
      'message','Esa cuenta ya está vinculada a otro cliente.',
      'email',v_cliente.correo
    );
  end if;

  update public.clientes
  set user_id=v_user_id, updated_at=now()
  where id=p_cliente_id;

  insert into public.notificaciones(profile_id,tipo,titulo,mensaje,url)
  values(v_user_id,'sistema','Tu acceso a Mi InvitaPro está activo',
         'Tu cuenta ya fue vinculada. Entra para consultar tu evento e invitación.',
         '/mi-cuenta');

  return jsonb_build_object(
    'status','activated',
    'message','Acceso activado correctamente. El cliente ya puede entrar a Mi InvitaPro.',
    'email',v_cliente.correo
  );
end;
$$;

revoke all on function public.activar_acceso_cliente(uuid) from public;
grant execute on function public.activar_acceso_cliente(uuid) to authenticated;

commit;
