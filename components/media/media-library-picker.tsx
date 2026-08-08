'use client';
/* eslint-disable @next/next/no-img-element -- Media library URLs are dynamic Supabase resources and must render without remote image configuration. */

import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { messageFromError } from '@/lib/invitapro';

type PickerKind='imagen'|'audio';
type MediaItem={id:string;evento_id:string|null;tipo:PickerKind|'video'|'documento';bucket:string;path:string;nombre_original:string|null;mime_type:string|null;size_bytes:number|null;created_at:string};
type Props={open:boolean;eventId:string;kind:PickerKind;multiple?:boolean;maxSelected?:number;selectedUrls?:string[];onClose:()=>void;onSelect:(urls:string[])=>void};

function formatBytes(value:number|null){if(!value)return '—';if(value<1024)return `${value} B`;if(value<1024**2)return `${(value/1024).toFixed(1)} KB`;return `${(value/1024**2).toFixed(1)} MB`}
function safeFileName(name:string){return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-')}

export default function MediaLibraryPicker({open,eventId,kind,multiple=false,maxSelected=1,selectedUrls=[],onClose,onSelect}:Props){
  const supabase=useMemo(()=>createClient(),[]);
  const inputRef=useRef<HTMLInputElement|null>(null);
  const selectedUrlsKey=JSON.stringify(selectedUrls);
  const[items,setItems]=useState<MediaItem[]>([]);const[loading,setLoading]=useState(false);const[error,setError]=useState('');const[search,setSearch]=useState('');const[selected,setSelected]=useState<string[]>([]);const[uploading,setUploading]=useState(false);const[dragging,setDragging]=useState(false);
  function urlFor(item:MediaItem){return supabase.storage.from(item.bucket).getPublicUrl(item.path).data.publicUrl}
  const loadItems=useCallback(async()=>{
    setLoading(true);setError('');
    let query=supabase.from('media').select('id,evento_id,tipo,bucket,path,nombre_original,mime_type,size_bytes,created_at').eq('tipo',kind).order('created_at',{ascending:false});
    if(eventId)query=query.eq('evento_id',eventId);
    const{data,error:loadError}=await query;
    if(loadError)setError(messageFromError(loadError));else setItems((data??[]) as MediaItem[]);
    setLoading(false);
  },[eventId,kind,supabase]);
  useEffect(()=>{
    if(!open)return;
    const timer=window.setTimeout(()=>{
      const initialSelected=JSON.parse(selectedUrlsKey) as string[];
      setSelected(multiple?initialSelected.slice(0,maxSelected):[]);
      setSearch('');
      setDragging(false);
      void loadItems();
    },0);
    return()=>window.clearTimeout(timer);
  },[open,multiple,maxSelected,loadItems,selectedUrlsKey]);
  const filtered=useMemo(()=>items.filter(item=>(item.nombre_original||'').toLowerCase().includes(search.trim().toLowerCase())),[items,search]);
  function choose(url:string){if(!multiple){onSelect([url]);onClose();return}setSelected(current=>current.includes(url)?current.filter(item=>item!==url):current.length>=maxSelected?current:[...current,url])}

  async function uploadFiles(files:File[]){
    if(!files.length||!eventId)return;
    const valid=files.filter(file=>kind==='imagen'?file.type.startsWith('image/'):file.type.startsWith('audio/'));
    if(!valid.length){setError(kind==='imagen'?'Selecciona archivos de imagen válidos.':'Selecciona archivos de audio válidos.');return}
    if(valid.some(file=>file.size>20*1024*1024)){setError('Cada archivo debe pesar máximo 20 MB.');return}
    const allowedCount=multiple?Math.max(0,maxSelected-selected.length):1;
    const uploadBatch=valid.slice(0,allowedCount||valid.length);
    if(multiple&&allowedCount===0){setError(`Ya seleccionaste el máximo de ${maxSelected} fotografías.`);return}

    setUploading(true);setError('');
    try{
      const{data:userData,error:userError}=await supabase.auth.getUser();
      if(userError||!userData.user)throw new Error('La sesión no está disponible.');
      const uploadedUrls:string[]=[];
      for(const file of uploadBatch){
        const bucket=kind==='audio'?'event-audio':'event-media';
        const ext=(file.name.includes('.')?file.name.split('.').pop():'bin')||'bin';
        const base=safeFileName(file.name.replace(/\.[^.]+$/,'')||'archivo');
        const path=`${userData.user.id}/${eventId}/${Date.now()}-${crypto.randomUUID().slice(0,8)}-${base}.${ext}`;
        const{error:uploadError}=await supabase.storage.from(bucket).upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||undefined});
        if(uploadError)throw uploadError;
        const{error:insertError}=await supabase.from('media').insert({evento_id:eventId,invitacion_id:null,owner_id:userData.user.id,tipo:kind,bucket,path,nombre_original:file.name,mime_type:file.type||null,size_bytes:file.size});
        if(insertError){await supabase.storage.from(bucket).remove([path]);throw insertError}
        uploadedUrls.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
      }
      await loadItems();
      if(!multiple&&uploadedUrls[0]){onSelect([uploadedUrls[0]]);onClose();return}
      if(uploadedUrls.length)setSelected(current=>[...current,...uploadedUrls].slice(0,maxSelected));
    }catch(uploadError){setError(messageFromError(uploadError))}
    finally{setUploading(false);setDragging(false)}
  }

  function handleInput(event:ChangeEvent<HTMLInputElement>){const files=Array.from(event.target.files??[]);event.target.value='';void uploadFiles(files)}
  function handleDrop(event:DragEvent<HTMLDivElement>){event.preventDefault();setDragging(false);void uploadFiles(Array.from(event.dataTransfer.files??[]))}

  if(!open)return null;
  return <div className="modal-backdrop media-picker-backdrop" onMouseDown={onClose}><section className="modal-card media-picker-modal" role="dialog" aria-modal="true" aria-labelledby="media-picker-title" onMouseDown={event=>event.stopPropagation()}>
    <header className="media-picker-header"><div><p className="eyebrow">Biblioteca multimedia</p><h2 id="media-picker-title">Elegir {kind==='imagen'?(multiple?'fotografías':'una imagen'):'música'}</h2><p>{eventId?'Mostrando recursos del evento seleccionado.':'Selecciona primero un evento para ver sus recursos.'}</p></div><button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>×</button></header>
    <div className="media-picker-toolbar"><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar por nombre…" aria-label="Buscar en biblioteca"/>{multiple&&<span>{selected.length}/{maxSelected} seleccionadas</span>}</div>
    {eventId&&<div className={`media-picker-upload ${dragging?'is-dragging':''}`} onDragOver={event=>{event.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={handleDrop}>
      <input ref={inputRef} hidden type="file" multiple={multiple} accept={kind==='imagen'?'image/*':'audio/*'} onChange={handleInput}/>
      <span className="media-picker-upload-icon">{kind==='imagen'?'▧':'♫'}</span>
      <div><strong>{kind==='imagen'?'Sube fotografías directamente':'Sube música directamente'}</strong><small>{kind==='imagen'?'Arrastra imágenes aquí o selecciónalas desde tu equipo. Se guardarán también en tu Biblioteca.':'Selecciona un archivo de audio. Se guardará también en tu Biblioteca.'}</small></div>
      <button type="button" className="button button-outline" disabled={uploading||(multiple&&selected.length>=maxSelected)} onClick={()=>inputRef.current?.click()}>{uploading?'Subiendo…':kind==='imagen'?'+ Subir fotografías':'+ Subir música'}</button>
    </div>}
    {!eventId?<div className="media-picker-empty"><strong>Selecciona un evento</strong><p>La biblioteca se filtra por el evento activo de la invitación.</p></div>:loading?<div className="media-picker-loading">Cargando biblioteca…</div>:error?<div className="alert alert-error">{error}</div>:filtered.length===0?<div className="media-picker-empty"><strong>Aún no hay recursos disponibles</strong><p>Usa el botón de arriba para subirlos ahora. Los archivos quedarán guardados en la Biblioteca de este evento.</p></div>:<div className={`media-picker-grid ${kind==='audio'?'is-audio':''}`}>{filtered.map(item=>{const url=urlFor(item);const active=selected.includes(url);return <button key={item.id} type="button" className={`media-picker-item ${active?'is-selected':''}`} onClick={()=>choose(url)}>{kind==='imagen'?<img src={url} alt={item.nombre_original||'Imagen de biblioteca'}/>:<div className="media-picker-audio"><span>♫</span><audio controls preload="none" src={url} onClick={event=>event.stopPropagation()}/></div>}<span className="media-picker-check">{active?'✓':'+'}</span><div><strong title={item.nombre_original||''}>{item.nombre_original||'Archivo sin nombre'}</strong><small>{formatBytes(item.size_bytes)}</small></div></button>})}</div>}
    <footer className="media-picker-footer"><button type="button" className="button button-outline" onClick={onClose}>Cancelar</button>{multiple&&<button type="button" className="button button-primary" disabled={!selected.length} onClick={()=>{onSelect(selected);onClose()}}>Usar {selected.length||''} fotografía{selected.length===1?'':'s'}</button>}</footer>
  </section></div>;
}
