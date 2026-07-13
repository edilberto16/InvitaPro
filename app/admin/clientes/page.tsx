"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  notas: string;
  creadoEn: string;
};

type ClienteForm = Omit<Cliente, "id" | "creadoEn">;

const STORAGE_KEY = "invitapro_clientes_v1";
const EMPTY_FORM: ClienteForm = { nombre: "", telefono: "", correo: "", notas: "" };

const demoClientes: Cliente[] = [
  {
    id: "demo-1",
    nombre: "María López",
    telefono: "999 123 4567",
    correo: "maria@ejemplo.com",
    notas: "Cliente de demostración para XV años.",
    creadoEn: "2026-07-13T12:00:00.000Z",
  },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<ClienteForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [cargado, setCargado] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);

  useEffect(() => {
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      try {
        setClientes(JSON.parse(guardados) as Cliente[]);
      } catch {
        setClientes(demoClientes);
      }
    } else {
      setClientes(demoClientes);
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (cargado) localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
  }, [clientes, cargado]);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return clientes;
    return clientes.filter((cliente) =>
      [cliente.nombre, cliente.telefono, cliente.correo]
        .join(" ")
        .toLowerCase()
        .includes(termino),
    );
  }, [busqueda, clientes]);

  function abrirNuevo() {
    setEditandoId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalAbierto(true);
  }

  function abrirEdicion(cliente: Cliente) {
    setEditandoId(cliente.id);
    setForm({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo,
      notas: cliente.notas,
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

  function guardarCliente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nombre = form.nombre.trim();
    const telefono = form.telefono.trim();
    const correo = form.correo.trim();

    if (!nombre) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }

    if (correo && !/^\S+@\S+\.\S+$/.test(correo)) {
      setError("Escribe un correo electrónico válido.");
      return;
    }

    if (editandoId) {
      setClientes((actuales) =>
        actuales.map((cliente) =>
          cliente.id === editandoId
            ? { ...cliente, nombre, telefono, correo, notas: form.notas.trim() }
            : cliente,
        ),
      );
    } else {
      const nuevo: Cliente = {
        id: crypto.randomUUID(),
        nombre,
        telefono,
        correo,
        notas: form.notas.trim(),
        creadoEn: new Date().toISOString(),
      };
      setClientes((actuales) => [nuevo, ...actuales]);
    }

    cerrarModal();
  }

  function solicitarEliminar(cliente: Cliente) {
    setClienteAEliminar(cliente);
  }

  function cancelarEliminar() {
    setClienteAEliminar(null);
  }

  function confirmarEliminar() {
    if (!clienteAEliminar) return;
    setClientes((actuales) => actuales.filter((item) => item.id !== clienteAEliminar.id));
    setClienteAEliminar(null);
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Gestión comercial</p>
          <h1>Clientes</h1>
          <p>Registra y administra a las personas que contratan tus invitaciones.</p>
        </div>
        <button type="button" className="button button-primary" onClick={abrirNuevo}>
          + Nuevo cliente
        </button>
      </section>

      <section className="stats-grid clients-stats">
        <article className="stat-card">
          <span>Total de clientes</span>
          <strong>{clientes.length}</strong>
          <small>Guardados en esta computadora</small>
        </article>
        <article className="stat-card">
          <span>Con correo</span>
          <strong>{clientes.filter((cliente) => cliente.correo).length}</strong>
          <small>Listos para contacto digital</small>
        </article>
        <article className="stat-card">
          <span>Con teléfono</span>
          <strong>{clientes.filter((cliente) => cliente.telefono).length}</strong>
          <small>Disponibles para WhatsApp</small>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-header client-toolbar">
          <div>
            <h2>Directorio de clientes</h2>
            <p>Busca, edita o elimina registros.</p>
          </div>
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre, teléfono o correo"
              aria-label="Buscar clientes"
            />
          </label>
        </div>

        {filtrados.length === 0 ? (
          <div className="empty-state compact-empty">
            <div className="empty-icon">+</div>
            <h2>No encontramos clientes</h2>
            <p>{busqueda ? "Prueba con otro término de búsqueda." : "Crea tu primer cliente para comenzar."}</p>
            {!busqueda && (
              <button type="button" className="button button-primary" onClick={abrirNuevo}>
                Crear cliente
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table clients-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <div className="client-name-cell">
                        <span className="client-avatar">{cliente.nombre.slice(0, 2).toUpperCase()}</span>
                        <div>
                          <strong>{cliente.nombre}</strong>
                          <span>{cliente.notas || "Sin notas"}</span>
                        </div>
                      </div>
                    </td>
                    <td>{cliente.telefono || "—"}</td>
                    <td>{cliente.correo || "—"}</td>
                    <td>{new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(cliente.creadoEn))}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="text-button" onClick={() => abrirEdicion(cliente)}>Editar</button>
                        <button type="button" className="text-button danger" onClick={() => solicitarEliminar(cliente)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalAbierto && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) cerrarModal();
        }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="client-modal-title">
            <div className="modal-header">
              <div>
                <p className="eyebrow">{editandoId ? "Actualizar registro" : "Nuevo registro"}</p>
                <h2 id="client-modal-title">{editandoId ? "Editar cliente" : "Crear cliente"}</h2>
              </div>
              <button type="button" className="modal-close" onClick={cerrarModal} aria-label="Cerrar">×</button>
            </div>

            <form className="form client-form" onSubmit={guardarCliente}>
              <label>
                Nombre completo <span className="required">*</span>
                <input
                  autoFocus
                  value={form.nombre}
                  onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                  placeholder="Ej. María López García"
                />
              </label>
              <div className="grid2">
                <label>
                  Teléfono / WhatsApp
                  <input
                    value={form.telefono}
                    onChange={(event) => setForm({ ...form, telefono: event.target.value })}
                    placeholder="999 123 4567"
                  />
                </label>
                <label>
                  Correo electrónico
                  <input
                    type="email"
                    value={form.correo}
                    onChange={(event) => setForm({ ...form, correo: event.target.value })}
                    placeholder="cliente@correo.com"
                  />
                </label>
              </div>
              <label>
                Notas
                <textarea
                  rows={4}
                  value={form.notas}
                  onChange={(event) => setForm({ ...form, notas: event.target.value })}
                  placeholder="Preferencias, tipo de evento o información importante"
                />
              </label>

              {error && <p className="form-error" role="alert">{error}</p>}

              <div className="modal-actions">
                <button type="button" className="button button-ghost" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="button button-primary">{editandoId ? "Guardar cambios" : "Crear cliente"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {clienteAEliminar && (
        <div
          className="modal-backdrop delete-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) cancelarEliminar();
          }}
        >
          <section
            className="delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-client-title"
            aria-describedby="delete-client-description"
          >
            <div className="delete-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
              </svg>
            </div>

            <div className="delete-heading">
              <h2 id="delete-client-title">Eliminar cliente</h2>
              <p id="delete-client-description">
                Esta acción eliminará el registro y no podrá deshacerse.
              </p>
            </div>

            <div className="delete-client-summary">
              <span className="client-avatar delete-avatar">
                {clienteAEliminar.nombre.slice(0, 2).toUpperCase()}
              </span>
              <div className="delete-client-details">
                <strong>{clienteAEliminar.nombre}</strong>
                <span>{clienteAEliminar.notas || "Sin notas"}</span>
                <div className="delete-contact-list">
                  {clienteAEliminar.telefono && <span>☎ {clienteAEliminar.telefono}</span>}
                  {clienteAEliminar.correo && <span>✉ {clienteAEliminar.correo}</span>}
                </div>
              </div>
            </div>

            <div className="delete-warning">
              <strong>Importante</strong>
              <p>
                Si este cliente tiene eventos, invitaciones o invitados asociados,
                esa información también podría verse afectada cuando conectemos la base de datos.
              </p>
            </div>

            <div className="delete-actions">
              <button type="button" className="button button-outline" onClick={cancelarEliminar}>
                Cancelar
              </button>
              <button type="button" className="button button-danger" onClick={confirmarEliminar} autoFocus>
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
                Sí, eliminar cliente
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
