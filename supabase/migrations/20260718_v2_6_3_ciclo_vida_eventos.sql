-- InvitaPro v2.6.3 — Ciclo de vida automático
-- Finaliza eventos confirmados cuyo día ya terminó.
begin;

create or replace function public.sincronizar_eventos_finalizados()
returns integer
language plpgsql
security definer
set search_path=''
as $$
declare
  v_count integer;
begin
  update public.eventos
     set estado='finalizado',
         updated_at=now()
   where estado='confirmado'
     and fecha < current_date;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.sincronizar_eventos_finalizados() from public;
grant execute on function public.sincronizar_eventos_finalizados() to authenticated;

commit;
