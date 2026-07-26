-- InvitaPro v2.13.0 — Check-in con QR

alter table public.invitados
  add column if not exists checkin_at timestamptz,
  add column if not exists checkin_by uuid references auth.users(id) on delete set null,
  add column if not exists checkin_count integer not null default 0,
  add column if not exists ultimo_checkin_at timestamptz;

create index if not exists invitados_checkin_at_idx
  on public.invitados(checkin_at desc)
  where checkin_at is not null;

create or replace function public.registrar_checkin(
  p_invitacion_id uuid,
  p_codigo text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_guest public.invitados%rowtype;
  v_allowed boolean := false;
begin
  if v_user is null then
    raise exception 'Debes iniciar sesión para registrar el acceso';
  end if;

  select exists (
    select 1
    from public.invitaciones i
    join public.eventos e on e.id = i.evento_id
    join public.clientes c on c.id = e.cliente_id
    join public.profiles p on p.id = v_user
    where i.id = p_invitacion_id
      and i.modalidad = 'pases'
      and (c.owner_id = v_user or c.user_id = v_user or p.rol = 'admin')
  ) into v_allowed;

  if not v_allowed then
    raise exception 'No tienes permiso para operar este evento';
  end if;

  select * into v_guest
  from public.invitados
  where invitacion_id = p_invitacion_id
    and upper(codigo) = upper(trim(p_codigo))
  limit 1
  for update;

  if v_guest.id is null then
    raise exception 'Código de pase no encontrado';
  end if;

  if v_guest.estado = 'no_asistira' then
    return jsonb_build_object(
      'ok', false,
      'status', 'rechazado',
      'message', 'El invitado indicó que no asistirá',
      'guest', jsonb_build_object(
        'id', v_guest.id,
        'nombre', v_guest.nombre,
        'codigo', v_guest.codigo,
        'mesa', v_guest.mesa,
        'adultos_permitidos', v_guest.adultos_permitidos,
        'ninos_permitidos', v_guest.ninos_permitidos,
        'estado', v_guest.estado,
        'checkin_at', v_guest.checkin_at
      )
    );
  end if;

  if v_guest.checkin_at is not null then
    update public.invitados
    set checkin_count = checkin_count + 1,
        ultimo_checkin_at = now(),
        updated_at = now()
    where id = v_guest.id;

    return jsonb_build_object(
      'ok', false,
      'status', 'duplicado',
      'message', 'Este pase ya fue registrado',
      'guest', jsonb_build_object(
        'id', v_guest.id,
        'nombre', v_guest.nombre,
        'codigo', v_guest.codigo,
        'mesa', v_guest.mesa,
        'adultos_permitidos', v_guest.adultos_permitidos,
        'ninos_permitidos', v_guest.ninos_permitidos,
        'estado', v_guest.estado,
        'checkin_at', v_guest.checkin_at
      )
    );
  end if;

  update public.invitados
  set checkin_at = now(),
      checkin_by = v_user,
      checkin_count = checkin_count + 1,
      ultimo_checkin_at = now(),
      estado = case when estado = 'pendiente' then 'confirmado' else estado end,
      updated_at = now()
  where id = v_guest.id
  returning * into v_guest;

  return jsonb_build_object(
    'ok', true,
    'status', 'llego',
    'message', 'Acceso registrado correctamente',
    'guest', jsonb_build_object(
      'id', v_guest.id,
      'nombre', v_guest.nombre,
      'codigo', v_guest.codigo,
      'mesa', v_guest.mesa,
      'adultos_permitidos', v_guest.adultos_permitidos,
      'ninos_permitidos', v_guest.ninos_permitidos,
      'estado', v_guest.estado,
      'checkin_at', v_guest.checkin_at
    )
  );
end;
$$;

revoke all on function public.registrar_checkin(uuid, text) from public;
grant execute on function public.registrar_checkin(uuid, text) to authenticated;
