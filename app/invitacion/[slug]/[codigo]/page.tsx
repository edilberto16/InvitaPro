'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type PassData = {
  invitacion: {
    id: string;
    titulo: string;
    slug: string;
    modalidad: string;
    design_json: Record<string, unknown>;
    color_principal: string | null;
    musica_url: string | null;
    whatsapp: string | null;
  };
  evento: {
    nombre?: string;
    fecha: string;
    hora: string | null;
    tipo: string;
    lugar: string | null;
    direccion: string | null;
    maps_url: string | null;
  };
  invitado: {
    id: string;
    nombre: string;
    adultos_permitidos: number;
    ninos_permitidos: number;
    mesa: string | null;
    codigo: string;
    estado: string;
  };
};

function longDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function PersonalizedPassPage() {
  const params = useParams<{ slug: string; codigo: string }>();
  const supabase = useMemo(() => createClient(), []);

  const [data, setData] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState(true);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [countdown, setCountdown] = useState({
    days: '--',
    hours: '--',
    minutes: '--',
    invalid: false,
    ended: false,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;

    supabase
      .rpc('obtener_invitacion_publica', {
        p_slug: params.slug,
        p_codigo: params.codigo,
      })
      .then(({ data: response, error: responseError }) => {
        if (!active) return;

        if (responseError || !response) {
          setError('Pase no encontrado o invitación no disponible.');
        } else {
          const loaded = response as PassData;
          setData(loaded);
          setAdults(Math.min(1, loaded.invitado.adultos_permitidos));
          setChildren(0);
        }

        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.slug, params.codigo, supabase]);

  useEffect(() => {
    if (!data) return;

    const time = (data.evento.hora || '00:00').slice(0, 5);
    const target = new Date(`${data.evento.fecha}T${time}:00`).getTime();

    if (!Number.isFinite(target)) {
      setCountdown({
        days: '--',
        hours: '--',
        minutes: '--',
        invalid: true,
        ended: false,
      });
      return;
    }

    const tick = () => {
      const remaining = target - Date.now();

      if (remaining <= 0) {
        setCountdown({
          days: '00',
          hours: '00',
          minutes: '00',
          invalid: false,
          ended: true,
        });
        return;
      }

      setCountdown({
        days: String(Math.floor(remaining / 86400000)).padStart(2, '0'),
        hours: String(Math.floor((remaining / 3600000) % 24)).padStart(2, '0'),
        minutes: String(Math.floor((remaining / 60000) % 60)).padStart(2, '0'),
        invalid: false,
        ended: false,
      });
    };

    tick();
    const timer = window.setInterval(tick, 60000);
    return () => window.clearInterval(timer);
  }, [data]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const response = await supabase.rpc('registrar_confirmacion', {
      p_slug: params.slug,
      p_asistira: attendance,
      p_adultos: attendance ? adults : 0,
      p_ninos: attendance ? children : 0,
      p_nombre: null,
      p_telefono: null,
      p_mensaje: message || null,
      p_codigo: params.codigo,
    });

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setSent(true);
  }

  if (loading) {
    return <main className="public-invite-loading">Preparando pase…</main>;
  }

  if (!data) {
    return (
      <main className="public-invite-error">
        <h1>Pase no disponible</h1>
        <p>{error}</p>
      </main>
    );
  }

  const design = data.invitacion.design_json || {};
  const plantilla = String(design.plantilla || 'elegante');
  const intro = String(
    design.mensaje || 'Será un honor contar con tu presencia.'
  );
  const subtitle = String(
    design.subtitulo || 'Queremos compartir contigo este momento'
  );
  const dress = String(design.vestimenta || 'Libre');
  const coverUrl =
    typeof design.portada_url === 'string' ? design.portada_url : '';
  const galleryUrls = Array.isArray(design.galeria_urls)
    ? design.galeria_urls.filter(
        (value): value is string => typeof value === 'string'
      )
    : [];
  const showCountdown = design.mostrar_contador !== false;
  const showDetails = design.mostrar_detalles !== false;
  const showGallery = design.mostrar_galeria !== false;
  const showMap = design.mostrar_mapa !== false;
  const eventType = data.evento.tipo || 'Evento especial';

  return (
    <main
      className={`premium-public-invite personalized-premium theme-${plantilla}`}
      style={
        {
          '--invite-color': data.invitacion.color_principal || '#8f5c38',
        } as React.CSSProperties
      }
    >
      {data.invitacion.musica_url && (
        <>
          <audio
            ref={audioRef}
            src={data.invitacion.musica_url}
            loop
            preload="metadata"
            onPlay={() => setAudioPlaying(true)}
            onPause={() => setAudioPlaying(false)}
          />
          <button
            className={`premium-music-button ${
              audioPlaying ? 'playing' : ''
            }`}
            type="button"
            onClick={() => {
              const audio = audioRef.current;
              if (!audio) return;
              if (audio.paused) void audio.play();
              else audio.pause();
            }}
            aria-label={
              audioPlaying ? 'Pausar música' : 'Reproducir música'
            }
          >
            <span>{audioPlaying ? 'Ⅱ' : '♫'}</span>
            <small>{audioPlaying ? 'Pausar' : 'Música'}</small>
          </button>
        </>
      )}

      <section
        className={`premium-hero personalized-premium-hero ${
          coverUrl ? 'has-cover' : ''
        }`}
        style={
          coverUrl
            ? {
                backgroundImage: `linear-gradient(180deg,rgba(12,8,6,.32),rgba(12,8,6,.72)),url("${coverUrl}")`,
              }
            : undefined
        }
      >
        <div className="premium-hero-overlay" />
        <div className="premium-hero-decoration decoration-one" />
        <div className="premium-hero-decoration decoration-two" />

        <div className="premium-hero-content">
          <span className="premium-kicker">Invitación personalizada</span>
          <p className="premium-invite-label">Esta invitación es para</p>
          <h1>{data.invitado.nombre}</h1>
          <p className="personalized-event-title">
            {data.invitacion.titulo}
          </p>

          <div className="premium-hero-date">
            <span>{longDate(data.evento.fecha)}</span>
            <i />
            <span>{(data.evento.hora || 'Hora por confirmar').slice(0, 5)}</span>
          </div>

          <a href="#pase" className="premium-scroll-link">
            Ver mi pase <span>↓</span>
          </a>
        </div>
      </section>

      <section className="premium-intro-block" id="pase">
        <span className="premium-ornament">✦</span>
        <p className="premium-small-title">{eventType}</p>
        <h2>{subtitle}</h2>
        <p className="premium-copy">{intro}</p>
      </section>

      <section className="personalized-pass-section">
        <div className="personalized-premium-pass-card">
          <div className="pass-card-brand">
            <span>Pase personalizado</span>
            <strong>{data.invitado.nombre}</strong>
          </div>

          <div className="personalized-pass-grid">
            <article>
              <small>Adultos</small>
              <strong>{data.invitado.adultos_permitidos}</strong>
            </article>
            <article>
              <small>Niños</small>
              <strong>{data.invitado.ninos_permitidos}</strong>
            </article>
            <article>
              <small>Mesa</small>
              <strong>{data.invitado.mesa || 'Por asignar'}</strong>
            </article>
          </div>

          <div className="personalized-pass-code">
            <span>Código de acceso</span>
            <strong>{data.invitado.codigo}</strong>
          </div>
        </div>
      </section>

      {showCountdown && (
        <section className="premium-countdown-section">
          <p className="premium-small-title">Faltan</p>

          {countdown.invalid ? (
            <div className="premium-date-pending">Fecha por confirmar</div>
          ) : countdown.ended ? (
            <div className="premium-date-pending">
              ¡Hoy es el gran día!
            </div>
          ) : (
            <div className="premium-countdown-grid">
              <article>
                <strong>{countdown.days}</strong>
                <span>Días</span>
              </article>
              <article>
                <strong>{countdown.hours}</strong>
                <span>Horas</span>
              </article>
              <article>
                <strong>{countdown.minutes}</strong>
                <span>Minutos</span>
              </article>
            </div>
          )}
        </section>
      )}

      {showDetails && (
        <section className="premium-details-section">
          <div className="premium-section-heading">
            <p className="premium-small-title">Información</p>
            <h2>Todo lo que necesitas saber</h2>
          </div>

          <div className="premium-detail-grid">
            <article>
              <span className="premium-detail-icon">01</span>
              <small>Fecha y hora</small>
              <strong>{longDate(data.evento.fecha)}</strong>
              <p>{data.evento.hora?.slice(0, 5) || 'Hora por confirmar'}</p>
            </article>

            <article>
              <span className="premium-detail-icon">02</span>
              <small>Lugar</small>
              <strong>{data.evento.lugar || 'Por confirmar'}</strong>
              <p>{data.evento.direccion || 'Dirección por confirmar'}</p>
            </article>

            <article>
              <span className="premium-detail-icon">03</span>
              <small>Código de vestimenta</small>
              <strong>{dress}</strong>
              <p>Gracias por acompañarnos</p>
            </article>
          </div>
        </section>
      )}

      {showGallery && galleryUrls.length > 0 && (
        <section className="premium-gallery-section">
          <div className="premium-section-heading">
            <p className="premium-small-title">Recuerdos</p>
            <h2>Nuestra galería</h2>
            <p>Algunos momentos que queremos compartir contigo.</p>
          </div>

          <div
            className={`premium-gallery-grid gallery-count-${Math.min(
              galleryUrls.length,
              6
            )}`}
          >
            {galleryUrls.map((url, index) => (
              <figure
                key={url}
                className={`gallery-item gallery-item-${index + 1}`}
              >
                <img
                  src={url}
                  alt={`Fotografía ${index + 1} de ${
                    data.invitacion.titulo
                  }`}
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </section>
      )}

      {showMap && (
        <section className="premium-location-section">
          <div className="premium-location-card">
            <p className="premium-small-title">Ubicación</p>
            <h2>{data.evento.lugar || 'Lugar por confirmar'}</h2>
            <p>
              {data.evento.direccion ||
                'La dirección se publicará próximamente.'}
            </p>

            <div className="premium-location-actions">
              {data.evento.maps_url && (
                <a href={data.evento.maps_url} target="_blank">
                  Cómo llegar
                </a>
              )}

              {data.invitacion.whatsapp && (
                <a
                  className="secondary"
                  href={`https://wa.me/${data.invitacion.whatsapp}`}
                  target="_blank"
                >
                  Contactar anfitrión
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="premium-rsvp-section">
        <div className="premium-rsvp-card personalized-rsvp-card">
          <p className="premium-small-title">Confirmación</p>
          <h2>¿Nos acompañas?</h2>
          <p>
            Tu pase permite hasta {data.invitado.adultos_permitidos}{' '}
            adulto(s) y {data.invitado.ninos_permitidos} niño(s).
          </p>

          {sent ? (
            <div className="rsvp-success">
              ✓ Tu respuesta quedó guardada correctamente.
            </div>
          ) : (
            <form className="rsvp-public-form" onSubmit={submit}>
              <div className="rsvp-choice-grid">
                <button
                  type="button"
                  className={`rsvp-choice ${
                    attendance ? 'selected' : ''
                  }`}
                  onClick={() => setAttendance(true)}
                >
                  ✓ <strong>Sí, asistiré</strong>
                </button>

                <button
                  type="button"
                  className={`rsvp-choice decline ${
                    !attendance ? 'selected' : ''
                  }`}
                  onClick={() => setAttendance(false)}
                >
                  × <strong>No podré asistir</strong>
                </button>
              </div>

              {attendance && (
                <div className="rsvp-attendee-grid">
                  <label>
                    <span>Adultos</span>
                    <select
                      value={adults}
                      onChange={(event) =>
                        setAdults(Number(event.target.value))
                      }
                    >
                      {Array.from(
                        {
                          length:
                            data.invitado.adultos_permitidos + 1,
                        },
                        (_, index) => (
                          <option key={index}>{index}</option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Niños</span>
                    <select
                      value={children}
                      onChange={(event) =>
                        setChildren(Number(event.target.value))
                      }
                    >
                      {Array.from(
                        {
                          length: data.invitado.ninos_permitidos + 1,
                        },
                        (_, index) => (
                          <option key={index}>{index}</option>
                        )
                      )}
                    </select>
                  </label>
                </div>
              )}

              <label className="rsvp-message-field">
                <span>Mensaje</span>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button className="rsvp-submit">
                Enviar confirmación
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="premium-footer">
        <span>Gracias por ser parte de este momento</span>
        <strong>{data.invitacion.titulo}</strong>
        <small>Pase {data.invitado.codigo} · Creado con InvitaPro</small>
      </footer>
    </main>
  );
}
