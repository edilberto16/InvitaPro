"use client";
import {FormEvent,Suspense,useMemo,useState} from "react";
import Link from "next/link";
import {useRouter,useSearchParams} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {getTemplateById} from "@/lib/template-catalog";
function Config(){
 const q=useSearchParams(),router=useRouter(),supabase=useMemo(()=>createClient(),[]);
 const tipo=q.get("tipo")||"wedding",templateId=q.get("plantilla")||"";
 const template=getTemplateById(templateId);
 const [nombre,setNombre]=useState("");const[fecha,setFecha]=useState("");const[hora,setHora]=useState("18:00");const[lugar,setLugar]=useState("");const[mensaje,setMensaje]=useState("");const[saving,setSaving]=useState(false);const[error,setError]=useState("");
 async function save(e:FormEvent){e.preventDefault();setSaving(true);setError("");const {data,error}=await supabase.rpc("crear_borrador_autoservicio",{p_tipo_coleccion:tipo,p_plantilla_id:templateId,p_nombre_evento:nombre.trim(),p_fecha:fecha,p_hora:hora||null,p_lugar:lugar.trim()||null,p_mensaje:mensaje.trim()||null});setSaving(false);if(error){setError(error.message);return;}router.push("/mi-cuenta?creado="+data)}
 return <main className="self-service-page"><header className="self-service-topbar"><Link href="/mi-cuenta" className="client-logo"><span>IP</span><strong>InvitaPro</strong></Link><Link href="/mi-cuenta" className="self-service-exit">Guardar y salir</Link></header><section className="self-service-shell">
 <div className="wizard-progress"><span className="done">✓</span><i className="done"/><span className="done">✓</span><i className="done"/><span className="active">3</span></div>
 <div className="wizard-heading"><p className="eyebrow">Paso 3 de 3</p><h1>Cuéntanos lo esencial de tu evento</h1><p>Crearemos un borrador con <strong>{template?.name||"tu plantilla"}</strong>. Después podrás continuar personalizándolo.</p></div>
 <div className="self-config-grid"><form className="self-config-form" onSubmit={save}><label>Nombre del evento *<input required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder={tipo==="wedding"?"Ej. Mariana & Alejandro":tipo==="xv"?"Ej. Mis XV · Valentina":"Ej. Cumpleaños de Mateo"}/></label><div className="self-form-row"><label>Fecha *<input required type="date" value={fecha} onChange={e=>setFecha(e.target.value)}/></label><label>Hora<input type="time" value={hora} onChange={e=>setHora(e.target.value)}/></label></div><label>Lugar<input value={lugar} onChange={e=>setLugar(e.target.value)} placeholder="Salón, jardín o ubicación"/></label><label>Mensaje de bienvenida<textarea rows={5} value={mensaje} onChange={e=>setMensaje(e.target.value)} placeholder="Escribe una frase especial para tus invitados…"/></label>{error&&<p className="client-error">{error}</p>}<button className="client-primary self-save-button" disabled={saving}>{saving?"Creando borrador…":"Crear mi borrador →"}</button><small>No se publicará todavía. Podrás revisar y editar antes de pagar o compartir.</small></form>
 <aside className="self-summary"><p className="eyebrow">Tu selección</p><div className="self-summary-art" style={{background:`linear-gradient(145deg,${template?.color||"#72264f"},#24171f)`}}><span>{template?.premium?"Premium":"Plantilla"}</span><strong>{template?.name||templateId}</strong></div><h3>{nombre||"Tu evento"}</h3><p>{fecha||"Fecha por definir"} {hora?`· ${hora}`:""}</p><p>{lugar||"Ubicación por definir"}</p><div className="draft-badge">BORRADOR</div></aside></div>
 <Link className="wizard-back" href={`/mi-cuenta/crear/plantilla?tipo=${tipo}`}>← Elegir otra plantilla</Link></section></main>
}
export default function Page(){return <Suspense fallback={<div className="client-loading">Preparando editor…</div>}><Config/></Suspense>}
