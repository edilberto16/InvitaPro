"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  notas: string;
  creadoEn: string;
};

type EstadoEvento = "borrador" | "confirmado" | "finalizado";

type Evento = {
  id: string;
  clienteId: string;
  nombre: string;
  tipo: string;
  fecha: string;
  hora: string;
  lugar: string;
  direccion: string;
  estado: EstadoEvento;
  notas: string;
  creadoEn: string;
};

type EventoForm = Omit<Evento, "id" | "creadoEn">;

const CLIENTES_KEY = "invitapro_clientes_v1";
const EVENTOS_KEY = "invitapro_eventos_v1";
const EMPTY_FORM: EventoForm = {
  clienteId: "",
  nombre: "",
  tipo: "XV años",
  fecha: "",
  hora: "18:00",
  lugar: "",
  direccion: "",
  estado: "borrador",
  notas: "",
};

const TIPOS_EVENTO = [
  "XV años",
  "Boda",
  "Cumpleaños",
  "Baby shower",
  "Bautizo",
  "Graduación",
  "Evento empresarial",
  "Otro",
];

function formatDate(fecha: string) {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${fecha}T00:00:00Z`));
}

function initials(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("") || "EV";
}

function eventTimestamp(evento: Evento) {
  return new Date(`${evento.fecha || "2999-12-31"}T${evento.hora || "00:00"}:00`).getTime();
}

export default function EventosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | EstadoEvento>("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [eventoAEliminar, setEventoAEliminar] = useState<Evento | null>(null);
  const [form, setForm] = useState<EventoForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const clientesGuardados = localStorage.getItem(CLIENTES_KEY);
      setClientes(clientesGuardados ? (JSON.parse(clientesGuardados) as Cliente[]) : []);
    } catch {
      setClientes([]);
    }

    try {
      const eventosGuardados = localStorage.getItem(EVENTOS_KEY);
      setEventos(eventosGuardados ? (JSON.parse(eventosGuardados) as Evento[]) : []);
    } catch {
      setEventos([]);
    }

    setCargado(true);
  }, []);

  useEffect(() => {
    if (cargado) localStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos));
  }, [eventos, cargado]);

  const clientesPorId = useMemo(
    () => new Map(clientes.map((cliente) => [cliente.id, cliente])),
    [clientes],
  );

  const eventosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return [...eventos]
      .filter((evento) => filtroEstado === "todos" || evento.estado === filtroEstado)
      .filter((evento) => {
        if (!termino) return true;
        const cliente = clientesPorId.get(evento.clienteId)?.nombre ?? "";
        return [evento.nombre, evento.tipo, evento.lugar, cliente]
          .join(" ")
          .toLowerCase()
          .includes(termino);
      })
      .sort((a, b) => eventTimestamp(a) - eventTimestamp(b));
  }, [busqueda, clientesPorId, eventos, filtroEstado]);

  const ahora = new Date();
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
  const proximos = eventos.filter(
    (evento) => evento.estado !== "finalizado" && eventTimestamp(evento) >= inicioHoy,
  ).length;
  const esteMes = eventos.filter((evento) => {
    if (!evento.fecha) return false;
    const fecha = new Date(`${evento.fecha}T00:00:00`);
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
  }).length;

  function abrirNuevo() {
    setEditandoId(null);
    setForm({ ...EMPTY_FORM, clienteId: clientes[0]?.id ?? "" });
    setError("");
    setModalAbierto(true);
  }

  function abrirEdicion(evento: Evento) {
    setEditandoId(evento.id);
    setForm({
      clienteId: evento.clienteId,
      nombre: evento.nombre,
      tipo: evento.tipo,
      fecha: evento.fecha,
      hora: evento.hora,
      lugar: evento.lugar,
      direccion: evento.direccion,
      estado: evento.estado,
      notas: evento.notas,
    });
    setError("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  function guardarEvento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.clienteId) {
      setError("Selecciona un cliente para este evento.");
      return;
    }
    if (!form.nombre.trim()) {
      setError("El nombre del evento es obligatorio.");
      return;
    }
    if (!form.fecha) {
      setError("Selecciona la fecha del evento.");
      return;
    }

    const datos: EventoForm = {
      ...form,
      nombre: form.nombre.trim(),
      lugar: form.lugar.trim(),
      direccion: form.direccion.trim(),
      notas: form.notas.trim(),
    };

    if (editandoId) {
      setEventos((actuales) =>
        actuales.map((eventoActual) =>
          eventoActual.id === editandoId ? { ...eventoActual, ...datos } : eventoActual,
        ),
      );
    } else {
      setEventos((actuales) => [
        { id: crypto.randomUUID(), creadoEn: new Date().toISOString(), ...datos },
        ...actuales,
      ]);
    }

    cerrarModal();
  }

  function confirmarEliminar() {
    if (!eventoAEliminar) return;
    setEventos((actuales) => actuales.filter((evento) => evento.id !== eventoAEliminar.id));
    setEventoAEliminar(null);
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Organización de eventos</p>
          <h1>Eventos</h1>
          <p>Relaciona cada celebración con su cliente, fecha y lugar.</p>
        </div>
        <button type="button" className="button button-primary" onClick={abrirNuevo}>
          + Nuevo evento
        </button>
      </section>

      <section className="stats-grid events-stats">
        <article className="stat-card">
          <span>Total de eventos</span>
          <strong>{eventos.length}</strong>
          <small>Registrados en esta computadora</small>
        </article>
        <article className="stat-card">
          <span>Próximos</span>
          <strong>{proximos}</strong>
          <small>Pendientes o confirmados</small>
        </article>
        <article className="stat-card">
          <span>Este mes</span>
          <strong>{esteMes}</strong>
          <small>Según la fecha del evento</small>
        </article>
        <article className="stat-card">
          <span>Borradores</span>
          <strong>{eventos.filter((evento) => evento.estado === "borrador").length}</strong>
          <small>Requieren revisión</small>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-header events-toolbar">
          <div>
            <h2>Agenda de eventos</h2>
            <p>Busca, filtra y administra tus celebraciones.</p>
          </div>
          <div className="events-filters">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar evento, cliente o lugar"
                aria-label="Buscar eventos"
              />
            </label>
            <select
              className="status-filter"
              value={filtroEstado}
              onChange={(event) => setFiltroEstado(event.target.value as "todos" | EstadoEvento)}
              aria-label="Filtrar eventos por estado"
            >
              <option value="todos">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="confirmado">Confirmado</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
        </div>

        {eventosFiltrados.length === 0 ? (
          <div className="empty-state compact-empty">
            <div className="empty-icon">◷</div>
            <h2>{eventos.length === 0 ? "Aún no hay eventos" : "No encontramos coincidencias"}</h2>
            <p>
              {eventos.length === 0
                ? "Crea el primer evento y relaciónalo con uno de tus clientes."
                : "Prueba con otra búsqueda o cambia el filtro de estado."}
            </p>
            {eventos.length === 0 && clientes.length > 0 && (
              <button type="button" className="button button-primary" onClick={abrirNuevo}>
                Crear evento
              </button>
            )}
            {clientes.length === 0 && (
              <Link href="/admin/clientes" className="button button-primary">
                Crear primero un cliente
              </Link>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table events-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Cliente</th>
                  <th>Fecha y hora</th>
                  <th>Lugar</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventosFiltrados.map((evento) => {
                  const cliente = clientesPorId.get(evento.clienteId);
                  return (
                    <tr key={evento.id}>
                      <td>
                        <div className="event-name-cell">
                          <span className="event-avatar">{initials(evento.nombre)}</span>
                          <div>
                            <strong>{evento.nombre}</strong>
                            <span>{evento.tipo}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{cliente?.nombre ?? "Cliente no disponible"}</strong>
                        <span>{cliente?.telefono || cliente?.correo || "Sin datos de contacto"}</span>
                      </td>
                      <td>
                        <strong>{formatDate(evento.fecha)}</strong>
                        <span>{evento.hora ? `${evento.hora} h` : "Hora pendiente"}</span>
                      </td>
                      <td>
                        <strong>{evento.lugar || "Lugar pendiente"}</strong>
                        <span>{evento.direccion || "Sin dirección"}</span>
                      </td>
                      <td>
                        <span className={`event-status event-status-${evento.estado}`}>
                          {evento.estado[0].toUpperCase() + evento.estado.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="text-button" onClick={() => abrirEdicion(evento)}>
                            Editar
                          </button>
                          <button
                            type="button"
                            className="text-button danger"
                            onClick={() => setEventoAEliminar(evento)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalAbierto && (
        <div className="modal-backdrop" role="presentation" onMouseDown={cerrarModal}>
          <section
            className="modal-card event-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <p className="eyebrow">{editandoId ? "Actualizar registro" : "Nuevo registro"}</p>
                <h2 id="event-modal-title">{editandoId ? "Editar evento" : "Crear evento"}</h2>
              </div>
              <button type="button" className="modal-close" onClick={cerrarModal} aria-label="Cerrar">
                ×
              </button>
            </header>

            {clientes.length === 0 ? (
              <div className="event-no-clients">
                <strong>Primero necesitas registrar un cliente.</strong>
                <p>Todo evento debe pertenecer a una persona o empresa responsable.</p>
                <Link href="/admin/clientes" className="button button-primary">
                  Ir a clientes
                </Link>
              </div>
            ) : (
              <form className="form event-form" onSubmit={guardarEvento}>
                <div className="grid2">
                  <label>
                    Cliente <span className="required">*</span>
                    <select
                      value={form.clienteId}
                      onChange={(event) => setForm({ ...form, clienteId: event.target.value })}
                    >
                      <option value="">Selecciona un cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Tipo de evento <span className="required">*</span>
                    <select value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value })}>
                      {TIPOS_EVENTO.map((tipo) => <option key={tipo}>{tipo}</option>)}
                    </select>
                  </label>
                </div>

                <label>
                  Nombre del evento <span className="required">*</span>
                  <input
                    value={form.nombre}
                    onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                    placeholder="Ej. XV años de Valeria"
                    autoFocus
                  />
                </label>

                <div className="grid2">
                  <label>
                    Fecha <span className="required">*</span>
                    <input type="date" value={form.fecha} onChange={(event) => setForm({ ...form, fecha: event.target.value })} />
                  </label>
                  <label>
                    Hora
                    <input type="time" value={form.hora} onChange={(event) => setForm({ ...form, hora: event.target.value })} />
                  </label>
                </div>

                <div className="grid2">
                  <label>
                    Lugar
                    <input value={form.lugar} onChange={(event) => setForm({ ...form, lugar: event.target.value })} placeholder="Salón, iglesia o domicilio" />
                  </label>
                  <label>
                    Estado
                    <select value={form.estado} onChange={(event) => setForm({ ...form, estado: event.target.value as EstadoEvento })}>
                      <option value="borrador">Borrador</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </label>
                </div>

                <label>
                  Dirección
                  <input value={form.direccion} onChange={(event) => setForm({ ...form, direccion: event.target.value })} placeholder="Calle, número, colonia y ciudad" />
                </label>

                <label>
                  Notas
                  <textarea rows={3} value={form.notas} onChange={(event) => setForm({ ...form, notas: event.target.value })} placeholder="Indicaciones, anticipo, preferencias o pendientes" />
                </label>

                {error && <p className="form-error" role="alert">{error}</p>}

                <footer className="modal-actions">
                  <button type="button" className="button button-ghost" onClick={cerrarModal}>Cancelar</button>
                  <button type="submit" className="button button-primary">{editandoId ? "Guardar cambios" : "Crear evento"}</button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}

      {eventoAEliminar && (
        <div className="modal-backdrop delete-backdrop" role="presentation" onMouseDown={() => setEventoAEliminar(null)}>
          <section
            className="delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="delete-icon" aria-hidden="true">✕</div>
            <div className="delete-heading">
              <h2 id="delete-event-title">Eliminar evento</h2>
              <p>Esta acción quitará el evento de tu agenda local y no podrá deshacerse.</p>
            </div>

            <div className="delete-client-summary">
              <span className="client-avatar delete-avatar">{initials(eventoAEliminar.nombre)}</span>
              <div className="delete-client-details">
                <strong>{eventoAEliminar.nombre}</strong>
                <span>{eventoAEliminar.tipo} · {formatDate(eventoAEliminar.fecha)}</span>
                <div className="delete-contact-list">
                  <span>Cliente: {clientesPorId.get(eventoAEliminar.clienteId)?.nombre ?? "No disponible"}</span>
                  <span>{eventoAEliminar.lugar || "Lugar pendiente"}</span>
                </div>
              </div>
            </div>

            <div className="delete-warning">
              <strong>Importante</strong>
              <p>En la siguiente etapa, las invitaciones e invitados asociados también dependerán de este evento.</p>
            </div>

            <div className="delete-actions">
              <button type="button" className="button button-outline" onClick={() => setEventoAEliminar(null)}>Cancelar</button>
              <button type="button" className="button button-danger" onClick={confirmarEliminar}>Sí, eliminar evento</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
