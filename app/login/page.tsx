"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCargando(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: correo.trim(),
        password: contrasena,
      });

      if (authError) throw authError;
      const nextPath = new URLSearchParams(window.location.search).get("next") || "/admin";
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><span>IP</span><div><strong>InvitaPro</strong><small>Administración de eventos</small></div></div>
        <div className="login-heading"><p className="eyebrow">Acceso seguro</p><h1>Iniciar sesión</h1><p>Ingresa con tus credenciales de administrador.</p></div>
        <form className="login-form" onSubmit={iniciarSesion}>
          <label>Correo electrónico<input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required autoComplete="email" placeholder="admin@invitapro.mx" /></label>
          <label>Contraseña<input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required autoComplete="current-password" placeholder="••••••••" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary login-button" disabled={cargando}>{cargando ? "Ingresando…" : "Entrar a InvitaPro"}</button>
        </form>
        <p className="login-help">La autenticación se activa cuando configuras <code>.env.local</code>.</p>
      </section>
    </main>
  );
}
