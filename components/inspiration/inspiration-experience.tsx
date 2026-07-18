'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { InspirationTheme } from '@/lib/inspiration-data';

export function InspirationExperience({ theme }: { theme: InspirationTheme }) {
  const [rsvp, setRsvp] = useState<'idle' | 'yes' | 'no'>('idle');
  const [favorite, setFavorite] = useState(false);
  const [playing, setPlaying] = useState(false);
  const countdown = useMemo(() => ({ days: 118, hours: 8, minutes: 32 }), []);

  return (
    <main className="experience" style={{ '--experience-accent': theme.accent, '--experience-dark': theme.dark } as React.CSSProperties}>
      <nav className="experience-topbar">
        <Link href="/" className="experience-brand">InvitaPro</Link>
        <Link href="/inspiracion" className="experience-back">← Volver a Inspiración</Link>
      </nav>

      <section className="experience-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.68)), url(${theme.cover})` }}>
        <div className="experience-hero-content">
          <span>{theme.category} · {theme.style}</span>
          <h1>{theme.couple}</h1>
          <p>{theme.date}</p>
          <a href="#historia" className="experience-scroll">Descubrir la experiencia ↓</a>
        </div>
      </section>

      <button className="experience-music" onClick={() => setPlaying((value) => !value)} aria-pressed={playing}>
        <span>{playing ? '❚❚' : '♫'}</span>
        <div><strong>{playing ? 'Reproduciendo' : 'Escuchar música'}</strong><small>Vista previa musical</small></div>
      </button>

      <section className="experience-intro" id="historia">
        <span className="experience-eyebrow">La inspiración</span>
        <h2>{theme.title}</h2>
        <p>{theme.story}</p>
        <div className="experience-tags">{theme.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </section>

      <section className="experience-countdown" aria-label="Cuenta regresiva de muestra">
        <div><strong>{countdown.days}</strong><span>Días</span></div>
        <div><strong>{countdown.hours}</strong><span>Horas</span></div>
        <div><strong>{countdown.minutes}</strong><span>Minutos</span></div>
      </section>

      <section className="experience-details">
        <article><span>Fecha</span><strong>{theme.date}</strong><p>Ceremonia y recepción</p></article>
        <article><span>Lugar</span><strong>{theme.venue}</strong><p>{theme.location}</p></article>
        <article><span>Vestimenta</span><strong>Código elegante</strong><p>Consulta los detalles del evento</p></article>
      </section>

      <section className="experience-gallery">
        <div className="experience-section-heading"><span>Momentos</span><h2>Una historia contada en imágenes</h2></div>
        <div className="experience-gallery-grid">
          {theme.gallery.map((image, index) => <figure key={image} className={index === 0 ? 'is-large' : ''}><img src={image} alt={`Inspiración ${theme.title} ${index + 1}`} /></figure>)}
        </div>
      </section>

      <section className="experience-rsvp">
        <div>
          <span className="experience-eyebrow">Confirmación de asistencia</span>
          <h2>¿Nos acompañas?</h2>
          <p>Prueba cómo tus invitados podrán confirmar en segundos.</p>
        </div>
        {rsvp === 'idle' ? (
          <div className="experience-rsvp-actions">
            <button onClick={() => setRsvp('yes')}>Sí, asistiré</button>
            <button onClick={() => setRsvp('no')} className="secondary">No podré asistir</button>
          </div>
        ) : (
          <div className="experience-rsvp-result"><span>{rsvp === 'yes' ? '✓' : '♥'}</span><strong>{rsvp === 'yes' ? '¡Confirmación registrada!' : 'Gracias por responder'}</strong><p>Esta es una demostración; no se guardó información.</p></div>
        )}
      </section>

      <section className="experience-cta">
        <button className={`experience-favorite ${favorite ? 'is-active' : ''}`} onClick={() => setFavorite((value) => !value)}>{favorite ? '♥ Inspiración guardada' : '♡ Guardar inspiración'}</button>
        <span>¿Te imaginas este diseño con tus fotografías?</span>
        <h2>Crea una invitación como esta.</h2>
        <p>Personaliza colores, textos, música, galería y todos los detalles de tu evento.</p>
        <div><Link href="/login" className="experience-primary">Crear mi invitación</Link><Link href="/inspiracion" className="experience-secondary">Explorar más diseños</Link></div>
      </section>

      <footer className="experience-footer">Experiencia de muestra creada con InvitaPro · Los datos son ficticios.</footer>
    </main>
  );
}
