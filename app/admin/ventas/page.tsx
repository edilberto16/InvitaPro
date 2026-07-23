'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/client';
import {moneyMXN} from '@/lib/commercial-plans';

type Sale={id:string;plan_nombre:string;plan_clave:string;precio_lista:number;importe_pagado:number;metodo_pago:string;estado_pago:string;referencia:string|null;activated_at:string|null;created_at:string;invitaciones:{titulo:string;slug:string;eventos:{nombre:string;clientes:{nombre:string}|null}|null}|null};
type Pending={id:string;titulo:string;design_json:Record<string,unknown>|null;eventos:{nombre:string;clientes:{nombre:string}|null}|null};

export default function VentasPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const[items,setItems]=useState<Sale[]>([]);
 const[pending,setPending]=useState<Pending[]>([]);
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState('');

 async function load(){
  setLoading(true);setError('');
  const[sales,pipeline]=await Promise.all([
   supabase.from('ventas_invitaciones').select('*, invitaciones(titulo,slug,eventos(nombre,clientes(nombre)))').order('created_at',{ascending:false}),
   supabase.from('invitaciones').select('id,titulo,design_json,eventos(nombre,clientes(nombre))').eq('estado','pendiente_activacion').order('created_at',{ascending:false})
  ]);
  if(sales.error)setError(sales.error.message);
  if(pipeline.error)setError(current=>current||pipeline.error?.message||'');
  setItems((sales.data??[]) as unknown as Sale[]);
  setPending((pipeline.data??[]) as unknown as Pending[]);
  setLoading(false);
 }
 useEffect(()=>{void load()},[]);

 const income=items.filter(x=>x.estado_pago==='confirmado').reduce((s,x)=>s+Number(x.importe_pagado||0),0);
 const listValue=items.reduce((s,x)=>s+Number(x.precio_lista||0),0);
 const courtesy=items.filter(x=>x.estado_pago==='cortesia').length;
 const paid=items.filter(x=>x.estado_pago==='confirmado');
 const ticket=paid.length?income/paid.length:0;
 const pipelineValue=pending.reduce((s,x)=>s+Number(x.design_json?.activation_price_snapshot||0),0);
 const difference=Math.max(0,listValue-income);

 return <div className="page-stack">
  <section className="page-heading"><div><p className="eyebrow">Gestión comercial</p><h1>Ventas</h1><p>Controla activaciones, cobros y oportunidades pendientes.</p></div><Link className="button button-outline" href="/admin/planes">Planes y precios</Link></section>

  <section className="stats-grid">
   <article className="stat-card"><span>Ingresos cobrados</span><strong>{moneyMXN(income)}</strong><small>Pagos confirmados</small></article>
   <article className="stat-card"><span>Ticket promedio</span><strong>{moneyMXN(ticket)}</strong><small>Por venta pagada</small></article>
   <article className="stat-card"><span>Por activar</span><strong>{moneyMXN(pipelineValue)}</strong><small>{pending.length} solicitud(es)</small></article>
   <article className="stat-card"><span>Descuentos / cortesías</span><strong>{moneyMXN(difference)}</strong><small>{courtesy} cortesía(s)</small></article>
  </section>

  {pending.length>0&&<section className="panel-card sales-pipeline-card">
   <div className="panel-header"><div><h2>Pendientes de cobro y activación</h2><p>Solicitudes que todavía no se han convertido en venta.</p></div><Link href="/admin/invitaciones" className="text-link">Ir a activaciones</Link></div>
   <div className="sales-pipeline-list">{pending.map(x=><div key={x.id}><div><strong>{x.titulo}</strong><span>{x.eventos?.clientes?.nombre||x.eventos?.nombre||'Cliente'}</span></div><div><span>{String(x.design_json?.activation_plan_name||x.design_json?.activation_plan||'Plan')}</span><strong>{moneyMXN(Number(x.design_json?.activation_price_snapshot||0))}</strong></div></div>)}</div>
  </section>}

  <section className="panel-card"><div className="panel-header"><div><h2>Historial comercial</h2><p>Cada activación queda registrada con su importe y método de pago.</p></div></div>
  {loading?<div className="dashboard-loading">Cargando ventas…</div>:items.length===0?<div className="empty-state compact-empty"><div className="empty-icon">$</div><h2>Aún no hay ventas registradas</h2><p>Las activaciones confirmadas aparecerán aquí automáticamente.</p></div>:<div className="table-wrap"><table className="data-table"><thead><tr><th>Invitación / cliente</th><th>Plan</th><th>Importe</th><th>Método</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td><strong>{x.invitaciones?.titulo||'—'}</strong><span>{x.invitaciones?.eventos?.clientes?.nombre||x.invitaciones?.eventos?.nombre||'—'}</span></td><td><strong>{x.plan_nombre}</strong><span>{x.plan_clave}</span></td><td><strong>{moneyMXN(Number(x.importe_pagado||0))}</strong>{Number(x.precio_lista||0)!==Number(x.importe_pagado||0)&&<span>Lista {moneyMXN(Number(x.precio_lista||0))}</span>}</td><td>{x.metodo_pago}</td><td><span className={`badge ${x.estado_pago==='confirmado'?'badge-success':'badge-neutral'}`}>{x.estado_pago}</span></td><td>{new Date(x.activated_at||x.created_at).toLocaleDateString('es-MX')}</td></tr>)}</tbody></table></div>}
  </section>
  {error&&<p className="form-error">{error}</p>}
 </div>
}