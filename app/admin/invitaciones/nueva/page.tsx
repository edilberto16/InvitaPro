'use client';

import { FormEvent, useState } from 'react';

export default function NuevaInvitacionPage() {
  const [mensaje, setMensaje] = useState('');

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    const response = await fetch('/api/invitaciones', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const result = await response.json();
    setMensaje(result.message ?? 'Invitación guardada');
  }

  return (
    <main className="shell narrow">
      <a href="/admin">← Regresar al panel</a>
      <h1>Nueva invitación</h1>
      <form className="card form" onSubmit={guardar}>
        <label>Nombre del evento<input name="titulo" required placeholder="XV de Valeria" /></label>
        <label>Tipo de evento<select name="tipo_evento"><option>XV años</option><option>Boda</option><option>Cumpleaños</option><option>Bautizo</option><option>Baby shower</option></select></label>
        <div className="grid2">
          <label>Fecha<input name="fecha_evento" type="date" required /></label>
          <label>Hora<input name="hora_evento" type="time" required /></label>
        </div>
        <label>Lugar<input name="lugar" placeholder="Salón Imperial" /></label>
        <label>Enlace de Google Maps<input name="mapa_url" type="url" placeholder="https://maps.google.com/..." /></label>
        <label>WhatsApp<input name="whatsapp" placeholder="5219991234567" /></label>
        <label>Mensaje<textarea name="mensaje" rows={4} placeholder="Será un honor contar con tu presencia." /></label>
        <label>Plantilla<select name="plantilla"><option value="elegante">Elegante</option></select></label>
        <button className="button" type="submit">Guardar invitación</button>
        {mensaje && <p className="success">{mensaje}</p>}
      </form>
    </main>
  );
}
