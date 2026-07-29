"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAvailableTemplateById, getTemplateFamilyVariants, TEMPLATE_COLLECTIONS, templatePlanLabel } from "@/lib/template-catalog";
import { resolveTemplateEngine, templateEngineStyle } from "@/lib/template-engine";

function Preview() {
  const query = useSearchParams();
  const tipo = query.get("tipo") || "wedding";
  const id = query.get("plantilla") || "";
  const template = getAvailableTemplateById(id);
  const templateCollection = template?.collection || tipo;
  const label = TEMPLATE_COLLECTIONS.find((collection) => collection.id === templateCollection)?.label || "Evento";

  if (!template) {
    return <main className="self-service-page"><header className="self-service-topbar"><Link href="/mi-cuenta" className="self-brand"><span>IP</span><strong>InvitaPro</strong></Link></header><section className="self-service-shell"><div className="client-empty"><h2>Plantilla no encontrada</h2><Link className="client-primary" href={`/mi-cuenta/crear/plantilla?tipo=${tipo}`}>Volver a plantillas</Link></div></section></main>;
  }

  const engine = resolveTemplateEngine(template.id, template.color);
  const variants = getTemplateFamilyVariants(template);
  const isCamp = templateCollection === "campamento";
  const demoName = templateCollection === "wedding" ? "Mariana & Alejandro" : templateCollection === "xv" ? "Valentina" : templateCollection === "infantil" ? "Mateo cumple 6" : isCamp ? "AVIVA 2027" : "Future Summit";
  const demoDate = templateCollection === "wedding" ? "12 · OCT · 2026" : templateCollection === "xv" ? "28 · NOV · 2026" : isCamp ? "12–14 · AGO · 2027" : "16 · AGO · 2026";

  return <main className="signature-demo-page" style={templateEngineStyle(engine)}>
    <header className="signature-demo-topbar">
      <Link href="/mi-cuenta" className="self-brand"><span>IP</span><strong>InvitaPro</strong></Link>
      <div className="preview-top-actions"><Link className="client-secondary" href={`/mi-cuenta/crear/plantilla?tipo=${tipo}`}>← Volver</Link><Link className="client-primary" href={`/mi-cuenta/crear/configurar?tipo=${template.collection}&plantilla=${template.id}`}>Elegir esta plantilla</Link></div>
    </header>

    <section className={`signature-demo-canvas theme-${template.id} layout-${engine.layout} decoration-${engine.decoration}`}>
      <section className="signature-demo-hero">
        <div className="signature-demo-orbit" aria-hidden="true" />
        <p>{label} · {templatePlanLabel(template)}</p>
        <h1>{demoName}</h1>
        <span>{demoDate}</span>
        <button type="button">Abrir invitación</button>
      </section>

      <section className="signature-demo-intro">
        <small>{template.familyName || "Colección InvitaPro"}</small>
        <h2>{template.name}</h2>
        <p>{template.description}</p>
      </section>

      <section className="signature-demo-countdown">
        <article><strong>84</strong><span>Días</span></article><article><strong>12</strong><span>Horas</span></article><article><strong>36</strong><span>Minutos</span></article>
      </section>

      <section className="signature-demo-editorial">
        <div className="signature-demo-photo"><span>{isCamp ? "Una aventura con propósito" : "Nuestra historia"}</span></div>
        <div><small>{isCamp ? "Fe · amistad · aventura" : "Una noche para recordar"}</small><h2>{isCamp ? "Tres días para conectar con Dios y crear recuerdos inolvidables." : "Celebramos el amor, la vida y todo lo que viene."}</h2><p>{isCamp ? "Alabanza, fogata, actividades, talleres y comunidad en una experiencia diseñada para jóvenes y familias." : "Una composición real para revisar tipografía, ritmo, tarjetas, galería y profundidad antes de elegir el diseño."}</p></div>
      </section>

      <section className="signature-demo-cards">
        <article><small>{isCamp ? "VIERNES" : "17:00"}</small><strong>{isCamp ? "Registro y bienvenida" : "Ceremonia"}</strong><span>{isCamp ? "Cena · Fogata · Alabanza" : "Jardín Magnolia"}</span></article>
        <article><small>{isCamp ? "SÁBADO" : "19:30"}</small><strong>{isCamp ? "Aventura y talleres" : "Recepción"}</strong><span>{isCamp ? "Devocional · Retos · Noche especial" : "Salón Imperial"}</span></article>
        <article><small>{isCamp ? "DOMINGO" : "21:00"}</small><strong>{isCamp ? "Celebración y cierre" : "Celebración"}</strong><span>{isCamp ? "Servicio · Comunidad · Regreso" : "Código elegante"}</span></article>
      </section>

      <section className="signature-demo-gallery"><div /><div /><div /></section>

      <section className="signature-demo-rsvp">
        <small>{isCamp ? "Reserva tu lugar" : "Confirma tu asistencia"}</small><h2>{isCamp ? "Prepárate para vivir AVIVA" : "Nos encantará celebrar contigo"}</h2><p>{isCamp ? "Registra edad, iglesia, transporte, contacto de emergencia y necesidades especiales desde el mismo flujo RSVP." : "RSVP, pases y álbum utilizan el mismo renderizador central en todas las plantillas."}</p><button type="button">{isCamp ? "Quiero asistir" : "Confirmar asistencia"}</button>
      </section>
    </section>

    <aside className="signature-demo-panel">
      <p className="eyebrow">Demo completa</p><h2>{template.name}</h2><p>{template.description}</p>
      {variants.length > 1 && <div className="signature-variant-switcher"><small>Variantes de la familia</small><div>{variants.map((variant) => <Link key={variant.id} className={variant.id === template.id ? "active" : ""} href={`/mi-cuenta/crear/preview?tipo=${variant.collection}&plantilla=${variant.id}`}><i style={{ background: variant.color }} /><span>{variant.variantName || variant.name}</span></Link>)}</div></div>}
      <ul>{template.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
      <div className="template-preview-actions"><Link className="client-primary" href={`/mi-cuenta/crear/configurar?tipo=${template.collection}&plantilla=${template.id}`}>Elegir esta plantilla →</Link><Link className="client-secondary" href={`/mi-cuenta/crear/plantilla?tipo=${tipo}`}>Ver otras plantillas</Link></div>
    </aside>
  </main>;
}

export default function Page() {
  return <Suspense fallback={<div className="client-loading">Preparando demo…</div>}><Preview /></Suspense>;
}
