"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Cliente = { id: string; nombre: string; telefono: string; correo: string; notas: string; creadoEn: string };
type Evento = { id: string; clienteId: string; nombre: string; tipo: string; fecha: string; hora: string; lugar: string; direccion: string; estado: string; notas: string; creadoEn: string };
type EstadoInvitacion = "borrador" | "publicada" | "pausada";
type Invitacion = {
  id: string;
  eventoId: string;
  titulo: string;
  slug: string;
  plantilla: string;
  estado: EstadoInvitacion;
  mensaje: string;
  mapaUrl: string;
  whatsapp: string;
  vestimenta: string;
  colorPrincipal: string;
  creadoEn: string;
};
type InvitacionForm = Omit<Invitacion, "id" | "creadoEn">;

const CLIENTES_KEY = "invitapro_clientes_v1";
const EVENTOS_KEY = "invitapro_eventos_v1";
const INVITACIONES_KEY = "invitapro_invitaciones_v1";
const EMPTY_FORM: InvitacionForm = {
  eventoId: "",
  titulo: "",
  slug: "",
  plantilla: "elegante",
  estado: "borrador",
  mensaje: "Será un honor contar con tu presencia para celebrar este día tan especial.",
  mapaUrl: "",
  whatsapp: "",
  vestimenta: "Formal",
  colorPrincipal: "#8f5c38",
};

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function formatDate(value: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
function initials(value: string) {
  return value.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "IN";
}

export default function InvitacionesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todas" | EstadoInvitacion>("todas");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Invitacion | null>(null);
  const [form, setForm] = useState<InvitacionForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try { setClientes(JSON.parse(localStorage.getItem(CLIENTES_KEY) || "[]")); } catch { setClientes([]); }
    try { setEventos(JSON.parse(localStorage.getItem(EVENTOS_KEY) || "[]")); } catch { setEventos([]); }
    try { setInvitaciones(JSON.parse(localStorage.getItem(INVITACIONES_KEY) || "[]")); } catch { setInvitaciones([]); }
    setCargado(true);
  }, []);
  useEffect(() => { if (cargado) localStorage.setItem(INVITACIONES_KEY, JSON.stringify(invitaciones)); }, [invitaciones, cargado]);

  const eventosPorId = useMemo(() => new Map(eventos.map((evento) => [evento.id, evento])), [eventos]);
  const clientesPorId = useMemo(() => new Map(clientes.map((cliente) => [cliente.id, cliente])), [clientes]);
  const lista = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    return invitaciones.filter((item) => filtro === "todas" || item.estado === filtro).filter((item) => {
      if (!term) return true;
      const evento = eventosPorId.get(item.eventoId);
      const cliente = evento ? clientesPorId.get(evento.clienteId) : undefined;
      return [item.titulo, item.slug, evento?.nombre, cliente?.nombre].join(" ").toLowerCase().includes(term);
    });
  }, [busqueda, filtro, invitaciones, eventosPorId, clientesPorId]);

  function abrirNueva() {
    const evento = eventos[0];
    setEditandoId(null);
    setForm({ ...EMPTY_FORM, eventoId: evento?.id || "", titulo: evento?.nombre || "", slug: slugify(evento?.nombre || "") });
    setError("");
    setModalAbierto(true);
  }
  function abrirEditar(item: Invitacion) {
    setEditandoId(item.id);
    setForm({ eventoId: item.eventoId, titulo: item.titulo, slug: item.slug, plantilla: item.plantilla, estado: item.estado, mensaje: item.mensaje, mapaUrl: item.mapaUrl, whatsapp: item.whatsapp, vestimenta: item.vestimenta, colorPrincipal: item.colorPrincipal });
    setError("");
    setModalAbierto(true);
  }
  function cerrar() { setModalAbierto(false); setEditandoId(null); setForm(EMPTY_FORM); setError(""); }
  function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = slugify(form.slug || form.titulo);
    if (!form.eventoId) return setError("Selecciona el evento al que pertenece la invitación.");
    if (!form.titulo.trim()) return setError("Escribe un título para la invitación.");
    if (!slug) return setError("Escribe un enlace válido.");
    if (invitaciones.some((item) => item.slug === slug && item.id !== editandoId)) return setError("Ese enlace ya está siendo utilizado por otra invitación.");
    const datos = { ...form, titulo: form.titulo.trim(), slug, mensaje: form.mensaje.trim(), mapaUrl: form.mapaUrl.trim(), whatsapp: form.whatsapp.replace(/\D/g, ""), vestimenta: form.vestimenta.trim() };
    if (editandoId) setInvitaciones((actuales) => actuales.map((item) => item.id === editandoId ? { ...item, ...datos } : item));
    else setInvitaciones((actuales) => [{ id: crypto.randomUUID(), creadoEn: new Date().toISOString(), ...datos }, ...actuales]);
    cerrar();
  }
  function cambiarEstado(item: Invitacion) {
    setInvitaciones((actuales) => actuales.map((actual) => actual.id === item.id ? { ...actual, estado: actual.estado === "publicada" ? "pausada" : "publicada" } : actual));
  }
  function eliminar() { if (aEliminar) setInvitaciones((actuales) => actuales.filter((item) => item.id !== aEliminar.id)); setAEliminar(null); }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">Constructor digital</p><h1>Invitaciones</h1><p>Crea enlaces públicos, personaliza el contenido y controla su publicación.</p></div>
        <button className="button button-primary" type="button" onClick={abrirNueva}>+ Nueva invitación</button>
      </section>

      <section className="stats-grid invitation-stats">
        <article className="stat-card"><span>Total</span><strong>{invitaciones.length}</strong><small>Invitaciones creadas</small></article>
        <article className="stat-card"><span>Publicadas</span><strong>{invitaciones.filter((x) => x.estado === "publicada").length}</strong><small>Disponibles mediante enlace</small></article>
        <article className="stat-card"><span>Borradores</span><strong>{invitaciones.filter((x) => x.estado === "borrador").length}</strong><small>Pendientes de publicar</small></article>
        <article className="stat-card"><span>Eventos disponibles</span><strong>{eventos.length}</strong><small>Listos para una invitación</small></article>
      </section>

      <section className="panel-card">
        <div className="panel-header events-toolbar">
          <div><h2>Biblioteca de invitaciones</h2><p>Edita, publica y abre la vista previa.</p></div>
          <div className="events-filters">
            <label className="search-field"><span>⌕</span><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar título, evento o cliente" /></label>
            <select className="status-filter" value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)}><option value="todas">Todos los estados</option><option value="borrador">Borrador</option><option value="publicada">Publicada</option><option value="pausada">Pausada</option></select>
          </div>
        </div>

        {lista.length === 0 ? (
          <div className="empty-state compact-empty"><div className="empty-icon">✉</div><h2>{invitaciones.length ? "No encontramos coincidencias" : "Aún no hay invitaciones"}</h2><p>{eventos.length ? "Crea una invitación vinculada a uno de tus eventos." : "Primero registra un evento para poder crear la invitación."}</p>{eventos.length ? <button className="button button-primary" onClick={abrirNueva}>Crear invitación</button> : <Link className="button button-primary" href="/admin/eventos">Ir a eventos</Link>}</div>
        ) : (
          <div className="table-wrap"><table className="data-table invitation-table"><thead><tr><th>Invitación</th><th>Evento / cliente</th><th>Plantilla</th><th>Estado</th><th>Enlace</th><th>Acciones</th></tr></thead><tbody>
            {lista.map((item) => { const evento = eventosPorId.get(item.eventoId); const cliente = evento ? clientesPorId.get(evento.clienteId) : undefined; return <tr key={item.id}>
              <td><div className="event-name-cell"><span className="event-avatar" style={{ background: item.colorPrincipal }}>{initials(item.titulo)}</span><div><strong>{item.titulo}</strong><span>{evento ? `${formatDate(evento.fecha)} · ${evento.hora || "Sin hora"}` : "Evento no disponible"}</span></div></div></td>
              <td><strong>{evento?.nombre || "Sin evento"}</strong><span>{cliente?.nombre || "Cliente no disponible"}</span></td>
              <td><strong>{item.plantilla === "elegante" ? "Elegante" : item.plantilla === "minimalista" ? "Minimalista" : "Floral"}</strong><span>{item.vestimenta || "Sin vestimenta"}</span></td>
              <td><span className={`invite-status invite-status-${item.estado}`}>{item.estado[0].toUpperCase() + item.estado.slice(1)}</span></td>
              <td><code className="slug-code">/invitacion/{item.slug}</code></td>
              <td><div className="row-actions invitation-actions"><Link className="text-button" href={`/invitacion/${item.slug}`} target="_blank">Vista previa</Link><button className="text-button" onClick={() => abrirEditar(item)}>Editar</button><button className="text-button" onClick={() => cambiarEstado(item)}>{item.estado === "publicada" ? "Pausar" : "Publicar"}</button><button className="text-button danger" onClick={() => setAEliminar(item)}>Eliminar</button></div></td>
            </tr>; })}
          </tbody></table></div>
        )}
      </section>

      {modalAbierto && <div className="modal-backdrop" onMouseDown={cerrar}><section className="modal-card invitation-form-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-header"><div><p className="eyebrow">{editandoId ? "Actualizar diseño" : "Nuevo proyecto"}</p><h2>{editandoId ? "Editar invitación" : "Crear invitación"}</h2></div><button className="modal-close" onClick={cerrar}>×</button></header>
        {eventos.length === 0 ? <div className="event-no-clients"><strong>Primero necesitas crear un evento.</strong><p>La invitación obtiene del evento la fecha, hora, lugar y cliente.</p><Link href="/admin/eventos" className="button button-primary">Ir a eventos</Link></div> : <form className="form invitation-form" onSubmit={guardar}>
          <div className="grid2"><label>Evento <span className="required">*</span><select value={form.eventoId} onChange={(e) => { const evento = eventosPorId.get(e.target.value); setForm({ ...form, eventoId: e.target.value, titulo: form.titulo || evento?.nombre || "", slug: form.slug || slugify(evento?.nombre || "") }); }}><option value="">Selecciona un evento</option>{eventos.map((evento) => <option value={evento.id} key={evento.id}>{evento.nombre}</option>)}</select></label><label>Estado<select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoInvitacion })}><option value="borrador">Borrador</option><option value="publicada">Publicada</option><option value="pausada">Pausada</option></select></label></div>
          <label>Título <span className="required">*</span><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value, slug: editandoId ? form.slug : slugify(e.target.value) })} placeholder="XV años de Valeria" /></label>
          <div className="grid2"><label>Enlace personalizado <span className="required">*</span><div className="slug-input"><span>/invitacion/</span><input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="xv-valeria" /></div></label><label>Plantilla<select value={form.plantilla} onChange={(e) => setForm({ ...form, plantilla: e.target.value })}><option value="elegante">Elegante</option><option value="minimalista">Minimalista</option><option value="floral">Floral</option></select></label></div>
          <label>Mensaje principal<textarea rows={3} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} /></label>
          <div className="grid2"><label>Código de vestimenta<input value={form.vestimenta} onChange={(e) => setForm({ ...form, vestimenta: e.target.value })} placeholder="Formal" /></label><label>Color principal<div className="color-field"><input type="color" value={form.colorPrincipal} onChange={(e) => setForm({ ...form, colorPrincipal: e.target.value })} /><input value={form.colorPrincipal} onChange={(e) => setForm({ ...form, colorPrincipal: e.target.value })} /></div></label></div>
          <div className="grid2"><label>Google Maps<input type="url" value={form.mapaUrl} onChange={(e) => setForm({ ...form, mapaUrl: e.target.value })} placeholder="https://maps.google.com/..." /></label><label>WhatsApp<input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="5219991234567" /></label></div>
          {error && <p className="form-error">{error}</p>}
          <footer className="modal-actions"><button type="button" className="button button-ghost" onClick={cerrar}>Cancelar</button><button className="button button-primary" type="submit">{editandoId ? "Guardar cambios" : "Crear invitación"}</button></footer>
        </form>}
      </section></div>}

      {aEliminar && <div className="modal-backdrop delete-backdrop" onMouseDown={() => setAEliminar(null)}><section className="delete-modal" role="alertdialog" onMouseDown={(e) => e.stopPropagation()}><div className="delete-icon">✕</div><div className="delete-heading"><h2>Eliminar invitación</h2><p>El enlace público dejará de estar disponible en esta computadora.</p></div><div className="delete-client-summary"><span className="client-avatar delete-avatar">{initials(aEliminar.titulo)}</span><div className="delete-client-details"><strong>{aEliminar.titulo}</strong><span>/invitacion/{aEliminar.slug}</span><div className="delete-contact-list"><span>{eventosPorId.get(aEliminar.eventoId)?.nombre || "Evento no disponible"}</span><span>Estado: {aEliminar.estado}</span></div></div></div><div className="delete-warning"><strong>Importante</strong><p>Esta acción no puede deshacerse. El evento y el cliente no serán eliminados.</p></div><div className="delete-actions"><button className="button button-outline" onClick={() => setAEliminar(null)}>Cancelar</button><button className="button button-danger" onClick={eliminar}>Sí, eliminar invitación</button></div></section></div>}
    </div>
  );
}
