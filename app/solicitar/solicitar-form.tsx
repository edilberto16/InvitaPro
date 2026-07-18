"use client";
import Link from "next/link";
import {FormEvent,useMemo,useState} from "react";
import {useSearchParams} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

export default function SolicitarForm(){
 const params=useSearchParams();
 const [nombre,setNombre]=useState("");
 const [telefono,setTelefono]=useState("");
 const [correo,setCorreo]=useState("");
 const [tipo,setTipo]=useState(params.get("categoria")||"Boda");
 const [fecha,setFecha]=useState("");
 const [plantilla,setPlantilla]=useState(params.get("plantilla")||"");
 const [detalle,setDetalle]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const phone=(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||"").replace(/\D/g,"");

 const message=useMemo(()=>`Hola 👋

Vi InvitaPro y me gustaría solicitar una invitación digital.

Nombre: ${nombre||"-"}
WhatsApp: ${telefono||"-"}
Correo: ${correo||"-"}
Tipo de evento: ${tipo}
Fecha aproximada: ${fecha||"-"}
Plantilla o estilo: ${plantilla||"Aún no decido"}
Detalles: ${detalle||"-"}

¿Me pueden dar información y precio?`,[nombre,telefono,correo,tipo,fecha,plantilla,detalle]);

 async function submit(e:FormEvent){
   e.preventDefault();
   setError("");
   if(!telefono.trim()){setError("Escribe un número de WhatsApp para poder contactarte.");return;}
   setBusy(true);
   try{
     const supabase=createClient();
     const {error:saveError}=await supabase.rpc("registrar_solicitud_publica",{
       p_nombre:nombre.trim(),
       p_telefono:telefono.trim(),
       p_correo:correo.trim()||null,
       p_tipo_evento:tipo,
       p_fecha:fecha||null,
       p_plantilla:plantilla.trim()||null,
       p_detalle:detalle.trim()||null
     });
     if(saveError) throw saveError;

     if(phone){
       window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
     }else{
       await navigator.clipboard?.writeText(message);
       alert("Solicitud guardada. El mensaje fue copiado; configura NEXT_PUBLIC_WHATSAPP_NUMBER para abrir WhatsApp automáticamente.");
     }
   }catch(err){
     setError(err instanceof Error?err.message:"No fue posible guardar tu solicitud. Inténtalo nuevamente.");
   }finally{setBusy(false);}
 }

 return <main className="request-page">
  <header className="inspiration-header">
   <div className="marketing-container inspiration-nav">
    <Link href="/" aria-label="InvitaPro" style={{textDecoration:"none"}}>
      <span style={{display:"inline-flex",alignItems:"center",gap:12}}>
        <span style={{width:48,height:48,borderRadius:14,display:"grid",placeItems:"center",background:"#72264f",color:"#fff",fontWeight:900,fontSize:18,boxShadow:"0 10px 24px rgba(114,38,79,.18)"}}>IP</span>
        <span style={{display:"grid",gap:1}}>
          <strong style={{fontFamily:"Georgia, serif",fontSize:25,lineHeight:1,color:"#24171f"}}>InvitaPro</strong>
          <small style={{fontSize:9,letterSpacing:".14em",textTransform:"uppercase",fontWeight:800,color:"#5e4b55"}}>Momentos que conectan</small>
        </span>
      </span>
    </Link>
    <nav><Link href="/">Inicio</Link><Link href="/inspiracion">Inspiración</Link><Link href="/login">Entrar</Link></nav>
   </div>
  </header>
  <section className="request-hero"><div className="marketing-container request-grid">
   <div className="request-copy"><span className="marketing-eyebrow">Servicio administrado</span><h1>Cuéntanos sobre tu evento. Nosotros nos encargamos de la invitación.</h1><p>Déjanos tus datos y continuamos por WhatsApp para ayudarte con diseño, contenido y opciones.</p><div className="request-points"><span>✓ Atención personalizada</span><span>✓ Diseño y configuración por InvitaPro</span><span>✓ Seguimiento desde nuestro equipo</span><span>✓ Acceso a Mi InvitaPro</span></div></div>
   <form className="request-form" onSubmit={submit}>
    <h2>Solicitar mi invitación</h2>
    <label>Tu nombre *<input required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="¿Cómo te llamas?"/></label>
    <label>WhatsApp / teléfono *<input required inputMode="tel" value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="Ej. 998 123 4567"/></label>
    <label>Correo electrónico<input type="email" value={correo} onChange={e=>setCorreo(e.target.value)} placeholder="tu@correo.com"/></label>
    <label>Tipo de evento<select value={tipo} onChange={e=>setTipo(e.target.value)}><option>Boda</option><option>XV años</option><option>Cumpleaños</option><option>Baby shower</option><option>Empresarial</option><option>Otro</option></select></label>
    <label>Fecha aproximada<input type="date" value={fecha} onChange={e=>setFecha(e.target.value)}/></label>
    <label>Plantilla o estilo<input value={plantilla} onChange={e=>setPlantilla(e.target.value)} placeholder="Ej. Princess Rose"/></label>
    <label>Cuéntanos un poco más<textarea value={detalle} onChange={e=>setDetalle(e.target.value)} placeholder="Colores, invitados, ideas especiales…"/></label>
    {error&&<p className="form-error">{error}</p>}
    <button
      className="request-submit"
      disabled={busy}
      style={{
        width:"100%", minHeight:58, border:"1px solid #72264f", borderRadius:999,
        background: busy ? "#9b7187" : "#72264f", color:"#ffffff",
        fontWeight:800, fontSize:16, cursor:busy?"wait":"pointer",
        display:"inline-flex", alignItems:"center", justifyContent:"center", gap:10,
        boxShadow:"0 12px 28px rgba(114,38,79,.22)", opacity:1
      }}
    >
      <span style={{color:"#ffffff"}}>{busy?"Guardando solicitud…":"Enviar solicitud y continuar por WhatsApp"}</span>
      <span style={{color:"#ffffff"}}>→</span>
    </button>
    <small>Guardaremos tus datos para poder darte seguimiento. No realizas ningún pago al enviar esta solicitud.</small>
   </form>
  </div></section>
 </main>
}