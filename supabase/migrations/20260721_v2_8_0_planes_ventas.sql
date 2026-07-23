-- InvitaPro v2.8.0 — planes comerciales + registro de ventas
begin;

create table if not exists public.planes_comerciales(
  id uuid primary key default gen_random_uuid(),
  clave text not null unique check (clave in ('clasico','premium','signature')),
  nombre text not null,
  descripcion text not null default '',
  precio_mxn numeric(10,2) not null default 0 check (precio_mxn >= 0),
  activo boolean not null default true,
  orden integer not null default 0,
  limite_invitados integer,
  limite_galeria integer,
  permite_musica boolean not null default false,
  permite_rsvp boolean not null default true,
  permite_plantillas_premium boolean not null default false,
  permite_signature boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.planes_comerciales(clave,nombre,descripcion,precio_mxn,orden,limite_invitados,limite_galeria,permite_musica,permite_rsvp,permite_plantillas_premium,permite_signature)
values
 ('clasico','Clásico','Invitación esencial para publicar y compartir.',399,1,80,6,false,true,false,false),
 ('premium','Premium','Experiencia completa con multimedia y mayor personalización.',599,2,200,12,true,true,true,false),
 ('signature','Signature','Diseños exclusivos y funciones especiales.',899,3,null,30,true,true,true,true)
on conflict (clave) do update set
 nombre=excluded.nombre,
 descripcion=excluded.descripcion,
 orden=excluded.orden;

create table if not exists public.ventas_invitaciones(
  id uuid primary key default gen_random_uuid(),
  invitacion_id uuid not null unique references public.invitaciones(id) on delete cascade,
  plan_id uuid references public.planes_comerciales(id) on delete set null,
  plan_clave text not null,
  plan_nombre text not null,
  precio_lista numeric(10,2) not null default 0,
  importe_pagado numeric(10,2) not null default 0,
  moneda text not null default 'MXN',
  metodo_pago text not null default 'transferencia',
  estado_pago text not null default 'confirmado' check (estado_pago in ('pendiente','confirmado','cortesia','reembolsado')),
  referencia text,
  notas text,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.planes_comerciales enable row level security;
alter table public.ventas_invitaciones enable row level security;

drop policy if exists "planes lectura autenticados" on public.planes_comerciales;
create policy "planes lectura autenticados" on public.planes_comerciales for select to authenticated using (true);

drop policy if exists "planes admin gestion" on public.planes_comerciales;
create policy "planes admin gestion" on public.planes_comerciales for all to authenticated
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.rol='admin'))
with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.rol='admin'));

drop policy if exists "ventas admin gestion" on public.ventas_invitaciones;
create policy "ventas admin gestion" on public.ventas_invitaciones for all to authenticated
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.rol='admin'))
with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.rol='admin'));

commit;
