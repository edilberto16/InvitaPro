"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
import {createClient} from "../../lib/supabase/client";
export default function RecuperarContrasena(){
  const [correo,setCorreo]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [ok,setOk]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setOk("");
    try{const supabase=createClient();const redirectTo=`${window.location.origin}/restablecer-contrasena`;const {error}=await supabase.auth.resetPasswordForEmail(correo.trim(),{redirectTo});if(error)throw error;setOk("Te enviamos un enlace para crear una nueva contraseña. Revisa tu correo y también la carpeta de spam.");}
    catch(err){setError(err instanceof Error?err.message:"No pudimos enviar el correo de recuperación.");}finally{setBusy(false);}
  }
  return <main className="login-page"><section className="login-card"><div className="login-brand"><span>IP</span><div><strong>InvitaPro</strong><small>Recupera tu acceso</small></div></div><div className="login-heading"><p className="eyebrow">Acceso seguro</p><h1>Recuperar contraseña</h1><p>Escribe el correo con el que creaste tu cuenta.</p></div><form className="login-form" onSubmit={submit}><label>Correo electrónico<input type="email" required value={correo} onChange={e=>setCorreo(e.target.value)} placeholder="tu@correo.com"/></label>{error&&<p className="form-error">{error}</p>}{ok&&<p style={{padding:14,borderRadius:12,background:"#effaf3",lineHeight:1.5}}>{ok}</p>}<button className="button button-primary login-button" disabled={busy}>{busy?"Enviando…":"Enviar enlace de recuperación"}</button></form><p style={{textAlign:"center",marginTop:18,fontSize:14}}><Link href="/login"><strong>Volver a iniciar sesión</strong></Link></p></section></main>;
}