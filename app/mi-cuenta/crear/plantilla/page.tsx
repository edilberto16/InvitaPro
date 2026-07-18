"use client";
import {Suspense} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {TEMPLATE_CATALOG,TEMPLATE_COLLECTIONS} from "@/lib/template-catalog";
function Selector(){
 const q=useSearchParams(); const tipo=q.get("tipo")||"wedding";
 const templates=TEMPLATE_CATALOG.filter(t=>t.collection===tipo&&t.available);
 const label=TEMPLATE_COLLECTIONS.find(c=>c.id===tipo)?.label||"Evento";
 return <main className="self-service-page"><header className="self-service-topbar"><Link href="/mi-cuenta" className="self-brand"><span>IP</span><strong>InvitaPro</strong></Link><Link href="/mi-cuenta" className="self-service-exit">Guardar y salir</Link></header><section className="self-service-shell">
 <div className="wizard-progress"><span className="done">✓</span><i className="done"/><span className="active">2</span><i/><span>3</span></div>
 <div className="wizard-heading"><p className="eyebrow">Paso 2 de 3 · {label}</p><h1>Elige el diseño que contará tu historia</h1><p>Podrás cambiar textos, fotografías y datos sin perder la esencia profesional de la plantilla.</p></div>
 <div className="self-template-grid">{templates.map(t=><article key={t.id} className="self-template-card"><div className="self-template-art" style={{background:`linear-gradient(145deg,${t.color},#261c23)`}}><small>{label}</small><strong>{t.name}</strong><span>{t.premium?"Premium":"Clásica"}</span></div><div className="self-template-info"><div><h2>{t.name}</h2><p>{t.description}</p></div><ul>{t.features.slice(0,3).map(f=><li key={f}>✓ {f}</li>)}</ul><div className="self-template-actions"><Link className="client-secondary" href={`/mi-cuenta/crear/preview?tipo=${tipo}&plantilla=${t.id}`}>Vista previa</Link><Link className="client-primary" href={`/mi-cuenta/crear/configurar?tipo=${tipo}&plantilla=${t.id}`}>Elegir esta plantilla</Link></div></div></article>)}</div>
 <Link className="wizard-back" href="/mi-cuenta/crear">← Cambiar tipo de evento</Link></section></main>
}
export default function Page(){return <Suspense fallback={<div className="client-loading">Cargando diseños…</div>}><Selector/></Suspense>}
