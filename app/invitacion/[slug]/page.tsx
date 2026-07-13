'use client';

import { useEffect, useState } from 'react';

export default function InvitacionPublica() {
  const fecha = new Date('2026-12-12T18:00:00');
  const [faltan, setFaltan] = useState('');

  useEffect(() => {
    function actualizar() {
      const diferencia = fecha.getTime() - Date.now();
      if (diferencia <= 0) return setFaltan('¡Hoy es el gran día!');
      const dias = Math.floor(diferencia / 86400000);
      const horas = Math.floor((diferencia / 3600000) % 24);
      const minutos = Math.floor((diferencia / 60000) % 60);
      setFaltan(`${dias} días · ${horas} horas · ${minutos} minutos`);
    }
    actualizar();
    const timer = setInterval(actualizar, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="invite">
      <section className="inviteCover">
        <p>Mis XV años</p>
        <h1>Valeria</h1>
        <span>12 · DICIEMBRE · 2026</span>
      </section>
      <section className="inviteSection">
        <h2>Estás cordialmente invitado</h2>
        <p>Será un honor contar con tu presencia para celebrar este día tan especial.</p>
        <div className="countdown">{faltan}</div>
      </section>
      <section className="inviteSection details">
        <article><h3>Ceremonia</h3><p>6:00 p. m.</p><p>Salón Imperial</p></article>
        <article><h3>Vestimenta</h3><p>Formal</p><p>Evitar color rosa</p></article>
      </section>
      <section className="inviteSection actions">
        <a className="button" href="https://maps.google.com" target="_blank">Abrir ubicación</a>
        <a className="button secondary" href="https://wa.me/5219991234567?text=Confirmo%20mi%20asistencia" target="_blank">Confirmar por WhatsApp</a>
      </section>
    </main>
  );
}
