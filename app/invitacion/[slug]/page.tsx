"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Evento = { id: string; clienteId: string; nombre: string; tipo: string; fecha: string; hora: string; lugar: string; direccion: string };
type Invitacion = { id: string; eventoId: string; titulo: string; slug: string; plantilla: string; estado: "borrador" | "publicada" | "pausada"; mensaje: string; mapaUrl: string; whatsapp: string; vestimenta: string; colorPrincipal: string };
const EVENTOS_KEY = "invitapro_eventos_v1";
const INVITACIONES_KEY = "invitapro_invitaciones_v1";

function dateLong(value: string) {
  if (!value) return "Fecha por confirmar";
  return new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function InvitacionPublica() {
  const params = useParams<{ slug: string }>();
  const [invitacion, setInvitacion] = useState<Invitacion | null>(null);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargado, setCargado] = useState(false);
  const [faltan, setFaltan] = useState("");

  useEffect(() => {
    try {
      const invitaciones = JSON.parse(localStorage.getItem(INVITACIONES_KEY) || "[]") as Invitacion[];
      const encontrada = invitaciones.find((item) => item.slug === params.slug) || null;
      const eventos = JSON.parse(localStorage.getItem(EVENTOS_KEY) || "[]") as Evento[];
      setInvitacion(encontrada);
      setEvento(encontrada ? eventos.find((item) => item.id === encontrada.eventoId) || null : null);
    } catch { setInvitacion(null); setEvento(null); }
    setCargado(true);
  }, [params.slug]);

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

  const whatsappHref = useMemo(() => invitacion?.whatsapp ? `https://wa.me/${invitacion.whatsapp}?text=${encodeURIComponent(`Confirmo mi asistencia a ${invitacion.titulo}`)}` : "", [invitacion]);
  if (!cargado) return <main className="public-invite-loading">Preparando invitación…</main>;
  if (!invitacion || !evento) return <main className="public-invite-error"><h1>Invitación no encontrada</h1><p>El enlace no existe en esta computadora o fue eliminado.</p></main>;
  if (invitacion.estado !== "publicada") return <main className="public-invite-error"><h1>Invitación no disponible</h1><p>Esta invitación se encuentra en estado {invitacion.estado}.</p></main>;

  return <main className={`public-invite theme-${invitacion.plantilla}`} style={{ "--invite-color": invitacion.colorPrincipal } as React.CSSProperties}>
    <section className="public-hero"><span className="public-kicker">{evento.tipo}</span><h1>{invitacion.titulo}</h1><p>{dateLong(evento.fecha)}</p><div className="public-scroll">Desliza para ver los detalles ↓</div></section>
    <section className="public-section public-intro"><p className="public-small-title">Estás cordialmente invitado</p><h2>Queremos compartir contigo este momento</h2><p>{invitacion.mensaje}</p><div className="public-countdown">{faltan}</div></section>
    <section className="public-section public-details"><article><span>Fecha</span><strong>{dateLong(evento.fecha)}</strong><p>{evento.hora ? `${evento.hora} h` : "Hora por confirmar"}</p></article><article><span>Lugar</span><strong>{evento.lugar || "Por confirmar"}</strong><p>{evento.direccion || "La dirección se compartirá próximamente"}</p></article><article><span>Vestimenta</span><strong>{invitacion.vestimenta || "Libre"}</strong><p>Gracias por ser parte de nuestra celebración</p></article></section>
    <section className="public-section public-actions"><h2>¿Nos acompañas?</h2><p>Confirma tu asistencia y guarda la ubicación del evento.</p><div>{invitacion.mapaUrl && <a href={invitacion.mapaUrl} target="_blank" rel="noreferrer">Abrir ubicación</a>}{whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer">Confirmar por WhatsApp</a>}</div></section>
    <footer className="public-footer">Creado con InvitaPro</footer>
  </main>;
}
