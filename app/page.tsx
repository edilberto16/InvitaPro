import Link from 'next/link';
import { InvitaProLogo } from '@/components/marketing/invitapro-logo';

const features = [
  { icon: '✓', title: 'RSVP en tiempo real', text: 'Recibe confirmaciones, acompañantes y respuestas desde un solo panel.' },
  { icon: '⌁', title: 'Pases y códigos QR', text: 'Comparte accesos personalizados y prepara un check-in más ágil.' },
  { icon: '♫', title: 'Música y galería', text: 'Cuenta tu historia con fotografías, portada y una banda sonora especial.' },
  { icon: '⌖', title: 'Ubicación y agenda', text: 'Incluye mapas, horarios y todos los detalles importantes del evento.' },
  { icon: '◷', title: 'Cuenta regresiva', text: 'Haz crecer la emoción desde el primer momento en que compartes el enlace.' },
  { icon: '✦', title: 'Diseño personalizable', text: 'Adapta colores, tipografías y secciones a la identidad de cada celebración.' },
];

const templates = [
  { category: 'Boda', title: 'Romantic Garden', image: '/demo/portada-boda.jpg', tone: 'garden' },
  { category: 'XV años', title: 'Princess Rose', image: '/demo/galeria/foto3.jpg', tone: 'rose' },
  { category: 'Celebración', title: 'Golden Night', image: '/demo/galeria/foto6.jpg', tone: 'gold' },
];

const steps = [
  ['01', 'Elige tu estilo', 'Comienza con una plantilla que refleje la personalidad de tu evento.'],
  ['02', 'Personaliza', 'Cambia textos, fotografías, colores, música y cada detalle importante.'],
  ['03', 'Comparte', 'Envía el enlace o pase personalizado por WhatsApp, correo o redes.'],
  ['04', 'Administra', 'Consulta confirmaciones e invitados desde tu panel InvitaPro.'],
];

const faqs = [
  ['¿Necesito instalar una aplicación?', 'No. InvitaPro funciona desde el navegador y tus invitados pueden abrir la invitación desde cualquier celular, tableta o computadora.'],
  ['¿Puedo usar mis propias fotografías y música?', 'Sí. Puedes subir tus recursos o elegirlos desde la biblioteca multimedia de tu evento.'],
  ['¿Puedo saber quién confirmó?', 'Sí. El panel reúne las respuestas de asistencia, acompañantes y datos de cada invitado.'],
  ['¿La invitación se puede modificar después de compartirla?', 'Sí. Los cambios publicados se reflejan en el mismo enlace, sin necesidad de reenviarlo.'],
];

