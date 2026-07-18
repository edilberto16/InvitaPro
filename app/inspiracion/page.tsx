import Link from 'next/link';
import { InvitaProLogo } from '@/components/marketing/invitapro-logo';
import { InspirationGallery } from '@/components/inspiracion/inspiration-gallery';

export const metadata = {
  title: 'Inspiración | InvitaPro',
  description: 'Explora experiencias de invitaciones digitales para bodas, XV años, cumpleaños, baby shower y eventos empresariales.',
};

export default function InspirationPage() {
  return (
    <main className="inspiration-page">
      <header className="inspiration-header">
        <div className="marketing-container inspiration-nav">
          <InvitaProLogo />
          <nav><Link href="/">Inicio</Link><Link href="/inspiracion" className="is-current">Inspiración</Link><Link href="/solicitar">Solicitar invitación</Link><Link href="/login">Entrar</Link></nav>
        </div>
      </header>
      <section className="inspiration-hero">
        <div className="marketing-container">
          <span className="marketing-eyebrow">Momentos que conectan</span>
          <h1>Encuentra la inspiración para tu evento.</h1>
          <p>Explora experiencias completas, descubre estilos y visualiza cómo podría sentirse tu propia invitación.</p>
        </div>
      </section>
      <section className="marketing-container inspiration-catalog">
        <InspirationGallery />
      </section>
    </main>
  );
}
