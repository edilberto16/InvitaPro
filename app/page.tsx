import Link from 'next/link';

export default function Home() {
  return (
    <main className="centered hero">
      <span className="badge">InvitaPro</span>
      <h1>Crea y administra invitaciones digitales</h1>
      <p>Primera versión del sistema: panel, formulario e invitación pública.</p>
      <div className="actions">
        <Link className="button" href="/admin">Abrir panel</Link>
        <Link className="button secondary" href="/invitacion/demo-valeria">Ver demostración</Link>
      </div>
    </main>
  );
}
