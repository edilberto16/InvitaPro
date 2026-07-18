-- InvitaPro v2.5.0 — Self-Service Foundation
-- Ejecutar una vez en Supabase SQL Editor.
begin;

alter table public.invitaciones add column if not exists plantilla_id text;
alter table public.invitaciones add column if not exists contenido jsonb not null default '{}'::jsonb;

create or replace function public.crear_borrador_autoservicio(
 p_tipo_coleccion text,
 p_plantilla_id text,
 p_nombre_evento text,
 p_fecha date,
 p_hora time default null,
 p_lugar text default null,
 p_mensaje text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
 v_user uuid:=auth.uid();
 v_cliente uuid;
 v_evento uuid;
 v_invitacion uuid;
 v_tipo text;
 v_slug text;
begin
 if v_user is null then raise exception 'Debes iniciar sesión.'; end if;
 if char_length(trim(coalesce(p_nombre_evento,'')))<2 then raise exception 'Escribe el nombre del evento.'; end if;
 if p_fecha is null then raise exception 'Selecciona la fecha del evento.'; end if;

 select c.id into v_cliente from public.clientes c where c.user_id=v_user limit 1;
 if v_cliente is null then raise exception 'Tu cuenta todavía no está vinculada a un perfil de cliente.'; end if;

 v_tipo:=case p_tipo_coleccion when 'wedding' then 'Boda' when 'xv' then 'XV años' when 'infantil' then 'Cumpleaños' when 'empresarial' then 'Evento empresarial' else 'Otro' end;

 insert into public.eventos(cliente_id,nombre,tipo,fecha,hora,lugar,estado)
 values(v_cliente,trim(p_nombre_evento),v_tipo,p_fecha,p_hora,nullif(trim(coalesce(p_lugar,'')),''),'borrador')
 returning id into v_evento;

 v_slug:=lower(regexp_replace(trim(p_nombre_evento),'[^a-zA-Z0-9]+','-','g'))||'-'||substr(replace(gen_random_uuid()::text,'-',''),1,6);

 insert into public.invitaciones(evento_id,titulo,slug,estado,modalidad,plantilla_id,contenido)
 values(v_evento,trim(p_nombre_evento),v_slug,'borrador','autoservicio',p_plantilla_id,
 jsonb_build_object('mensaje',nullif(trim(coalesce(p_mensaje,'')),''),'creado_por','cliente','wizard_version','2.5.0'))
 returning id into v_invitacion;

 return v_invitacion;
end;
$$;

revoke all on function public.crear_borrador_autoservicio(text,text,text,date,time,text,text) from public;
grant execute on function public.crear_borrador_autoservicio(text,text,text,date,time,text,text) to authenticated;

commit;
