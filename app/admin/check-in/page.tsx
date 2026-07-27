'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Invitation = { id: string; titulo: string; slug: string; estado: string };
type Guest = {
  id: string;
  nombre: string;
  telefono: string | null;
  codigo: string;
  mesa: string | null;
  estado: 'pendiente' | 'confirmado' | 'no_asistira';
  adultos_permitidos: number;
  ninos_permitidos: number;
  checkin_adultos: number;
  checkin_ninos: number;
  checkin_at: string | null;
  ultimo_checkin_at: string | null;
};
type Activity = {
  id: string;
  invitado_id: string;
  usuario_id: string | null;
  accion: 'entrada' | 'reversion';
  adultos: number;
  ninos: number;
  created_at: string;
};
type CheckinResult = {
  ok: boolean;
  status: 'llego' | 'parcial' | 'duplicado' | 'rechazado';
  message: string;
  guest: Guest;
};
type Filter = 'todos' | 'pendientes' | 'confirmados' | 'llegaron' | 'rechazaron';

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => {
      detect(source: ImageBitmapSource): Promise<Array<{ rawValue: string }>>;
    };
  }
}

function extractCode(value: string) {
  const clean = value.trim();
  try {
    const url = new URL(clean);
    return decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) || '').toUpperCase();
  } catch {
    return clean.toUpperCase();
  }
}

