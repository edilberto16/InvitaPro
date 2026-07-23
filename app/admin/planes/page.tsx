'use client';
import {useEffect,useMemo,useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import {CommercialPlan,moneyMXN} from '@/lib/commercial-plans';

type EditablePlan=CommercialPlan & {saving?:boolean;message?:string};

export default function PlanesPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const[plans,setPlans]=useState<EditablePlan[]>([]);
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState('');

 async function load(){
  setLoading(true);setError('');
  const{data,error}=await supabase.from('planes_comerciales').select('*').order('orden');
  if(error){setError(error.message);setPlans([])}else setPlans((data??[]) as EditablePlan[]);
  setLoading(false);
 }
 useEffect(()=>{void load()},[]);

 function updateLocal(id:string,patch:Partial<EditablePlan>){
  setPlans(current=>current.map(p=>p.id===id?{...p,...patch}:p));
 }

 async function save(plan:EditablePlan){
  updateLocal(plan.id,{saving:true,message:''});setError('');
  const payload={
   nombre:plan.nombre.trim(),
   descripcion:plan.descripcion.trim(),
   precio_mxn:Number(plan.precio_mxn||0),
   activo:Boolean(plan.activo),
   limite_invitados:plan.limite_invitados===null?null:Number(plan.limite_invitados),
   limite_galeria:plan.limite_galeria===null?null:Number(plan.limite_galeria),
   permite_musica:Boolean(plan.permite_musica),
   permite_rsvp:Boolean(plan.permite_rsvp),
   permite_plantillas_premium:Boolean(plan.permite_plantillas_premium),
   permite_signature:Boolean(plan.permite_signature),
   updated_at:new Date().toISOString()
  };
  const{error}=await supabase.from('planes_comerciales').update(payload).eq('id',plan.id);
  if(error){updateLocal(plan.id,{saving:false,message:'Error al guardar'});setError(error.message);return;}
  updateLocal(plan.id,{...payload,saving:false,message:'Guardado ✓'} as Partial<EditablePlan>);
  window.setTimeout(()=>updateLocal(plan.id,{message:''}),1800);
 }

 if(loading)return <div className="dashboard-loading">Cargando planes comerciales…</div>;

 return <div className="page-stack">
  <section className="page-heading">
   <div><p className="eyebrow">Configuración comercial</p><h1>Planes y precios</h1><p>Controla precios, límites y funciones sin modificar código.</p></div>
  </section>

  <section className="stats-grid">
   {plans.map(p=><article className="stat-card" key={p.id}><span>{p.nombre}</span><strong>{moneyMXN(Number(p.precio_mxn||0))}</strong><small>{p.activo?'Disponible para venta':'Desactivado'}</small></article>)}
  </section>

  <section className="panel-card">
   <div className="panel-header"><div><h2>Configuración de planes</h2><p>Los cambios se reflejan en nuevas solicitudes de activación. Las ventas anteriores conservan su precio histórico.</p></div></div>
   <div className="commercial-plan-admin-grid">
    {plans.map(plan=><article className={`commercial-plan-admin-card ${plan.activo?'':'inactive'}`} key={plan.id}>
     <header><div><span className="plan-key">{plan.clave}</span><input value={plan.nombre} onChange={e=>updateLocal(plan.id,{nombre:e.target.value})}/></div><label className="plan-active-toggle"><input type="checkbox" checked={plan.activo} onChange={e=>updateLocal(plan.id,{activo:e.target.checked})}/><span>Activo</span></label></header>
     <label>Precio MXN<input type="number" min="0" step="1" value={plan.precio_mxn} onChange={e=>updateLocal(plan.id,{precio_mxn:Number(e.target.value)})}/></label>
     <label>Descripción<textarea rows={3} value={plan.descripcion} onChange={e=>updateLocal(plan.id,{descripcion:e.target.value})}/></label>
     <div className="commercial-plan-limits">
      <label>Límite de invitados<input type="number" min="0" placeholder="Sin límite" value={plan.limite_invitados??''} onChange={e=>updateLocal(plan.id,{limite_invitados:e.target.value===''?null:Number(e.target.value)})}/></label>
      <label>Fotos en galería<input type="number" min="0" placeholder="Sin límite" value={plan.limite_galeria??''} onChange={e=>updateLocal(plan.id,{limite_galeria:e.target.value===''?null:Number(e.target.value)})}/></label>
     </div>
     <div className="commercial-feature-list">
      <label><input type="checkbox" checked={plan.permite_rsvp} onChange={e=>updateLocal(plan.id,{permite_rsvp:e.target.checked})}/><span>RSVP y confirmaciones</span></label>
      <label><input type="checkbox" checked={plan.permite_musica} onChange={e=>updateLocal(plan.id,{permite_musica:e.target.checked})}/><span>Música</span></label>
      <label><input type="checkbox" checked={plan.permite_plantillas_premium} onChange={e=>updateLocal(plan.id,{permite_plantillas_premium:e.target.checked})}/><span>Plantillas Premium</span></label>
      <label><input type="checkbox" checked={plan.permite_signature} onChange={e=>updateLocal(plan.id,{permite_signature:e.target.checked})}/><span>Experiencias Signature</span></label>
     </div>
     <footer><span className="plan-save-message">{plan.message}</span><button className="button button-primary" disabled={plan.saving} onClick={()=>void save(plan)}>{plan.saving?'Guardando…':'Guardar plan'}</button></footer>
    </article>)}
   </div>
  </section>
  {error&&<p className="form-error">{error}</p>}
 </div>
}