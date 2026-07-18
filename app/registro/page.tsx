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
 return <main className="login-page"><section className="login-card"><div className="login-brand"><span>IP</span><div><strong>InvitaPro</strong><small>Comienza tu experiencia</small></div></div><div className="login-heading"><p className="eyebrow">Mi InvitaPro</p><h1>Crea tu cuenta</h1><p>Guarda tus diseños y administra tu evento desde un espacio privado.</p></div>
 <form className="login-form" onSubmit={submit}><label>Nombre<input required value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre"/></label><label>Correo<input required type="email" value={correo} onChange={e=>setCorreo(e.target.value)} placeholder="tu@correo.com"/></label><label>Contraseña<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 8 caracteres"/></label>{error&&<p className="form-error">{error}</p>}{ok&&<p style={{padding:12,borderRadius:12,background:"#effaf3",fontSize:14}}>{ok}</p>}<button className="button button-primary login-button" disabled={busy}>{busy?"Creando…":"Crear mi cuenta"}</button></form><p style={{textAlign:"center",marginTop:18,fontSize:14}}>¿Ya tienes cuenta? <Link href="/login"><strong>Iniciar sesión</strong></Link></p></section></main>
}