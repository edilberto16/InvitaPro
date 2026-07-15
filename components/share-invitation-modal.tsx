'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  path: string;
  recipient?: string | null;
  phone?: string | null;
  personalized?: boolean;
};

function normalizePhone(value?: string | null) {
  return (value || '').replace(/\D/g, '');
}

export default function ShareInvitationModal({
  open,
  onClose,
  title,
  path,
  recipient,
  phone,
  personalized = false,
}: Props) {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOrigin(window.location.origin);
    setCopied(false);
  }, [open]);

  const url = `${origin}${path}`;
  const greeting = recipient ? `Hola ${recipient} 😊` : 'Hola 😊';
  const message = useMemo(
    () =>
      `${greeting}\n\n` +
      `Queremos compartir contigo nuestra invitación digital: ${title}.\n\n` +
      `${personalized ? 'Este enlace contiene tu pase personalizado:\n' : 'Puedes consultar todos los detalles aquí:\n'}` +
      `${url}\n\n` +
      `¡Esperamos contar con tu presencia!`,
    [greeting, personalized, title, url]
  );

  if (!open) return null;

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyUrl();
      return;
    }

    await navigator.share({
      title,
      text: message,
      url,
    });
  }

  function openWhatsApp() {
    const number = normalizePhone(phone);
    const base = number ? `https://wa.me/${number}` : 'https://wa.me/';
    window.open(`${base}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="modal-backdrop share-modal-backdrop" onMouseDown={onClose}>
      <section className="share-invitation-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="share-modal-header">
          <div>
            <p className="eyebrow">Compartir invitación</p>
            <h2>{personalized ? 'Enviar pase personalizado' : 'Compartir enlace público'}</h2>
            <p>
              {personalized
                ? 'Este enlace es exclusivo para el invitado seleccionado.'
                : 'Todas las personas pueden abrir este mismo enlace.'}
            </p>
          </div>
          <button type="button" className="modal-close" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="share-modal-body">
          {recipient && (
            <div className="share-recipient">
              <span>Destinatario</span>
              <strong>{recipient}</strong>
              <small>{phone || 'Sin teléfono registrado'}</small>
            </div>
          )}

          <label className="share-link-field">
            <span>Enlace que recibirá el invitado</span>
            <div>
              <input readOnly value={url} />
              <button type="button" onClick={() => void copyUrl()}>
                {copied ? 'Copiado ✓' : 'Copiar'}
              </button>
            </div>
          </label>

          <div className="share-message-preview">
            <span>Vista previa del mensaje</span>
            <pre>{message}</pre>
          </div>

          <div className="share-security-note">
            <strong>{personalized ? 'Enlace privado' : 'Enlace público'}</strong>
            <p>
              {personalized
                ? 'No compartas este enlace con otras familias porque contiene cupos y datos asignados.'
                : 'Puedes enviarlo a cualquier persona por WhatsApp, correo o redes sociales.'}
            </p>
          </div>
        </div>

        <footer className="share-modal-actions">
          <button type="button" className="button button-ghost" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="button button-outline" onClick={() => void nativeShare()}>
            Compartir…
          </button>
          <button type="button" className="button button-whatsapp" onClick={openWhatsApp}>
            Enviar por WhatsApp
          </button>
        </footer>
      </section>
    </div>
  );
}
