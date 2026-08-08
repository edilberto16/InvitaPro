"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { authMessage } from "../../lib/auth/messages";

function subscribeToLocationSearch() {
  return () => {};
}

function getLocationSearchSnapshot() {
  return window.location.search;
}

function getLocationSearchServerSnapshot() {
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const [correo,setCorreo]=useState(""); const [contrasena,setContrasena]=useState("");
  const [error,setError]=useState(""); const [notice,setNotice]=useState(""); const [cargando,setCargando]=useState(false);
  const [resending,setResending]=useState(false); const [resendWait,setResendWait]=useState(0);
  const locationSearch = useSyncExternalStore(
    subscribeToLocationSearch,
    getLocationSearchSnapshot,
    getLocationSearchServerSnapshot
  );
  const queryParams = new URLSearchParams(locationSearch);
  const queryNotice = queryParams.get("password") === "updated"
    ? "Contraseña actualizada. Ya puedes iniciar sesión con tu nueva contraseña."
    : queryParams.get("confirmed") === "1"
      ? "Correo confirmado. Ya puedes iniciar sesión."
      : "";
  const queryError = queryParams.get("auth_error") === "invalid_link"
    ? "El enlace de autenticación no es válido o ya expiró. Solicita uno nuevo."
    : "";
  const visibleError = error || queryError;
  const visibleNotice = notice || queryNotice;

  useEffect(()=>{ if(resendWait<=0)return; const timer=window.setInterval(()=>setResendWait(v=>Math.max(0,v-1)),1000); return()=>window.clearInterval(timer); },[resendWait]);

  async function iniciarSesion(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError(""); setNotice(""); setCargando(true);
    try{
      const supabase=createClient();
      const {data,error:authError}=await supabase.auth.signInWithPassword({email:correo.trim(),password:contrasena});
      if(authError) throw authError;
      const user=data.user;
      const {data:profile}=await supabase.from("profiles").select("rol").eq("id",user.id).maybeSingle();
      const requested=new URLSearchParams(window.location.search).get("next");
      const isAdmin = ["admin","administrador","super_admin"].includes(profile?.rol ?? "");
      const destination=requested || (isAdmin?"/admin":"/mi-cuenta");
      router.replace(destination); router.refresh();
    }catch(err){ setError(authMessage(err,"No fue posible iniciar sesión. Inténtalo nuevamente.")); }
    finally{setCargando(false);}
  }

  async function resendConfirmation(){
    if(!correo.trim()) return setError("Escribe primero el correo de tu cuenta.");
    if(resendWait>0) return;
    setResending(true); setError(""); setNotice("");
    try{
      const supabase=createClient();
      const {error}=await supabase.auth.resend({type:"signup",email:correo.trim(),options:{emailRedirectTo:`${window.location.origin}/auth/callback?next=/login?confirmed=1`}});
      if(error) throw error;
      setNotice("Correo de confirmación reenviado. Revisa tu bandeja de entrada y spam.");
      setResendWait(60);
    }catch(err){ setError(authMessage(err,"No fue posible reenviar el correo de confirmación.")); }
    finally{setResending(false);}
  }

  return <main className="auth-page">
    <section className="auth-shell">
      <aside className="auth-showcase">
        <Link href="/" className="auth-brand"><span>IP</span><div><strong>InvitaPro</strong><small>Momentos que conectan</small></div></Link>
        <div className="auth-showcase-copy">
          <p className="auth-kicker">TU EVENTO, TODO EN UN SOLO LUGAR</p>
          <h2>Crea, publica y comparte momentos inolvidables.</h2>
          <p>Administra tu invitación, invitados, confirmaciones y todos los detalles de tu evento desde una sola experiencia.</p>
          <div className="auth-proof-grid"><div><strong>Diseña</strong><span>Plantillas profesionales y personalización visual.</span></div><div><strong>Comparte</strong><span>Un enlace listo para enviar a tus invitados.</span></div><div><strong>Gestiona</strong><span>RSVP, pases y seguimiento en tiempo real.</span></div></div>
        </div>
        <div className="auth-showcase-footer"><span>✦</span><p>Invitaciones digitales que se sienten especiales desde el primer vistazo.</p></div>
      </aside>
      <section className="auth-panel"><div className="auth-panel-inner">
        <div className="auth-mobile-brand"><Link href="/"><span>IP</span><strong>InvitaPro</strong></Link></div>
        <div className="auth-heading"><p className="eyebrow">Bienvenido de nuevo</p><h1>Inicia sesión</h1><p>Continúa creando y administrando tu evento desde Mi InvitaPro.</p></div>
        <form className="auth-form" onSubmit={iniciarSesion}>
          <label><span>Correo electrónico</span><input type="email" value={correo} onChange={e=>setCorreo(e.target.value)} required autoComplete="email" placeholder="tu@correo.com"/></label>
          <label><div className="auth-label-row"><span>Contraseña</span><Link href="/recuperar-contrasena">¿La olvidaste?</Link></div><input type="password" value={contrasena} onChange={e=>setContrasena(e.target.value)} required autoComplete="current-password" placeholder="••••••••"/></label>
          {visibleError&&<div className="auth-inline-message is-error"><p>{visibleError}</p>{/confirmado|confirmación/i.test(visibleError)&&<button type="button" disabled={resending||resendWait>0} onClick={()=>void resendConfirmation()}>{resending?"Reenviando…":resendWait>0?`Reenviar en ${resendWait}s`:"Reenviar confirmación"}</button>}</div>}
          {visibleNotice&&<p className="auth-success">{visibleNotice}</p>}
          <button className="auth-submit" disabled={cargando}>{cargando?"Ingresando…":"Entrar a Mi InvitaPro"}<span>→</span></button>
        </form>
        <div className="auth-divider"><span>¿Aún no tienes cuenta?</span></div>
        <Link className="auth-secondary-action" href="/registro">Crear mi cuenta gratis</Link>
        <p className="auth-legal">Al continuar, aceptas nuestros términos y aviso de privacidad.</p>
      </div></section>
    </section>
  </main>;
}
