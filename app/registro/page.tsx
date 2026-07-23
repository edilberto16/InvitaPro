"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "../../lib/supabase/client";
export default function Registro(){
 const router=useRouter(); const [nombre,setNombre]=useState(""); const [correo,setCorreo]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [ok,setOk]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setOk("");
  const supabase=createClient(); const {data,error}=await supabase.auth.signUp({email:correo.trim(),password,options:{data:{nombre:nombre.trim(),rol:"cliente"}}});
  setBusy(false); if(error){setError(error.message);return;} if(data.session){router.replace("/mi-cuenta");router.refresh();} else setOk("Cuenta creada. Revisa tu correo para confirmar tu cuenta y después inicia sesión.");
 }
 return <main className="auth-page">
  <section className="auth-shell">
   <aside className="auth-showcase auth-showcase-register">
    <Link href="/" className="auth-brand"><span>IP</span><div><strong>InvitaPro</strong><small>Momentos que conectan</small></div></Link>
    <div className="auth-showcase-copy">
     <p className="auth-kicker">EMPIEZA A CREAR</p>
     <h2>Tu invitación comienza con una idea. Nosotros te damos las herramientas.</h2>
     <p>Elige una plantilla, personalízala a tu estilo y administra cada detalle de tu evento desde un solo lugar.</p>
     <div className="auth-step-list">
      <div><span>01</span><p><strong>Elige tu diseño</strong><small>Encuentra la plantilla ideal para tu evento.</small></p></div>
      <div><span>02</span><p><strong>Personaliza</strong><small>Agrega fotos, música, ubicación y detalles.</small></p></div>
      <div><span>03</span><p><strong>Publica y comparte</strong><small>Activa tu invitación y recibe confirmaciones.</small></p></div>
     </div>
    </div>
    <div className="auth-showcase-footer"><span>✦</span><p>Tu primera versión puede estar lista en pocos minutos.</p></div>
   </aside>

   <section className="auth-panel">
    <div className="auth-panel-inner">
     <div className="auth-mobile-brand"><Link href="/"><span>IP</span><strong>InvitaPro</strong></Link></div>
     <div className="auth-heading">
      <p className="eyebrow">Mi InvitaPro</p>
      <h1>Crea tu cuenta</h1>
      <p>Empieza tu invitación y guarda todo tu evento en un espacio privado.</p>
     </div>

     <form className="auth-form" onSubmit={submit}>
      <label><span>Tu nombre</span><input required autoComplete="name" value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="¿Cómo te llamas?"/></label>
      <label><span>Correo electrónico</span><input required autoComplete="email" type="email" value={correo} onChange={e=>setCorreo(e.target.value)} placeholder="tu@correo.com"/></label>
      <label><span>Contraseña</span><input required minLength={8} autoComplete="new-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 8 caracteres"/><small className="auth-field-help">Usa al menos 8 caracteres para proteger tu cuenta.</small></label>
      {error&&<p className="form-error auth-error">{error}</p>}
      {ok&&<p className="auth-success">{ok}</p>}
      <button className="auth-submit" disabled={busy}>{busy?"Creando tu cuenta…":"Crear mi cuenta"}<span>→</span></button>
     </form>

     <div className="auth-divider"><span>¿Ya tienes cuenta?</span></div>
     <Link className="auth-secondary-action" href="/login">Iniciar sesión</Link>
     <p className="auth-legal">Al crear tu cuenta, aceptas nuestros términos y aviso de privacidad.</p>
    </div>
   </section>
  </section>
 </main>
}