'use client';
import Link from 'next/link';
import { DragEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ShareInvitationModal from '@/components/share-invitation-modal';
import MediaLibraryPicker from '@/components/media/media-library-picker';
import SectionNavigator, { SECTION_META } from '@/components/editor/section-navigator';
import { designValue, Evento, formatDate, initials, Invitacion, messageFromError, slugify } from '@/lib/invitapro';
import { TEMPLATE_CATALOG, TEMPLATE_COLLECTIONS } from '@/lib/template-catalog';
import { DEFAULT_TEMPLATE_SECTION_ORDER, normalizeTemplateSectionOrder, TemplateSectionId } from '@/lib/template-engine';
import { applyThemeStudioOverrides, normalizeThemeStudioOverrides, resolveThemeStudio, THEME_STUDIO_THEMES, themeStudioStyle, ThemeStudioOverrides } from '@/lib/theme-studio';

type SectionSettings=Record<TemplateSectionId,{eyebrow:string;title:string;description:string;buttonLabel:string;alignment:'left'|'center'|'right'}>;
const DEFAULT_SECTION_SETTINGS:SectionSettings={
  hero:{eyebrow:'Tenemos el honor de invitarte a',title:'',description:'',buttonLabel:'Descubre los detalles',alignment:'center'},
  intro:{eyebrow:'Estás cordialmente invitado',title:'Queremos compartir contigo este momento',description:'Será un honor contar con tu presencia para celebrar este día tan especial.',buttonLabel:'Agregar a mi calendario',alignment:'center'},
  countdown:{eyebrow:'Faltan',title:'Cuenta regresiva',description:'',buttonLabel:'',alignment:'center'},
  details:{eyebrow:'Información',title:'Todo lo que necesitas saber',description:'',buttonLabel:'',alignment:'center'},
  program:{eyebrow:'Itinerario',title:'Programa del evento',description:'',buttonLabel:'',alignment:'center'},
  gallery:{eyebrow:'Recuerdos',title:'Nuestra galería',description:'Algunos momentos que queremos compartir contigo.',buttonLabel:'',alignment:'center'},
  location:{eyebrow:'Ubicación',title:'',description:'',buttonLabel:'Cómo llegar',alignment:'center'},
  rsvp:{eyebrow:'RSVP',title:'¿Nos acompañas?',description:'Agradecemos confirmar tu asistencia.',buttonLabel:'Enviar confirmación',alignment:'center'}
};
function normalizeSectionSettings(value:unknown):SectionSettings{
  const input=value&&typeof value==='object'?value as Record<string,unknown>:{};
  return Object.fromEntries(Object.entries(DEFAULT_SECTION_SETTINGS).map(([id,defaults])=>{
    const current=input[id]&&typeof input[id]==='object'?input[id] as Record<string,unknown>:{};
    return [id,{...defaults,...current,alignment:['left','center','right'].includes(String(current.alignment))?String(current.alignment) as 'left'|'center'|'right':defaults.alignment}];
  })) as SectionSettings;
}
type FormState={evento_id:string;titulo:string;slug:string;modalidad:Invitacion['modalidad'];estado:Invitacion['estado'];plantilla:string;mensaje:string;subtitulo:string;vestimenta:string;programa:string;color_principal:string;portada_url:string;portada_efecto:string;pantalla_bienvenida:boolean;texto_bienvenida:string;galeria_urls:string[];musica_url:string;whatsapp:string;fecha_expiracion:string;theme_id:string;theme_overrides:ThemeStudioOverrides;section_order:TemplateSectionId[];mostrar_intro:boolean;mostrar_contador:boolean;mostrar_detalles:boolean;mostrar_programa:boolean;mostrar_galeria:boolean;mostrar_mapa:boolean;mostrar_rsvp:boolean;section_settings:SectionSettings};
const EMPTY:FormState={evento_id:'',titulo:'',slug:'',modalidad:'simple',estado:'borrador',plantilla:'elegante-classic',mensaje:'Será un honor contar con tu presencia para celebrar este día tan especial.',subtitulo:'Queremos compartir contigo este momento',vestimenta:'Formal',programa:'18:00 | Recepción\n19:00 | Ceremonia\n20:30 | Cena\n22:00 | Celebración',color_principal:'#8f5c38',portada_url:'',portada_efecto:'cinematic-zoom',pantalla_bienvenida:true,texto_bienvenida:'Abrir invitación',galeria_urls:[],musica_url:'',whatsapp:'',fecha_expiracion:'',theme_id:'elegant-classic',theme_overrides:{},section_order:[...DEFAULT_TEMPLATE_SECTION_ORDER],mostrar_intro:true,mostrar_contador:true,mostrar_detalles:true,mostrar_programa:true,mostrar_galeria:true,mostrar_mapa:true,mostrar_rsvp:true,section_settings:normalizeSectionSettings(null)};
const DEMO_CONTENT={
  portada_url:'/demo/portada-boda.jpg',
  galeria_urls:[
    '/demo/galeria/foto1.jpg',
    '/demo/galeria/foto2.jpg',
    '/demo/galeria/foto3.jpg',
    '/demo/galeria/foto4.jpg',
    '/demo/galeria/foto5.jpg',
    '/demo/galeria/foto6.jpg',
    '/demo/galeria/foto7.jpg',
    '/demo/galeria/foto8.jpg'
  ],
  musica_url:'/demo/music/romantic-demo.mp3',
  color_principal:'#9a6845',
  plantilla:'elegante-classic',
  subtitulo:'Una historia, un destino y un día para recordar',
  mensaje:'Con mucha alegría queremos compartir contigo el comienzo de esta nueva etapa.',
  vestimenta:'Formal',
  programa:'18:00 | Recepción\n19:00 | Ceremonia\n20:30 | Cena\n22:00 | Celebración'
};
const MODALITIES=[
  {id:'simple' as const,icon:'🔗',title:'Solo enlace',tag:'Básica',description:'Una invitación pública lista para compartir por WhatsApp.',features:['Invitación digital','Música, mapa y galería','Sin confirmaciones']},
  {id:'rsvp' as const,icon:'✓',title:'RSVP público',tag:'Popular',description:'Los asistentes confirman desde un formulario abierto.',features:['Todo lo de Solo enlace','Confirmación pública','Lista de respuestas']},
  {id:'pases' as const,icon:'★',title:'Pases personalizados',tag:'Premium',description:'Control individual por persona, pareja o familia.',features:['Códigos privados','Cupos de adultos y niños','Mesa y confirmación individual']}
];


function Icon({children}: {children: ReactNode}){return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>}
function EyeIcon(){return <Icon><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></Icon>}
function ShareIcon(){return <Icon><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.7 6.8-4.1M8.6 13.3l6.8 4.1"/></Icon>}
function EditIcon(){return <Icon><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></Icon>}
function ReviewIcon(){return <Icon><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></Icon>}
function PublishIcon(){return <Icon><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></Icon>}
function PauseIcon(){return <Icon><circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/></Icon>}
function ArchiveIcon(){return <Icon><path d="M3 6h18"/><path d="M5 6v14h14V6"/><path d="M8 3h8l2 3H6Z"/><path d="M10 11h4"/></Icon>}
function TrashIcon(){return <Icon><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></Icon>}
function CopyIcon(){return <Icon><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>}

export default function InvitacionesPage(){const supabase=useMemo(()=>createClient(),[]);const[eventos,setEventos]=useState<Evento[]>([]);const[items,setItems]=useState<Invitacion[]>([]);const[loading,setLoading]=useState(true);const[modal,setModal]=useState(false);const[editing,setEditing]=useState<Invitacion|null>(null);const[deleting,setDeleting]=useState<Invitacion|null>(null);const[form,setForm]=useState<FormState>(EMPTY);const[error,setError]=useState('');const[search,setSearch]=useState('');const[filter,setFilter]=useState('todas');const[saving,setSaving]=useState(false);const[uploading,setUploading]=useState<'cover'|'gallery'|'audio'|null>(null);const[sharing,setSharing]=useState<Invitacion|null>(null);const[mediaPicker,setMediaPicker]=useState<'cover'|'gallery'|'audio'|null>(null);const[reviewing,setReviewing]=useState<Invitacion|null>(null);const[reviewBusy,setReviewBusy]=useState(false);const[templateFilter,setTemplateFilter]=useState('todas');const[copiedSlug,setCopiedSlug]=useState('');const[draggedSection,setDraggedSection]=useState<TemplateSectionId|null>(null);const[selectedSection,setSelectedSection]=useState<TemplateSectionId>('hero');
async function load(){setLoading(true);const[e,i]=await Promise.all([supabase.from('eventos').select('*, clientes(id,nombre)').order('fecha'),supabase.from('invitaciones').select('*, eventos(id,nombre,tipo,fecha,hora,lugar,direccion,maps_url,cliente_id,clientes(id,nombre))').order('created_at',{ascending:false})]);if(e.error)setError(messageFromError(e.error));else setEventos((e.data??[]) as Evento[]);if(i.error)setError(messageFromError(i.error));else setItems((i.data??[]) as Invitacion[]);setLoading(false)}useEffect(()=>{void load()},[]);
useEffect(()=>{
  if(typeof window==='undefined'||eventos.length===0)return;
  const params=new URLSearchParams(window.location.search);
  const templateId=params.get('plantilla');
  if(!templateId)return;
  const template=TEMPLATE_CATALOG.find(item=>item.id===templateId&&item.available);
  if(!template)return;
  const ev=eventos[0];
  setEditing(null);
  setTemplateFilter(template.collection);
  setForm({...EMPTY,evento_id:ev?.id??'',titulo:ev?.nombre??'',slug:slugify(ev?.nombre??''),plantilla:template.id,color_principal:template.color});
  setError('');
  setModal(true);
  window.history.replaceState({},'',window.location.pathname);
},[eventos]);
function openNew(){const ev=eventos[0];setEditing(null);setForm({...EMPTY,evento_id:ev?.id??'',titulo:ev?.nombre??'',slug:slugify(ev?.nombre??'')});setError('');setModal(true)}function openEdit(x:Invitacion){const d=x.design_json||{};setEditing(x);setForm({evento_id:x.evento_id,titulo:x.titulo,slug:x.slug,modalidad:x.modalidad,estado:x.estado,plantilla:designValue(x,'plantilla','elegante'),mensaje:designValue(x,'mensaje',''),subtitulo:designValue(x,'subtitulo','Queremos compartir contigo este momento'),vestimenta:designValue(x,'vestimenta','Formal'),programa:designValue(x,'programa','18:00 | Recepción\n19:00 | Ceremonia\n20:30 | Cena\n22:00 | Celebración'),color_principal:x.color_principal??'#8f5c38',portada_url:designValue(x,'portada_url',''),portada_efecto:designValue(x,'portada_efecto','cinematic-zoom'),pantalla_bienvenida:d.pantalla_bienvenida!==false,texto_bienvenida:designValue(x,'texto_bienvenida','Abrir invitación'),galeria_urls:Array.isArray(d.galeria_urls)?d.galeria_urls.filter((url):url is string=>typeof url==='string'):[],musica_url:x.musica_url??'',whatsapp:x.whatsapp??'',fecha_expiracion:x.fecha_expiracion?.slice(0,16)??'',theme_id:typeof d.theme_id==='string'?d.theme_id:'elegant-classic',theme_overrides:normalizeThemeStudioOverrides(d.theme_overrides),section_order:normalizeTemplateSectionOrder(d.section_order),mostrar_intro:d.mostrar_intro!==false,mostrar_contador:d.mostrar_contador!==false,mostrar_detalles:d.mostrar_detalles!==false,mostrar_programa:d.mostrar_programa!==false,mostrar_galeria:d.mostrar_galeria!==false,mostrar_mapa:d.mostrar_mapa!==false,mostrar_rsvp:d.mostrar_rsvp!==false,section_settings:normalizeSectionSettings(d.section_settings)});setError('');setModal(true)}

function loadDemoContent(){
  setForm(current=>({
    ...current,
    portada_url:DEMO_CONTENT.portada_url,
    portada_efecto:'cinematic-zoom',
    pantalla_bienvenida:true,
    texto_bienvenida:'Abrir invitación',
    galeria_urls:[...DEMO_CONTENT.galeria_urls],
    musica_url:DEMO_CONTENT.musica_url,
    color_principal:DEMO_CONTENT.color_principal,
    plantilla:DEMO_CONTENT.plantilla,
    subtitulo:DEMO_CONTENT.subtitulo,
    mensaje:DEMO_CONTENT.mensaje,
    vestimenta:DEMO_CONTENT.vestimenta,
    programa:DEMO_CONTENT.programa,
    mostrar_galeria:true,
    mostrar_programa:true,
    mostrar_contador:true,
    mostrar_detalles:true,
    mostrar_mapa:true
  }));
  setError('');
}
function selectTemplate(templateId:string){
  const template=TEMPLATE_CATALOG.find(item=>item.id===templateId);
  if(!template||!template.available)return;
  setForm(current=>({...current,plantilla:template.id,color_principal:template.color}));
}
function moveSection(sectionId:TemplateSectionId,direction:-1|1){
  setForm(current=>{
    const order=[...current.section_order];
    const index=order.indexOf(sectionId);
    const target=index+direction;
    if(index<0||target<0||target>=order.length)return current;
    [order[index],order[target]]=[order[target],order[index]];
    return {...current,section_order:order};
  });
}
function reorderSection(sourceId:TemplateSectionId,targetId:TemplateSectionId){
  if(sourceId===targetId)return;
  setForm(current=>{
    const order=[...current.section_order];
    const sourceIndex=order.indexOf(sourceId);
    const targetIndex=order.indexOf(targetId);
    if(sourceIndex<0||targetIndex<0)return current;
    order.splice(sourceIndex,1);
    order.splice(targetIndex,0,sourceId);
    return {...current,section_order:order};
  });
}
function handleSectionDragStart(event:DragEvent<HTMLElement>,sectionId:TemplateSectionId){
  setDraggedSection(sectionId);
  event.dataTransfer.effectAllowed='move';
  event.dataTransfer.setData('text/plain',sectionId);
}
function handleSectionDragOver(event:DragEvent<HTMLElement>,targetId:TemplateSectionId){
  event.preventDefault();
  event.dataTransfer.dropEffect='move';
  if(draggedSection&&draggedSection!==targetId)reorderSection(draggedSection,targetId);
}
function handleSectionDragEnd(){setDraggedSection(null)}
function sectionEnabled(sectionId:TemplateSectionId){
  if(sectionId==='hero')return true;
  if(sectionId==='intro')return form.mostrar_intro;
  const field={countdown:'mostrar_contador',details:'mostrar_detalles',program:'mostrar_programa',gallery:'mostrar_galeria',location:'mostrar_mapa',rsvp:'mostrar_rsvp'}[sectionId] as keyof FormState|undefined;
  return field?Boolean(form[field]):true;
}
function updateSectionSetting<K extends keyof SectionSettings[TemplateSectionId]>(sectionId:TemplateSectionId,key:K,value:SectionSettings[TemplateSectionId][K]){setForm(current=>({...current,section_settings:{...current.section_settings,[sectionId]:{...current.section_settings[sectionId],[key]:value}}}))}
function toggleSection(sectionId:TemplateSectionId){
  if(sectionId==='hero')return;
  const field={intro:'mostrar_intro',countdown:'mostrar_contador',details:'mostrar_detalles',program:'mostrar_programa',gallery:'mostrar_galeria',location:'mostrar_mapa',rsvp:'mostrar_rsvp'}[sectionId] as keyof FormState|undefined;
  if(!field)return;
  setForm(current=>({...current,[field]:!Boolean(current[field])}));
}
function safeFileName(name:string){return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')}
async function uploadAsset(file:File,bucket:'event-media'|'event-audio',tipo:'imagen'|'audio'){
  if(!form.evento_id)throw new Error('Selecciona primero un evento.');
  const{data:userData,error:userError}=await supabase.auth.getUser();
  if(userError||!userData.user)throw new Error('La sesión no está disponible.');
  const ext=file.name.includes('.')?file.name.split('.').pop():'bin';
  const base=safeFileName(file.name.replace(/\.[^.]+$/,'')||'archivo');
  const path=`${userData.user.id}/${form.evento_id}/${Date.now()}-${base}.${ext}`;
  const{error:uploadError}=await supabase.storage.from(bucket).upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined});
  if(uploadError)throw uploadError;
  const{data:urlData}=supabase.storage.from(bucket).getPublicUrl(path);
  const{error:mediaError}=await supabase.from('media').insert({evento_id:form.evento_id,invitacion_id:editing?.id??null,owner_id:userData.user.id,tipo,bucket,path,nombre_original:file.name,mime_type:file.type||null,size_bytes:file.size});
  if(mediaError)console.warn('El archivo se subió, pero no se registró en media:',mediaError.message);
  return urlData.publicUrl;
}
async function handleCover(file?:File){
  if(!file)return;
  if(!file.type.startsWith('image/'))return setError('La portada debe ser una imagen.');
  if(file.size>5*1024*1024)return setError('La portada no debe superar 5 MB.');
  setUploading('cover');setError('');
  try{const url=await uploadAsset(file,'event-media','imagen');setForm(current=>({...current,portada_url:url}))}
  catch(e){setError(messageFromError(e))}
  finally{setUploading(null)}
}
async function handleGallery(files:FileList|null){
  if(!files?.length)return;
  const selected=Array.from(files).slice(0,8-form.galeria_urls.length);
  if(selected.some(file=>!file.type.startsWith('image/')))return setError('La galería solo acepta imágenes.');
  if(selected.some(file=>file.size>5*1024*1024))return setError('Cada imagen debe pesar máximo 5 MB.');
  setUploading('gallery');setError('');
  try{const urls=[] as string[];for(const file of selected)urls.push(await uploadAsset(file,'event-media','imagen'));setForm(current=>({...current,galeria_urls:[...current.galeria_urls,...urls].slice(0,8)}))}
  catch(e){setError(messageFromError(e))}
  finally{setUploading(null)}
}
async function handleAudio(file?:File){
  if(!file)return;
  if(!file.type.startsWith('audio/'))return setError('Selecciona un archivo de audio.');
  if(file.size>10*1024*1024)return setError('El audio no debe superar 10 MB.');
  setUploading('audio');setError('');
  try{const url=await uploadAsset(file,'event-audio','audio');setForm(current=>({...current,musica_url:url}))}
  catch(e){setError(messageFromError(e))}
  finally{setUploading(null)}
}
async function save(e:FormEvent){e.preventDefault();const slug=slugify(form.slug||form.titulo);if(!form.evento_id)return setError('Selecciona un evento.');if(!form.titulo.trim()||!slug)return setError('Título y enlace son obligatorios.');setSaving(true);const design_json={version:6,componentes:[],theme_id:form.theme_id,theme_overrides:form.theme_overrides,section_order:form.section_order,section_settings:form.section_settings,mostrar_intro:form.mostrar_intro,plantilla:form.plantilla,mensaje:form.mensaje.trim(),subtitulo:form.subtitulo.trim(),vestimenta:form.vestimenta.trim(),programa:form.programa.trim(),portada_url:form.portada_url,portada_efecto:form.portada_efecto,pantalla_bienvenida:form.pantalla_bienvenida,texto_bienvenida:form.texto_bienvenida.trim()||'Abrir invitación',galeria_urls:form.galeria_urls,mostrar_contador:form.mostrar_contador,mostrar_detalles:form.mostrar_detalles,mostrar_programa:form.mostrar_programa,mostrar_galeria:form.mostrar_galeria,mostrar_mapa:form.mostrar_mapa,mostrar_rsvp:form.mostrar_rsvp};const payload={evento_id:form.evento_id,titulo:form.titulo.trim(),slug,modalidad:form.modalidad,estado:form.estado,design_json,color_principal:form.color_principal,musica_url:form.musica_url.trim()||null,whatsapp:form.whatsapp.replace(/\D/g,'')||null,fecha_publicacion:form.estado==='publicada'?(editing?.fecha_publicacion??new Date().toISOString()):null,fecha_expiracion:form.fecha_expiracion?new Date(form.fecha_expiracion).toISOString():null};const r=editing?await supabase.from('invitaciones').update(payload).eq('id',editing.id):await supabase.from('invitaciones').insert(payload);setSaving(false);if(r.error)return setError(messageFromError(r.error));setModal(false);await load()}
async function changeStatus(x:Invitacion,estado:Invitacion['estado']){const r=await supabase.from('invitaciones').update({estado,fecha_publicacion:estado==='publicada'?(x.fecha_publicacion??new Date().toISOString()):x.fecha_publicacion}).eq('id',x.id);if(r.error)setError(messageFromError(r.error));else{await load();setEditing(current=>current?.id===x.id?{...current,estado}:current)}}
async function toggle(x:Invitacion){await changeStatus(x,x.estado==='publicada'?'pausada':'publicada')}
async function ensureReviewLink(x:Invitacion){setReviewBusy(true);setError('');const token=x.review_token||crypto.randomUUID().replace(/-/g,'');const r=await supabase.from('invitaciones').update({review_token:token,review_enabled:true}).eq('id',x.id).select('*').single();setReviewBusy(false);if(r.error)return setError(messageFromError(r.error));const updated={...x,...r.data} as Invitacion;setReviewing(updated);setItems(current=>current.map(item=>item.id===updated.id?updated:item))}
async function disableReview(x:Invitacion){setReviewBusy(true);const r=await supabase.from('invitaciones').update({review_enabled:false}).eq('id',x.id);setReviewBusy(false);if(r.error)return setError(messageFromError(r.error));setReviewing({...x,review_enabled:false});setItems(current=>current.map(item=>item.id===x.id?{...item,review_enabled:false}:item))}
async function regenerateReview(x:Invitacion){setReviewBusy(true);const token=crypto.randomUUID().replace(/-/g,'');const r=await supabase.from('invitaciones').update({review_token:token,review_enabled:true}).eq('id',x.id).select('*').single();setReviewBusy(false);if(r.error)return setError(messageFromError(r.error));const updated={...x,...r.data} as Invitacion;setReviewing(updated);setItems(current=>current.map(item=>item.id===updated.id?updated:item))}
async function remove(){if(!deleting)return;const r=await supabase.from('invitaciones').delete().eq('id',deleting.id);if(r.error)setError(messageFromError(r.error));setDeleting(null);await load()}
const statusCounts=useMemo(()=>({
  todas:items.length,
  borrador:items.filter(x=>x.estado==='borrador').length,
  publicada:items.filter(x=>x.estado==='publicada').length,
  pausada:items.filter(x=>x.estado==='pausada').length,
  archivada:items.filter(x=>x.estado==='archivada').length
}),[items]);
const list=useMemo(()=>items.filter(x=>filter==='todas'||x.estado===filter).filter(x=>[x.titulo,x.slug,x.eventos?.nombre,x.eventos?.clientes?.nombre].join(' ').toLowerCase().includes(search.toLowerCase().trim())),[items,filter,search]);
async function copyInvitationLink(x:Invitacion){
  const url=`${window.location.origin}/invitacion/${x.slug}`;
  await navigator.clipboard.writeText(url);
  setCopiedSlug(x.slug);
  window.setTimeout(()=>setCopiedSlug(current=>current===x.slug?'':current),1800);
}
return <div className="page-stack"><section className="page-heading"><div><p className="eyebrow">Constructor digital</p><h1>Invitaciones</h1><p>Crea, personaliza y publica experiencias digitales para cada evento.</p></div><button className="button button-primary" onClick={openNew}>+ Nueva invitación</button></section><section className="stats-grid invitation-stats"><article className="stat-card"><span>Total</span><strong>{items.length}</strong><small>Registradas</small></article><article className="stat-card"><span>Publicadas</span><strong>{statusCounts.publicada}</strong><small>Enlaces activos</small></article><article className="stat-card"><span>Con RSVP</span><strong>{items.filter(x=>x.modalidad!=='simple').length}</strong><small>Reciben respuestas</small></article><article className="stat-card"><span>Eventos</span><strong>{eventos.length}</strong><small>Disponibles</small></article></section><section className="panel-card invitation-library-card"><div className="panel-header events-toolbar invitation-library-toolbar"><div><h2>Biblioteca de invitaciones</h2><p>Gestiona, publica y comparte tus invitaciones.</p></div><div className="events-filters"><label className="search-field"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar invitación"/></label><select className="status-filter" value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filtrar por estado"><option value="todas">Todos los estados</option><option value="borrador">Borrador</option><option value="publicada">Publicada</option><option value="pausada">Pausada</option><option value="vencida">Vencida</option><option value="archivada">Archivada</option></select></div></div><div className="invitation-filter-tabs" role="tablist" aria-label="Estados de invitaciones">{[['todas','Todas'],['borrador','Borrador'],['publicada','Publicadas'],['pausada','Pausadas'],['archivada','Archivadas']].map(([value,label])=><button key={value} type="button" role="tab" aria-selected={filter===value} className={filter===value?'active':''} onClick={()=>setFilter(value)}><span>{label}</span><strong>{statusCounts[value as keyof typeof statusCounts]}</strong></button>)}</div>{loading?<div className="dashboard-loading">Cargando invitaciones…</div>:list.length===0?<div className="empty-state compact-empty"><div className="empty-icon">✉</div><h2>Sin resultados</h2><p>{search?'No encontramos invitaciones que coincidan con tu búsqueda.':'No hay invitaciones en este estado.'}</p>{(search||filter!=='todas')&&<button type="button" className="button button-outline" onClick={()=>{setSearch('');setFilter('todas')}}>Limpiar filtros</button>}</div>:<div className="table-wrap"><table className="data-table invitation-table"><thead><tr><th>Invitación</th><th>Evento / cliente</th><th>Modalidad</th><th>Estado</th><th>Enlace</th><th>Acciones</th></tr></thead><tbody>{list.map(x=><tr key={x.id}><td><div className="event-name-cell invitation-identity"><span className="event-avatar" style={{background:x.color_principal??'#8f5c38'}}>{initials(x.titulo)}</span><div><strong>{x.titulo}</strong><span>{designValue(x,'plantilla','elegante')}</span><small>ID: {x.id.slice(0,8)}</small></div></div></td><td><strong>{x.eventos?.nombre||'—'}</strong><span>{x.eventos?.clientes?.nombre||'—'}</span><span>{formatDate(x.eventos?.fecha)}</span></td><td><span className={`modality-badge modality-${x.modalidad}`}>{x.modalidad==='simple'?'Simple':x.modalidad==='rsvp'?'RSVP':'Pases'}</span></td><td><span className={`invite-status invite-status-${x.estado}`}>{x.estado}</span></td><td><div className="invitation-link-box"><code>/invitacion/{x.slug}</code><button type="button" onClick={()=>void copyInvitationLink(x)} title="Copiar enlace" aria-label={`Copiar enlace de ${x.titulo}`}><CopyIcon/></button>{copiedSlug===x.slug&&<span className="copy-feedback">Copiado</span>}</div></td><td className="invitation-actions-cell"><div className="invitation-action-panel"><div className="invitation-action-primary"><Link className="invite-action-button action-preview" href={`/invitacion/${x.slug}?preview=1`} target="_blank"><EyeIcon/><span>Vista previa</span></Link>{x.modalidad==='pases'?<Link className="invite-action-button action-share" href="/admin/invitados"><ShareIcon/><span>Gestionar</span></Link>:<button className="invite-action-button action-share" onClick={()=>setSharing(x)} disabled={x.estado!=='publicada'} title={x.estado!=='publicada'?'Publica la invitación antes de compartirla':''}><ShareIcon/><span>Compartir</span></button>}<button className="invite-action-button action-edit" onClick={()=>openEdit(x)}><EditIcon/><span>Editar</span></button><button className="invite-action-button action-review" onClick={()=>void ensureReviewLink(x)}><ReviewIcon/><span>Revisión</span></button></div><div className="invitation-action-secondary"><button className={`invite-secondary-action ${x.estado==='publicada'?'action-pause':'action-publish'}`} onClick={()=>toggle(x)}>{x.estado==='publicada'?<PauseIcon/>:<PublishIcon/>}<span>{x.estado==='publicada'?'Pausar':'Publicar'}</span></button><button className="invite-secondary-action action-archive" onClick={()=>void changeStatus(x,'archivada')}><ArchiveIcon/><span>Archivar</span></button><button className="invite-secondary-action action-delete" onClick={()=>setDeleting(x)}><TrashIcon/><span>Eliminar</span></button></div></div></td></tr>)}</tbody></table></div>}</section>{error&&!modal&&<p className="form-error">{error}</p>}
{modal&&<div className="modal-backdrop" onMouseDown={()=>setModal(false)}>
  <section className="modal-card invitation-builder-modal" onMouseDown={e=>e.stopPropagation()}>
    <header className="modal-header invitation-builder-header">
      <div>
        <p className="eyebrow">Constructor comercial</p>
        <h2>{editing?'Editar invitación':'Nueva invitación'}</h2>
        <p>Elige la modalidad y configura la experiencia que recibirá tu cliente.</p>
      </div>
      <button type="button" className="modal-close" aria-label="Cerrar" onClick={()=>setModal(false)}>×</button>
    </header>

    <form className="invitation-builder-form" onSubmit={save}>
      <div className="invitation-builder-scroll">
        <section className="invitation-builder-section">
          <div className="invitation-section-heading">
            <span>1</span>
            <div>
              <strong>Tipo de invitación</strong>
              <small>Selecciona el plan adecuado para este evento.</small>
            </div>
          </div>

          <div className="modality-card-grid">
            {MODALITIES.map(option=>{
              const selected=form.modalidad===option.id;
              return <button
                key={option.id}
                type="button"
                className={`modality-card ${selected?'selected':''}`}
                onClick={()=>setForm({...form,modalidad:option.id})}
                aria-pressed={selected}
              >
                <div className="modality-card-top">
                  <span className="modality-icon">{option.icon}</span>
                  <span className="modality-tag">{option.tag}</span>
                </div>
                <strong>{option.title}</strong>
                <p>{option.description}</p>
                <ul>{option.features.map(feature=><li key={feature}>{feature}</li>)}</ul>
                <span className="modality-select-state">{selected?'✓ Seleccionada':'Seleccionar'}</span>
              </button>
            })}
          </div>
        </section>

        <div className="invitation-builder-layout visual-builder-layout">
          <SectionNavigator order={form.section_order} selected={selectedSection} modalidad={form.modalidad} isEnabled={sectionEnabled} onSelect={setSelectedSection}/>
          <div className="invitation-builder-fields">
            <section className="invitation-builder-section">
              <div className="invitation-section-heading">
                <span>2</span>
                <div>
                  <strong>Información principal</strong>
                  <small>Define el evento, nombre y enlace público.</small>
                </div>
              </div>

              <div className="invitation-form-grid">
                <label className="form-field">
                  <span>Evento *</span>
                  <select value={form.evento_id} onChange={e=>{const ev=eventos.find(x=>x.id===e.target.value);setForm({...form,evento_id:e.target.value,titulo:form.titulo||ev?.nombre||'',slug:form.slug||slugify(ev?.nombre||'')})}}>
                    <option value="">Selecciona un evento</option>
                    {eventos.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}
                  </select>
                </label>

                <label className="form-field">
                  <span>Estado</span>
                  <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value as Invitacion['estado']})}>
                    <option value="borrador">Borrador</option>
                    <option value="publicada">Publicada</option>
                    <option value="pausada">Pausada</option>
                    <option value="vencida">Vencida</option><option value="archivada">Archivada</option>
                  </select>
                </label>

                <label className="form-field full-width">
                  <span>Título *</span>
                  <input value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value,slug:editing?form.slug:slugify(e.target.value)})} placeholder="Ej. XV años de Valeria"/>
                </label>

                <label className="form-field full-width">
                  <span>Enlace personalizado *</span>
                  <div className="slug-input builder-slug-input">
                    <span>/invitacion/</span>
                    <input value={form.slug} onChange={e=>setForm({...form,slug:slugify(e.target.value)})} placeholder="xv-valeria"/>
                  </div>
                </label>
              </div>
            </section>

            <section className="invitation-builder-section">
              <div className="invitation-section-heading">
                <span>3</span>
                <div>
                  <strong>Diseño y contenido</strong>
                  <small>Personaliza el estilo general de la invitación.</small>
                </div>
              </div>

              <div className="invitation-form-grid">
                <div className="template-catalog-field full-width">
                  <div className="template-catalog-title">
                    <div>
                      <span>Catálogo de plantillas</span>
                      <small>Selecciona un diseño. Tu contenido y modalidad se conservarán.</small>
                    </div>
                    <strong>{TEMPLATE_CATALOG.find(item=>item.id===form.plantilla)?.name||'Selecciona una plantilla'}</strong>
                  </div>

                  <div className="template-filter-row">
                    {TEMPLATE_COLLECTIONS.map(collection=><button
                      key={collection.id}
                      type="button"
                      className={templateFilter===collection.id?'active':''}
                      onClick={()=>setTemplateFilter(collection.id)}
                    >{collection.label}</button>)}
                  </div>

                  <div className="template-catalog-grid">
                    {TEMPLATE_CATALOG
                      .filter(template=>templateFilter==='todas'||template.collection===templateFilter)
                      .map(template=>{
                        const selected=form.plantilla===template.id;
                        return <button
                          key={template.id}
                          type="button"
                          className={`template-catalog-card theme-preview-${template.id} ${selected?'selected':''} ${!template.available?'disabled':''}`}
                          onClick={()=>selectTemplate(template.id)}
                          disabled={!template.available}
                        >
                          <div className="template-mini-preview">
                            <span className="template-preview-kicker">{template.collection}</span>
                            <strong>A & M</strong>
                            <i/>
                            <small>Una fecha para recordar</small>
                          </div>
                          <div className="template-card-copy">
                            <div>
                              <strong>{template.name}</strong>
                              <span>{template.badge}</span>
                            </div>
                            <p>{template.description}</p>
                            <em>{selected?'✓ Seleccionada':template.available?'Seleccionar':'En desarrollo'}</em>
                          </div>
                        </button>
                      })}
                  </div>
                </div>

                <label className="form-field">
                  <span>Color principal</span>
                  <div className="color-field builder-color-field">
                    <input type="color" value={form.color_principal} onChange={e=>setForm({...form,color_principal:e.target.value})}/>
                    <input value={form.color_principal} onChange={e=>setForm({...form,color_principal:e.target.value})}/>
                  </div>
                </label>

                <label className="form-field full-width">
                  <span>Mensaje de bienvenida</span>
                  <textarea rows={3} value={form.mensaje} onChange={e=>setForm({...form,mensaje:e.target.value})}/>
                </label>

                <label className="form-field full-width">
                  <span>Título de introducción</span>
                  <input value={form.subtitulo} onChange={e=>setForm({...form,subtitulo:e.target.value})} placeholder="Queremos compartir contigo este momento"/>
                </label>

                <label className="form-field full-width">
                  <span>Programa del evento</span>
                  <textarea rows={4} value={form.programa} onChange={e=>setForm({...form,programa:e.target.value})} placeholder={'18:00 | Recepción\n19:00 | Ceremonia'}/>
                  <small>Escribe un horario por línea usando: hora | actividad.</small>
                </label>

                <label className="form-field">
                  <span>Código de vestimenta</span>
                  <input value={form.vestimenta} onChange={e=>setForm({...form,vestimenta:e.target.value})}/>
                </label>

                <label className="form-field">
                  <span>WhatsApp del anfitrión</span>
                  <input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="5219991234567"/>
                </label>

                <label className="form-field">
                  <span>Fecha de expiración</span>
                  <input type="datetime-local" value={form.fecha_expiracion} onChange={e=>setForm({...form,fecha_expiracion:e.target.value})}/>
                </label>
              </div>

              <div className="opening-experience-panel">
                <div className="block-config-heading">
                  <strong>Experiencia de apertura</strong>
                  <span>El primer toque permite iniciar la música correctamente en teléfonos y computadoras.</span>
                </div>

                <div className="opening-experience-grid">
                  <label className="opening-toggle-card">
                    <input
                      type="checkbox"
                      checked={form.pantalla_bienvenida}
                      onChange={e=>setForm({...form,pantalla_bienvenida:e.target.checked})}
                    />
                    <span>
                      <strong>Mostrar pantalla de bienvenida</strong>
                      <small>Recomendada cuando la invitación tiene música.</small>
                    </span>
                  </label>

                  <label className="form-field">
                    <span>Texto del botón</span>
                    <input
                      value={form.texto_bienvenida}
                      disabled={!form.pantalla_bienvenida}
                      onChange={e=>setForm({...form,texto_bienvenida:e.target.value})}
                      placeholder="Abrir invitación"
                    />
                  </label>

                  <label className="form-field full-width">
                    <span>Efecto de la fotografía de portada</span>
                    <select
                      value={form.portada_efecto}
                      onChange={e=>setForm({...form,portada_efecto:e.target.value})}
                    >
                      <option value="cinematic-zoom">Zoom cinematográfico</option>
                      <option value="blur-focus">Desenfoque a enfoque</option>
                      <option value="slow-pan">Movimiento lateral suave</option>
                      <option value="fade-in">Fundido elegante</option>
                      <option value="none">Sin efecto</option>
                    </select>
                  </label>
                </div>

                <div className={`opening-mini-preview effect-${form.portada_efecto}`}>
                  <div
                    className="opening-mini-background"
                    style={form.portada_url?{backgroundImage:`url("${form.portada_url}")`}:undefined}
                  />
                  <div className="opening-mini-overlay">
                    <small>Esta invitación es para</small>
                    <strong>{form.titulo||'Tu evento especial'}</strong>
                    <span>{form.pantalla_bienvenida?(form.texto_bienvenida||'Abrir invitación'):'Apertura directa'}</span>
                  </div>
                </div>
              </div>

              <div className="media-manager-panel">
                <div className="media-manager-heading-row">
                  <div className="block-config-heading">
                    <strong>Fotografías y música</strong>
                    <span>Sube tus archivos o carga el paquete demo incluido.</span>
                  </div>
                  <button type="button" className="button button-demo" onClick={loadDemoContent}>Usar contenido demo</button>
                </div>

                <div className="media-manager-grid">
                  <article className="media-upload-card">
                    <div className="media-upload-preview cover" style={form.portada_url?{backgroundImage:`url("${form.portada_url}")`}:undefined}>
                      {!form.portada_url&&<span>Portada</span>}
                    </div>
                    <div>
                      <strong>Fotografía de portada</strong>
                      <small>JPG, PNG o WebP. Máximo 5 MB.</small>
                    </div>
                    <label className="button button-outline media-file-button">
                      {uploading==='cover'?'Subiendo…':'Seleccionar portada'}
                      <input type="file" accept="image/*" disabled={Boolean(uploading)} onChange={e=>void handleCover(e.target.files?.[0])}/>
                    </label>
                    <button type="button" className="button button-soft media-library-button" disabled={!form.evento_id} onClick={()=>setMediaPicker('cover')}>Elegir de Biblioteca</button>
                    {form.portada_url&&<button type="button" className="text-button danger" onClick={()=>setForm({...form,portada_url:''})}>Quitar portada</button>}
                  </article>

                  <article className="media-upload-card">
                    <div className="media-gallery-preview">
                      {form.galeria_urls.length===0?<span>Galería</span>:form.galeria_urls.slice(0,4).map((url,index)=><img key={url} src={url} alt={`Galería ${index+1}`}/>)}
                    </div>
                    <div>
                      <strong>Galería de fotografías</strong>
                      <small>{form.galeria_urls.length}/8 imágenes cargadas.</small>
                    </div>
                    <label className="button button-outline media-file-button">
                      {uploading==='gallery'?'Subiendo…':'Agregar fotografías'}
                      <input type="file" accept="image/*" multiple disabled={Boolean(uploading)||form.galeria_urls.length>=8} onChange={e=>void handleGallery(e.target.files)}/>
                    </label>
                    <button type="button" className="button button-soft media-library-button" disabled={!form.evento_id||form.galeria_urls.length>=8} onClick={()=>setMediaPicker('gallery')}>Elegir de Biblioteca</button>
                    {form.galeria_urls.length>0&&<div className="gallery-chip-list">{form.galeria_urls.map((url,index)=><button key={url} type="button" onClick={()=>setForm({...form,galeria_urls:form.galeria_urls.filter(item=>item!==url)})}>Foto {index+1} ×</button>)}</div>}
                  </article>

                  <article className="media-upload-card audio-manager-card">
                    <div className="audio-upload-icon">♫</div>
                    <div>
                      <strong>Música de fondo</strong>
                      <small>Sube un archivo MP3, M4A u otro audio. Máximo 10 MB.</small>
                    </div>

                    <label className="button button-outline media-file-button">
                      {uploading==='audio'?'Subiendo música…':form.musica_url?'Cambiar música':'Seleccionar música'}
                      <input
                        type="file"
                        accept="audio/*"
                        disabled={Boolean(uploading)}
                        onChange={e=>void handleAudio(e.target.files?.[0])}
                      />
                    </label>
                    <button type="button" className="button button-soft media-library-button" disabled={!form.evento_id} onClick={()=>setMediaPicker('audio')}>Elegir de Biblioteca</button>

                    {form.musica_url&&<div className="audio-file-status">
                      <span className="audio-status-check">✓</span>
                      <div>
                        <strong>Música cargada correctamente</strong>
                        <small>{form.musica_url.startsWith('/demo/')?'Pista de demostración incluida':'Archivo de música seleccionado'}</small>
                      </div>
                    </div>}

                    {form.musica_url&&<audio className="admin-audio-preview" controls src={form.musica_url}/>}

                    {form.musica_url&&<button
                      type="button"
                      className="text-button danger audio-remove-button"
                      onClick={()=>setForm({...form,musica_url:''})}
                    >
                      Quitar música
                    </button>}
                  </article>
                </div>
              </div>

              <div className="block-config-panel theme-studio-panel">
                <div className="block-config-heading">
                  <strong>Theme Studio</strong>
                  <span>Aplica una identidad completa de colores, tipografía, botones y superficies con un solo clic.</span>
                </div>
                <div className="theme-studio-grid">
                  {THEME_STUDIO_THEMES.map(theme=>{
                    const active=form.theme_id===theme.id;
                    return <button
                      type="button"
                      key={theme.id}
                      className={`theme-studio-card ${active?'active':''}`}
                      onClick={()=>setForm(current=>({...current,theme_id:theme.id,theme_overrides:{},color_principal:theme.palette.primary}))}
                      aria-pressed={active}
                    >
                      <span className="theme-studio-preview" style={{background:`linear-gradient(145deg, ${theme.palette.background} 0 54%, ${theme.palette.surface} 54% 100%)`}}>
                        <i style={{background:theme.palette.primary}}/>
                        <i style={{background:theme.palette.secondary}}/>
                        <i style={{background:theme.palette.text}}/>
                      </span>
                      <span className="theme-studio-copy"><small>{theme.collection}</small><strong>{theme.name}</strong><em>{theme.description}</em></span>
                      <span className="theme-studio-check">{active?'✓':'Aplicar'}</span>
                    </button>
                  })}
                </div>
                <div className="theme-studio-current">
                  <span>Tema activo</span>
                  <strong>{resolveThemeStudio(form.theme_id).name}</strong>
                  <small>Personaliza colores y tipografías con vista previa en tiempo real.</small>
                </div>
                <div className="theme-studio-customizer">
                  <div className="theme-studio-customizer-heading">
                    <div><strong>Personalizar tema</strong><small>Ajusta colores y tipografías sin perder el tema base.</small></div>
                    <button type="button" onClick={()=>setForm(current=>({...current,theme_overrides:{},color_principal:resolveThemeStudio(current.theme_id).palette.primary}))}>Restablecer</button>
                  </div>
                  <div className="theme-studio-color-grid">
                    {[['primary','Principal'],['secondary','Secundario'],['background','Fondo'],['surface','Tarjetas'],['text','Texto']] .map(([key,label])=>{
                      const base=resolveThemeStudio(form.theme_id);
                      const value=(form.theme_overrides as Record<string,string>)[key] || (base.palette as unknown as Record<string,string>)[key];
                      return <label key={key}><span>{label}</span><div><input type="color" value={value} onChange={event=>setForm(current=>({...current,color_principal:key==='primary'?event.target.value:current.color_principal,theme_overrides:{...current.theme_overrides,[key]:event.target.value}}))}/><code>{value.toUpperCase()}</code></div></label>
                    })}
                  </div>
                  <div className="theme-studio-font-grid">
                    <label><span>Tipografía de títulos</span><select value={form.theme_overrides.headingFont || resolveThemeStudio(form.theme_id).headingFont} onChange={event=>setForm(current=>({...current,theme_overrides:{...current.theme_overrides,headingFont:event.target.value}}))}><option value={'Georgia, "Times New Roman", serif'}>Editorial Serif</option><option value={'"Trebuchet MS", Arial, sans-serif'}>Divertida</option><option value={'Inter, Arial, sans-serif'}>Moderna</option><option value={'"Arial Rounded MT Bold", Arial, sans-serif'}>Redondeada</option></select></label>
                    <label><span>Tipografía de texto</span><select value={form.theme_overrides.bodyFont || resolveThemeStudio(form.theme_id).bodyFont} onChange={event=>setForm(current=>({...current,theme_overrides:{...current.theme_overrides,bodyFont:event.target.value}}))}><option value={'Inter, Arial, sans-serif'}>Inter / Moderna</option><option value={'Georgia, "Times New Roman", serif'}>Serif clásica</option><option value={'"Trebuchet MS", Arial, sans-serif'}>Trebuchet</option></select></label>
                  </div>
                </div>
              </div>

              <div className="block-config-panel section-structure-panel">
                <div className="block-config-heading">
                  <strong>Estructura de la invitación</strong>
                  <span>Arrastra los bloques para ordenarlos y decide cuáles aparecerán en la página pública.</span>
                </div>
                <div className="section-structure-list">
                  {form.section_order.map((sectionId,index)=>{
                    const meta=SECTION_META[sectionId];
                    const locked=sectionId==='hero';
                    const unavailable=sectionId==='rsvp'&&form.modalidad==='simple';
                    const enabled=sectionEnabled(sectionId)&&!unavailable;
                    return <article
                      className={`section-structure-item ${enabled?'enabled':'disabled'} ${draggedSection===sectionId?'dragging':''}`}
                      key={sectionId}
                      draggable
                      onDragStart={event=>handleSectionDragStart(event,sectionId)}
                      onDragOver={event=>handleSectionDragOver(event,sectionId)}
                      onDragEnd={handleSectionDragEnd}
                      aria-label={`${meta.title}. Arrastra para cambiar su posición.`}
                    >
                      <div className="section-drag-handle" title="Arrastra para ordenar" aria-hidden="true">⋮⋮</div>
                      <span className="section-structure-icon">{meta.icon}</span>
                      <div className="section-structure-copy"><strong>{meta.title}</strong><small>{unavailable?'No disponible en modalidad Solo enlace':meta.description}</small></div>
                      <div className="section-order-actions">
                        <button type="button" aria-label={`Subir ${meta.title}`} disabled={index===0} onClick={()=>moveSection(sectionId,-1)}>↑</button>
                        <button type="button" aria-label={`Bajar ${meta.title}`} disabled={index===form.section_order.length-1} onClick={()=>moveSection(sectionId,1)}>↓</button>
                      </div>
                      <button type="button" className={`section-visibility-button ${enabled?'active':''}`} disabled={locked||unavailable} onClick={()=>toggleSection(sectionId)}>
                        {locked?'Siempre visible':enabled?'Visible':'Oculta'}
                      </button>
                      <button type="button" className={`section-configure-button ${selectedSection===sectionId?'active':''}`} onClick={()=>setSelectedSection(sectionId)}>Configurar</button>
                    </article>
                  })}
                </div>
                <div className="section-properties-panel">
                  <div className="section-properties-header"><div><span>Propiedades del bloque</span><strong>{({hero:'Portada',intro:'Introducción',countdown:'Cuenta regresiva',details:'Detalles del evento',program:'Programa',gallery:'Galería',location:'Ubicación',rsvp:'Confirmación RSVP'} as Record<TemplateSectionId,string>)[selectedSection]}</strong></div><button type="button" onClick={()=>setForm(current=>({...current,section_settings:{...current.section_settings,[selectedSection]:{...DEFAULT_SECTION_SETTINGS[selectedSection]}}}))}>Restablecer</button></div>
                  <div className="section-properties-grid">
                    <label className="form-field"><span>Etiqueta superior</span><input value={form.section_settings[selectedSection].eyebrow} onChange={e=>updateSectionSetting(selectedSection,'eyebrow',e.target.value)}/></label>
                    <label className="form-field"><span>Título del bloque</span><input value={form.section_settings[selectedSection].title} placeholder={selectedSection==='hero'?'Usa el título principal de la invitación':''} onChange={e=>updateSectionSetting(selectedSection,'title',e.target.value)}/></label>
                    <label className="form-field full-width"><span>Descripción</span><textarea rows={3} value={form.section_settings[selectedSection].description} onChange={e=>updateSectionSetting(selectedSection,'description',e.target.value)}/></label>
                    <label className="form-field"><span>Texto del botón</span><input value={form.section_settings[selectedSection].buttonLabel} onChange={e=>updateSectionSetting(selectedSection,'buttonLabel',e.target.value)}/></label>
                    <label className="form-field"><span>Alineación</span><select value={form.section_settings[selectedSection].alignment} onChange={e=>updateSectionSetting(selectedSection,'alignment',e.target.value as 'left'|'center'|'right')}><option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option></select></label>
                  </div>
                  <small>Personaliza el contenido y la alineación de cada sección.</small>
                </div>
                <div className="section-structure-tip"><span>💡</span><p>Arrastra desde el control ⋮⋮ o utiliza las flechas para organizar las secciones.</p></div>
              </div>

              {form.modalidad==='rsvp'&&<div className="modality-note">
                <span>✓</span>
                <div><strong>RSVP público activado</strong><p>Cualquier persona con el enlace podrá escribir su nombre y confirmar asistencia.</p></div>
              </div>}

              {form.modalidad==='pases'&&<div className="modality-note premium">
                <span>★</span>
                <div><strong>Pases personalizados activados</strong><p>Después de guardar, asigna familias, cupos, códigos y mesas desde el módulo Invitados.</p></div>
              </div>}
            </section>
          </div>

          <aside className="invitation-live-preview">
            <div className="preview-label-row">
              <span>Vista previa</span>
              <small>Celular</small>
            </div>
            <div data-theme-studio={form.theme_id} className={`preview-phone admin-template-preview theme-${form.plantilla} theme-studio-${form.theme_id}`} style={themeStudioStyle(applyThemeStudioOverrides(resolveThemeStudio(form.theme_id),form.theme_overrides))}>
              <div className="preview-phone-notch"/>
              <div className="preview-cover" style={{backgroundImage:form.portada_url?`linear-gradient(rgba(20,15,12,.36),rgba(20,15,12,.58)), url("${form.portada_url}")`:`linear-gradient(160deg, ${form.color_principal}, #211913)`,backgroundSize:'cover',backgroundPosition:'center'}}>
                <span className="preview-template">{form.plantilla}</span>
                <div>
                  <small>Estás invitado a</small>
                  <h3>{form.titulo||'Tu evento especial'}</h3>
                  <p><strong>{form.subtitulo||'Queremos compartir contigo este momento'}</strong></p>
                  <p>{form.mensaje||'Será un honor contar con tu presencia.'}</p>
                </div>
              </div>
              <div className="preview-details">
                <div><span>Modalidad</span><strong>{MODALITIES.find(x=>x.id===form.modalidad)?.title}</strong></div>
                <div><span>Vestimenta</span><strong>{form.vestimenta||'Por definir'}</strong></div>
                <div className="preview-link"><span>Enlace</span><code>/invitacion/{form.slug||'tu-evento'}</code></div>
                {form.modalidad!=='simple'&&<button type="button" style={{background:form.color_principal}}>Confirmar asistencia</button>}
              </div>
            </div>
            <p className="preview-help">La vista final incluirá fecha, ubicación, música, galería y demás bloques configurados.</p>
          </aside>
        </div>

        {error&&<p className="form-error">{error}</p>}
      </div>

      <footer className="invitation-builder-footer">
        <div>
          <strong>{MODALITIES.find(x=>x.id===form.modalidad)?.title}</strong>
          <span>{form.estado==='publicada'?'Se publicará al guardar':'Se guardará como '+form.estado}</span>
        </div>
        <div>
          <button type="button" className="button button-ghost" onClick={()=>setModal(false)}>Cancelar</button>
          {editing&&form.slug&&<Link className="button button-ghost" href={`/invitacion/${form.slug}?preview=1`} target="_blank"><EyeIcon/><span>Vista previa</span></Link>}
          {editing&&<button type="button" className="button button-ghost" onClick={()=>void ensureReviewLink(editing)}>Enlace de revisión</button>}
          {editing&&editing.estado!=='publicada'&&<button type="button" className="button button-success" onClick={()=>void changeStatus(editing,'publicada')}>Publicar</button>}
          {editing&&editing.estado==='publicada'&&<button type="button" className="button button-outline" onClick={()=>void changeStatus(editing,'pausada')}>Pausar</button>}
          {editing&&editing.estado!=='archivada'&&<button type="button" className="button button-outline" onClick={()=>void changeStatus(editing,'archivada')}>Archivar</button>}
          <button className="button button-primary" disabled={saving}>{saving?'Guardando…':editing?'Guardar cambios':'Crear invitación'}</button>
        </div>
      </footer>
    </form>
  </section>
