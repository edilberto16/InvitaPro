'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { InspirationItem } from './inspiration-data';

export function InspirationExperience({ item }: { item: InspirationItem }) {
  const [confirmed, setConfirmed] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <main className={`experience-page experience-theme--${item.theme}`}>
      <div className="experience-topbar">
        <Link href="/inspiracion">← Volver a Inspiración</Link>
        <span>Experiencia de muestra · Datos ficticios</span>
      </div>

      <section className="experience-hero" style={{ backgroundImage: `url(${item.image})` }}>
        <div className="experience-hero-shade" />
        <div className="experience-ornament" aria-hidden="true" />
        <div className="experience-hero-content">
          <span>{item.ceremonyLabel}</span>
          <h1>{item.names}</h1>
          <p>{item.date}</p>
          <a href="#historia">{item.primaryAction} ↓</a>
        </div>
      </section>

      <section className="experience-section experience-story" id="historia">
        <span className="experience-kicker">La inspiración</span>
        <h2>{item.title}</h2>
        <p>{item.story}</p>
      </section>

      <section className="experience-countdown" aria-label="Cuenta regresiva de muestra">
        <div><strong>126</strong><span>Días</span></div>
        <div><strong>08</strong><span>Horas</span></div>
        <div><strong>42</strong><span>Minutos</span></div>
        <div><strong>16</strong><span>Segundos</span></div>
      </section>

      <section className="experience-section experience-details">
        <div><span>Fecha</span><strong>{item.date}</strong><p>Recepción a partir de las 6:00 PM</p></div>
        <div><span>Lugar</span><strong>{item.venue}</strong><p>Consulta el mapa y las indicaciones del evento.</p><button type="button">Ver ubicación</button></div>
      </section>

      <section className="experience-gallery" aria-label="Galería de ejemplo">
        <div style={{ backgroundImage: `url(${item.image})` }} />
        <div style={{ backgroundImage: `url(${item.image})` }} />
        <div style={{ backgroundImage: `url(${item.image})` }} />
      </section>

      <section className="experience-section experience-rsvp">
        <span className="experience-kicker">Confirma tu asistencia</span>
        <h2>{item.theme === 'corporate' ? 'Reserva tu lugar.' : item.theme === 'dino' ? '¿Listos para la aventura?' : 'Nos encantará contar contigo.'}</h2>
        <p>Este formulario es una demostración y no enviará información.</p>
        {confirmed ? (
          <div className="experience-success">✓ Confirmación de muestra realizada</div>
        ) : (
          <button type="button" onClick={() => setConfirmed(true)}>Confirmar asistencia</button>
        )}
      </section>

      <section className="experience-cta">
        <button type="button" className="experience-save" onClick={() => setSaved(!saved)}>{saved ? '♥ Inspiración guardada' : '♡ Guardar inspiración'}</button>
        <h2>¿Te imaginas este diseño con tus fotografías?</h2>
        <p>Empieza con esta inspiración y personaliza cada detalle para tu evento.</p>
        <Link href={`/login?plantilla=${item.slug}`}>Crear una invitación como esta <span>→</span></Link>
      </section>
    </main>
  );
}