export default function Home() {
  return (
    <main className="marketing-site">
      <header className="marketing-header">
        <div className="marketing-container marketing-nav">
          <InvitaProLogo />
          <nav className="marketing-nav-links" aria-label="Navegación principal">
            <a href="#caracteristicas">Características</a>
            <a href="#plantillas">Plantillas</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#preguntas">Preguntas</a>
          </nav>
          <div className="marketing-nav-actions">
            <Link className="marketing-login" href="/login">Iniciar sesión</Link>
            <Link className="marketing-button marketing-button-small" href="/login">Crear invitación</Link>
          </div>
        </div>
      </header>

      <section className="marketing-hero">
        <div className="marketing-hero-glow marketing-hero-glow-one" />
        <div className="marketing-hero-glow marketing-hero-glow-two" />
        <div className="marketing-container marketing-hero-grid">
          <div className="marketing-hero-copy">
            <span className="marketing-kicker"><span>✦</span> Invitaciones digitales, hechas memorables</span>
            <h1>Convierte tu evento en una experiencia que comienza desde la invitación.</h1>
            <p>Crea, personaliza y comparte invitaciones digitales con RSVP, galería, música, ubicación, pases y administración de invitados.</p>
            <div className="marketing-hero-actions">
              <Link className="marketing-button" href="/login">Crear mi invitación <span>→</span></Link>
              <Link className="marketing-button marketing-button-ghost" href="/invitacion/demo-valeria">Ver demostración <span>▶</span></Link>
            </div>
            <div className="marketing-trust-row">
              <div className="marketing-avatars" aria-hidden="true"><span>AM</span><span>JP</span><span>FV</span><span>+</span></div>
              <p><strong>Todo en un solo lugar</strong><br />Diseño, invitados y confirmaciones.</p>
            </div>
          </div>

          <div className="marketing-visual" aria-label="Vista previa de una invitación digital">
            <div className="marketing-float-card marketing-float-rsvp">
              <span className="marketing-float-icon">✓</span>
              <div><strong>Nueva confirmación</strong><small>Familia Martínez · 4 pases</small></div>
            </div>
            <div className="marketing-phone-shadow" />
            <div className="marketing-phone">
              <div className="marketing-phone-top"><span /><i /><span /></div>
              <div className="marketing-phone-screen">
                <div className="marketing-phone-cover">
                  <span className="marketing-phone-label">Nuestra boda</span>
                  <h2>Andrea<br /><em>&amp;</em> Miguel</h2>
                  <p>14 · 11 · 2026</p>
                </div>
                <div className="marketing-phone-countdown">
                  <span><strong>118</strong><small>Días</small></span>
                  <span><strong>08</strong><small>Horas</small></span>
                  <span><strong>32</strong><small>Min</small></span>
                </div>
                <div className="marketing-phone-message">Tenemos el honor de invitarte a celebrar con nosotros.</div>
              </div>
            </div>
            <div className="marketing-float-card marketing-float-music">
              <span className="marketing-music-button">♫</span>
              <div><strong>Nuestra canción</strong><small>Reproduciendo ahora</small></div>
              <span className="marketing-equalizer"><i /><i /><i /></span>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-proof">
        <div className="marketing-container marketing-proof-grid">
          <p>Una sola plataforma para crear experiencias memorables</p>
          <div><strong>100%</strong><span>Digital</span></div>
          <div><strong>24/7</strong><span>Disponible</span></div>
          <div><strong>1 enlace</strong><span>Siempre actualizado</span></div>
        </div>
      </section>

      <section className="marketing-section" id="caracteristicas">
        <div className="marketing-container">
          <div className="marketing-section-heading">
            <span className="marketing-eyebrow">Todo lo que necesitas</span>
            <h2>Mucho más que una invitación bonita.</h2>
            <p>InvitaPro combina diseño, comunicación y organización para acompañarte antes y durante tu evento.</p>
          </div>
          <div className="marketing-features-grid">
            {features.map((feature) => (
              <article className="marketing-feature-card" key={feature.title}>
                <span className="marketing-feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-templates-section" id="plantillas">
        <div className="marketing-container">
          <div className="marketing-section-heading marketing-heading-row">
            <div>
              <span className="marketing-eyebrow">Diseños que inspiran</span>
              <h2>Encuentra el estilo perfecto para tu historia.</h2>
            </div>
            <Link className="marketing-text-link" href="/invitacion/demo-valeria">Explorar demostración <span>→</span></Link>
          </div>
          <div className="marketing-template-grid">
            {templates.map((template) => (
              <article className={`marketing-template-card marketing-template-${template.tone}`} key={template.title}>
                <div className="marketing-template-image" style={{ backgroundImage: `url(${template.image})` }}>
                  <span>{template.category}</span>
                  <Link href="/invitacion/demo-valeria" aria-label={`Ver demo de ${template.title}`}>Ver demo <b>↗</b></Link>
                </div>
                <div className="marketing-template-info"><h3>{template.title}</h3><p>Diseño adaptable y personalizable</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-how" id="como-funciona">
        <div className="marketing-container">
          <div className="marketing-section-heading marketing-heading-center">
            <span className="marketing-eyebrow">Simple desde el primer paso</span>
            <h2>Tu invitación lista en cuatro momentos.</h2>
          </div>
          <div className="marketing-steps">
            {steps.map(([number, title, text], index) => (
              <article className="marketing-step" key={number}>
                <span>{number}</span><h3>{title}</h3><p>{text}</p>
                {index < steps.length - 1 && <i aria-hidden="true">→</i>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-demo-section">
        <div className="marketing-container marketing-demo-card">
          <div className="marketing-demo-copy">
            <span className="marketing-eyebrow marketing-eyebrow-light">Una experiencia real</span>
            <h2>No te lo imagines.<br />Vívelo como uno de tus invitados.</h2>
            <p>Abre una invitación completa y descubre cómo se ven la portada, cuenta regresiva, galería, música, ubicación y confirmación de asistencia.</p>
            <Link className="marketing-button marketing-button-light" href="/invitacion/demo-valeria">Abrir invitación de muestra <span>↗</span></Link>
          </div>
          <div className="marketing-demo-phone">
            <div className="marketing-demo-photo" />
            <div><span>Invitación de muestra</span><strong>Valeria &amp; Daniel</strong><small>Una experiencia completa y navegable</small></div>
          </div>
        </div>
      </section>

      <section className="marketing-section" id="preguntas">
        <div className="marketing-container marketing-faq-grid">
          <div className="marketing-faq-intro">
            <span className="marketing-eyebrow">Preguntas frecuentes</span>
            <h2>Resolvemos tus dudas antes de comenzar.</h2>
            <p>InvitaPro está diseñado para que crear y compartir tu invitación sea sencillo, incluso si nunca has usado una herramienta de diseño.</p>
            <Link className="marketing-text-link" href="/login">Comenzar ahora <span>→</span></Link>
          </div>
          <div className="marketing-faq-list">
            {faqs.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>{question}<span>+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-cta">
        <div className="marketing-container marketing-cta-inner">
          <span className="marketing-kicker marketing-kicker-light">Tu evento merece una gran primera impresión</span>
          <h2>Crea una invitación que tus invitados querrán volver a abrir.</h2>
          <p>Empieza a diseñar, comparte tu historia y administra cada confirmación desde InvitaPro.</p>
          <div className="marketing-hero-actions">
            <Link className="marketing-button marketing-button-light" href="/login">Crear mi invitación <span>→</span></Link>
            <Link className="marketing-button marketing-button-outline-light" href="/invitacion/demo-valeria">Ver demostración</Link>
          </div>
        </div>
      </section>

      <footer className="marketing-footer">
        <div className="marketing-container">
          <div className="marketing-footer-main">
            <div><InvitaProLogo /><p>Invitaciones digitales y gestión de eventos, todo en un solo lugar.</p></div>
            <div><strong>Producto</strong><a href="#caracteristicas">Características</a><a href="#plantillas">Plantillas</a><Link href="/invitacion/demo-valeria">Demostración</Link></div>
            <div><strong>Cuenta</strong><Link href="/login">Iniciar sesión</Link><Link href="/login">Crear invitación</Link><Link href="/admin">Panel administrativo</Link></div>
            <div><strong>Legal</strong><span>Aviso de privacidad</span><span>Términos y condiciones</span><span>Contacto</span></div>
          </div>
          <div className="marketing-footer-bottom"><span>© 2026 InvitaPro. Todos los derechos reservados.</span><span>Hecho para celebrar momentos inolvidables ✦</span></div>
        </div>
      </footer>
    </main>
  );
}
