'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { messageFromError } from '@/lib/invitapro';

type PickerKind='imagen'|'audio';
type MediaItem={id:string;evento_id:string|null;tipo:PickerKind|'video'|'documento';bucket:string;path:string;nombre_original:string|null;mime_type:string|null;size_bytes:number|null;created_at:string};
type Props={open:boolean;eventId:string;kind:PickerKind;multiple?:boolean;maxSelected?:number;selectedUrls?:string[];onClose:()=>void;onSelect:(urls:string[])=>void};

function formatBytes(value:number|null){if(!value)return '—';if(value<1024)return `${value} B`;if(value<1024**2)return `${(value/1024).toFixed(1)} KB`;return `${(value/1024**2).toFixed(1)} MB`}

export default function MediaLibraryPicker({open,eventId,kind,multiple=false,maxSelected=1,selectedUrls=[],onClose,onSelect}:Props){
  const supabase=useMemo(()=>createClient(),[]);
  const[items,setItems]=useState<MediaItem[]>([]);const[loading,setLoading]=useState(false);const[error,setError]=useState('');const[search,setSearch]=useState('');const[selected,setSelected]=useState<string[]>([]);
  function urlFor(item:MediaItem){return supabase.storage.from(item.bucket).getPublicUrl(item.path).data.publicUrl}
  useEffect(()=>{if(!open)return;setSelected(multiple?selectedUrls.slice(0,maxSelected):[]);setSearch('');setLoading(true);setError('');let query=supabase.from('media').select('id,evento_id,tipo,bucket,path,nombre_original,mime_type,size_bytes,created_at').eq('tipo',kind).order('created_at',{ascending:false});if(eventId)query=query.eq('evento_id',eventId);void query.then(({data,error:loadError})=>{if(loadError)setError(messageFromError(loadError));else setItems((data??[]) as MediaItem[]);setLoading(false)});},[open,eventId,kind,multiple,maxSelected]);
  const filtered=useMemo(()=>items.filter(item=>(item.nombre_original||'').toLowerCase().includes(search.trim().toLowerCase())),[items,search]);
  function choose(url:string){if(!multiple){onSelect([url]);onClose();return}setSelected(current=>current.includes(url)?current.filter(item=>item!==url):current.length>=maxSelected?current:[...current,url])}
  if(!open)return null;
  return <div className="modal-backdrop media-picker-backdrop" onMouseDown={onClose}><section className="modal-card media-picker-modal" role="dialog" aria-modal="true" aria-labelledby="media-picker-title" onMouseDown={event=>event.stopPropagation()}>
    <header className="media-picker-header"><div><p className="eyebrow">Biblioteca multimedia</p><h2 id="media-picker-title">Elegir {kind==='imagen'?(multiple?'fotografías':'una imagen'):'música'}</h2><p>{eventId?'Mostrando recursos del evento seleccionado.':'Selecciona primero un evento para ver sus recursos.'}</p></div><button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>×</button></header>
    <div className="media-picker-toolbar"><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar por nombre…" aria-label="Buscar en biblioteca"/>{multiple&&<span>{selected.length}/{maxSelected} seleccionadas</span>}</div>
    {!eventId?<div className="media-picker-empty"><strong>Selecciona un evento</strong><p>La biblioteca se filtra por el evento activo de la invitación.</p></div>:loading?<div className="media-picker-loading">Cargando biblioteca…</div>:error?<div className="alert alert-error">{error}</div>:filtered.length===0?<div className="media-picker-empty"><strong>No hay recursos disponibles</strong><p>Sube archivos desde Biblioteca o usa la carga directa del editor.</p></div>:<div className={`media-picker-grid ${kind==='audio'?'is-audio':''}`}>{filtered.map(item=>{const url=urlFor(item);const active=selected.includes(url);return <button key={item.id} type="button" className={`media-picker-item ${active?'is-selected':''}`} onClick={()=>choose(url)}>{kind==='imagen'?<img src={url} alt={item.nombre_original||'Imagen de biblioteca'}/>:<div className="media-picker-audio"><span>♫</span><audio controls preload="none" src={url} onClick={event=>event.stopPropagation()}/></div>}<span className="media-picker-check">{active?'✓':'+'}</span><div><strong title={item.nombre_original||''}>{item.nombre_original||'Archivo sin nombre'}</strong><small>{formatBytes(item.size_bytes)}</small></div></button>})}</div>}
    <footer className="media-picker-footer"><button type="button" className="button button-outline" onClick={onClose}>Cancelar</button>{multiple&&<button type="button" className="button button-primary" disabled={!selected.length} onClick={()=>{onSelect(selected);onClose()}}>Usar {selected.length||''} fotografía{selected.length===1?'':'s'}</button>}</footer>
  </section></div>;
}
