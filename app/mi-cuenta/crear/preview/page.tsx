"use client";
import {Suspense} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {getTemplateById,TEMPLATE_COLLECTIONS} from "@/lib/template-catalog";

function Preview(){
 const q=useSearchParams();
 const tipo=q.get("tipo")||"wedding";
 const id=q.get("plantilla")||"";
 const template=getTemplateById(id);
 const label=TEMPLATE_COLLECTIONS.find(c=>c.id===tipo)?.label||"Evento";

 if(!template){
  return <main className="self-service-page"><header className="self-service-topbar"><Link href="/mi-cuenta" className="self-brand"><span>IP</span><strong>InvitaPro</strong></Link></header><section className="self-service-shell"><div className="client-empty"><h2>Plantilla no encontrada</h2><Link className="client-primary" href={`/mi-cuenta/crear/plantilla?tipo=${tipo}`}>Volver a plantillas</Link></div></section></main>
 }

 const demoName=tipo==="wedding"?"Mariana & Alejandro":tipo==="xv"?"Valentina":tipo==="infantil"?"Mateo cumple 6":"Future Summit";

 return <main className="self-service-page">
  <header className="self-service-topbar">
   <Link href="/mi-cuenta" className="self-brand"><span>IP</span><strong>InvitaPro</strong></Link>
   <div className="preview-top-actions"><Link className="client-secondary" href={`/mi-cuenta/crear/plantilla?tipo=${tipo}`}>← Volver</Link><Link className="client-primary" href={`/mi-cuenta/crear/configurar?tipo=${tipo}&plantilla=${template.id}`}>Elegir esta plantilla</Link></div>
  </header>
  <section className="template-preview-page">
   <div className="template-preview-stage" style={{background:`linear-gradient(145deg,${template.color},#21171d)`}}>
    <div className="template-preview-frame">
      <span className="template-preview-kicker">{label}</span>
      <h1>{template.name}</h1>
      <p>{template.description}</p>
      <div className="template-preview-demo-card">
        <small>{template.premium?"Experiencia Premium":"Diseño clásico"}</small>
        <strong>{demoName}</strong>
        <span>Vista previa del estilo, tipografía y atmósfera de esta plantilla.</span>
      </div>
    </div>
   </div>
   <aside className="template-preview-panel">
    <p className="eyebrow">Vista previa</p>
    <h2>{template.name}</h2>
    <p>{template.description}</p>
    <ul>{template.features.map(f=><li key={f}>✓ {f}</li>)}</ul>
    <div className="template-preview-actions">
      <Link className="client-primary" href={`/mi-cuenta/crear/configurar?tipo=${tipo}&plantilla=${template.id}`}>Elegir esta plantilla →</Link>
      <Link className="client-secondary" href={`/mi-cuenta/crear/plantilla?tipo=${tipo}`}>Ver otras plantillas</Link>
    </div>
   </aside>
  </section>
 </main>
}
export default function Page(){return <Suspense fallback={<div className="client-loading">Preparando vista previa…</div>}><Preview/></Suspense>}
