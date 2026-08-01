-- InvitaPro v2.31.1
-- Corrige RSVP público para invitaciones históricas guardadas como "autoservicio".
-- También separa los errores de existencia, publicación, modalidad y expiración.

create or replace function public.registrar_confirmacion(
  p_slug text,
  p_asistira boolean,
  p_adultos integer default 0,
  p_ninos integer default 0,
  p_nombre text default null,
  p_telefono text default null,
  p_mensaje text default null,
  p_codigo text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitacion public.invitaciones%rowtype;
  v_evento public.eventos%rowtype;
  v_invitado public.invitados%rowtype;
  v_confirmacion_id uuid;
  v_owner_id uuid;
  v_cliente_user_id uuid;
  v_tipo_notificacion text;
  v_modalidad text;
begin
  if coalesce(p_adultos, 0) < 0 or coalesce(p_ninos, 0) < 0 then
    raise exception 'Las cantidades no pueden ser negativas';
  end if;

  select i.*
  into v_invitacion
  from public.invitaciones i
  where i.slug = trim(p_slug)
  limit 1;

  if v_invitacion.id is null then
    raise exception 'La invitación no existe';
  end if;

  if v_invitacion.estado <> 'publicada' then
    raise exception 'La invitación todavía no está publicada';
  end if;

  v_modalidad := lower(trim(coalesce(v_invitacion.modalidad, '')));

  if v_modalidad not in ('rsvp', 'autoservicio', 'pases') then
    raise exception 'Esta invitación no acepta confirmaciones RSVP';
  end if;

  if v_invitacion.fecha_expiracion is not null
     and v_invitacion.fecha_expiracion <= now() then
    raise exception 'Esta invitación ya no está disponible';
  end if;

  select e.*
  into v_evento
  from public.eventos e
  where e.id = v_invitacion.evento_id;

  if v_evento.id is null then
    raise exception 'El evento relacionado no está disponible';
  end if;

  if v_modalidad = 'pases' then
    if p_codigo is null or trim(p_codigo) = '' then
      raise exception 'Se requiere el código del pase';
    end if;

    select g.*
    into v_invitado
    from public.invitados g
    where g.invitacion_id = v_invitacion.id
      and upper(trim(g.codigo)) = upper(trim(p_codigo))
    limit 1;

    if v_invitado.id is null then
      raise exception 'Código de pase inválido';
    end if;

    if coalesce(p_adultos, 0) > v_invitado.adultos_permitidos
       or coalesce(p_ninos, 0) > v_invitado.ninos_permitidos then
      raise exception 'La confirmación supera los lugares asignados';
    end if;

    insert into public.confirmaciones (
      invitacion_id, invitado_id, nombre, asistira,
      adultos, ninos, mensaje, telefono
    )
    values (
      v_invitacion.id, v_invitado.id, v_invitado.nombre, p_asistira,
      case when p_asistira then coalesce(p_adultos, 0) else 0 end,
      case when p_asistira then coalesce(p_ninos, 0) else 0 end,
      p_mensaje, coalesce(p_telefono, v_invitado.telefono)
    )
    on conflict (invitado_id) where invitado_id is not null
    do update set
      asistira = excluded.asistira,
      adultos = excluded.adultos,
      ninos = excluded.ninos,
      mensaje = excluded.mensaje,
      telefono = excluded.telefono,
      updated_at = now()
    returning id into v_confirmacion_id;

    update public.invitados
    set estado = case when p_asistira then 'confirmado' else 'no_asistira' end
    where id = v_invitado.id;
  else
    if p_nombre is null or char_length(trim(p_nombre)) < 2 then
      raise exception 'Es necesario indicar el nombre';
    end if;

    insert into public.confirmaciones (
      invitacion_id, nombre, asistira, adultos, ninos, mensaje, telefono
    )
    values (
      v_invitacion.id, trim(p_nombre), p_asistira,
      case when p_asistira then coalesce(p_adultos, 0) else 0 end,
      case when p_asistira then coalesce(p_ninos, 0) else 0 end,
      p_mensaje, nullif(trim(coalesce(p_telefono, '')), '')
    )
    returning id into v_confirmacion_id;
  end if;

  select c.owner_id, c.user_id
  into v_owner_id, v_cliente_user_id
  from public.clientes c
  where c.id = v_evento.cliente_id;

  v_tipo_notificacion := case
    when p_asistira then 'rsvp_confirmado'
    else 'rsvp_rechazado'
  end;

  insert into public.notificaciones (
    profile_id, evento_id, tipo, titulo, mensaje, url
  )
  select receptor, v_evento.id, v_tipo_notificacion,
    case when p_asistira then 'Nueva confirmación' else 'No asistirá' end,
    coalesce(v_invitado.nombre, trim(p_nombre), 'Un invitado')
      || case
           when p_asistira
             then ' confirmó ' || (coalesce(p_adultos, 0) + coalesce(p_ninos, 0))::text || ' lugar(es).'
           else ' indicó que no asistirá.'
         end,
    '/admin/confirmaciones'
  from (
    select v_owner_id as receptor
    union
    select v_cliente_user_id where v_cliente_user_id is not null
  ) r
  where receptor is not null;

  insert into public.actividad (
    actor_id, evento_id, entidad, entidad_id, accion, detalles
  )
  values (
    null,
    v_evento.id,
    'confirmaciones',
    v_confirmacion_id,
    case when p_asistira then 'rsvp_confirmado' else 'rsvp_rechazado' end,
    jsonb_build_object(
      'nombre', coalesce(v_invitado.nombre, trim(p_nombre)),
      'adultos', case when p_asistira then coalesce(p_adultos, 0) else 0 end,
      'ninos', case when p_asistira then coalesce(p_ninos, 0) else 0 end
    )
  );

  return v_confirmacion_id;
end;
$$;

revoke all on function public.registrar_confirmacion(
  text, boolean, integer, integer, text, text, text, text
) from public;

grant execute on function public.registrar_confirmacion(
  text, boolean, integer, integer, text, text, text, text
) to anon, authenticated;
