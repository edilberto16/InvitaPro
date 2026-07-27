"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getTemplateById,
  getTemplateFamilyVariants,
  TEMPLATE_COLLECTIONS,
  templatePlanLabel,
} from "@/lib/template-catalog";
import { resolveTemplateEngine, templateEngineStyle } from "@/lib/template-engine";

function Preview() {
  const query = useSearchParams();
  const tipo = query.get("tipo") || "wedding";
  const id = query.get("plantilla") || "";
  const origin = query.get("origen") === "admin" ? "admin" : "cliente";
  const template = getTemplateById(id);
  const label = TEMPLATE_COLLECTIONS.find((collection) => collection.id === tipo)?.label || "Evento";
  const backHref = origin === "admin" ? "/admin/plantillas" : `/mi-cuenta/crear/plantilla?tipo=${tipo}`;
  const chooseHref = origin === "admin"
    ? `/admin/invitaciones?plantilla=${encodeURIComponent(id)}`
    : `/mi-cuenta/crear/configurar?tipo=${tipo}&plantilla=${encodeURIComponent(id)}`;

  if (!template) {
    return (
      <main className="self-service-page">
        <header className="self-service-topbar">
          <Link href={backHref} className="self-brand"><span>IP</span><strong>InvitaPro</strong></Link>
        </header>
        <section className="self-service-shell">
          <div className="client-empty">
            <h2>Plantilla no encontrada</h2>
            <Link className="client-primary" href={backHref}>Volver a plantillas</Link>
          </div>
        </section>
      </main>
    );
  }

  const engine = resolveTemplateEngine(template.id, template.color);
  const variants = getTemplateFamilyVariants(template);
  const demoName = tipo === "wedding" ? "Mariana & Alejandro" : tipo === "xv" ? "Valentina" : tipo === "infantil" ? "Mateo cumple 6" : "Future Summit";
  const demoDate = tipo === "wedding" ? "12 · OCT · 2026" : tipo === "xv" ? "28 · NOV · 2026" : "16 · AGO · 2026";

  return (
    <main className="signature-demo-page" style={templateEngineStyle(engine)}>
      <header className="signature-demo-topbar">
        <Link href={backHref} className="self-brand"><span>IP</span><strong>InvitaPro</strong></Link>
        <div className="preview-top-actions">
          <Link className="client-secondary" href={backHref}>← Volver</Link>
          <Link className="client-primary" href={chooseHref}>Elegir esta plantilla</Link>
        </div>
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
          <article><strong>84</strong><span>Días</span></article>
          <article><strong>12</strong><span>Horas</span></article>
          <article><strong>36</strong><span>Minutos</span></article>
        </section>

        <section className="signature-demo-editorial">
          <div className="signature-demo-photo"><span>Nuestra historia</span></div>
          <div>
            <small>Una noche para recordar</small>
            <h2>Celebramos el amor, la vida y todo lo que viene.</h2>
            <p>Una composición real para revisar tipografía, ritmo, tarjetas, galería y profundidad antes de elegir el diseño.</p>
          </div>
        </section>

        <section className="signature-demo-cards">
          <article><small>17:00</small><strong>Ceremonia</strong><span>Jardín Magnolia</span></article>
          <article><small>19:30</small><strong>Recepción</strong><span>Salón Imperial</span></article>
          <article><small>21:00</small><strong>Celebración</strong><span>Código elegante</span></article>
        </section>

        <section className="signature-demo-gallery"><div /><div /><div /></section>

        <section className="signature-demo-rsvp">
          <small>Confirma tu asistencia</small>
          <h2>Nos encantará celebrar contigo</h2>
          <p>RSVP, pases y álbum utilizan el mismo renderizador central en todas las plantillas.</p>
          <button type="button">Confirmar asistencia</button>
        </section>
      </section>

      <aside className="signature-demo-panel">
        <p className="eyebrow">Demo completa</p>
        <h2>{template.name}</h2>
        <p>{template.description}</p>
        {variants.length > 1 && (
          <div className="signature-variant-switcher">
            <small>Variantes de la familia</small>
            <div>
              {variants.map((variant) => (
                <Link
                  key={variant.id}
                  className={variant.id === template.id ? "active" : ""}
                  href={`/preview/plantilla?tipo=${variant.collection}&plantilla=${variant.id}&origen=${origin}`}
                >
                  <i style={{ background: variant.color }} />
                  <span>{variant.variantName || variant.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <ul>{template.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
        <div className="template-preview-actions">
          <Link className="client-primary" href={chooseHref}>Elegir esta plantilla →</Link>
          <Link className="client-secondary" href={backHref}>Ver otras plantillas</Link>
        </div>
      </aside>
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="client-loading">Preparando demo…</div>}><Preview /></Suspense>;
}