function totalAllowed(g: Guest) {
  return (g.adultos_permitidos || 0) + (g.ninos_permitidos || 0);
}
function totalArrived(g: Guest) {
  return (g.checkin_adultos || 0) + (g.checkin_ninos || 0);
}
function formatTime(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
    : '—';
}
function csvCell(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export default function CheckInPage() {
  const supabase = useMemo(() => createClient(), []);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationId, setInvitationId] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [closed, setClosed] = useState(false);
  const [code, setCode] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [tableFilter, setTableFilter] = useState('');

  async function loadInvitations() {
    setLoading(true);
    const { data, error: nextError } = await supabase
      .from('invitaciones')
      .select('id,titulo,slug,estado')
      .in('modalidad', ['pases', 'codigo'])
      .order('titulo');
    if (nextError) setError(nextError.message);
    const rows = (data || []) as Invitation[];
    setInvitations(rows);
    setInvitationId((current) => current || rows[0]?.id || '');
    setLoading(false);
  }

  async function loadDashboard(id = invitationId) {
    if (!id) {
      setGuests([]);
      setActivity([]);
      setClosed(false);
      return;
    }
    const [guestResponse, activityResponse, configurationResponse] = await Promise.all([
      supabase
        .from('invitados')
        .select('id,nombre,telefono,codigo,mesa,estado,adultos_permitidos,ninos_permitidos,checkin_adultos,checkin_ninos,checkin_at,ultimo_checkin_at')
        .eq('invitacion_id', id)
        .order('nombre'),
      supabase
        .from('checkin_registros')
        .select('id,invitado_id,usuario_id,accion,adultos,ninos,created_at')
        .eq('invitacion_id', id)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('checkin_configuracion')
        .select('cerrado')
        .eq('invitacion_id', id)
        .maybeSingle(),
    ]);
    if (guestResponse.error) setError(guestResponse.error.message);
    else setGuests((guestResponse.data || []) as Guest[]);
    if (!activityResponse.error) setActivity((activityResponse.data || []) as Activity[]);
    setClosed(Boolean(configurationResponse.data?.cerrado));
  }

  useEffect(() => {
    void loadInvitations();
  }, []);

  useEffect(() => {
    void loadDashboard(invitationId);
    if (!invitationId) return;
    const channel = supabase
      .channel(`checkin-dashboard-${invitationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invitados', filter: `invitacion_id=eq.${invitationId}` }, () => void loadDashboard(invitationId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkin_registros', filter: `invitacion_id=eq.${invitationId}` }, () => void loadDashboard(invitationId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkin_configuracion', filter: `invitacion_id=eq.${invitationId}` }, () => void loadDashboard(invitationId))
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [invitationId, supabase]);

  useEffect(() => () => stopScanner(), []);

  function beep(ok: boolean) {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = ok ? 880 : 220;
      gain.gain.setValueAtTime(0.12, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.18);
    } catch {}
  }

  async function register(rawCode: string) {
    const normalized = extractCode(rawCode);
    if (!invitationId || !normalized || checking || closed) return;
    setChecking(true);
    setError('');
    const { data, error: nextError } = await supabase.rpc('registrar_checkin', {
      p_invitacion_id: invitationId,
      p_codigo: normalized,
      p_adultos: adults,
      p_ninos: children,
    });
    if (nextError) {
      setError(nextError.message);
      setResult(null);
      beep(false);
    } else {
      const next = data as CheckinResult;
      setResult(next);
      setCode('');
      beep(next.ok);
      await loadDashboard(invitationId);
    }
    setChecking(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await register(code);
  }

  async function undo(guest: Guest) {
    if (!confirm(`¿Revertir el check-in de ${guest.nombre}?`)) return;
    setChecking(true);
    const { error: nextError } = await supabase.rpc('revertir_checkin', {
      p_invitacion_id: invitationId,
      p_invitado_id: guest.id,
    });
    if (nextError) setError(nextError.message);
    else {
      setResult(null);
      await loadDashboard(invitationId);
    }
    setChecking(false);
  }

  async function toggleClosed() {
    if (!invitationId) return;
    const nextClosed = !closed;
    if (nextClosed && !confirm('Al cerrar el check-in ya no se podrán registrar entradas. ¿Continuar?')) return;
    setChecking(true);
    const { error: nextError } = await supabase.rpc('configurar_checkin', {
      p_invitacion_id: invitationId,
      p_cerrado: nextClosed,
    });
    if (nextError) setError(nextError.message);
    else setClosed(nextClosed);
    setChecking(false);
  }

  function stopScanner() {
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    scanTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function startScanner() {
    setError('');
    if (!window.BarcodeDetector) {
      setError('Este navegador no soporta escaneo directo. Ingresa el código manualmente.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      scanTimerRef.current = window.setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || checking) return;
        try {
          const found = await detector.detect(video);
          if (found[0]?.rawValue) {
            stopScanner();
            await register(found[0].rawValue);
          }
        } catch {}
      }, 450);
    } catch {
      setError('No fue posible abrir la cámara. Verifica los permisos del navegador.');
      stopScanner();
    }
  }

  function exportCsv() {
    const headers = ['Invitado', 'Teléfono', 'Código', 'Mesa', 'Estado RSVP', 'Adultos permitidos', 'Niños permitidos', 'Adultos ingresaron', 'Niños ingresaron', 'Última llegada'];
    const rows = guests.map((guest) => [
      guest.nombre,
      guest.telefono || '',
      guest.codigo,
      guest.mesa || '',
      guest.estado,
      guest.adultos_permitidos,
      guest.ninos_permitidos,
      guest.checkin_adultos,
      guest.checkin_ninos,
      guest.ultimo_checkin_at || guest.checkin_at || '',
    ]);
    const content = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([`\ufeff${content}`], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `checkin-${invitations.find((item) => item.id === invitationId)?.slug || 'evento'}.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  const expected = guests.reduce((total, guest) => total + totalAllowed(guest), 0);
  const arrived = guests.reduce((total, guest) => total + totalArrived(guest), 0);
  const confirmed = guests.filter((guest) => guest.estado === 'confirmado').reduce((total, guest) => total + totalAllowed(guest), 0);
  const rejected = guests.filter((guest) => guest.estado === 'no_asistira').reduce((total, guest) => total + totalAllowed(guest), 0);
  const pending = Math.max(0, expected - arrived - rejected);
  const attendance = expected ? Math.round((arrived / expected) * 100) : 0;
  const guestById = new Map(guests.map((guest) => [guest.id, guest]));

  const visible = guests.filter((guest) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [guest.nombre, guest.codigo, guest.telefono || '', guest.mesa || ''].some((value) => value.toLowerCase().includes(query));
    const matchesTable = !tableFilter || (guest.mesa || '').toLowerCase().includes(tableFilter.toLowerCase());
    if (!matchesSearch || !matchesTable) return false;
    if (filter === 'pendientes') return totalArrived(guest) === 0 && guest.estado !== 'no_asistira';
    if (filter === 'confirmados') return guest.estado === 'confirmado';
    if (filter === 'llegaron') return totalArrived(guest) > 0;
    if (filter === 'rechazaron') return guest.estado === 'no_asistira';
    return true;
  });

  return (
    <div className="page-stack checkin-page">
      <section className="page-heading checkin-heading">
        <div>
          <p className="eyebrow">Control de acceso</p>
          <h1>Check-in y asistencia</h1>
          <p>Escanea pases, consulta métricas y descarga el reporte final del evento.</p>
        </div>
        <div className="checkin-heading-actions">
          <button type="button" className="button button-outline" onClick={exportCsv} disabled={!guests.length}>Exportar CSV</button>
          <button type="button" className="button button-outline" onClick={() => window.print()} disabled={!guests.length}>Imprimir lista</button>
          <button type="button" className={`button ${closed ? 'button-primary' : 'button-danger'}`} onClick={() => void toggleClosed()} disabled={!invitationId || checking}>
            {closed ? 'Reabrir check-in' : 'Cerrar check-in'}
          </button>
        </div>
      </section>

      <section className="panel-card checkin-event-selector">
        <label>
          <span>Evento</span>
          <select value={invitationId} onChange={(event) => { setInvitationId(event.target.value); setResult(null); }} disabled={loading}>
            <option value="">Selecciona una invitación</option>
            {invitations.map((invitation) => <option key={invitation.id} value={invitation.id}>{invitation.titulo}</option>)}
          </select>
        </label>
        <span className={`checkin-open-state ${closed ? 'is-closed' : ''}`}>{closed ? 'Check-in cerrado' : 'Check-in abierto'}</span>
      </section>

      <section className="stats-grid checkin-summary-grid">
        <article className="stat-card"><span>Esperados</span><strong>{expected}</strong><small>Personas autorizadas</small></article>
        <article className="stat-card"><span>Confirmados</span><strong>{confirmed}</strong><small>Personas con RSVP positivo</small></article>
        <article className="stat-card"><span>Han llegado</span><strong>{arrived}</strong><small>{attendance}% de asistencia</small></article>
        <article className="stat-card"><span>Pendientes</span><strong>{pending}</strong><small>Aún sin ingreso</small></article>
        <article className="stat-card"><span>Rechazados</span><strong>{rejected}</strong><small>No asistirán</small></article>
      </section>

      <section className="checkin-dashboard-grid">
        <article className="panel-card checkin-console">
          <div className="panel-header"><div><h2>Escáner de acceso</h2><p>Registra adultos y niños que ingresan con cada pase.</p></div></div>
          <div className="checkin-workspace">
            <div className="checkin-scanner-card">
              <video ref={videoRef} className={`checkin-camera ${scanning ? 'active' : ''}`} muted playsInline />
              {!scanning && <div className="checkin-camera-placeholder"><span>▣</span><strong>Cámara lista para escanear</strong><small>También puedes escribir el código manualmente.</small></div>}
              <button type="button" className="button button-outline" onClick={scanning ? stopScanner : () => void startScanner()} disabled={!invitationId || closed}>{scanning ? 'Detener cámara' : 'Abrir cámara'}</button>
            </div>
            <form className="checkin-manual-card" onSubmit={submit}>
              <label className="form-field"><span>Código del pase</span><input autoFocus value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Ej. A7K29PZ" disabled={!invitationId || checking || closed} /></label>
              <div className="checkin-party-count">
                <label><span>Adultos</span><input type="number" min="0" value={adults} onChange={(event) => setAdults(Math.max(0, Number(event.target.value)))} /></label>
                <label><span>Niños</span><input type="number" min="0" value={children} onChange={(event) => setChildren(Math.max(0, Number(event.target.value)))} /></label>
              </div>
              <button className="button button-primary" disabled={!invitationId || !code.trim() || checking || closed}>{checking ? 'Validando…' : closed ? 'Check-in cerrado' : 'Registrar llegada'}</button>
              {error && <p className="form-error">{error}</p>}
              {result && <article className={`checkin-result checkin-result-${result.status}`}><span>{result.ok ? '✓' : result.status === 'duplicado' ? '!' : '×'}</span><div><strong>{result.guest.nombre}</strong><p>{result.message}</p><small>Mesa {result.guest.mesa || 'sin asignar'} · {totalArrived(result.guest)} de {totalAllowed(result.guest)} personas registradas</small></div></article>}
            </form>
          </div>
        </article>

        <aside className="panel-card checkin-activity-card">
          <div className="panel-header"><div><h2>Actividad reciente</h2><p>Últimas entradas y reversiones.</p></div></div>
          <div className="checkin-activity-list">
            {activity.length ? activity.map((item) => {
              const guest = guestById.get(item.invitado_id);
              return <article key={item.id} className={item.accion === 'entrada' ? 'is-entry' : 'is-reversal'}><span>{item.accion === 'entrada' ? '✓' : '↶'}</span><div><strong>{guest?.nombre || 'Invitado'}</strong><p>{item.accion === 'entrada' ? `Ingreso: ${item.adultos} adulto(s), ${item.ninos} niño(s)` : 'Check-in revertido'}</p><small>{formatTime(item.created_at)} · {item.usuario_id ? `Usuario ${item.usuario_id.slice(0, 8)}` : 'Sistema'}</small></div></article>;
            }) : <p className="dashboard-loading">Todavía no hay actividad.</p>}
          </div>
          <div className="checkin-progress-card"><div><strong>{attendance}%</strong><span>Asistencia</span></div><div className="checkin-progress-track"><span style={{ width: `${attendance}%` }} /></div><small>{arrived} de {expected} personas han ingresado.</small></div>
        </aside>
      </section>

      <section className="panel-card checkin-report-section">
        <div className="panel-header checkin-list-header">
          <div><h2>Reporte de invitados</h2><p>Busca por nombre, código, teléfono o mesa.</p></div>
          <div className="checkin-filters">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar invitado…" />
            <input value={tableFilter} onChange={(event) => setTableFilter(event.target.value)} placeholder="Filtrar mesa…" />
            <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}><option value="todos">Todos</option><option value="pendientes">Pendientes</option><option value="confirmados">Confirmados</option><option value="llegaron">Llegaron</option><option value="rechazaron">Rechazaron</option></select>
          </div>
        </div>
        {!invitationId ? <div className="dashboard-loading">Selecciona una invitación.</div> : visible.length === 0 ? <div className="dashboard-loading">No hay resultados.</div> : <div className="table-wrap"><table className="data-table centered-data-table"><thead><tr><th>Invitado</th><th className="table-center">Código</th><th className="table-center">Mesa</th><th className="table-center">RSVP</th><th className="table-center">Ingreso</th><th className="table-center">Hora</th><th></th></tr></thead><tbody>{visible.map((guest) => <tr key={guest.id}><td><strong>{guest.nombre}</strong>{guest.telefono && <small className="checkin-phone">{guest.telefono}</small>}</td><td className="table-center">{guest.codigo}</td><td className="table-center">{guest.mesa || '—'}</td><td className="table-center"><span className={`checkin-rsvp status-${guest.estado}`}>{guest.estado.replace('_', ' ')}</span></td><td className="table-center">{totalArrived(guest) > 0 ? <span className="checkin-arrived">{totalArrived(guest)} / {totalAllowed(guest)}</span> : guest.estado === 'no_asistira' ? <span className="checkin-rejected">Rechazó</span> : <span className="checkin-pending">Pendiente</span>}</td><td className="table-center">{formatTime(guest.ultimo_checkin_at || guest.checkin_at)}</td><td>{totalArrived(guest) > 0 && <button type="button" className="button button-ghost button-small" onClick={() => void undo(guest)} disabled={checking || closed}>Revertir</button>}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
