'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ManagedGuest } from './guests/guest-management-center';

type ShareTab = 'general' | 'whatsapp' | 'qr';
type RecipientFilter = 'todos' | 'pendientes' | 'confirmados' | 'con_telefono';
type SendState = 'pending' | 'opened' | 'sent' | 'skipped';

type Props = {
  open: boolean;
  onClose: () => void;
  invitationTitle: string;
  invitationSlug: string;
  eventDate?: string | null;
  venue?: string | null;
  guests: ManagedGuest[];
  personalized: boolean;
};

const DEFAULT_MESSAGE = `Hola {{nombre}} 👋\n\nTe invitamos a {{evento}}.\n\n📅 {{fecha}}\n📍 {{ubicacion}}\n\nConsulta tu invitación aquí:\n{{link}}\n\n¡Será un gusto contar contigo!`;

function normalizePhone(value?: string | null) {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `52${digits}`;
  return digits;
}

function readableDate(value?: string | null) {
  if (!value) return 'Fecha por definir';
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = iso
    ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(date);
}

function replaceVariables(
  template: string,
  guest: ManagedGuest | null,
  values: { event: string; date: string; venue: string; link: string },
  personalized: boolean
) {
  const guestLink = personalized && guest?.codigo ? `${values.link}/${guest.codigo}` : values.link;
  return template
    .replaceAll('{{nombre}}', guest?.nombre || 'Invitado')
    .replaceAll('{{evento}}', values.event)
    .replaceAll('{{fecha}}', values.date)
    .replaceAll('{{ubicacion}}', values.venue || 'Ubicación por definir')
    .replaceAll('{{mesa}}', guest?.mesa || 'Por asignar')
    .replaceAll('{{pases}}', String((guest?.adultos_permitidos || 0) + (guest?.ninos_permitidos || 0) || 1))
    .replaceAll('{{link}}', guestLink);
}

