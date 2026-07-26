'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Invitation = { id: string; titulo: string; slug: string; estado: string };
type Guest = {
  id: string;
  nombre: string;
  codigo: string;
  mesa: string | null;
  estado: 'pendiente' | 'confirmado' | 'no_asistira';
  adultos_permitidos: number;
  ninos_permitidos: number;
  checkin_at: string | null;
};
type CheckinResult = {
  ok: boolean;
  status: 'llego' | 'duplicado' | 'rechazado';
  message: string;
  guest: Guest;
};

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
    const parts = url.pathname.split('/').filter(Boolean);
    return decodeURIComponent(parts.at(-1) || '').toUpperCase();
  } catch {
    return clean.toUpperCase();
  }
}

export default function CheckInPage() {
  const supabase = useMemo(() => createClient(), []);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationId, setInvitationId] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CheckinResult | null>(null);

  async function loadInvitations() {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('invitaciones')
      .select('id,titulo,slug,estado')
      .eq('modalidad', 'pases')
      .order('titulo');
    if (queryError) setError(queryError.message);
    const rows = (data || []) as Invitation[];
    setInvitations(rows);
    setInvitationId((current) => current || rows[0]?.id || '');
    setLoading(false);
  }

  async function loadGuests(id = invitationId) {
    if (!id) {
      setGuests([]);
      return;
    }
    const { data, error: queryError } = await supabase
      .from('invitados')
      .select('id,nombre,codigo,mesa,estado,adultos_permitidos,ninos_permitidos,checkin_at')
      .eq('invitacion_id', id)
      .order('nombre');
    if (queryError) setError(queryError.message);
    else setGuests((data || []) as Guest[]);
  }

  useEffect(() => {
    void loadInvitations();
  }, []);

  useEffect(() => {
    void loadGuests(invitationId);
  }, [invitationId]);

  useEffect(() => () => stopScanner(), []);

  async function register(rawCode: string) {
    const normalized = extractCode(rawCode);
    if (!invitationId || !normalized || checking) return;
    setChecking(true);
    setError('');
    const { data, error: rpcError } = await supabase.rpc('registrar_checkin', {
      p_invitacion_id: invitationId,
      p_codigo: normalized,
    });
    if (rpcError) {
      setError(rpcError.message);
      setResult(null);
    } else {
      setResult(data as CheckinResult);
      setCode('');
      await loadGuests(invitationId);
    }
    setChecking(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await register(code);
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
        } catch {
          // La cámara continúa intentando.
        }
      }, 500);
    } catch {
      setError('No fue posible abrir la cámara. Verifica los permisos del navegador.');
      stopScanner();
    }
  }

  const arrived = guests.filter((guest) => guest.checkin_at).length;
  const pending = guests.length - arrived;

  return (
    <div className="page-stack checkin-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Control de acceso</p>
          <h1>Check-in con QR</h1>
          <p>Escanea el pase o escribe su código para registrar la llegada.</p>
        </div>
      </section>

      <section className="stats-grid guest-stats">
        <article className="stat-card"><span>Invitados</span><strong>{guests.length}</strong><small>Pases registrados</small></article>
        <article className="stat-card"><span>Han llegado</span><strong>{arrived}</strong><small>Check-in completado</small></article>
        <article className="stat-card"><span>Pendientes</span><strong>{pending}</strong><small>Aún sin ingreso</small></article>
      </section>

      <section className="panel-card checkin-console">
        <div className="panel-header">
          <div><h2>Escáner de acceso</h2><p>Selecciona el evento y registra cada pase una sola vez.</p></div>
          <select value={invitationId} onChange={(event) => { setInvitationId(event.target.value); setResult(null); }} disabled={loading}>
            <option value="">Selecciona una invitación</option>
            {invitations.map((invitation) => <option key={invitation.id} value={invitation.id}>{invitation.titulo}</option>)}
          </select>
        </div>

        <div className="checkin-workspace">
          <div className="checkin-scanner-card">
            <video ref={videoRef} className={`checkin-camera ${scanning ? 'active' : ''}`} muted playsInline />
            {!scanning && <div className="checkin-camera-placeholder"><span>▣</span><strong>Cámara lista para escanear</strong><small>También puedes escribir el código del pase.</small></div>}
            <button type="button" className="button button-outline" onClick={scanning ? stopScanner : () => void startScanner()} disabled={!invitationId}>
              {scanning ? 'Detener cámara' : 'Abrir cámara'}
            </button>
          </div>

          <form className="checkin-manual-card" onSubmit={submit}>
            <label className="form-field">
              <span>Código del pase</span>
              <input autoFocus value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Ej. A7K29PZ" disabled={!invitationId || checking} />
            </label>
            <button className="button button-primary" disabled={!invitationId || !code.trim() || checking}>{checking ? 'Validando…' : 'Registrar llegada'}</button>
            {error && <p className="form-error">{error}</p>}
            {result && (
              <article className={`checkin-result checkin-result-${result.status}`}>
                <span>{result.ok ? '✓' : result.status === 'duplicado' ? '!' : '×'}</span>
                <div>
                  <strong>{result.guest.nombre}</strong>
                  <p>{result.message}</p>
                  <small>Mesa {result.guest.mesa || 'sin asignar'} · {result.guest.adultos_permitidos} adulto(s) · {result.guest.ninos_permitidos} niño(s)</small>
                </div>
              </article>
            )}
          </form>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header"><div><h2>Asistencia en tiempo real</h2><p>Estado actual de los pases del evento.</p></div></div>
        {!invitationId ? <div className="dashboard-loading">Selecciona una invitación.</div> : guests.length === 0 ? <div className="dashboard-loading">No hay pases registrados.</div> : (
          <div className="table-wrap"><table className="data-table centered-data-table"><thead><tr><th>Invitado</th><th className="table-center">Código</th><th className="table-center">Mesa</th><th className="table-center">RSVP</th><th className="table-center">Check-in</th></tr></thead><tbody>
            {guests.map((guest) => <tr key={guest.id}><td><strong>{guest.nombre}</strong></td><td className="table-center">{guest.codigo}</td><td className="table-center">{guest.mesa || '—'}</td><td className="table-center">{guest.estado.replace('_', ' ')}</td><td className="table-center">{guest.checkin_at ? <span className="checkin-arrived">Llegó</span> : <span className="checkin-pending">Pendiente</span>}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </div>
  );
}
