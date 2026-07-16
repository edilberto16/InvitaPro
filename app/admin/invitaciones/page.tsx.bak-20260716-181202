'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ShareInvitationModal from '@/components/share-invitation-modal';
import { designValue, Evento, formatDate, initials, Invitacion, messageFromError, slugify } from '@/lib/invitapro';

type FormState={evento_id:string;titulo:string;slug:string;modalidad:Invitacion['modalidad'];estado:Invitacion['estado'];plantilla:string;mensaje:string;subtitulo:string;vestimenta:string;programa:string;color_principal:string;portada_url:string;portada_efecto:string;pantalla_bienvenida:boolean;texto_bienvenida:string;galeria_urls:string[];musica_url:string;whatsapp:string;fecha_expiracion:string;mostrar_contador:boolean;mostrar_detalles:boolean;mostrar_programa:boolean;mostrar_galeria:boolean;mostrar_mapa:boolean;mostrar_rsvp:boolean};
const EMPTY:FormState={evento_id:'',titulo:'',slug:'',modalidad:'simple',estado:'borrador',plantilla:'elegante-classic',mensaje:'Será un honor contar con tu presencia para celebrar este día tan especial.',subtitulo:'Queremos compartir contigo este momento',vestimenta:'Formal',programa:'18:00 | Recepción\n19:00 | Ceremonia\n20:30 | Cena\n22:00 | Celebración',color_principal:'#8f5c38',portada_url:'',portada_efecto:'cinematic-zoom',pantalla_bienvenida:true,texto_bienvenida:'Abrir invitación',galeria_urls:[],musica_url:'',whatsapp:'',fecha_expiracion:'',mostrar_contador:true,mostrar_detalles:true,mostrar_programa:true,mostrar_galeria:true,mostrar_mapa:true,mostrar_rsvp:true};
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
const TEMPLATE_COLLECTIONS=[
  {id:'todas',label:'Todas'},
  {id:'wedding',label:'Wedding'},
  {id:'xv',label:'XV años'},
  {id:'infantil',label:'Infantil'},
  {id:'empresarial',label:'Empresarial'}
];
const TEMPLATE_CATALOG=[
  {id:'elegante-classic',name:'Elegante Classic',collection:'wedding',badge:'Disponible',available:true,color:'#9a6845',description:'Clásica, cálida y elegante. Ideal para bodas formales.',layout:'classic'},
  {id:'luxury-black',name:'Luxury Black',collection:'wedding',badge:'Disponible',available:true,color:'#c7a55b',description:'Negro profundo, detalles dorados y alto contraste.',layout:'dark'},
  {id:'royal-gold',name:'Royal Gold',collection:'wedding',badge:'Próximamente',available:false,color:'#b6924b',description:'Verde esmeralda, oro y detalles de inspiración real.',layout:'royal'},
  {id:'minimal-white',name:'Minimal White',collection:'wedding',badge:'Próximamente',available:false,color:'#6d625b',description:'Limpia, luminosa y centrada en la fotografía.',layout:'minimal'},
  {id:'romantic-garden',name:'Romantic Garden',collection:'wedding',badge:'Disponible',available:true,color:'#7f9a78',description:'Editorial botánica, navegación flotante y secciones orgánicas.',layout:'garden'},
  {id:'sunset',name:'Sunset',collection:'wedding',badge:'Próximamente',available:false,color:'#d37b57',description:'Atardecer, terracota y una atmósfera cálida.',layout:'sunset'},
  {id:'vintage',name:'Vintage',collection:'wedding',badge:'Próximamente',available:false,color:'#8b745c',description:'Texturas antiguas y composición clásica.',layout:'vintage'},
  {id:'modern-editorial',name:'Modern Editorial',collection:'wedding',badge:'Próximamente',available:false,color:'#222222',description:'Diseño editorial contemporáneo tipo revista.',layout:'editorial'},

  {id:'princess-rose',name:'Princess Rose',collection:'xv',badge:'Disponible',available:true,color:'#c78ca7',description:'Rosa sofisticado y detalles delicados para XV años.',layout:'princess'},
  {id:'golden-night',name:'Golden Night',collection:'xv',badge:'Próximamente',available:false,color:'#c2a14b',description:'Noche, destellos y glamour dorado.',layout:'golden'},
  {id:'butterfly',name:'Butterfly',collection:'xv',badge:'Próximamente',available:false,color:'#b584c4',description:'Mariposas, movimiento y una estética mágica.',layout:'butterfly'},
  {id:'lavender',name:'Lavender',collection:'xv',badge:'Próximamente',available:false,color:'#9178ad',description:'Lavanda, transparencias y elegancia juvenil.',layout:'lavender'},
  {id:'glamour',name:'Glamour',collection:'xv',badge:'Próximamente',available:false,color:'#a96884',description:'Brillo sutil y composición de gala.',layout:'glamour'},
  {id:'floral',name:'Floral',collection:'xv',badge:'Próximamente',available:false,color:'#b76d85',description:'Flores, romanticismo y tonos suaves.',layout:'floral'},
  {id:'luxury-pink',name:'Luxury Pink',collection:'xv',badge:'Próximamente',available:false,color:'#bf648c',description:'Rosa intenso con una presencia lujosa.',layout:'pink'},

  {id:'safari',name:'Safari',collection:'infantil',badge:'Disponible',available:true,color:'#8a9b55',description:'Naturaleza, animales y aventura para fiestas infantiles.',layout:'safari'},
  {id:'dinosaurios',name:'Dinosaurios',collection:'infantil',badge:'Próximamente',available:false,color:'#598a64',description:'Una aventura jurásica divertida.',layout:'dino'},
  {id:'unicornio',name:'Unicornio',collection:'infantil',badge:'Próximamente',available:false,color:'#c889c9',description:'Colores pastel y fantasía.',layout:'unicorn'},
  {id:'espacial',name:'Espacial',collection:'infantil',badge:'Próximamente',available:false,color:'#5368a8',description:'Planetas, estrellas y exploración.',layout:'space'},
  {id:'superheroes',name:'Superhéroes',collection:'infantil',badge:'Próximamente',available:false,color:'#d35545',description:'Energía, acción y colores intensos.',layout:'hero'},

  {id:'corporativo',name:'Corporativo',collection:'empresarial',badge:'Disponible',available:true,color:'#335d7a',description:'Profesional, sobria y clara para eventos de empresa.',layout:'corporate'},
  {id:'lanzamiento',name:'Lanzamiento',collection:'empresarial',badge:'Próximamente',available:false,color:'#6756a3',description:'Presentación de producto con estilo moderno.',layout:'launch'},
  {id:'conferencia',name:'Conferencia',collection:'empresarial',badge:'Próximamente',available:false,color:'#2b6f75',description:'Agenda, ponentes e información ejecutiva.',layout:'conference'},
  {id:'networking',name:'Networking',collection:'empresarial',badge:'Próximamente',available:false,color:'#3d708a',description:'Conexiones, comunidad y encuentros profesionales.',layout:'network'}
] as const;
const MODALITIES=[
  {id:'simple' as const,icon:'🔗',title:'Solo enlace',tag:'Básica',description:'Una invitación pública lista para compartir por WhatsApp.',features:['Invitación digital','Música, mapa y galería','Sin confirmaciones']},
  {id:'rsvp' as const,icon:'✓',title:'RSVP público',tag:'Popular',description:'Los asistentes confirman desde un formulario abierto.',features:['Todo lo de Solo enlace','Confirmación pública','Lista de respuestas']},
  {id:'pases' as const,icon:'★',title:'Pases personalizados',tag:'Premium',description:'Control individual por persona, pareja o familia.',features:['Códigos privados','Cupos de adultos y niños','Mesa y confirmación individual']}
];

