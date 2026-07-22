"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {useParams} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {TEMPLATE_CATALOG,TEMPLATE_COLLECTIONS,getTemplateById} from "@/lib/template-catalog";
import MediaLibraryPicker from "@/components/media/media-library-picker";

type Invite={
 id:string;evento_id:string;titulo:string;slug:string;estado:string;modalidad:string;
 template_key:string|null;design_json:Record<string,unknown>|null;color_principal:string|null;
 musica_url:string|null;whatsapp:string|null;
 eventos:{id:string;nombre:string;tipo:string;fecha:string;hora:string|null;lugar:string|null;direccion:string|null;maps_url:string|null}|null;
};

const SECTIONS=[
 {id:"portada",label:"Portada",desc:"Título, mensaje y primera impresión",icon:"✦"},
 {id:"fecha",label:"Fecha y cuenta regresiva",desc:"Fecha, hora y expectativa",icon:"◷"},
 {id:"ubicacion",label:"Ubicación",desc:"Lugar, dirección y mapa",icon:"⌖"},
 {id:"galeria",label:"Galería",desc:"Fotografías y recuerdos",icon:"▧"},
 {id:"musica",label:"Música",desc:"Canción de la celebración",icon:"♫"},
 {id:"programa",label:"Itinerario",desc:"Horarios y actividades",icon:"☷"},
 {id:"vestimenta",label:"Dress code",desc:"Código de vestimenta",icon:"◇"},
 {id:"regalos",label:"Mesa de regalos",desc:"Opciones y recomendaciones",icon:"♢"},
 {id:"rsvp",label:"Confirmación RSVP",desc:"Asistencia de invitados",icon:"✓"},
] as const;

function collectionForTipo(tipo:string){
 const t=tipo.toLowerCase();
 if(t.includes("xv"))return "xv";
 if(t.includes("boda"))return "wedding";
 if(t.includes("empres"))return "empresarial";
 return "infantil";
}

