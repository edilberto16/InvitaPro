"use client";

import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Evento = { id: string; clienteId: string; nombre: string; tipo: string; fecha: string; hora: string; lugar: string; direccion: string };
type Invitacion = { id: string; eventoId: string; titulo: string; slug: string; plantilla: string; estado: "borrador" | "publicada" | "pausada"; mensaje: string; mapaUrl: string; whatsapp: string; vestimenta: string; colorPrincipal: string };
type Invitado = { id: string; invitacionId: string; nombre: string; telefono: string; correo: string; adultos: number; ninos: number; mesa: string; codigo: string; estado: "pendiente" | "confirmado" | "declinado" };
type Confirmacion = { id: string; invitadoId: string; invitacionId: string; asistencia: "confirmado" | "declinado"; adultosConfirmados: number; ninosConfirmados: number; mensaje: string; respondidoEn: string };
const EVENTOS_KEY = "invitapro_eventos_v1";
const INVITACIONES_KEY = "invitapro_invitaciones_v1";
const INVITADOS_KEY = "invitapro_invitados_v1";
const CONFIRMACIONES_KEY = "invitapro_confirmaciones_v1";

function dateLong(value: string) {
  if (!value) return "Fecha por confirmar";
  return new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function InvitacionPersonalizada() {
  const params = useParams<{ slug: string; codigo: string }>();
  const [invitacion, setInvitacion] = useState<Invitacion | null>(null);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [invitado, setInvitado] = useState<Invitado | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const [asistencia, setAsistencia] = useState<"confirmado" | "declinado">("confirmado");
  const [adultos, setAdultos] = useState(1);
  const [ninos, setNinos] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");
  const [cargado, setCargado] = useState(false);
  const [faltan, setFaltan] = useState("");

  useEffect(() => {
    try {
      const invitaciones = JSON.parse(localStorage.getItem(INVITACIONES_KEY) || "[]") as Invitacion[];
      const encontrada = invitaciones.find((item) => item.slug === params.slug) || null;
      const eventos = JSON.parse(localStorage.getItem(EVENTOS_KEY) || "[]") as Evento[];
      const invitados = JSON.parse(localStorage.getItem(INVITADOS_KEY) || "[]") as Invitado[];
      const confirmaciones = JSON.parse(localStorage.getItem(CONFIRMACIONES_KEY) || "[]") as Confirmacion[];
      const pase = encontrada ? invitados.find((item) => item.invitacionId === encontrada.id && item.codigo.toUpperCase() === params.codigo.toUpperCase()) || null : null;
      const respuesta = pase ? confirmaciones.find((item) => item.invitadoId === pase.id) || null : null;
      setInvitacion(encontrada);
      setEvento(encontrada ? eventos.find((item) => item.id === encontrada.eventoId) || null : null);
      setInvitado(pase);
      setConfirmacion(respuesta);
      if (pase) { setAdultos(Math.max(1, pase.adultos)); setNinos(pase.ninos); }
      if (respuesta) { setAsistencia(respuesta.asistencia); setAdultos(respuesta.adultosConfirmados); setNinos(respuesta.ninosConfirmados); setMensaje(respuesta.mensaje); }
    } catch { setInvitacion(null); setEvento(null); setInvitado(null); setConfirmacion(null); }
    setCargado(true);
  }, [params.slug, params.codigo]);

  useEffect(() => {
    if (!evento?.fecha) return;
    const target = new Date(`${evento.fecha}T${evento.hora || "00:00"}:00`).getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setFaltan("¡Hoy es el gran día!");
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff / 3600000) % 24);
      const minutes = Math.floor((diff / 60000) % 60);
      setFaltan(`${days} días · ${hours} horas · ${minutes} minutos`);
    };
    update(); const timer = setInterval(update, 60000); return () => clearInterval(timer);
  }, [evento]);

  const whatsappHref = useMemo(() => invitacion?.whatsapp && invitado ? `https://wa.me/${invitacion.whatsapp}?text=${encodeURIComponent(`Hola, soy ${invitado.nombre}. Ya respondí mi invitación para ${invitacion.titulo}. Mi pase es ${invitado.codigo}.`)}` : "", [invitacion, invitado]);

  function guardarRespuesta(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!invitado || !invitacion) return;
    if (asistencia === "confirmado" && adultos + ninos < 1) return setError("Confirma al menos una persona asistente.");
    if (adultos > invitado.adultos || ninos > invitado.ninos) return setError("La cantidad confirmada no puede superar los pases asignados.");
    const respuesta: Confirmacion = {
      id: confirmacion?.id || crypto.randomUUID(), invitadoId: invitado.id, invitacionId: invitacion.id,
      asistencia, adultosConfirmados: asistencia === "confirmado" ? adultos : 0,
      ninosConfirmados: asistencia === "confirmado" ? ninos : 0,
      mensaje: mensaje.trim(), respondidoEn: new Date().toISOString(),
    };
    const actuales = JSON.parse(localStorage.getItem(CONFIRMACIONES_KEY) || "[]") as Confirmacion[];
    const actualizadas = actuales.some((item) => item.invitadoId === invitado.id) ? actuales.map((item) => item.invitadoId === invitado.id ? respuesta : item) : [respuesta, ...actuales];
    localStorage.setItem(CONFIRMACIONES_KEY, JSON.stringify(actualizadas));
    const invitados = JSON.parse(localStorage.getItem(INVITADOS_KEY) || "[]") as Invitado[];
    const invitadosActualizados = invitados.map((item) => item.id === invitado.id ? { ...item, estado: asistencia } : item);
    localStorage.setItem(INVITADOS_KEY, JSON.stringify(invitadosActualizados));
    setInvitado({ ...invitado, estado: asistencia });
    setConfirmacion(respuesta); setError(""); setGuardado(true);
    setTimeout(() => setGuardado(false), 3500);
  }

  if (!cargado) return <main className="public-invite-loading">Preparando tu pase…</main>;
  if (!invitacion || !evento || !invitado) return <main className="public-invite-error"><h1>Pase no encontrado</h1><p>Verifica el enlace recibido. El código puede haber cambiado o sido eliminado.</p></main>;
  if (invitacion.estado !== "publicada") return <main className="public-invite-error"><h1>Invitación no disponible</h1><p>Esta invitación se encuentra en estado {invitacion.estado}.</p></main>;

  return <main className={`public-invite theme-${invitacion.plantilla}`} style={{ "--invite-color": invitacion.colorPrincipal } as React.CSSProperties}>
    <section className="public-hero personalized-hero"><span className="public-kicker">Invitación para</span><h1>{invitado.nombre}</h1><p>{invitacion.titulo}</p><div className="public-scroll">Desliza para ver tu pase ↓</div></section>
    <section className="public-section public-intro"><p className="public-small-title">Pase personalizado</p><h2>Queremos compartir contigo este momento</h2><p>{invitacion.mensaje}</p><div className="public-countdown">{faltan}</div></section>
    <section className="public-section personalized-pass"><div className="pass-card"><div className="pass-card-heading"><span>Invitado</span><strong>{invitado.nombre}</strong></div><div className="pass-grid"><article><span>Adultos</span><strong>{invitado.adultos}</strong></article><article><span>Niños</span><strong>{invitado.ninos}</strong></article><article><span>Mesa</span><strong>{invitado.mesa || "Por asignar"}</strong></article></div><div className="pass-code"><span>Código de acceso</span><strong>{invitado.codigo}</strong></div><p>Este pase es personal. Preséntalo al ingresar al evento.</p></div></section>
    <section className="public-section public-details"><article><span>Fecha</span><strong>{dateLong(evento.fecha)}</strong><p>{evento.hora ? `${evento.hora} h` : "Hora por confirmar"}</p></article><article><span>Lugar</span><strong>{evento.lugar || "Por confirmar"}</strong><p>{evento.direccion || "La dirección se compartirá próximamente"}</p></article><article><span>Vestimenta</span><strong>{invitacion.vestimenta || "Libre"}</strong><p>Gracias por ser parte de nuestra celebración</p></article></section>
    <section className="public-section public-rsvp"><div className="rsvp-public-card"><p className="public-small-title">Confirmación de asistencia</p><h2>¿Nos acompañas?</h2><p>Tu respuesta se guardará directamente en la lista del evento.</p>
      <form onSubmit={guardarRespuesta} className="rsvp-public-form">
        <div className="rsvp-choice-grid"><button type="button" className={`rsvp-choice ${asistencia === "confirmado" ? "selected" : ""}`} onClick={() => setAsistencia("confirmado")}><span>✓</span><strong>Sí, asistiré</strong><small>Confirmar lugares</small></button><button type="button" className={`rsvp-choice decline ${asistencia === "declinado" ? "selected" : ""}`} onClick={() => setAsistencia("declinado")}><span>×</span><strong>No podré asistir</strong><small>Enviar respuesta</small></button></div>
        {asistencia === "confirmado" && <div className="rsvp-attendee-grid"><label><span>Adultos</span><select value={adultos} onChange={(e) => setAdultos(Number(e.target.value))}>{Array.from({ length: invitado.adultos + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select><small>Máximo {invitado.adultos}</small></label><label><span>Niños</span><select value={ninos} onChange={(e) => setNinos(Number(e.target.value))}>{Array.from({ length: invitado.ninos + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select><small>Máximo {invitado.ninos}</small></label></div>}
        <label className="rsvp-message-field"><span>Mensaje para los anfitriones <small>(opcional)</small></span><textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Escribe un mensaje breve…" rows={4} /></label>
        {error && <p className="form-error">{error}</p>}{guardado && <div className="rsvp-success">✓ Tu respuesta se guardó correctamente.</div>}
        <button className="rsvp-submit" type="submit">{confirmacion ? "Actualizar mi respuesta" : "Enviar confirmación"}</button>
      </form>
      {confirmacion && <p className="rsvp-current">Respuesta actual: <strong>{confirmacion.asistencia === "confirmado" ? `${confirmacion.adultosConfirmados + confirmacion.ninosConfirmados} asistentes` : "No asistirá"}</strong></p>}
      <div className="rsvp-secondary-actions">{invitacion.mapaUrl && <a href={invitacion.mapaUrl} target="_blank" rel="noreferrer">Abrir ubicación</a>}{whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer">Avisar también por WhatsApp</a>}</div>
    </div></section>
    <footer className="public-footer">Pase {invitado.codigo} · Creado con InvitaPro</footer>
  </main>;
}
