"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Cliente = { id: string; nombre: string; telefono: string; correo: string };
type Evento = { id: string; clienteId: string; nombre: string; fecha: string; hora: string };
type Invitacion = { id: string; eventoId: string; titulo: string; slug: string; estado: "borrador" | "publicada" | "pausada"; colorPrincipal: string };
type EstadoInvitado = "pendiente" | "confirmado" | "declinado";
type Invitado = {
  id: string;
  invitacionId: string;
  nombre: string;
  telefono: string;
  correo: string;
  adultos: number;
  ninos: number;
  mesa: string;
  codigo: string;
  estado: EstadoInvitado;
  notas: string;
  creadoEn: string;
};
type InvitadoForm = Omit<Invitado, "id" | "creadoEn">;

const CLIENTES_KEY = "invitapro_clientes_v1";
const EVENTOS_KEY = "invitapro_eventos_v1";
const INVITACIONES_KEY = "invitapro_invitaciones_v1";
const INVITADOS_KEY = "invitapro_invitados_v1";
const EMPTY_FORM: InvitadoForm = {
  invitacionId: "",
  nombre: "",
  telefono: "",
  correo: "",
  adultos: 1,
  ninos: 0,
  mesa: "",
  codigo: "",
  estado: "pendiente",
  notas: "",
};

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 7 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}
function initials(value: string) {
  return value.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "IN";
}
function formatDate(value: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function InvitadosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroInvitacion, setFiltroInvitacion] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | EstadoInvitado>("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Invitado | null>(null);
  const [form, setForm] = useState<InvitadoForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState("");
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try { setClientes(JSON.parse(localStorage.getItem(CLIENTES_KEY) || "[]")); } catch { setClientes([]); }
    try { setEventos(JSON.parse(localStorage.getItem(EVENTOS_KEY) || "[]")); } catch { setEventos([]); }
    try { setInvitaciones(JSON.parse(localStorage.getItem(INVITACIONES_KEY) || "[]")); } catch { setInvitaciones([]); }
    try { setInvitados(JSON.parse(localStorage.getItem(INVITADOS_KEY) || "[]")); } catch { setInvitados([]); }
    setCargado(true);
  }, []);
  useEffect(() => { if (cargado) localStorage.setItem(INVITADOS_KEY, JSON.stringify(invitados)); }, [invitados, cargado]);

  const eventosPorId = useMemo(() => new Map(eventos.map((item) => [item.id, item])), [eventos]);
  const clientesPorId = useMemo(() => new Map(clientes.map((item) => [item.id, item])), [clientes]);
  const invitacionesPorId = useMemo(() => new Map(invitaciones.map((item) => [item.id, item])), [invitaciones]);
  const lista = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    return invitados
      .filter((item) => filtroInvitacion === "todas" || item.invitacionId === filtroInvitacion)
      .filter((item) => filtroEstado === "todos" || item.estado === filtroEstado)
      .filter((item) => {
        if (!term) return true;
        const invitacion = invitacionesPorId.get(item.invitacionId);
        return [item.nombre, item.telefono, item.correo, item.codigo, item.mesa, invitacion?.titulo].join(" ").toLowerCase().includes(term);
      });
  }, [busqueda, filtroInvitacion, filtroEstado, invitados, invitacionesPorId]);

  const totalPases = invitados.reduce((sum, item) => sum + item.adultos + item.ninos, 0);
  const totalConfirmados = invitados.filter((item) => item.estado === "confirmado").reduce((sum, item) => sum + item.adultos + item.ninos, 0);

  function abrirNuevo() {
    const primera = invitaciones.find((item) => item.estado === "publicada") || invitaciones[0];
    setEditandoId(null);
    setForm({ ...EMPTY_FORM, invitacionId: primera?.id || "", codigo: generateCode() });
    setError("");
    setModalAbierto(true);
  }
  function abrirEditar(item: Invitado) {
    setEditandoId(item.id);
    setForm({ invitacionId: item.invitacionId, nombre: item.nombre, telefono: item.telefono, correo: item.correo, adultos: item.adultos, ninos: item.ninos, mesa: item.mesa, codigo: item.codigo, estado: item.estado, notas: item.notas });
    setError("");
    setModalAbierto(true);
  }
  function cerrar() { setModalAbierto(false); setEditandoId(null); setForm(EMPTY_FORM); setError(""); }
  function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = form.codigo.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!form.invitacionId) return setError("Selecciona la invitación que recibirá este invitado.");
    if (!form.nombre.trim()) return setError("Escribe el nombre del invitado o de la familia.");
    if (form.adultos < 0 || form.ninos < 0 || form.adultos + form.ninos < 1) return setError("Asigna al menos un pase válido.");
    if (!code) return setError("Genera un código válido para el enlace personalizado.");
    if (invitados.some((item) => item.codigo === code && item.id !== editandoId)) return setError("Ese código ya pertenece a otro invitado.");
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) return setError("Escribe un correo electrónico válido.");
    const datos = { ...form, nombre: form.nombre.trim(), telefono: form.telefono.replace(/\D/g, ""), correo: form.correo.trim().toLowerCase(), adultos: Number(form.adultos), ninos: Number(form.ninos), mesa: form.mesa.trim(), codigo: code, notas: form.notas.trim() };
    if (editandoId) setInvitados((actuales) => actuales.map((item) => item.id === editandoId ? { ...item, ...datos } : item));
    else setInvitados((actuales) => [{ id: crypto.randomUUID(), creadoEn: new Date().toISOString(), ...datos }, ...actuales]);
    cerrar();
  }
  function eliminar() { if (aEliminar) setInvitados((actuales) => actuales.filter((item) => item.id !== aEliminar.id)); setAEliminar(null); }
  async function copiarEnlace(item: Invitado) {
    const invitacion = invitacionesPorId.get(item.invitacionId);
    if (!invitacion) return;
    const url = `${window.location.origin}/invitacion/${invitacion.slug}/${item.codigo}`;
    try { await navigator.clipboard.writeText(url); setCopiado(item.id); setTimeout(() => setCopiado(""), 1800); } catch { window.prompt("Copia este enlace:", url); }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">Control de accesos</p><h1>Invitados y pases</h1><p>Crea enlaces individuales y define cuántos adultos y niños puede registrar cada familia.</p></div>
        <button className="button button-primary" type="button" onClick={abrirNuevo}>+ Nuevo invitado</button>
      </section>

      <section className="stats-grid guest-stats">
        <article className="stat-card"><span>Registros</span><strong>{invitados.length}</strong><small>Familias o invitados</small></article>
        <article className="stat-card"><span>Pases asignados</span><strong>{totalPases}</strong><small>Adultos y niños</small></article>
        <article className="stat-card"><span>Confirmados</span><strong>{totalConfirmados}</strong><small>Pases confirmados</small></article>
        <article className="stat-card"><span>Pendientes</span><strong>{invitados.filter((x) => x.estado === "pendiente").length}</strong><small>Registros por responder</small></article>
      </section>

      <section className="panel-card">
        <div className="panel-header events-toolbar">
          <div><h2>Lista de invitados</h2><p>Administra pases, mesas y enlaces personalizados.</p></div>
          <div className="guest-filters">
            <label className="search-field"><span>⌕</span><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar nombre, código o teléfono" /></label>
            <select className="status-filter" value={filtroInvitacion} onChange={(e) => setFiltroInvitacion(e.target.value)}><option value="todas">Todas las invitaciones</option>{invitaciones.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select>
            <select className="status-filter guest-status-filter" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}><option value="todos">Todos los estados</option><option value="pendiente">Pendiente</option><option value="confirmado">Confirmado</option><option value="declinado">No asistirá</option></select>
          </div>
        </div>

        {lista.length === 0 ? (
          <div className="empty-state compact-empty"><div className="empty-icon">♚</div><h2>{invitados.length ? "No encontramos coincidencias" : "Aún no hay invitados"}</h2><p>{invitaciones.length ? "Agrega una familia o invitado y genera su pase personalizado." : "Primero crea una invitación para poder asignar pases."}</p>{invitaciones.length ? <button className="button button-primary" onClick={abrirNuevo}>Agregar invitado</button> : <Link className="button button-primary" href="/admin/invitaciones">Ir a invitaciones</Link>}</div>
        ) : (
          <div className="table-wrap"><table className="data-table guest-table"><thead><tr><th>Invitado</th><th>Invitación</th><th>Pases</th><th>Mesa</th><th>Estado</th><th>Código</th><th>Acciones</th></tr></thead><tbody>
            {lista.map((item) => {
              const invitacion = invitacionesPorId.get(item.invitacionId);
              const evento = invitacion ? eventosPorId.get(invitacion.eventoId) : undefined;
              const cliente = evento ? clientesPorId.get(evento.clienteId) : undefined;
              return <tr key={item.id}>
                <td><div className="guest-name-cell"><span className="client-avatar">{initials(item.nombre)}</span><div><strong>{item.nombre}</strong><span>{item.telefono || item.correo || "Sin contacto"}</span></div></div></td>
                <td><strong>{invitacion?.titulo || "Invitación no disponible"}</strong><span>{evento ? `${formatDate(evento.fecha)} · ${cliente?.nombre || "Sin cliente"}` : "Evento no disponible"}</span></td>
                <td><div className="pass-badges"><span>{item.adultos} adulto{item.adultos === 1 ? "" : "s"}</span><span>{item.ninos} niño{item.ninos === 1 ? "" : "s"}</span></div></td>
                <td><strong>{item.mesa || "Sin asignar"}</strong></td>
                <td><span className={`guest-status guest-status-${item.estado}`}>{item.estado === "pendiente" ? "Pendiente" : item.estado === "confirmado" ? "Confirmado" : "No asistirá"}</span></td>
                <td><code className="guest-code">{item.codigo}</code></td>
                <td><div className="row-actions guest-actions"><button type="button" onClick={() => copiarEnlace(item)}>{copiado === item.id ? "Copiado ✓" : "Copiar enlace"}</button>{invitacion && <Link href={`/invitacion/${invitacion.slug}/${item.codigo}`} target="_blank">Vista previa</Link>}<button type="button" onClick={() => abrirEditar(item)}>Editar</button><button className="danger-link" type="button" onClick={() => setAEliminar(item)}>Eliminar</button></div></td>
              </tr>;
            })}
          </tbody></table></div>
        )}
      </section>

      {modalAbierto && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) cerrar(); }}><section className="form-modal guest-form-modal" role="dialog" aria-modal="true" aria-labelledby="guest-form-title">
        <div className="modal-header"><div><p className="eyebrow">Pase personalizado</p><h2 id="guest-form-title">{editandoId ? "Editar invitado" : "Nuevo invitado"}</h2><p>Define quién recibirá el enlace y cuántos lugares tiene disponibles.</p></div><button className="modal-close" type="button" onClick={cerrar} aria-label="Cerrar">×</button></div>
        {invitaciones.length === 0 ? <div className="event-no-clients"><h3>No hay invitaciones disponibles</h3><p>Crea primero una invitación para asociar el invitado.</p><Link className="button button-primary" href="/admin/invitaciones">Crear invitación</Link></div> : <form className="guest-form-redesign" onSubmit={guardar}>
          <div className="guest-form-scroll">
            <section className="guest-form-section">
              <div className="guest-form-section-title"><span>1</span><div><strong>Invitación e invitado</strong><small>Selecciona el evento y captura a quién se enviará el pase.</small></div></div>
              <div className="guest-form-grid">
                <label className="form-field form-field-full"><span>Invitación *</span><select value={form.invitacionId} onChange={(e) => setForm({ ...form, invitacionId: e.target.value })}><option value="">Seleccionar invitación</option>{invitaciones.map((item) => <option key={item.id} value={item.id}>{item.titulo} · {item.estado}</option>)}</select></label>
                <label className="form-field form-field-full"><span>Nombre o familia *</span><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Familia López García" autoFocus /></label>
                <label className="form-field"><span>Teléfono</span><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} inputMode="tel" placeholder="999 123 4567" /></label>
                <label className="form-field"><span>Correo</span><input value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} type="email" placeholder="familia@ejemplo.com" /></label>
              </div>
            </section>

            <section className="guest-form-section">
              <div className="guest-form-section-title"><span>2</span><div><strong>Pases y ubicación</strong><small>Define cuántos lugares tendrá disponibles y dónde se sentará.</small></div></div>
              <div className="guest-form-grid guest-form-grid-compact">
                <label className="form-field"><span>Adultos *</span><input value={form.adultos} onChange={(e) => setForm({ ...form, adultos: Math.max(0, Number(e.target.value)) })} type="number" min="0" max="30" /></label>
                <label className="form-field"><span>Niños</span><input value={form.ninos} onChange={(e) => setForm({ ...form, ninos: Math.max(0, Number(e.target.value)) })} type="number" min="0" max="30" /></label>
                <label className="form-field"><span>Mesa</span><input value={form.mesa} onChange={(e) => setForm({ ...form, mesa: e.target.value })} placeholder="Ej. Mesa 8" /></label>
                <label className="form-field"><span>Estado</span><select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoInvitado })}><option value="pendiente">Pendiente</option><option value="confirmado">Confirmado</option><option value="declinado">No asistirá</option></select></label>
              </div>
            </section>

            <section className="guest-form-section">
              <div className="guest-form-section-title"><span>3</span><div><strong>Acceso personalizado</strong><small>Este código formará parte del enlace privado del invitado.</small></div></div>
              <div className="guest-form-grid">
                <label className="form-field form-field-full"><span>Código del pase *</span><div className="code-generator"><input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} maxLength={12} /><button className="button button-outline" type="button" onClick={() => setForm({ ...form, codigo: generateCode() })}>Generar otro</button></div><small>Usa letras y números. Evita nombres o datos personales.</small></label>
                <label className="form-field form-field-full"><span>Notas internas</span><textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={3} placeholder="Preferencias, parentesco, indicaciones especiales…" /></label>
              </div>
            </section>

            {error && <p className="form-error">{error}</p>}
          </div>
          <div className="guest-form-footer"><button className="button button-outline" type="button" onClick={cerrar}>Cancelar</button><button className="button button-primary" type="submit">{editandoId ? "Guardar cambios" : "Crear pase"}</button></div>
        </form>}
      </section></div>}

      {aEliminar && <div className="modal-backdrop delete-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAEliminar(null); }}><section className="delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-guest-title">
        <div className="delete-icon" aria-hidden="true">♚</div><h2 id="delete-guest-title">Eliminar invitado</h2><p className="delete-description">Se eliminará el pase y su enlace personalizado. Esta acción no puede deshacerse.</p>
        <div className="delete-client-summary"><span className="client-avatar delete-avatar">{initials(aEliminar.nombre)}</span><div className="delete-client-details"><strong>{aEliminar.nombre}</strong><span>{aEliminar.adultos} adulto{aEliminar.adultos === 1 ? "" : "s"} · {aEliminar.ninos} niño{aEliminar.ninos === 1 ? "" : "s"}</span><div className="delete-contact-list"><span>Código: {aEliminar.codigo}</span>{aEliminar.mesa && <span>{aEliminar.mesa}</span>}</div></div></div>
        <div className="delete-warning"><strong>Importante</strong><p>El enlace dejará de reconocer a este invitado inmediatamente.</p></div>
        <div className="delete-actions"><button className="button button-outline" type="button" onClick={() => setAEliminar(null)}>Cancelar</button><button className="button button-danger" type="button" onClick={eliminar}>Eliminar invitado</button></div>
      </section></div>}
    </div>
  );
}
