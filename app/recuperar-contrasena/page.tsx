"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
import {createClient} from "../../lib/supabase/client";
import {authMessage} from "../../lib/auth/messages";
export default function RecuperarContrasena(){
  const [correo,setCorreo]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [ok,setOk]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setOk("");
    try{const supabase=createClient();const redirectTo=`${window.location.origin}/restablecer-contrasena`;const {error}=await supabase.auth.resetPasswordForEmail(correo.trim(),{redirectTo});if(error)throw error;setOk("Si existe una cuenta con ese correo, recibirás un enlace para crear una nueva contraseña. Revisa también spam.");}
    catch(err){setError(authMessage(err,"No pudimos enviar el correo de recuperación."));}finally{setBusy(false);}
  }
  return <main className="auth-page"><section className="auth-compact-card"><Link href="/" className="auth-compact-brand"><span>IP</span><div><strong>InvitaPro</strong><small>Recupera tu acceso</small></div></Link><div className="auth-heading"><p className="eyebrow">Acceso seguro</p><h1>Recuperar contraseña</h1><p>Escribe el correo con el que creaste tu cuenta.</p></div><form className="auth-form" onSubmit={submit}><label><span>Correo electrónico</span><input type="email" required autoComplete="email" value={correo} onChange={e=>setCorreo(e.target.value)} placeholder="tu@correo.com"/></label>{error&&<p className="form-error auth-error">{error}</p>}{ok&&<p className="auth-success">{ok}</p>}<button className="auth-submit" disabled={busy}>{busy?"Enviando…":"Enviar enlace de recuperación"}<span>→</span></button></form><p className="auth-compact-footer"><Link href="/login"><strong>← Volver a iniciar sesión</strong></Link></p></section></main>;
}