export default function InvitacionesPage(){const supabase=useMemo(()=>createClient(),[]);const[eventos,setEventos]=useState<Evento[]>([]);const[items,setItems]=useState<Invitacion[]>([]);const[loading,setLoading]=useState(true);const[modal,setModal]=useState(false);const[editing,setEditing]=useState<Invitacion|null>(null);const[deleting,setDeleting]=useState<Invitacion|null>(null);const[form,setForm]=useState<FormState>(EMPTY);const[error,setError]=useState('');const[search,setSearch]=useState('');const[filter,setFilter]=useState('todas');const[saving,setSaving]=useState(false);const[uploading,setUploading]=useState<'cover'|'gallery'|'audio'|null>(null);const[sharing,setSharing]=useState<Invitacion|null>(null);const[templateFilter,setTemplateFilter]=useState('todas');
async function load(){setLoading(true);const[e,i]=await Promise.all([supabase.from('eventos').select('*, clientes(id,nombre)').order('fecha'),supabase.from('invitaciones').select('*, eventos(id,nombre,tipo,fecha,hora,lugar,direccion,maps_url,cliente_id,clientes(id,nombre))').order('created_at',{ascending:false})]);if(e.error)setError(messageFromError(e.error));else setEventos((e.data??[]) as Evento[]);if(i.error)setError(messageFromError(i.error));else setItems((i.data??[]) as Invitacion[]);setLoading(false)}useEffect(()=>{void load()},[]);
function openNew(){const ev=eventos[0];setEditing(null);setForm({...EMPTY,evento_id:ev?.id??'',titulo:ev?.nombre??'',slug:slugify(ev?.nombre??'')});setError('');setModal(true)}function openEdit(x:Invitacion){const d=x.design_json||{};setEditing(x);setForm({evento_id:x.evento_id,titulo:x.titulo,slug:x.slug,modalidad:x.modalidad,estado:x.estado,plantilla:designValue(x,'plantilla','elegante'),mensaje:designValue(x,'mensaje',''),subtitulo:designValue(x,'subtitulo','Queremos compartir contigo este momento'),vestimenta:designValue(x,'vestimenta','Formal'),programa:designValue(x,'programa','18:00 | Recepción\n19:00 | Ceremonia\n20:30 | Cena\n22:00 | Celebración'),color_principal:x.color_principal??'#8f5c38',portada_url:designValue(x,'portada_url',''),portada_efecto:designValue(x,'portada_efecto','cinematic-zoom'),pantalla_bienvenida:d.pantalla_bienvenida!==false,texto_bienvenida:designValue(x,'texto_bienvenida','Abrir invitación'),galeria_urls:Array.isArray(d.galeria_urls)?d.galeria_urls.filter((url):url is string=>typeof url==='string'):[],musica_url:x.musica_url??'',whatsapp:x.whatsapp??'',fecha_expiracion:x.fecha_expiracion?.slice(0,16)??'',mostrar_contador:d.mostrar_contador!==false,mostrar_detalles:d.mostrar_detalles!==false,mostrar_programa:d.mostrar_programa!==false,mostrar_galeria:d.mostrar_galeria!==false,mostrar_mapa:d.mostrar_mapa!==false,mostrar_rsvp:d.mostrar_rsvp!==false});setError('');setModal(true)}

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
async function save(e:FormEvent){e.preventDefault();const slug=slugify(form.slug||form.titulo);if(!form.evento_id)return setError('Selecciona un evento.');if(!form.titulo.trim()||!slug)return setError('Título y enlace son obligatorios.');setSaving(true);const design_json={version:3,componentes:[],plantilla:form.plantilla,mensaje:form.mensaje.trim(),subtitulo:form.subtitulo.trim(),vestimenta:form.vestimenta.trim(),programa:form.programa.trim(),portada_url:form.portada_url,portada_efecto:form.portada_efecto,pantalla_bienvenida:form.pantalla_bienvenida,texto_bienvenida:form.texto_bienvenida.trim()||'Abrir invitación',galeria_urls:form.galeria_urls,mostrar_contador:form.mostrar_contador,mostrar_detalles:form.mostrar_detalles,mostrar_programa:form.mostrar_programa,mostrar_galeria:form.mostrar_galeria,mostrar_mapa:form.mostrar_mapa,mostrar_rsvp:form.mostrar_rsvp};const payload={evento_id:form.evento_id,titulo:form.titulo.trim(),slug,modalidad:form.modalidad,estado:form.estado,design_json,color_principal:form.color_principal,musica_url:form.musica_url.trim()||null,whatsapp:form.whatsapp.replace(/\D/g,'')||null,fecha_publicacion:form.estado==='publicada'?(editing?.fecha_publicacion??new Date().toISOString()):null,fecha_expiracion:form.fecha_expiracion?new Date(form.fecha_expiracion).toISOString():null};const r=editing?await supabase.from('invitaciones').update(payload).eq('id',editing.id):await supabase.from('invitaciones').insert(payload);setSaving(false);if(r.error)return setError(messageFromError(r.error));setModal(false);await load()}
async function toggle(x:Invitacion){const estado=x.estado==='publicada'?'pausada':'publicada';const r=await supabase.from('invitaciones').update({estado,fecha_publicacion:estado==='publicada'?(x.fecha_publicacion??new Date().toISOString()):x.fecha_publicacion}).eq('id',x.id);if(r.error)setError(messageFromError(r.error));else await load()}
async function remove(){if(!deleting)return;const r=await supabase.from('invitaciones').delete().eq('id',deleting.id);if(r.error)setError(messageFromError(r.error));setDeleting(null);await load()}
const list=useMemo(()=>items.filter(x=>filter==='todas'||x.estado===filter).filter(x=>[x.titulo,x.slug,x.eventos?.nombre,x.eventos?.clientes?.nombre].join(' ').toLowerCase().includes(search.toLowerCase().trim())),[items,filter,search]);
return <div className="page-stack"><section className="page-heading"><div><p className="eyebrow">Constructor digital</p><h1>Invitaciones</h1><p>Los cambios se publican directamente en Supabase.</p></div><button className="button button-primary" onClick={openNew}>+ Nueva invitación</button></section><section className="stats-grid invitation-stats"><article className="stat-card"><span>Total</span><strong>{items.length}</strong><small>En la nube</small></article><article className="stat-card"><span>Publicadas</span><strong>{items.filter(x=>x.estado==='publicada').length}</strong><small>Enlaces activos</small></article><article className="stat-card"><span>Con RSVP</span><strong>{items.filter(x=>x.modalidad!=='simple').length}</strong><small>Reciben respuestas</small></article><article className="stat-card"><span>Eventos</span><strong>{eventos.length}</strong><small>Disponibles</small></article></section><section className="panel-card"><div className="panel-header events-toolbar"><div><h2>Biblioteca de invitaciones</h2><p>Simple, RSVP o pases personalizados.</p></div><div className="events-filters"><label className="search-field"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar invitación"/></label><select className="status-filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="todas">Todos</option><option value="borrador">Borrador</option><option value="publicada">Publicada</option><option value="pausada">Pausada</option><option value="vencida">Vencida</option></select></div></div>{loading?<div className="dashboard-loading">Cargando invitaciones…</div>:list.length===0?<div className="empty-state compact-empty"><div className="empty-icon">✉</div><h2>Sin invitaciones</h2><p>Crea la primera.</p></div>:<div className="table-wrap"><table className="data-table invitation-table"><thead><tr><th>Invitación</th><th>Evento / cliente</th><th>Modalidad</th><th>Estado</th><th>Enlace</th><th>Acciones</th></tr></thead><tbody>{list.map(x=><tr key={x.id}><td><div className="event-name-cell"><span className="event-avatar" style={{background:x.color_principal??'#8f5c38'}}>{initials(x.titulo)}</span><div><strong>{x.titulo}</strong><span>{designValue(x,'plantilla','elegante')}</span></div></div></td><td><strong>{x.eventos?.nombre||'—'}</strong><span>{x.eventos?.clientes?.nombre||'—'} · {formatDate(x.eventos?.fecha)}</span></td><td>{x.modalidad}</td><td><span className={`invite-status invite-status-${x.estado}`}>{x.estado}</span></td><td><code className="slug-code">/invitacion/{x.slug}</code></td><td><div className="row-actions invitation-actions"><Link className="text-button" href={`/invitacion/${x.slug}${x.modalidad==='pases'?'?preview=1':''}`} target="_blank">Vista previa</Link>{x.modalidad==='pases'?<Link className="text-button share-action" href="/admin/invitados">Gestionar pases</Link>:<button className="text-button share-action" onClick={()=>setSharing(x)} disabled={x.estado!=='publicada'} title={x.estado!=='publicada'?'Publica la invitación antes de compartirla':''}>Compartir</button>}<button className="text-button" onClick={()=>openEdit(x)}>Editar</button><button className="text-button" onClick={()=>toggle(x)}>{x.estado==='publicada'?'Pausar':'Publicar'}</button><button className="text-button danger" onClick={()=>setDeleting(x)}>Eliminar</button></div></td></tr>)}</tbody></table></div>}</section>{error&&!modal&&<p className="form-error">{error}</p>}
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

        <div className="invitation-builder-layout">
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
                    <option value="vencida">Vencida</option>
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

                    {form.musica_url&&<div className="audio-file-status">
                      <span className="audio-status-check">✓</span>
                      <div>
                        <strong>Música cargada correctamente</strong>
                        <small>{form.musica_url.startsWith('/demo/')?'Pista de demostración incluida':'Archivo almacenado en Supabase Storage'}</small>
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

              <div className="block-config-panel">
                <div className="block-config-heading">
                  <strong>Secciones visibles</strong>
                  <span>Activa únicamente lo que necesita esta invitación.</span>
                </div>
                <div className="block-toggle-grid">
                  {[
                    ['mostrar_contador','Cuenta regresiva'],
                    ['mostrar_detalles','Fecha, lugar y vestimenta'],
                    ['mostrar_programa','Programa del evento'],
                    ['mostrar_galeria','Galería de fotografías'],
                    ['mostrar_mapa','Ubicación y contacto'],
                    ['mostrar_rsvp','Confirmación RSVP']
                  ].map(([key,label])=><label className="block-toggle" key={key}>
                    <input
                      type="checkbox"
                      checked={Boolean(form[key as keyof FormState])}
                      disabled={key==='mostrar_rsvp'&&form.modalidad==='simple'}
                      onChange={e=>setForm({...form,[key]:e.target.checked})}
                    />
                    <span><strong>{label}</strong><small>{key==='mostrar_rsvp'&&form.modalidad==='simple'?'No disponible en Solo enlace':'Mostrar en la página pública'}</small></span>
                  </label>)}
                </div>
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
            <div className={`preview-phone admin-template-preview theme-${form.plantilla}`}>
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
          <button className="button button-primary" disabled={saving}>{saving?'Guardando…':editing?'Guardar cambios':'Crear invitación'}</button>
        </div>
      </footer>
    </form>
  </section>
</div>}

{sharing&&<ShareInvitationModal
  open={Boolean(sharing)}
  onClose={()=>setSharing(null)}
  title={sharing.titulo}
  path={`/invitacion/${sharing.slug}`}
  personalized={false}
/>}
{deleting&&<div className="modal-backdrop delete-backdrop"><section className="delete-modal"><div className="delete-icon">✕</div><div className="delete-heading"><h2>Eliminar invitación</h2><p>{deleting.titulo}</p></div><div className="delete-warning"><strong>Importante</strong><p>Se eliminarán también pases y respuestas asociadas.</p></div><div className="delete-actions"><button className="button button-outline" onClick={()=>setDeleting(null)}>Cancelar</button><button className="button button-danger" onClick={remove}>Sí, eliminar</button></div></section></div>}</div>}