export default function ShareCenterModal({
  open,
  onClose,
  invitationTitle,
  invitationSlug,
  eventDate,
  venue,
  guests,
  personalized,
}: Props) {
  const [tab, setTab] = useState<ShareTab>('general');
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<RecipientFilter>('todos');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [template, setTemplate] = useState(DEFAULT_MESSAGE);
  const [queue, setQueue] = useState<ManagedGuest[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [sendStates, setSendStates] = useState<Record<string, SendState>>({});

  useEffect(() => {
    if (!open) return;
    setOrigin(window.location.origin);
    setCopied(false);
    setQueue([]);
    setQueueIndex(0);
    const saved = window.localStorage.getItem(`invitapro-share-status:${invitationSlug}`);
    if (saved) {
      try {
        setSendStates(JSON.parse(saved) as Record<string, SendState>);
      } catch {
        setSendStates({});
      }
    }
  }, [open, invitationSlug]);

  useEffect(() => {
    if (!open) return;
    window.localStorage.setItem(`invitapro-share-status:${invitationSlug}`, JSON.stringify(sendStates));
  }, [sendStates, invitationSlug, open]);

  const publicUrl = `${origin}/invitacion/${invitationSlug}`;
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      if (filter === 'pendientes') return guest.estado === 'pendiente';
      if (filter === 'confirmados') return guest.estado === 'confirmado';
      if (filter === 'con_telefono') return Boolean(normalizePhone(guest.telefono));
      return true;
    });
  }, [filter, guests]);

  const selectedGuests = useMemo(
    () => guests.filter((guest) => selectedIds.includes(guest.id) && normalizePhone(guest.telefono)),
    [guests, selectedIds]
  );
  const allVisibleSelected = filteredGuests.length > 0 && filteredGuests.every((guest) => selectedIds.includes(guest.id));
  const previewGuest = selectedGuests[0] || filteredGuests.find((guest) => normalizePhone(guest.telefono)) || null;
  const templateValues = {
    event: invitationTitle,
    date: readableDate(eventDate),
    venue: venue || 'Ubicación por definir',
    link: publicUrl,
  };
  const previewMessage = replaceVariables(template, previewGuest, templateValues, personalized);
  const currentGuest = queue[queueIndex] || null;

  if (!open) return null;

  function toggleVisible() {
    const visibleIds = filteredGuests.map((guest) => guest.id);
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  }

  function toggleGuest(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyUrl();
      return;
    }
    await navigator.share({ title: invitationTitle, text: `Te invitamos a ${invitationTitle}`, url: publicUrl });
  }

  function startQueue() {
    if (!selectedGuests.length) return;
    setQueue(selectedGuests);
    setQueueIndex(0);
  }

  function openCurrentWhatsApp() {
    if (!currentGuest) return;
    const phone = normalizePhone(currentGuest.telefono);
    const message = replaceVariables(template, currentGuest, templateValues, personalized);
    setSendStates((current) => ({ ...current, [currentGuest.id]: 'opened' }));
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  function advance(state: SendState) {
    if (!currentGuest) return;
    setSendStates((current) => ({ ...current, [currentGuest.id]: state }));
    setQueueIndex((current) => Math.min(current + 1, queue.length));
  }

  async function downloadQr() {
    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(publicUrl)}&size=1000&margin=2`;
    try {
      const response = await fetch(qrUrl);
      if (!response.ok) throw new Error('No fue posible generar el QR');
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = `qr-${invitationSlug}.png`;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch {
      window.open(qrUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="modal-backdrop share-center-backdrop" onMouseDown={onClose}>
      <section className="share-center-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="share-center-header">
          <div>
            <p className="eyebrow">Centro de compartir</p>
            <h2>Distribuye tu invitación</h2>
            <p>Copia el enlace, descarga el QR o prepara envíos personalizados por WhatsApp.</p>
          </div>
          <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>×</button>
        </header>

        <nav className="share-center-tabs" aria-label="Opciones de compartir">
          <button type="button" className={tab === 'general' ? 'active' : ''} onClick={() => setTab('general')}>Enlace</button>
          <button type="button" className={tab === 'whatsapp' ? 'active' : ''} onClick={() => setTab('whatsapp')}>WhatsApp</button>
          <button type="button" className={tab === 'qr' ? 'active' : ''} onClick={() => setTab('qr')}>Código QR</button>
        </nav>

        <div className="share-center-body">
          {tab === 'general' && (
            <div className="share-center-general">
              <div className="share-center-link-card">
                <span>Enlace público</span>
                <strong>{invitationTitle}</strong>
                <div><input readOnly value={publicUrl} /><button type="button" onClick={() => void copyUrl()}>{copied ? 'Copiado ✓' : 'Copiar enlace'}</button></div>
              </div>
              <div className="share-center-action-grid">
                <button type="button" onClick={() => void nativeShare()}><span>↗</span><strong>Compartir</strong><small>Usa las opciones de tu dispositivo</small></button>
                <button type="button" onClick={() => setTab('whatsapp')}><span>◉</span><strong>WhatsApp</strong><small>Envía a tu lista de invitados</small></button>
                <button type="button" onClick={() => setTab('qr')}><span>⌗</span><strong>Código QR</strong><small>Descarga una imagen en alta resolución</small></button>
              </div>
            </div>
          )}

          {tab === 'whatsapp' && (
            <div className="share-whatsapp-layout">
              <section className="share-recipient-panel">
                <header><div><strong>Destinatarios</strong><small>{selectedGuests.length} con teléfono seleccionados</small></div><button type="button" onClick={toggleVisible}>{allVisibleSelected ? 'Quitar visibles' : 'Seleccionar visibles'}</button></header>
                <div className="share-recipient-filters">
                  {([['todos', 'Todos'], ['pendientes', 'Pendientes'], ['confirmados', 'Confirmados'], ['con_telefono', 'Con teléfono']] as const).map(([id, label]) => (
                    <button key={id} type="button" className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>
                  ))}
                </div>
                <div className="share-recipient-list">
                  {filteredGuests.map((guest) => {
                    const hasPhone = Boolean(normalizePhone(guest.telefono));
                    const state = sendStates[guest.id] || 'pending';
                    return (
                      <label key={guest.id} className={!hasPhone ? 'is-disabled' : ''}>
                        <input type="checkbox" disabled={!hasPhone} checked={selectedIds.includes(guest.id)} onChange={() => toggleGuest(guest.id)} />
                        <span><strong>{guest.nombre}</strong><small>{guest.telefono || 'Sin teléfono'}</small></span>
                        <em className={`share-send-state state-${state}`}>{state === 'sent' ? 'Enviado' : state === 'opened' ? 'Abierto' : state === 'skipped' ? 'Omitido' : 'Pendiente'}</em>
                      </label>
                    );
                  })}
                  {!filteredGuests.length && <p className="share-empty">No hay invitados en este segmento.</p>}
                </div>
              </section>

              <section className="share-message-panel">
                <header><strong>Mensaje</strong><small>Variables: {'{{nombre}}'} {'{{evento}}'} {'{{fecha}}'} {'{{ubicacion}}'} {'{{mesa}}'} {'{{pases}}'} {'{{link}}'}</small></header>
                <textarea value={template} onChange={(event) => setTemplate(event.target.value)} rows={11} />
                <div className="share-message-preview"><span>Vista previa</span><pre>{previewMessage}</pre></div>
                <button type="button" className="client-primary share-start-button" disabled={!selectedGuests.length} onClick={startQueue}>Iniciar {selectedGuests.length} envío{selectedGuests.length === 1 ? '' : 's'}</button>
              </section>
            </div>
          )}

          {tab === 'qr' && (
            <div className="share-qr-panel">
              <div className="share-qr-preview"><img src={`https://quickchart.io/qr?text=${encodeURIComponent(publicUrl)}&size=420&margin=2`} alt={`Código QR para ${invitationTitle}`} /></div>
              <div><p className="eyebrow">Código QR</p><h3>{invitationTitle}</h3><p>Ideal para imprimir en mesas, accesos, recuerdos o material promocional.</p><button type="button" className="client-primary" onClick={() => void downloadQr()}>Descargar QR en PNG</button></div>
            </div>
          )}

          {queue.length > 0 && (
            <div className="share-queue-overlay">
              <section>
                <header><div><p className="eyebrow">Envío asistido</p><h3>{currentGuest ? `${queueIndex + 1} de ${queue.length}` : 'Proceso terminado'}</h3></div><button type="button" className="modal-close" onClick={() => setQueue([])}>×</button></header>
                {currentGuest ? (
                  <>
                    <div className="share-queue-person"><strong>{currentGuest.nombre}</strong><span>{currentGuest.telefono}</span></div>
                    <pre>{replaceVariables(template, currentGuest, templateValues, personalized)}</pre>
                    <div className="share-queue-actions">
                      <button type="button" className="button button-outline" onClick={() => advance('skipped')}>Omitir</button>
                      <button type="button" className="button button-whatsapp" onClick={openCurrentWhatsApp}>Abrir WhatsApp</button>
                      <button type="button" className="client-primary" onClick={() => advance('sent')}>Marcar enviado y seguir</button>
                    </div>
                  </>
                ) : (
                  <div className="share-queue-complete"><span>✓</span><h4>Proceso completado</h4><p>El estado quedó guardado en este navegador.</p><button type="button" className="client-primary" onClick={() => setQueue([])}>Cerrar</button></div>
                )}
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
