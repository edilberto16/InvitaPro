"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Evento = { id: string; nombre: string; fecha: string; hora: string };
type Invitacion = { id: string; eventoId: string; titulo: string; slug: string };
type Invitado = { id: string; invitacionId: string; nombre: string; codigo: string; adultos: number; ninos: number; estado: "pendiente" | "confirmado" | "declinado" };
type Confirmacion = {
  id: string;
  invitadoId: string;
  invitacionId: string;
  asistencia: "confirmado" | "declinado";
  adultosConfirmados: number;
  ninosConfirmados: number;
  mensaje: string;
  respondidoEn: string;
};

const EVENTOS_KEY = "invitapro_eventos_v1";
const INVITACIONES_KEY = "invitapro_invitaciones_v1";
const INVITADOS_KEY = "invitapro_invitados_v1";
const CONFIRMACIONES_KEY = "invitapro_confirmaciones_v1";

function formatDateTime(value: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function ConfirmacionesPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [confirmaciones, setConfirmaciones] = useState<Confirmacion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "confirmado" | "declinado">("todas");
  const [filtroInvitacion, setFiltroInvitacion] = useState("todas");
  const [aEliminar, setAEliminar] = useState<Confirmacion | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try { setEventos(JSON.parse(localStorage.getItem(EVENTOS_KEY) || "[]")); } catch { setEventos([]); }
    try { setInvitaciones(JSON.parse(localStorage.getItem(INVITACIONES_KEY) || "[]")); } catch { setInvitaciones([]); }
    try { setInvitados(JSON.parse(localStorage.getItem(INVITADOS_KEY) || "[]")); } catch { setInvitados([]); }
    try { setConfirmaciones(JSON.parse(localStorage.getItem(CONFIRMACIONES_KEY) || "[]")); } catch { setConfirmaciones([]); }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (cargado) localStorage.setItem(CONFIRMACIONES_KEY, JSON.stringify(confirmaciones));
  }, [confirmaciones, cargado]);

  const invitadosPorId = useMemo(() => new Map(invitados.map((item) => [item.id, item])), [invitados]);
  const invitacionesPorId = useMemo(() => new Map(invitaciones.map((item) => [item.id, item])), [invitaciones]);
  const eventosPorId = useMemo(() => new Map(eventos.map((item) => [item.id, item])), [eventos]);

  const lista = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    return confirmaciones.filter((item) => filtro === "todas" || item.asistencia === filtro)
      .filter((item) => filtroInvitacion === "todas" || item.invitacionId === filtroInvitacion)
      .filter((item) => {
        if (!term) return true;
        const invitado = invitadosPorId.get(item.invitadoId);
        const invitacion = invitacionesPorId.get(item.invitacionId);
        return [invitado?.nombre, invitado?.codigo, invitacion?.titulo, item.mensaje].join(" ").toLowerCase().includes(term);
      })
      .sort((a, b) => new Date(b.respondidoEn).getTime() - new Date(a.respondidoEn).getTime());
  }, [confirmaciones, filtro, filtroInvitacion, busqueda, invitadosPorId, invitacionesPorId]);

  const confirmados = confirmaciones.filter((item) => item.asistencia === "confirmado");
  const pasesConfirmados = confirmados.reduce((sum, item) => sum + item.adultosConfirmados + item.ninosConfirmados, 0);
  const noAsisten = confirmaciones.filter((item) => item.asistencia === "declinado").length;
  const pendientes = Math.max(invitados.length - confirmaciones.length, 0);

  function eliminarConfirmacion() {
    if (!aEliminar) return;
    setConfirmaciones((actuales) => actuales.filter((item) => item.id !== aEliminar.id));
    setInvitados((actuales) => {
      const actualizados = actuales.map((item) => item.id === aEliminar.invitadoId ? { ...item, estado: "pendiente" as const } : item);
      localStorage.setItem(INVITADOS_KEY, JSON.stringify(actualizados));
      return actualizados;
    });
    setAEliminar(null);
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">RSVP</p><h1>Confirmaciones</h1><p>Consulta respuestas, asistentes y mensajes enviados desde cada pase personalizado.</p></div>
        <Link className="button button-primary" href="/admin/invitados">Administrar invitados</Link>
      </section>

      <section className="stats-grid rsvp-stats">
        <article className="stat-card"><span>Respuestas</span><strong>{confirmaciones.length}</strong><small>Invitados que respondieron</small></article>
        <article className="stat-card"><span>Pases confirmados</span><strong>{pasesConfirmados}</strong><small>Adultos y niños asistirán</small></article>
        <article className="stat-card"><span>No asistirán</span><strong>{noAsisten}</strong><small>Respuestas negativas</small></article>
        <article className="stat-card"><span>Pendientes</span><strong>{pendientes}</strong><small>Invitados sin responder</small></article>
      </section>

      <section className="panel-card">
        <div className="panel-header events-toolbar">
          <div><h2>Registro de respuestas</h2><p>Las respuestas se actualizan automáticamente desde las invitaciones.</p></div>
          <div className="rsvp-filters">
            <label className="search-field"><span>⌕</span><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar invitado, código o mensaje" /></label>
            <select className="status-filter" value={filtroInvitacion} onChange={(e) => setFiltroInvitacion(e.target.value)}><option value="todas">Todas las invitaciones</option>{invitaciones.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select>
            <select className="status-filter" value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)}><option value="todas">Todas las respuestas</option><option value="confirmado">Sí asistirán</option><option value="declinado">No asistirán</option></select>
          </div>
        </div>

        {lista.length === 0 ? (
          <div className="empty-state compact-empty"><div className="empty-icon">✓</div><h2>{confirmaciones.length ? "No encontramos coincidencias" : "Aún no hay confirmaciones"}</h2><p>{invitados.length ? "Comparte los enlaces personalizados para comenzar a recibir respuestas." : "Primero agrega invitados y genera sus pases personalizados."}</p><Link className="button button-primary" href="/admin/invitados">Ir a invitados</Link></div>
        ) : (
          <div className="table-wrap"><table className="data-table rsvp-table"><thead><tr><th>Invitado</th><th>Invitación</th><th>Respuesta</th><th>Asistentes</th><th>Mensaje</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>{lista.map((item) => {
            const invitado = invitadosPorId.get(item.invitadoId);
            const invitacion = invitacionesPorId.get(item.invitacionId);
            const evento = invitacion ? eventosPorId.get(invitacion.eventoId) : undefined;
            return <tr key={item.id}><td><div className="rsvp-person"><span className="client-avatar">{invitado?.nombre.slice(0, 2).toUpperCase() || "IN"}</span><div><strong>{invitado?.nombre || "Invitado eliminado"}</strong><span>{invitado?.codigo || "Sin código"}</span></div></div></td><td><strong>{invitacion?.titulo || "Invitación eliminada"}</strong><small>{evento?.fecha || "Sin fecha"}</small></td><td><span className={`guest-status guest-status-${item.asistencia}`}>{item.asistencia === "confirmado" ? "Sí asistirá" : "No asistirá"}</span></td><td><div className="rsvp-count"><strong>{item.adultosConfirmados + item.ninosConfirmados}</strong><span>{item.adultosConfirmados} adultos · {item.ninosConfirmados} niños</span></div></td><td><p className="rsvp-message">{item.mensaje || "Sin mensaje"}</p></td><td>{formatDateTime(item.respondidoEn)}</td><td><button className="table-action danger" type="button" onClick={() => setAEliminar(item)}>Eliminar</button></td></tr>;
          })}</tbody></table></div>
        )}
      </section>

      {aEliminar && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setAEliminar(null); }}><section className="delete-modal"><div className="delete-icon">🗑</div><h2>Eliminar confirmación</h2><p>Se borrará la respuesta de <strong>{invitadosPorId.get(aEliminar.invitadoId)?.nombre || "este invitado"}</strong> y su estado volverá a pendiente.</p><div className="delete-warning"><strong>Esta acción no se puede deshacer.</strong><span>El invitado podrá responder nuevamente desde su enlace.</span></div><div className="modal-actions"><button className="button button-secondary" onClick={() => setAEliminar(null)}>Cancelar</button><button className="button button-danger" onClick={eliminarConfirmacion}>Sí, eliminar</button></div></section></div>}
    </div>
  );
}
