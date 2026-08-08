"use client";

import Link from "next/link";
import {ChangeEvent,useCallback,useEffect,useMemo,useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {messageFromError} from "@/lib/invitapro";

type MediaType="todos"|"imagen"|"audio"|"video"|"documento";
type MediaItem={
 id:string;evento_id:string|null;tipo:Exclude<MediaType,"todos">;bucket:string;path:string;
 nombre_original:string|null;mime_type:string|null;size_bytes:number|null;created_at:string;
};
type EventOption={id:string;nombre:string};

const tabs:[MediaType,string][]=[["todos","Todos"],["imagen","Fotos"],["audio","Música"],["video","Videos"],["documento","Archivos"]];

function safeFileName(name:string){return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9._-]+/g,"-").replace(/-+/g,"-")}
function formatBytes(value:number|null){if(!value)return "—";if(value<1024)return `${value} B`;if(value<1024**2)return `${(value/1024).toFixed(1)} KB`;return `${(value/1024**2).toFixed(1)} MB`}

export default function ClientLibraryPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const inputRef=useRef<HTMLInputElement|null>(null);
 const[items,setItems]=useState<MediaItem[]>([]);
 const[events,setEvents]=useState<EventOption[]>([]);
 const[eventId,setEventId]=useState("");
 const[type,setType]=useState<MediaType>("todos");
 const[search,setSearch]=useState("");
 const[loading,setLoading]=useState(true);
 const[uploading,setUploading]=useState(false);
 const[error,setError]=useState("");
 const[notice,setNotice]=useState("");

 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const[{data:media,error:mediaError},{data:eventData,error:eventError}]=await Promise.all([
   supabase.from("media").select("id,evento_id,tipo,bucket,path,nombre_original,mime_type,size_bytes,created_at").order("created_at",{ascending:false}),
   supabase.from("eventos").select("id,nombre").order("fecha",{ascending:true})
  ]);
  if(mediaError)setError(messageFromError(mediaError));else setItems((media??[]) as MediaItem[]);
  if(eventError)setError(current=>current||messageFromError(eventError));else{const list=(eventData??[]) as EventOption[];setEvents(list);setEventId(current=>current||list[0]?.id||"")}
  setLoading(false);
 },[supabase]);
 useEffect(()=>{
  const timer=window.setTimeout(()=>{void load()},0);
  return()=>window.clearTimeout(timer);
 },[load]);

 const filtered=useMemo(()=>items.filter(item=>!eventId||item.evento_id===eventId).filter(item=>type==="todos"||item.tipo===type).filter(item=>(item.nombre_original||"").toLowerCase().includes(search.trim().toLowerCase())),[items,eventId,type,search]);
 function publicUrl(item:MediaItem){return supabase.storage.from(item.bucket).getPublicUrl(item.path).data.publicUrl}

 async function uploadFiles(event:ChangeEvent<HTMLInputElement>){
  const files=Array.from(event.target.files??[]);event.target.value="";
  if(!files.length)return;
  if(!eventId){setError("Selecciona un evento.");return}
  if(files.some(file=>file.size>20*1024*1024)){setError("Cada archivo debe pesar máximo 20 MB.");return}
  setUploading(true);setError("");setNotice("");
  try{
   const{data:userData,error:userError}=await supabase.auth.getUser();
   if(userError||!userData.user)throw new Error("La sesión no está disponible.");
   for(const file of files){
    const tipo:MediaItem["tipo"]=file.type.startsWith("image/")?"imagen":file.type.startsWith("audio/")?"audio":file.type.startsWith("video/")?"video":"documento";
    const bucket=tipo==="audio"?"event-audio":"event-media";
    const ext=(file.name.includes(".")?file.name.split(".").pop():"bin")||"bin";
    const base=safeFileName(file.name.replace(/\.[^.]+$/,"")||"archivo");
    const path=`${userData.user.id}/${eventId}/${Date.now()}-${crypto.randomUUID().slice(0,8)}-${base}.${ext}`;
    const{error:uploadError}=await supabase.storage.from(bucket).upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type||undefined});
    if(uploadError)throw uploadError;
    const{error:insertError}=await supabase.from("media").insert({evento_id:eventId,invitacion_id:null,owner_id:userData.user.id,tipo,bucket,path,nombre_original:file.name,mime_type:file.type||null,size_bytes:file.size});
    if(insertError){await supabase.storage.from(bucket).remove([path]);throw insertError}
   }
   setNotice(files.length===1?"Archivo agregado a tu Biblioteca.":`${files.length} archivos agregados a tu Biblioteca.`);
   await load();
  }catch(uploadError){setError(messageFromError(uploadError))}
  finally{setUploading(false)}
 }

 async function removeItem(item:MediaItem){
  if(!confirm(`¿Eliminar \"${item.nombre_original||"este archivo"}\"?`))return;
  setError("");
  const storageResult=await supabase.storage.from(item.bucket).remove([item.path]);
  if(storageResult.error){setError(messageFromError(storageResult.error));return}
  const{error:deleteError}=await supabase.from("media").delete().eq("id",item.id);
  if(deleteError){setError(messageFromError(deleteError));return}
  setNotice("Archivo eliminado.");await load();
 }

 return <main className="client-portal client-library-page">
  <header className="client-topbar"><Link href="/mi-cuenta" className="client-logo"><span>IP</span><strong>InvitaPro</strong></Link><nav><Link href="/mi-cuenta">Mi evento</Link><Link href="/mi-cuenta/biblioteca">Biblioteca</Link></nav></header>
  <section className="client-library-hero">
   <div><p className="eyebrow">Tus recursos</p><h1>Biblioteca multimedia</h1><p>Sube fotografías, música y videos para reutilizarlos en tu invitación.</p></div>
   <div className="client-library-upload">
    <label><span>Evento</span><select value={eventId} onChange={e=>setEventId(e.target.value)}>{events.length?events.map(item=><option key={item.id} value={item.id}>{item.nombre}</option>):<option value="">Sin eventos</option>}</select></label>
    <input ref={inputRef} hidden type="file" multiple accept="image/*,audio/*,video/*,.pdf" onChange={uploadFiles}/>
    <button type="button" className="client-primary" disabled={uploading||!eventId} onClick={()=>inputRef.current?.click()}>{uploading?"Subiendo…":"+ Agregar archivos"}</button>
   </div>
  </section>

  {error&&<div className="client-library-alert error">{error}</div>}
  {notice&&<div className="client-library-alert success">{notice}</div>}

  <section className="client-library-toolbar">
   <div>{tabs.map(([id,label])=><button type="button" key={id} className={type===id?"active":""} onClick={()=>setType(id)}>{label}</button>)}</div>
   <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre…"/>
  </section>

  {loading?<div className="client-loading">Cargando Biblioteca…</div>:filtered.length?<section className="client-library-grid">{filtered.map(item=>{const url=publicUrl(item);return <article key={item.id} className="client-library-card">
   <div className="client-library-preview">{item.tipo==="imagen"?<img src={url} alt={item.nombre_original||"Imagen"}/>:item.tipo==="audio"?<><span>♫</span><audio controls src={url}/></>:item.tipo==="video"?<video controls src={url}/>:<span>▤</span>}</div>
   <div className="client-library-card-body"><strong>{item.nombre_original||"Archivo"}</strong><small>{formatBytes(item.size_bytes)}</small></div>
   <div className="client-library-card-actions"><a href={url} target="_blank" rel="noreferrer">Ver</a><button type="button" onClick={()=>void removeItem(item)}>Eliminar</button></div>
  </article>})}</section>:<section className="client-library-empty"><span>▧</span><h2>Tu Biblioteca está vacía</h2><p>Sube tus primeras fotografías y luego podrás seleccionarlas desde el Studio.</p><button type="button" className="client-primary" disabled={!eventId} onClick={()=>inputRef.current?.click()}>+ Subir fotografías</button></section>}
 </main>
}
