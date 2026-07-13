"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Evento = { id: string; clienteId: string; nombre: string; tipo: string; fecha: string; hora: string; lugar: string; direccion: string };
type Invitacion = { id: string; eventoId: string; titulo: string; slug: string; plantilla: string; estado: "borrador" | "publicada" | "pausada"; mensaje: string; mapaUrl: string; whatsapp: string; vestimenta: string; colorPrincipal: string };
type Invitado = { id: string; invitacionId: string; nombre: string; telefono: string; correo: string; adultos: number; ninos: number; mesa: string; codigo: string; estado: "pendiente" | "confirmado" | "declinado" };
const EVENTOS_KEY = "invitapro_eventos_v1";
const INVITACIONES_KEY = "invitapro_invitaciones_v1";
const INVITADOS_KEY = "invitapro_invitados_v1";

function dateLong(value: string) {
  if (!value) return "Fecha por confirmar";
  return new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function InvitacionPersonalizada() {
  const params = useParams<{ slug: string; codigo: string }>();
  const [invitacion, setInvitacion] = useState<Invitacion | null>(null);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [invitado, setInvitado] = useState<Invitado | null>(null);
  const [cargado, setCargado] = useState(false);
  const [faltan, setFaltan] = useState("");

  useEffect(() => {
    try {
      const invitaciones = JSON.parse(localStorage.getItem(INVITACIONES_KEY) || "[]") as Invitacion[];
      const encontrada = invitaciones.find((item) => item.slug === params.slug) || null;
      const eventos = JSON.parse(localStorage.getItem(EVENTOS_KEY) || "[]") as Evento[];
      const invitados = JSON.parse(localStorage.getItem(INVITADOS_KEY) || "[]") as Invitado[];
      const pase = encontrada ? invitados.find((item) => item.invitacionId === encontrada.id && item.codigo.toUpperCase() === params.codigo.toUpperCase()) || null : null;
      setInvitacion(encontrada);
      setEvento(encontrada ? eventos.find((item) => item.id === encontrada.eventoId) || null : null);
      setInvitado(pase);
    } catch { setInvitacion(null); setEvento(null); setInvitado(null); }
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

  const whatsappHref = useMemo(() => invitacion?.whatsapp && invitado ? `https://wa.me/${invitacion.whatsapp}?text=${encodeURIComponent(`Hola, soy ${invitado.nombre}. Confirmo mi asistencia a ${invitacion.titulo}. Mi pase es ${invitado.codigo}.`)}` : "", [invitacion, invitado]);
  if (!cargado) return <main className="public-invite-loading">Preparando tu pase…</main>;
  if (!invitacion || !evento || !invitado) return <main className="public-invite-error"><h1>Pase no encontrado</h1><p>Verifica el enlace recibido. El código puede haber cambiado o sido eliminado.</p></main>;
  if (invitacion.estado !== "publicada") return <main className="public-invite-error"><h1>Invitación no disponible</h1><p>Esta invitación se encuentra en estado {invitacion.estado}.</p></main>;

  return <main className={`public-invite theme-${invitacion.plantilla}`} style={{ "--invite-color": invitacion.colorPrincipal } as React.CSSProperties}>
    <section className="public-hero personalized-hero"><span className="public-kicker">Invitación para</span><h1>{invitado.nombre}</h1><p>{invitacion.titulo}</p><div className="public-scroll">Desliza para ver tu pase ↓</div></section>
    <section className="public-section public-intro"><p className="public-small-title">Pase personalizado</p><h2>Queremos compartir contigo este momento</h2><p>{invitacion.mensaje}</p><div className="public-countdown">{faltan}</div></section>
    <section className="public-section personalized-pass"><div className="pass-card"><div className="pass-card-heading"><span>Invitado</span><strong>{invitado.nombre}</strong></div><div className="pass-grid"><article><span>Adultos</span><strong>{invitado.adultos}</strong></article><article><span>Niños</span><strong>{invitado.ninos}</strong></article><article><span>Mesa</span><strong>{invitado.mesa || "Por asignar"}</strong></article></div><div className="pass-code"><span>Código de acceso</span><strong>{invitado.codigo}</strong></div><p>Este pase es personal. Preséntalo al ingresar al evento.</p></div></section>
    <section className="public-section public-details"><article><span>Fecha</span><strong>{dateLong(evento.fecha)}</strong><p>{evento.hora ? `${evento.hora} h` : "Hora por confirmar"}</p></article><article><span>Lugar</span><strong>{evento.lugar || "Por confirmar"}</strong><p>{evento.direccion || "La dirección se compartirá próximamente"}</p></article><article><span>Vestimenta</span><strong>{invitacion.vestimenta || "Libre"}</strong><p>Gracias por ser parte de nuestra celebración</p></article></section>
    <section className="public-section public-actions"><h2>¿Nos acompañas?</h2><p>{invitado.estado === "confirmado" ? "Tu asistencia aparece confirmada." : invitado.estado === "declinado" ? "Tu respuesta actual indica que no asistirás." : "Confirma tu asistencia usando el botón de WhatsApp."}</p><div>{invitacion.mapaUrl && <a href={invitacion.mapaUrl} target="_blank" rel="noreferrer">Abrir ubicación</a>}{whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer">Confirmar por WhatsApp</a>}</div></section>
    <footer className="public-footer">Pase {invitado.codigo} · Creado con InvitaPro</footer>
  </main>;
}
