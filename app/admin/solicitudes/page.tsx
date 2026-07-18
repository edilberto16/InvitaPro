"use client";
import {useEffect,useMemo,useState} from "react";
import {createClient} from "@/lib/supabase/client";

type Solicitud={
 id:string;nombre:string;telefono:string;correo:string|null;tipo_evento:string;
 fecha_evento:string|null;plantilla:string|null;detalle:string|null;estado:string;
 created_at:string;cliente_id:string|null;
};

export default function SolicitudesPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const [items,setItems]=useState<Solicitud[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [deleting,setDeleting]=useState<Solicitud|null>(null);
 const [deletingBusy,setDeletingBusy]=useState(false);

 async function load(){
  setLoading(true);
  const {data,error}=await supabase.from("solicitudes").select("*").order("created_at",{ascending:false});
  if(error)setError(error.message);else setItems((data??[]) as Solicitud[]);
  setLoading(false);
 }

 useEffect(()=>{void load()},[]);

 async function setEstado(id:string,estado:string){
  const {error}=await supabase.from("solicitudes").update({estado}).eq("id",id);
  if(error)setError(error.message);else await load();
 }

 async function eliminarSolicitud(){
  if(!deleting)return;
  setDeletingBusy(true); setError("");
  const {error}=await supabase.from("solicitudes").delete().eq("id",deleting.id);
  setDeletingBusy(false);
  if(error){setError(error.message);return;}
  setDeleting(null);
  await load();
 }

 const nuevas=items.filter(i=>i.estado==="nueva").length;
 const seguimiento=items.filter(i=>i.estado==="contactado").length;
 const cerradas=items.filter(i=>i.estado==="cerrada").length;

 return <div className="page-stack">
  <section className="page-heading"><div><p className="eyebrow">Gestión comercial</p><h1>Solicitudes</h1><p>Prospectos que pidieron una invitación desde la página pública.</p></div></section>

  <section className="stats-grid clients-stats">
   <article className="stat-card"><span>Total</span><strong>{items.length}</strong><small>Solicitudes</small></article>
   <article className="stat-card"><span>Nuevas</span><strong>{nuevas}</strong><small>Por atender</small></article>
   <article className="stat-card"><span>En seguimiento</span><strong>{seguimiento}</strong><small>Conversaciones abiertas</small></article>
   <article className="stat-card"><span>Cerradas</span><strong>{cerradas}</strong><small>Sin seguimiento activo</small></article>
  </section>

  <section className="panel-card">
   <div className="panel-header"><div><h2>Bandeja de solicitudes</h2><p>Contacta al prospecto, da seguimiento y limpia solicitudes canceladas o duplicadas.</p></div></div>
   {error&&<p className="form-error">{error}</p>}
   {loading?<div className="dashboard-loading">Cargando solicitudes…</div>:items.length===0?<div className="empty-state compact-empty"><div className="empty-icon">✉</div><h2>Sin solicitudes</h2><p>Cuando alguien envíe el formulario público aparecerá aquí.</p></div>:<div className="table-wrap"><table className="data-table"><thead><tr><th>Prospecto</th><th>Evento</th><th>Plantilla</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{items.map(s=>{
    const wa=s.telefono.replace(/\D/g,"");
    const text=encodeURIComponent(`Hola ${s.nombre}, soy de InvitaPro. Recibimos tu solicitud para ${s.tipo_evento}${s.plantilla?` con el diseño ${s.plantilla}`:""}. ¿Te ayudo con los detalles y precio?`);
    return <tr key={s.id}>
      <td><strong>{s.nombre}</strong><span>{s.telefono}</span><span>{s.correo||"Sin correo"}</span></td>
      <td><strong>{s.tipo_evento}</strong><span>{s.fecha_evento||"Fecha por definir"}</span></td>
      <td>{s.plantilla||"Sin selección"}</td>
      <td><span className="badge">{s.estado==="nueva"?"Nueva":s.estado==="contactado"?"En seguimiento":"Cerrada"}</span></td>
      <td><div className="row-actions">
        <a className="button button-primary" target="_blank" rel="noreferrer" href={`https://wa.me/${wa}?text=${text}`} onClick={()=>void setEstado(s.id,"contactado")}>WhatsApp</a>
        {s.estado==="nueva"&&<button className="button button-ghost" onClick={()=>void setEstado(s.id,"contactado")}>En seguimiento</button>}
        {s.estado!=="cerrada"&&<button className="button button-ghost" onClick={()=>void setEstado(s.id,"cerrada")}>Cerrar</button>}
        <button className="button button-danger" onClick={()=>setDeleting(s)}>Eliminar</button>
      </div></td>
    </tr>
   })}</tbody></table></div>}
  </section>

  {deleting&&<div className="modal-backdrop delete-backdrop" onMouseDown={()=>!deletingBusy&&setDeleting(null)}>
    <section className="delete-modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="delete-icon">✕</div>
      <div className="delete-heading">
        <h2>Eliminar solicitud</h2>
        <p>¿Quieres eliminar la solicitud de <strong>{deleting.nombre}</strong>?</p>
      </div>
      <div className="delete-warning">
        <strong>El cliente no se eliminará</strong>
        <p>Solo se quitará esta solicitud de la bandeja. El prospecto, su cuenta, eventos o invitaciones relacionadas no serán eliminados.</p>
      </div>
      <div className="delete-actions">
        <button className="button button-outline" disabled={deletingBusy} onClick={()=>setDeleting(null)}>Cancelar</button>
        <button className="button button-danger" disabled={deletingBusy} onClick={()=>void eliminarSolicitud()}>{deletingBusy?"Eliminando…":"Sí, eliminar solicitud"}</button>
      </div>
    </section>
  </div>}
 </div>
}