</div>}

{mediaPicker&&<MediaLibraryPicker
  open
  eventId={form.evento_id}
  kind={mediaPicker==='audio'?'audio':'imagen'}
  multiple={mediaPicker==='gallery'}
  maxSelected={mediaPicker==='gallery'?Math.max(1,8-form.galeria_urls.length):1}
  selectedUrls={mediaPicker==='gallery'?form.galeria_urls:[]}
  onClose={()=>setMediaPicker(null)}
  onSelect={urls=>{
    if(mediaPicker==='cover')setForm(current=>({...current,portada_url:urls[0]||current.portada_url}));
    if(mediaPicker==='audio')setForm(current=>({...current,musica_url:urls[0]||current.musica_url}));
    if(mediaPicker==='gallery')setForm(current=>({...current,galeria_urls:Array.from(new Set([...current.galeria_urls,...urls])).slice(0,8)}));
  }}
/>}
{sharing&&<ShareInvitationModal
  open={Boolean(sharing)}
  onClose={()=>setSharing(null)}
  title={sharing.titulo}
  path={`/invitacion/${sharing.slug}`}
  personalized={false}
/>}
{reviewing&&<div className="modal-backdrop review-backdrop"><section className="review-link-modal"><div className="review-link-heading"><div><span>Enlace privado</span><h2>Revisión del cliente</h2><p>Permite revisar la invitación sin publicarla.</p></div><button type="button" className="modal-close" onClick={()=>setReviewing(null)}>×</button></div><label className="form-field"><span>Enlace de revisión</span><input readOnly value={reviewing.review_token&&reviewing.review_enabled&&typeof window!=='undefined'?`${window.location.origin}/revision/${reviewing.review_token}`:'Enlace desactivado'}/></label><div className="review-link-actions">{reviewing.review_token&&reviewing.review_enabled&&<><button type="button" className="button button-primary" onClick={()=>void navigator.clipboard.writeText(`${window.location.origin}/revision/${reviewing.review_token}`)}>Copiar enlace</button><a className="button button-ghost" target="_blank" href={`/revision/${reviewing.review_token}`}>Abrir revisión</a></>}<button type="button" className="button button-outline" disabled={reviewBusy} onClick={()=>void regenerateReview(reviewing)}>Regenerar</button>{reviewing.review_enabled&&<button type="button" className="button button-danger" disabled={reviewBusy} onClick={()=>void disableReview(reviewing)}>Desactivar</button>}</div><small className="review-security-note">El enlace es privado y puede desactivarse o regenerarse en cualquier momento.</small></section></div>}
{deleting&&<div className="modal-backdrop delete-backdrop"><section className="delete-modal"><div className="delete-icon">✕</div><div className="delete-heading"><h2>Eliminar invitación</h2><p>{deleting.titulo}</p></div><div className="delete-warning"><strong>Importante</strong><p>Se eliminarán también pases y respuestas asociadas.</p></div><div className="delete-actions"><button className="button button-outline" onClick={()=>setDeleting(null)}>Cancelar</button><button className="button button-danger" onClick={remove}>Sí, eliminar</button></div></section></div>}</div>}

