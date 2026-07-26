-- InvitaPro v2.13.1 — check-in profesional con entradas parciales y auditoría
alter table public.invitados
  add column if not exists checkin_adultos integer not null default 0,
  add column if not exists checkin_ninos integer not null default 0;

create table if not exists public.checkin_registros (
  id uuid primary key default gen_random_uuid(),
  invitacion_id uuid not null references public.invitaciones(id) on delete cascade,
  invitado_id uuid not null references public.invitados(id) on delete cascade,
  usuario_id uuid references auth.users(id) on delete set null,
  accion text not null check (accion in ('entrada','reversion')),
  adultos integer not null default 0,
  ninos integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists checkin_registros_invitacion_fecha_idx on public.checkin_registros(invitacion_id,created_at desc);
alter table public.checkin_registros enable row level security;

drop policy if exists "checkin_registros_select_equipo" on public.checkin_registros;
create policy "checkin_registros_select_equipo" on public.checkin_registros for select to authenticated using (
  exists(select 1 from public.invitaciones i join public.eventos e on e.id=i.evento_id join public.clientes c on c.id=e.cliente_id join public.profiles p on p.id=auth.uid() where i.id=checkin_registros.invitacion_id and (c.owner_id=auth.uid() or c.user_id=auth.uid() or p.rol='admin'))
);

create or replace function public.registrar_checkin(p_invitacion_id uuid,p_codigo text,p_adultos integer default 1,p_ninos integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_guest public.invitados%rowtype;v_allowed boolean:=false;v_adults integer:=greatest(coalesce(p_adultos,0),0);v_children integer:=greatest(coalesce(p_ninos,0),0);v_total integer;
begin
 if v_user is null then raise exception 'Debes iniciar sesión para registrar el acceso'; end if;
 select exists(select 1 from public.invitaciones i join public.eventos e on e.id=i.evento_id join public.clientes c on c.id=e.cliente_id join public.profiles p on p.id=v_user where i.id=p_invitacion_id and i.modalidad='pases' and (c.owner_id=v_user or c.user_id=v_user or p.rol='admin')) into v_allowed;
 if not v_allowed then raise exception 'No tienes permiso para operar este evento'; end if;
 select * into v_guest from public.invitados where invitacion_id=p_invitacion_id and upper(codigo)=upper(trim(p_codigo)) limit 1 for update;
 if v_guest.id is null then raise exception 'Código de pase no encontrado'; end if;
 if v_guest.estado='no_asistira' then return jsonb_build_object('ok',false,'status','rechazado','message','El invitado indicó que no asistirá','guest',to_jsonb(v_guest)); end if;
 if v_adults+v_children<=0 then raise exception 'Indica al menos una persona para registrar'; end if;
 if v_guest.checkin_adultos+v_adults>v_guest.adultos_permitidos or v_guest.checkin_ninos+v_children>v_guest.ninos_permitidos then raise exception 'La cantidad excede las personas autorizadas en este pase'; end if;
 update public.invitados set checkin_adultos=checkin_adultos+v_adults,checkin_ninos=checkin_ninos+v_children,checkin_at=coalesce(checkin_at,now()),checkin_by=v_user,checkin_count=checkin_count+1,ultimo_checkin_at=now(),estado=case when estado='pendiente' then 'confirmado' else estado end,updated_at=now() where id=v_guest.id returning * into v_guest;
 insert into public.checkin_registros(invitacion_id,invitado_id,usuario_id,accion,adultos,ninos) values(p_invitacion_id,v_guest.id,v_user,'entrada',v_adults,v_children);
 v_total:=v_guest.checkin_adultos+v_guest.checkin_ninos;
 return jsonb_build_object('ok',true,'status',case when v_total<(v_guest.adultos_permitidos+v_guest.ninos_permitidos) then 'parcial' else 'llego' end,'message',case when v_total<(v_guest.adultos_permitidos+v_guest.ninos_permitidos) then 'Entrada parcial registrada' else 'Acceso completo registrado' end,'guest',to_jsonb(v_guest));
end;$$;

create or replace function public.revertir_checkin(p_invitacion_id uuid,p_invitado_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_guest public.invitados%rowtype;v_allowed boolean:=false;
begin
 if v_user is null then raise exception 'Debes iniciar sesión'; end if;
 select exists(select 1 from public.invitaciones i join public.eventos e on e.id=i.evento_id join public.clientes c on c.id=e.cliente_id join public.profiles p on p.id=v_user where i.id=p_invitacion_id and (c.owner_id=v_user or c.user_id=v_user or p.rol='admin')) into v_allowed;
 if not v_allowed then raise exception 'No tienes permiso para operar este evento'; end if;
 select * into v_guest from public.invitados where id=p_invitado_id and invitacion_id=p_invitacion_id for update;
 if v_guest.id is null then raise exception 'Invitado no encontrado'; end if;
 insert into public.checkin_registros(invitacion_id,invitado_id,usuario_id,accion,adultos,ninos) values(p_invitacion_id,v_guest.id,v_user,'reversion',v_guest.checkin_adultos,v_guest.checkin_ninos);
 update public.invitados set checkin_adultos=0,checkin_ninos=0,checkin_at=null,checkin_by=null,ultimo_checkin_at=now(),updated_at=now() where id=v_guest.id;
end;$$;
revoke all on function public.registrar_checkin(uuid,text,integer,integer) from public;grant execute on function public.registrar_checkin(uuid,text,integer,integer) to authenticated;
revoke all on function public.revertir_checkin(uuid,uuid) from public;grant execute on function public.revertir_checkin(uuid,uuid) to authenticated;
