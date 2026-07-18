"use client";
import Link from "next/link";
const TYPES=[
 {id:"wedding",label:"Boda",icon:"♥",desc:"Una celebración elegante y personal."},
 {id:"xv",label:"XV años",icon:"♕",desc:"Una experiencia especial para tus quince."},
 {id:"infantil",label:"Cumpleaños",icon:"★",desc:"Fiestas infantiles llenas de personalidad."},
 {id:"empresarial",label:"Empresarial",icon:"◆",desc:"Eventos profesionales y corporativos."}
];
export default function CrearInvitacion(){
 return <main className="self-service-page"><header className="self-service-topbar"><Link href="/mi-cuenta" className="client-logo"><span>IP</span><strong>InvitaPro</strong></Link><Link href="/mi-cuenta" className="self-service-exit">Guardar y salir</Link></header>
 <section className="self-service-shell"><div className="wizard-progress"><span className="active">1</span><i/><span>2</span><i/><span>3</span></div><div className="wizard-heading"><p className="eyebrow">Paso 1 de 3</p><h1>¿Qué estás celebrando?</h1><p>Selecciona el tipo de evento para mostrarte diseños pensados especialmente para tu ocasión.</p></div>
 <div className="event-type-grid">{TYPES.map(x=><Link key={x.id} href={`/mi-cuenta/crear/plantilla?tipo=${x.id}`} className="event-type-card"><span>{x.icon}</span><h2>{x.label}</h2><p>{x.desc}</p><strong>Continuar →</strong></Link>)}</div>
 </section></main>
}