'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Invitation = { id: string; titulo: string; slug: string; estado: string };
type Guest = {
  id: string; nombre: string; telefono: string | null; codigo: string; mesa: string | null;
  estado: 'pendiente' | 'confirmado' | 'no_asistira'; adultos_permitidos: number; ninos_permitidos: number;
  checkin_adultos: number; checkin_ninos: number; checkin_at: string | null; ultimo_checkin_at: string | null;
};
type CheckinResult = { ok: boolean; status: 'llego' | 'parcial' | 'duplicado' | 'rechazado'; message: string; guest: Guest };
type Filter = 'todos' | 'pendientes' | 'confirmados' | 'llegaron' | 'rechazaron';

declare global { interface Window { BarcodeDetector?: new (options?: { formats?: string[] }) => { detect(source: ImageBitmapSource): Promise<Array<{ rawValue: string }>> } } }

function extractCode(value: string) {
  const clean = value.trim();
  try { const url = new URL(clean); return decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) || '').toUpperCase(); }
  catch { return clean.toUpperCase(); }
}
function totalAllowed(g: Guest) { return (g.adultos_permitidos || 0) + (g.ninos_permitidos || 0); }
function totalArrived(g: Guest) { return (g.checkin_adultos || 0) + (g.checkin_ninos || 0); }
function formatTime(value: string | null) { return value ? new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'; }

export default function CheckInPage() {
  const supabase = useMemo(() => createClient(), []);
  const videoRef = useRef<HTMLVideoElement | null>(null); const streamRef = useRef<MediaStream | null>(null); const scanTimerRef = useRef<number | null>(null);
  const [invitations,setInvitations]=useState<Invitation[]>([]); const [invitationId,setInvitationId]=useState(''); const [guests,setGuests]=useState<Guest[]>([]);
  const [code,setCode]=useState(''); const [adults,setAdults]=useState(1); const [children,setChildren]=useState(0); const [loading,setLoading]=useState(true);
  const [checking,setChecking]=useState(false); const [scanning,setScanning]=useState(false); const [error,setError]=useState(''); const [result,setResult]=useState<CheckinResult|null>(null);
  const [search,setSearch]=useState(''); const [filter,setFilter]=useState<Filter>('todos');

  async function loadInvitations(){setLoading(true);const{data,error:e}=await supabase.from('invitaciones').select('id,titulo,slug,estado').eq('modalidad','pases').order('titulo');if(e)setError(e.message);const rows=(data||[]) as Invitation[];setInvitations(rows);setInvitationId(v=>v||rows[0]?.id||'');setLoading(false)}
  async function loadGuests(id=invitationId){if(!id){setGuests([]);return}const{data,error:e}=await supabase.from('invitados').select('id,nombre,telefono,codigo,mesa,estado,adultos_permitidos,ninos_permitidos,checkin_adultos,checkin_ninos,checkin_at,ultimo_checkin_at').eq('invitacion_id',id).order('nombre');if(e)setError(e.message);else setGuests((data||[]) as Guest[])}
  useEffect(()=>{void loadInvitations()},[]);
  useEffect(()=>{void loadGuests(invitationId);if(!invitationId)return;const channel=supabase.channel(`checkin-${invitationId}`).on('postgres_changes',{event:'*',schema:'public',table:'invitados',filter:`invitacion_id=eq.${invitationId}`},()=>void loadGuests(invitationId)).subscribe();return()=>{void supabase.removeChannel(channel)}},[invitationId]);
  useEffect(()=>()=>stopScanner(),[]);

  function beep(ok:boolean){try{const Ctx=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;const ctx=new Ctx();const osc=ctx.createOscillator();const gain=ctx.createGain();osc.frequency.value=ok?880:220;gain.gain.setValueAtTime(.12,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.18)}catch{}}
  async function register(rawCode:string){const normalized=extractCode(rawCode);if(!invitationId||!normalized||checking)return;setChecking(true);setError('');const{data,error:e}=await supabase.rpc('registrar_checkin',{p_invitacion_id:invitationId,p_codigo:normalized,p_adultos:adults,p_ninos:children});if(e){setError(e.message);setResult(null);beep(false)}else{const next=data as CheckinResult;setResult(next);setCode('');beep(next.ok);await loadGuests(invitationId)}setChecking(false)}
  async function submit(event:FormEvent){event.preventDefault();await register(code)}
  async function undo(guest:Guest){if(!confirm(`¿Revertir el check-in de ${guest.nombre}?`))return;setChecking(true);const{error:e}=await supabase.rpc('revertir_checkin',{p_invitacion_id:invitationId,p_invitado_id:guest.id});if(e)setError(e.message);else{setResult(null);await loadGuests(invitationId)}setChecking(false)}
  function stopScanner(){if(scanTimerRef.current)window.clearInterval(scanTimerRef.current);scanTimerRef.current=null;streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setScanning(false)}
  async function startScanner(){setError('');if(!window.BarcodeDetector){setError('Este navegador no soporta escaneo directo. Ingresa el código manualmente.');return}try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});streamRef.current=stream;if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play()}setScanning(true);const detector=new window.BarcodeDetector({formats:['qr_code']});scanTimerRef.current=window.setInterval(async()=>{const video=videoRef.current;if(!video||video.readyState<2||checking)return;try{const found=await detector.detect(video);if(found[0]?.rawValue){stopScanner();await register(found[0].rawValue)}}catch{}},450)}catch{setError('No fue posible abrir la cámara. Verifica los permisos del navegador.');stopScanner()}}

  const expected=guests.reduce((n,g)=>n+totalAllowed(g),0); const arrived=guests.reduce((n,g)=>n+totalArrived(g),0); const pending=Math.max(0,expected-arrived);
  const visible=guests.filter(g=>{const q=search.trim().toLowerCase();const match=!q||[g.nombre,g.codigo,g.telefono||'',g.mesa||''].some(v=>v.toLowerCase().includes(q));if(!match)return false;if(filter==='pendientes')return totalArrived(g)===0&&g.estado!=='no_asistira';if(filter==='confirmados')return g.estado==='confirmado';if(filter==='llegaron')return totalArrived(g)>0;if(filter==='rechazaron')return g.estado==='no_asistira';return true});

  return <div className="page-stack checkin-page">
    <section className="page-heading"><div><p className="eyebrow">Control de acceso</p><h1>Check-in profesional</h1><p>Escanea pases, registra entradas parciales y consulta la asistencia en tiempo real.</p></div></section>
    <section className="stats-grid guest-stats"><article className="stat-card"><span>Esperados</span><strong>{expected}</strong><small>Personas autorizadas</small></article><article className="stat-card"><span>Han llegado</span><strong>{arrived}</strong><small>{expected?Math.round(arrived/expected*100):0}% de asistencia</small></article><article className="stat-card"><span>Pendientes</span><strong>{pending}</strong><small>Aún sin ingreso</small></article></section>
    <section className="panel-card checkin-console"><div className="panel-header"><div><h2>Escáner de acceso</h2><p>Selecciona el evento y registra cuántas personas ingresan con cada pase.</p></div><select value={invitationId} onChange={e=>{setInvitationId(e.target.value);setResult(null)}} disabled={loading}><option value="">Selecciona una invitación</option>{invitations.map(i=><option key={i.id} value={i.id}>{i.titulo}</option>)}</select></div>
      <div className="checkin-workspace"><div className="checkin-scanner-card"><video ref={videoRef} className={`checkin-camera ${scanning?'active':''}`} muted playsInline/>{!scanning&&<div className="checkin-camera-placeholder"><span>▣</span><strong>Cámara lista para escanear</strong><small>También puedes buscar o escribir el código.</small></div>}<button type="button" className="button button-outline" onClick={scanning?stopScanner:()=>void startScanner()} disabled={!invitationId}>{scanning?'Detener cámara':'Abrir cámara'}</button></div>
        <form className="checkin-manual-card" onSubmit={submit}><label className="form-field"><span>Código del pase</span><input autoFocus value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Ej. A7K29PZ" disabled={!invitationId||checking}/></label><div className="checkin-party-count"><label><span>Adultos</span><input type="number" min="0" value={adults} onChange={e=>setAdults(Math.max(0,Number(e.target.value)))}/></label><label><span>Niños</span><input type="number" min="0" value={children} onChange={e=>setChildren(Math.max(0,Number(e.target.value)))}/></label></div><button className="button button-primary" disabled={!invitationId||!code.trim()||checking}>{checking?'Validando…':'Registrar llegada'}</button>{error&&<p className="form-error">{error}</p>}{result&&<article className={`checkin-result checkin-result-${result.status}`}><span>{result.ok?'✓':result.status==='duplicado'?'!':'×'}</span><div><strong>{result.guest.nombre}</strong><p>{result.message}</p><small>Mesa {result.guest.mesa||'sin asignar'} · {totalArrived(result.guest)} de {totalAllowed(result.guest)} personas registradas</small></div></article>}</form></div>
    </section>
    <section className="panel-card"><div className="panel-header checkin-list-header"><div><h2>Asistencia en tiempo real</h2><p>Busca por nombre, código, teléfono o mesa.</p></div><div className="checkin-filters"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar invitado…"/><select value={filter} onChange={e=>setFilter(e.target.value as Filter)}><option value="todos">Todos</option><option value="pendientes">Pendientes</option><option value="confirmados">Confirmados</option><option value="llegaron">Llegaron</option><option value="rechazaron">Rechazaron</option></select></div></div>
      {!invitationId?<div className="dashboard-loading">Selecciona una invitación.</div>:visible.length===0?<div className="dashboard-loading">No hay resultados.</div>:<div className="table-wrap"><table className="data-table centered-data-table"><thead><tr><th>Invitado</th><th className="table-center">Código</th><th className="table-center">Mesa</th><th className="table-center">Ingreso</th><th className="table-center">Hora</th><th></th></tr></thead><tbody>{visible.map(g=><tr key={g.id}><td><strong>{g.nombre}</strong>{g.telefono&&<small className="checkin-phone">{g.telefono}</small>}</td><td className="table-center">{g.codigo}</td><td className="table-center">{g.mesa||'—'}</td><td className="table-center">{totalArrived(g)>0?<span className="checkin-arrived">{totalArrived(g)} / {totalAllowed(g)}</span>:g.estado==='no_asistira'?<span className="checkin-rejected">Rechazó</span>:<span className="checkin-pending">Pendiente</span>}</td><td className="table-center">{formatTime(g.ultimo_checkin_at||g.checkin_at)}</td><td>{totalArrived(g)>0&&<button type="button" className="button button-ghost button-small" onClick={()=>void undo(g)} disabled={checking}>Revertir</button>}</td></tr>)}</tbody></table></div>}
    </section>
  </div>
}
