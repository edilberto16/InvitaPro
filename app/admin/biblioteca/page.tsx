'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { messageFromError } from '@/lib/invitapro';

type MediaType='todos'|'imagen'|'audio'|'video'|'documento';
type MediaItem={
  id:string;
  evento_id:string|null;
  invitacion_id:string|null;
  owner_id:string;
  tipo:Exclude<MediaType,'todos'>;
  bucket:string;
  path:string;
  nombre_original:string|null;
  mime_type:string|null;
  size_bytes:number|null;
  created_at:string;
  eventos?:{nombre:string}|null;
  invitaciones?:{titulo:string}|null;
};
type EventOption={id:string;nombre:string};

const tabs:[MediaType,string][]=[['todos','Todos'],['imagen','Imágenes'],['audio','Música'],['video','Videos'],['documento','Archivos']];
const typeIcon:Record<Exclude<MediaType,'todos'>,string>={imagen:'▧',audio:'♫',video:'▶',documento:'▤'};

function safeFileName(name:string){return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')}
function formatBytes(value:number|null){if(!value)return '—';if(value<1024)return `${value} B`;if(value<1024**2)return `${(value/1024).toFixed(1)} KB`;return `${(value/1024**2).toFixed(1)} MB`}
function formatDate(value:string){return new Intl.DateTimeFormat('es-MX',{dateStyle:'medium'}).format(new Date(value))}

export default function MediaLibraryPage(){
  const supabase=useMemo(()=>createClient(),[]);
  const inputRef=useRef<HTMLInputElement|null>(null);
  const[items,setItems]=useState<MediaItem[]>([]);
  const[events,setEvents]=useState<EventOption[]>([]);
  const[type,setType]=useState<MediaType>('todos');
  const[eventId,setEventId]=useState('todos');
  const[uploadEventId,setUploadEventId]=useState('');
  const[search,setSearch]=useState('');
  const[loading,setLoading]=useState(true);
  const[uploading,setUploading]=useState(false);
  const[error,setError]=useState('');
  const[notice,setNotice]=useState('');
  const[deleting,setDeleting]=useState<MediaItem|null>(null);

  async function load(){
    setLoading(true);setError('');
    const[{data:media,error:mediaError},{data:eventData,error:eventError}]=await Promise.all([
      supabase.from('media').select('*,eventos(nombre),invitaciones(titulo)').order('created_at',{ascending:false}),
      supabase.from('eventos').select('id,nombre').order('created_at',{ascending:false})
    ]);
    if(mediaError)setError(messageFromError(mediaError));
    else setItems((media??[]) as MediaItem[]);
    if(eventError)setError(current=>current||messageFromError(eventError));
    else{
      const list=(eventData??[]) as EventOption[];
      setEvents(list);
      setUploadEventId(current=>current||list[0]?.id||'');
    }
    setLoading(false);
  }
  useEffect(()=>{void load()},[]);

  const filtered=useMemo(()=>items.filter(item=>type==='todos'||item.tipo===type).filter(item=>eventId==='todos'||item.evento_id===eventId).filter(item=>{
    const haystack=[item.nombre_original,item.eventos?.nombre,item.invitaciones?.titulo,item.mime_type].join(' ').toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  }),[items,type,eventId,search]);

  const counts=useMemo(()=>({todos:items.length,imagen:items.filter(x=>x.tipo==='imagen').length,audio:items.filter(x=>x.tipo==='audio').length,video:items.filter(x=>x.tipo==='video').length,documento:items.filter(x=>x.tipo==='documento').length}),[items]);

  function publicUrl(item:MediaItem){return supabase.storage.from(item.bucket).getPublicUrl(item.path).data.publicUrl}
  async function copyUrl(item:MediaItem){await navigator.clipboard.writeText(publicUrl(item));setNotice('Enlace copiado al portapapeles.');window.setTimeout(()=>setNotice(''),2400)}

  async function uploadFiles(event:ChangeEvent<HTMLInputElement>){
    const files=Array.from(event.target.files??[]);event.target.value='';
    if(!files.length)return;
    if(!uploadEventId){setError('Selecciona el evento al que pertenecerán los archivos.');return}
    if(files.some(file=>file.size>20*1024*1024)){setError('Cada archivo debe pesar máximo 20 MB.');return}
    setUploading(true);setError('');setNotice('');
    try{
      const{data:userData,error:userError}=await supabase.auth.getUser();
      if(userError||!userData.user)throw new Error('La sesión no está disponible.');
      for(const file of files){
        const tipo:MediaItem['tipo']=file.type.startsWith('image/')?'imagen':file.type.startsWith('audio/')?'audio':file.type.startsWith('video/')?'video':'documento';
        const bucket=tipo==='audio'?'event-audio':'event-media';
        const ext=file.name.includes('.')?file.name.split('.').pop():'bin';
        const base=safeFileName(file.name.replace(/\.[^.]+$/,'')||'archivo');
        const path=`${userData.user.id}/${uploadEventId}/${Date.now()}-${crypto.randomUUID().slice(0,8)}-${base}.${ext}`;
        const{error:uploadError}=await supabase.storage.from(bucket).upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined});
        if(uploadError)throw uploadError;
        const{error:insertError}=await supabase.from('media').insert({evento_id:uploadEventId,invitacion_id:null,owner_id:userData.user.id,tipo,bucket,path,nombre_original:file.name,mime_type:file.type||null,size_bytes:file.size});
        if(insertError){await supabase.storage.from(bucket).remove([path]);throw insertError}
      }
      setNotice(files.length===1?'Archivo agregado a la biblioteca.':`${files.length} archivos agregados a la biblioteca.`);
      await load();
    }catch(e){setError(messageFromError(e))}finally{setUploading(false)}
  }

  async function removeItem(){
    if(!deleting)return;
    setError('');
    const storageResult=await supabase.storage.from(deleting.bucket).remove([deleting.path]);
    if(storageResult.error){setError(messageFromError(storageResult.error));return}
    const{error:deleteError}=await supabase.from('media').delete().eq('id',deleting.id);
    if(deleteError){setError(messageFromError(deleteError));return}
    setDeleting(null);setNotice('Archivo eliminado de la biblioteca.');await load();
  }

  return <div className="media-library-page">
    <section className="media-library-header">
      <div><p className="eyebrow">Recursos reutilizables</p><h1>Biblioteca multimedia</h1><p>Organiza fotografías, música, videos y documentos para reutilizarlos en tus invitaciones.</p></div>
      <div className="media-upload-actions">
        <label><span>Guardar en evento</span><select value={uploadEventId} onChange={e=>setUploadEventId(e.target.value)}><option value="">Selecciona un evento</option>{events.map(item=><option value={item.id} key={item.id}>{item.nombre}</option>)}</select></label>
        <input ref={inputRef} hidden type="file" multiple accept="image/*,audio/*,video/*,.pdf,.doc,.docx" onChange={uploadFiles}/>
        <button className="button button-primary" type="button" disabled={uploading||!events.length} onClick={()=>inputRef.current?.click()}>{uploading?'Subiendo…':'+ Agregar archivos'}</button>
      </div>
    </section>

    {error&&<div className="alert alert-error">{error}</div>}{notice&&<div className="alert alert-success">{notice}</div>}

    <section className="media-summary-grid">
      {tabs.slice(1).map(([id,label])=><button key={id} type="button" className={`media-summary-card ${type===id?'is-active':''}`} onClick={()=>setType(id)}><span>{typeIcon[id as Exclude<MediaType,'todos'>]}</span><strong>{counts[id]}</strong><small>{label}</small></button>)}
    </section>

    <section className="media-toolbar">
      <div className="media-tabs">{tabs.map(([id,label])=><button type="button" key={id} className={type===id?'is-active':''} onClick={()=>setType(id)}>{label}<span>{counts[id]}</span></button>)}</div>
      <div className="media-filters"><input aria-label="Buscar archivos" placeholder="Buscar por nombre…" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Filtrar por evento" value={eventId} onChange={e=>setEventId(e.target.value)}><option value="todos">Todos los eventos</option>{events.map(item=><option value={item.id} key={item.id}>{item.nombre}</option>)}</select></div>
    </section>

    {loading?<div className="media-loading">Cargando biblioteca…</div>:filtered.length?<section className="media-grid">{filtered.map(item=>{
      const url=publicUrl(item);
      return <article className="media-card" key={item.id}>
        <div className={`media-card-preview media-${item.tipo}`}>
          {item.tipo==='imagen'?<img src={url} alt={item.nombre_original||'Imagen de la biblioteca'}/>:item.tipo==='audio'?<><span className="media-file-icon">♫</span><audio controls preload="none" src={url}/></>:item.tipo==='video'?<video controls preload="metadata" src={url}/>:<><span className="media-file-icon">▤</span><a href={url} target="_blank" rel="noreferrer">Abrir archivo</a></>}
          <span className="media-type-badge">{item.tipo}</span>
        </div>
        <div className="media-card-body"><strong title={item.nombre_original||''}>{item.nombre_original||'Archivo sin nombre'}</strong><span>{item.eventos?.nombre||'Sin evento'}</span><small>{formatBytes(item.size_bytes)} · {formatDate(item.created_at)}</small></div>
        <div className="media-card-actions"><button type="button" onClick={()=>copyUrl(item)}>Copiar enlace</button><a href={url} target="_blank" rel="noreferrer">Ver</a><button type="button" className="danger" onClick={()=>setDeleting(item)}>Eliminar</button></div>
      </article>
    })}</section>:<section className="empty-state media-empty"><span>▧</span><h2>No encontramos archivos</h2><p>Ajusta los filtros o agrega el primer recurso a tu biblioteca.</p><button className="button button-primary" type="button" onClick={()=>inputRef.current?.click()}>Agregar archivos</button></section>}

    {deleting&&<div className="modal-backdrop" role="presentation"><section className="modal-card media-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-media-title"><div><p className="eyebrow">Eliminar recurso</p><h2 id="delete-media-title">¿Eliminar este archivo?</h2><p><strong>{deleting.nombre_original}</strong> se borrará de Supabase Storage y ya no estará disponible en las invitaciones que utilicen su enlace.</p></div><div className="modal-actions"><button className="button button-outline" type="button" onClick={()=>setDeleting(null)}>Cancelar</button><button className="button button-danger" type="button" onClick={removeItem}>Eliminar definitivamente</button></div></section></div>}
  </div>
}