export default function StudioPage(){
 const params=useParams<{id:string}>();
 const supabase=useMemo(()=>createClient(),[]);
 const [invite,setInvite]=useState<Invite|null>(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [saved,setSaved]=useState("");
 const [error,setError]=useState("");
 const [active,setActive]=useState("portada");
 const [showTemplates,setShowTemplates]=useState(false);
 const [title,setTitle]=useState("");
 const [message,setMessage]=useState("");
 const [subtitle,setSubtitle]=useState("");
 const [color,setColor]=useState("#72264f");
 const [music,setMusic]=useState("");
 const [whatsapp,setWhatsapp]=useState("");
 const [program,setProgram]=useState("");
 const [dress,setDress]=useState("Formal");
 const [gift,setGift]=useState("");
 const [rsvpText,setRsvpText]=useState("Confirma tu asistencia");
 const [cover,setCover]=useState("");
 const [gallery,setGallery]=useState<string[]>([]);
 const [date,setDate]=useState("");
 const [time,setTime]=useState("");
 const [venue,setVenue]=useState("");
 const [address,setAddress]=useState("");
 const [mapsUrl,setMapsUrl]=useState("");
 const [mediaPicker,setMediaPicker]=useState<null|"cover"|"gallery"|"music">(null);
 const [visibility,setVisibility]=useState<Record<string,boolean>>({
  portada:true,fecha:true,ubicacion:true,galeria:true,musica:true,programa:true,vestimenta:true,regalos:true,rsvp:true
 });

 async function load(){
  setLoading(true);setError("");
  const {data,error}=await supabase.from("invitaciones")
    .select("id,evento_id,titulo,slug,estado,modalidad,template_key,design_json,color_principal,musica_url,whatsapp,eventos(id,nombre,tipo,fecha,hora,lugar,direccion,maps_url)")
    .eq("id",params.id).maybeSingle();
  if(error||!data){setError(error?.message||"No encontramos esta invitación.");setLoading(false);return;}
  const i=data as unknown as Invite; const d=i.design_json||{};
  setInvite(i);setTitle(i.titulo);setMessage(typeof d.mensaje==="string"?d.mensaje:"");setSubtitle(typeof d.subtitulo==="string"?d.subtitulo:"Queremos compartir contigo este momento");
  setColor(i.color_principal||getTemplateById(i.template_key||"")?.color||"#72264f");setMusic(i.musica_url||"");setWhatsapp(i.whatsapp||"");
  setProgram(typeof d.programa==="string"?d.programa:"");setDress(typeof d.vestimenta==="string"?d.vestimenta:"Formal");setGift(typeof d.regalos==="string"?d.regalos:"");setRsvpText(typeof d.rsvp_text==="string"?d.rsvp_text:"Confirma tu asistencia");
  setCover(typeof d.portada_url==="string"?d.portada_url:"");setGallery(Array.isArray(d.galeria_urls)?d.galeria_urls.filter((x):x is string=>typeof x==="string"):[]);
  setDate(i.eventos?.fecha||"");setTime(i.eventos?.hora?.slice(0,5)||"");setVenue(i.eventos?.lugar||"");setAddress(i.eventos?.direccion||"");setMapsUrl(i.eventos?.maps_url||"");
  setVisibility(v=>({...v,...(typeof d.section_visibility==="object"&&d.section_visibility?d.section_visibility as Record<string,boolean>:{})}));
  setLoading(false);
 }
 useEffect(()=>{void load()},[params.id]);

 async function save(){
  if(!invite)return;
  setSaving(true);setError("");setSaved("");
  const current=invite.design_json||{};
  const payload={
    titulo:title.trim()||invite.titulo,
    color_principal:color,
    musica_url:music.trim()||null,
    whatsapp:whatsapp.trim()||null,
    design_json:{...current,mensaje:message,subtitulo:subtitle,programa:program,vestimenta:dress,regalos:gift,rsvp_text:rsvpText,portada_url:cover,galeria_urls:gallery,section_visibility:visibility,mostrar_galeria:visibility.galeria,mostrar_programa:visibility.programa,mostrar_mapa:visibility.ubicacion,mostrar_rsvp:visibility.rsvp,mostrar_contador:visibility.fecha,studio_version:"2.6.2",plantilla:invite.template_key||current.plantilla}
  };
  const [{error:inviteError},{error:eventError}]=await Promise.all([
    supabase.from("invitaciones").update(payload).eq("id",invite.id),
    supabase.from("eventos").update({fecha:date,hora:time||null,lugar:venue.trim()||null,direccion:address.trim()||null,maps_url:mapsUrl.trim()||null}).eq("id",invite.evento_id)
  ]);
  setSaving(false);
  const error=inviteError||eventError;
  if(error){setError(error.message);return;}
  const updatedEvent=invite.eventos?{...invite.eventos,fecha:date,hora:time||null,lugar:venue||null,direccion:address||null,maps_url:mapsUrl||null}:invite.eventos;
  setSaved("Guardado ✓");setInvite({...invite,...payload,eventos:updatedEvent});
  window.setTimeout(()=>setSaved(""),2200);
 }

 async function changeTemplate(id:string){
  if(!invite)return;
  const t=getTemplateById(id); if(!t)return;
  const current=invite.design_json||{};const {error}=await supabase.from("invitaciones").update({template_key:id,color_principal:t.color,design_json:{...current,plantilla:id,template_engine:id}}).eq("id",invite.id);
  if(error){setError(error.message);return;}
  setInvite({...invite,template_key:id,color_principal:t.color});setColor(t.color);setShowTemplates(false);setSaved("Plantilla actualizada ✓");
 }

 if(loading)return <main className="studio-page"><div className="client-loading">Abriendo InvitaPro Studio…</div></main>;
 if(!invite)return <main className="studio-page"><div className="client-empty"><h2>No pudimos abrir la invitación</h2><p>{error}</p><Link className="client-primary" href="/mi-cuenta">Volver</Link></div></main>;

 const template=getTemplateById(invite.template_key||"");
 const collection=collectionForTipo(invite.eventos?.tipo||"");
 const templates=TEMPLATE_CATALOG.filter(t=>t.collection===collection&&t.available);
 const enabled=Object.values(visibility).filter(Boolean).length;
 const progress=Math.round((enabled/SECTIONS.length)*70 + (title?10:0)+(invite.eventos?.fecha?10:0)+(message?10:0));

 return <main className="studio-page">
  <header className="studio-topbar">
   <div className="studio-topbar-left"><Link href="/mi-cuenta" className="self-brand"><span>IP</span><strong>InvitaPro</strong></Link><span className="studio-divider"/><div><strong>{invite.titulo}</strong><small>{saved||"Borrador · Guardado manual"}</small></div></div>
   <div className="studio-topbar-actions"><button className="client-secondary" onClick={()=>setShowTemplates(true)}>Cambiar plantilla</button><Link className="client-secondary" target="_blank" href={`/invitacion/${invite.slug}?preview=1`}>Vista previa</Link><button className="client-primary" onClick={()=>void save()} disabled={saving}>{saving?"Guardando…":"Guardar cambios"}</button></div>
  </header>

  <div className="studio-workspace">
   <aside className="studio-sidebar">
    <div className="studio-progress"><div><span>Tu invitación</span><strong>{Math.min(progress,100)}%</strong></div><i><b style={{width:`${Math.min(progress,100)}%`}}/></i><small>Completa las secciones antes de publicar.</small></div>
    <div className="studio-template-summary" onClick={()=>setShowTemplates(true)} role="button" tabIndex={0}><div style={{background:`linear-gradient(145deg,${template?.color||color},#251b22)`}}><span>{template?.premium?"Premium":"Plantilla"}</span><strong>{template?.name||invite.template_key||"Sin plantilla"}</strong></div><button>Cambiar diseño</button></div>
    <nav className="studio-section-list">{SECTIONS.map(s=><button key={s.id} className={active===s.id?"active":""} onClick={()=>setActive(s.id)}><span>{s.icon}</span><div><strong>{s.label}</strong><small>{s.desc}</small></div><em className={visibility[s.id]?"on":"off"}>{visibility[s.id]?"Visible":"Oculto"}</em></button>)}</nav>
   </aside>

   <section className="studio-editor">
    <div className="studio-editor-heading"><div><p className="eyebrow">InvitaPro Studio</p><h1>{SECTIONS.find(s=>s.id===active)?.label}</h1><p>{SECTIONS.find(s=>s.id===active)?.desc}</p></div><label className="studio-visibility"><input type="checkbox" checked={visibility[active]??true} onChange={e=>setVisibility({...visibility,[active]:e.target.checked})}/><span>Mostrar sección</span></label></div>

    {active==="portada"&&<div className="studio-fields">
      <label>Título principal<input value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <label>Introducción<input value={subtitle} onChange={e=>setSubtitle(e.target.value)}/></label>
      <label className="full">Mensaje de bienvenida<textarea rows={5} value={message} onChange={e=>setMessage(e.target.value)}/></label>
      <label>Color principal<div className="studio-color"><input type="color" value={color} onChange={e=>setColor(e.target.value)}/><input value={color} onChange={e=>setColor(e.target.value)}/></div></label><div className="studio-cover-field full"><div><strong>Imagen de portada</strong><small>Usa una fotografía vertical o panorámica de buena calidad.</small></div>{cover?<div className="studio-cover-preview"><img src={cover} alt="Portada"/><button type="button" onClick={()=>setCover("")}>Quitar</button></div>:null}<button type="button" className="client-secondary" onClick={()=>setMediaPicker("cover")}>{cover?"Cambiar portada":"Elegir de Biblioteca"}</button></div>
    </div>}
    {active==="fecha"&&<div className="studio-fields"><label>Fecha<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Hora<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label><div className="studio-note full">◷ La cuenta regresiva usa esta fecha y hora automáticamente.</div></div>}
    {active==="ubicacion"&&<div className="studio-fields"><label>Lugar<input value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Salón, jardín, iglesia…"/></label><label>Dirección<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Dirección completa"/></label><label className="full">Google Maps<input value={mapsUrl} onChange={e=>setMapsUrl(e.target.value)} placeholder="https://maps.google.com/..."/></label></div>}
    {active==="galeria"&&<div className="studio-media-section"><div className="studio-media-toolbar"><div><h3>Galería de fotografías</h3><p>Selecciona hasta 8 fotografías de la Biblioteca Multimedia.</p></div><button className="client-primary" onClick={()=>setMediaPicker("gallery")}>Seleccionar fotografías</button></div>{gallery.length?<div className="studio-gallery-grid">{gallery.map((url,index)=><figure key={url}><img src={url} alt={`Foto ${index+1}`}/><button onClick={()=>setGallery(gallery.filter(x=>x!==url))}>×</button></figure>)}</div>:<div className="studio-upload-placeholder"><span>▧</span><h3>Aún no hay fotografías</h3><p>Agrega imágenes para que tu invitación cobre vida.</p></div>}</div>}
    {active==="musica"&&<div className="studio-fields"><label className="full">Música<input value={music} onChange={e=>setMusic(e.target.value)} placeholder="Selecciona desde Biblioteca o pega una URL"/></label><div className="studio-inline-actions full"><button className="client-secondary" type="button" onClick={()=>setMediaPicker("music")}>Elegir de Biblioteca</button>{music&&<audio controls src={music}/>}</div><div className="studio-note full">♫ La música iniciará después de que el invitado abra la invitación.</div></div>}
    {active==="programa"&&<div className="studio-fields"><label className="full">Itinerario<textarea rows={8} value={program} onChange={e=>setProgram(e.target.value)} placeholder={"18:00 | Recepción\n19:00 | Ceremonia\n20:30 | Cena"}/><small>Una actividad por línea: hora | actividad</small></label></div>}
    {active==="vestimenta"&&<div className="studio-fields"><label className="full">Código de vestimenta<input value={dress} onChange={e=>setDress(e.target.value)} placeholder="Formal, cóctel, casual…"/></label></div>}
    {active==="regalos"&&<div className="studio-fields"><label className="full">Información de regalos<textarea rows={6} value={gift} onChange={e=>setGift(e.target.value)} placeholder="Mesa de regalos, transferencia, lluvia de sobres…"/></label></div>}
    {active==="rsvp"&&<div className="studio-fields"><label className="full">Texto para confirmar asistencia<input value={rsvpText} onChange={e=>setRsvpText(e.target.value)}/></label><label className="full">WhatsApp de contacto<input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="529981234567"/></label></div>}
    {error&&<p className="form-error">{error}</p>}
   </section>

   <aside className="studio-preview">
    <div className="studio-preview-head"><strong>Vista previa</strong><span>Celular</span></div>
    <div className="studio-phone"><div className="studio-phone-notch"/><div className="studio-phone-screen" style={{background:cover?`linear-gradient(rgba(25,15,20,.45),rgba(25,15,20,.58)),url("${cover}") center/cover`:`linear-gradient(160deg,${color},#21171d 55%,#fff 55%)`}}>
      <div className="studio-phone-hero"><small>{template?.name||"InvitaPro"}</small><span>ESTÁS INVITADO A</span><h2>{title||"Tu evento"}</h2><p>{subtitle}</p></div>
      <div className="studio-phone-body">
       {visibility.fecha&&<div><small>FECHA</small><strong>{date||"Por definir"} · {time||""}</strong></div>}
       {visibility.ubicacion&&<div><small>UBICACIÓN</small><strong>{venue||"Por definir"}</strong></div>}
       {visibility.vestimenta&&<div><small>VESTIMENTA</small><strong>{dress||"Por definir"}</strong></div>}
       {visibility.rsvp&&<button style={{background:color}}>{rsvpText||"Confirmar asistencia"}</button>}
      </div>
    </div></div>
    <p>La vista final incluirá las fotografías, música, animaciones y composición propia de la plantilla.</p>
   </aside>
  </div>

  <MediaLibraryPicker open={mediaPicker==="cover"} eventId={invite.evento_id} kind="imagen" selectedUrls={cover?[cover]:[]} onClose={()=>setMediaPicker(null)} onSelect={urls=>setCover(urls[0]||"")}/>
  <MediaLibraryPicker open={mediaPicker==="gallery"} eventId={invite.evento_id} kind="imagen" multiple maxSelected={8} selectedUrls={gallery} onClose={()=>setMediaPicker(null)} onSelect={urls=>setGallery(urls)}/>
  <MediaLibraryPicker open={mediaPicker==="music"} eventId={invite.evento_id} kind="audio" selectedUrls={music?[music]:[]} onClose={()=>setMediaPicker(null)} onSelect={urls=>setMusic(urls[0]||"")}/>
  {showTemplates&&<div className="modal-backdrop" onMouseDown={()=>setShowTemplates(false)}><section className="studio-template-modal" onMouseDown={e=>e.stopPropagation()}><header><div><p className="eyebrow">Catálogo completo</p><h2>Cambiar plantilla</h2><p>{TEMPLATE_COLLECTIONS.find(c=>c.id===collection)?.label} · {templates.length} diseños disponibles</p></div><button onClick={()=>setShowTemplates(false)}>×</button></header><div className="studio-template-grid">{templates.map(t=><button key={t.id} className={invite.template_key===t.id?"selected":""} onClick={()=>void changeTemplate(t.id)}><div style={{background:`linear-gradient(145deg,${t.color},#21171d)`}}><small>{t.premium?"Premium":"Disponible"}</small><strong>{t.name}</strong></div><h3>{t.name}</h3><p>{t.description}</p><span>{invite.template_key===t.id?"✓ Seleccionada":"Usar esta plantilla"}</span></button>)}</div></section></div>}
 </main>
}