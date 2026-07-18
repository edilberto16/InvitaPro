"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [correo,setCorreo]=useState(""); const [contrasena,setContrasena]=useState("");
  const [error,setError]=useState(""); const [cargando,setCargando]=useState(false);
  async function iniciarSesion(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError(""); setCargando(true);
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
    }catch(err){const raw = err instanceof Error ? err.message : "";
      if (/invalid login credentials/i.test(raw)) {
        setError("El correo o la contraseña no son correctos. Verifica tus datos e inténtalo nuevamente.");
      } else if (/email not confirmed/i.test(raw)) {
        setError("Tu correo todavía no ha sido confirmado. Revisa tu bandeja de entrada.");
      } else {
        setError(raw || "No fue posible iniciar sesión. Inténtalo nuevamente.");
      }}
    finally{setCargando(false);}
  }
  return <main className="login-page"><section className="login-card">
    <div className="login-brand"><span>IP</span><div><strong>InvitaPro</strong><small>Tu evento, en un solo lugar</small></div></div>
    <div className="login-heading"><p className="eyebrow">Bienvenido</p><h1>Iniciar sesión</h1><p>Accede para administrar tu invitación y tus invitados.</p></div>
    <form className="login-form" onSubmit={iniciarSesion}>
      <label>Correo electrónico<input type="email" value={correo} onChange={e=>setCorreo(e.target.value)} required autoComplete="email" placeholder="tu@correo.com"/></label>
      <label>Contraseña<input type="password" value={contrasena} onChange={e=>setContrasena(e.target.value)} required autoComplete="current-password" placeholder="••••••••"/></label>
      {error&&<p className="form-error">{error}</p>}
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:-4}}>
        <Link href="/recuperar-contrasena" style={{fontSize:14,fontWeight:700}}>¿Olvidaste tu contraseña?</Link>
      </div>
      <button className="button button-primary login-button" disabled={cargando}>{cargando?"Ingresando…":"Entrar a InvitaPro"}</button>
    </form>
    <p style={{textAlign:"center",marginTop:18,fontSize:14}}>¿Eres nuevo? <Link href="/registro"><strong>Crear cuenta</strong></Link></p>
  </section></main>;
}