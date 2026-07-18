-- InvitaPro v2.4.1 — Registro comercial automático
-- Ejecutar UNA VEZ en Supabase > SQL Editor.
begin;

-- Etapa comercial separada del estado operativo del registro.
alter table public.clientes
  add column if not exists etapa_comercial text not null default 'prospecto'
  check (etapa_comercial in ('prospecto','cliente','cliente_activo'));

create index if not exists clientes_etapa_comercial_idx
  on public.clientes(etapa_comercial);

-- Trigger: crea perfil + ficha comercial automáticamente.
-- Si ya existe una ficha con el mismo correo, la vincula en vez de duplicarla.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre text;
  v_admin_id uuid;
  v_cliente_id uuid;
begin
  v_nombre := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nombre'),''),
    split_part(coalesce(new.email,''),'@',1)
  );

  insert into public.profiles (id,nombre,telefono,avatar_url,rol)
  values (
    new.id,
    v_nombre,
    new.raw_user_meta_data ->> 'telefono',
    new.raw_user_meta_data ->> 'avatar_url',
    'cliente'
  )
  on conflict (id) do update
  set nombre = coalesce(nullif(excluded.nombre,''), public.profiles.nombre);

  -- Busca primero una ficha comercial existente con el mismo correo.
  select c.id into v_cliente_id
  from public.clientes c
  where c.user_id is null
    and lower(trim(coalesce(c.correo,''))) = lower(trim(coalesce(new.email,'')))
  order by c.created_at desc
  limit 1;

  if v_cliente_id is not null then
    update public.clientes
       set user_id = new.id,
           nombre = case when trim(coalesce(nombre,''))='' then v_nombre else nombre end,
           etapa_comercial = case when etapa_comercial='prospecto' then 'cliente' else etapa_comercial end,
           updated_at = now()
     where id = v_cliente_id;
    return new;
  end if;

  -- Todo prospecto web queda asignado al primer administrador activo.
  select p.id into v_admin_id
  from public.profiles p
  where p.rol='admin' and p.activo=true
  order by p.created_at asc
  limit 1;

  if v_admin_id is not null and coalesce(trim(new.email),'') <> '' then
    insert into public.clientes (
      owner_id,user_id,nombre,correo,telefono,estado,etapa_comercial,notas
    )
    values (
      v_admin_id,new.id,v_nombre,new.email,
      new.raw_user_meta_data ->> 'telefono',
      'activo','prospecto','Registro automático desde el sitio web'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Cuando el admin activa acceso de una ficha manual, pasa a cliente.
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
  if not private.is_admin() then raise exception 'No autorizado'; end if;
  select * into v_cliente from public.clientes where id=p_cliente_id;
  if v_cliente.id is null then return jsonb_build_object('status','error','message','El cliente no existe.'); end if;

  if v_cliente.user_id is not null then
    update public.clientes set etapa_comercial='cliente',updated_at=now() where id=p_cliente_id and etapa_comercial='prospecto';
    return jsonb_build_object('status','already_active','message','Este cliente ya tiene acceso a Mi InvitaPro.','email',v_cliente.correo);
  end if;

  v_email:=lower(trim(coalesce(v_cliente.correo,'')));
  if v_email='' then return jsonb_build_object('status','missing_email','message','El cliente no tiene correo electrónico.'); end if;

  select u.id into v_user_id from auth.users u
   where lower(trim(coalesce(u.email,'')))=v_email
   order by u.created_at desc limit 1;

  if v_user_id is null then
    return jsonb_build_object('status','account_not_found','message','Todavía no existe una cuenta con ese correo. Pide al cliente que se registre usando el mismo correo.','email',v_cliente.correo);
  end if;

  if not exists(select 1 from public.profiles p where p.id=v_user_id and p.rol='cliente' and p.activo=true) then
    return jsonb_build_object('status','invalid_role','message','La cuenta encontrada no es una cuenta de cliente activa.','email',v_cliente.correo);
  end if;

  if exists(select 1 from public.clientes c where c.user_id=v_user_id and c.id<>p_cliente_id) then
    return jsonb_build_object('status','already_linked_elsewhere','message','Esa cuenta ya está vinculada a otro cliente.','email',v_cliente.correo);
  end if;

  update public.clientes
     set user_id=v_user_id,etapa_comercial='cliente',updated_at=now()
   where id=p_cliente_id;

  insert into public.notificaciones(profile_id,tipo,titulo,mensaje,url)
  values(v_user_id,'sistema','Tu acceso a Mi InvitaPro está activo',
         'Tu cuenta ya fue vinculada. Entra para consultar tu evento e invitación.',
         '/mi-cuenta');

  return jsonb_build_object('status','activated','message','Acceso activado correctamente.','email',v_cliente.correo);
end;
$$;

-- Backfill: vincula usuarios cliente existentes por email; si no tienen ficha, crea prospecto.
do $$
declare
  r record;
  v_admin_id uuid;
  v_cliente_id uuid;
begin
  select p.id into v_admin_id
  from public.profiles p
  where p.rol='admin' and p.activo=true
  order by p.created_at asc limit 1;

  for r in
    select u.id,u.email,p.nombre
    from auth.users u
    join public.profiles p on p.id=u.id
    where p.rol='cliente'
  loop
    select c.id into v_cliente_id
    from public.clientes c
    where c.user_id=r.id
       or (c.user_id is null and lower(trim(coalesce(c.correo,'')))=lower(trim(coalesce(r.email,''))))
    order by (c.user_id=r.id) desc,c.created_at desc
    limit 1;

    if v_cliente_id is not null then
      update public.clientes
      set user_id=r.id,updated_at=now()
      where id=v_cliente_id and user_id is null;
    elsif v_admin_id is not null and coalesce(trim(r.email),'')<>'' then
      insert into public.clientes(owner_id,user_id,nombre,correo,estado,etapa_comercial,notas)
      values(v_admin_id,r.id,coalesce(nullif(trim(r.nombre),''),split_part(r.email,'@',1)),
             r.email,'activo','prospecto','Registro automático desde el sitio web')
      on conflict(user_id) do nothing;
    end if;
  end loop;
end $$;

commit;
