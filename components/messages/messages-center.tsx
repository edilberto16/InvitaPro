'use client';

import { useMemo, useState } from 'react';

export type WishMessageRecord = {
  id: string;
  invitacion_id: string;
  nombre: string;
  mensaje: string;
  aprobado: boolean;
  destacado: boolean;
  created_at: string;
};

type MessageFilter = 'todos' | 'pendientes' | 'aprobados' | 'destacados';

type Props = {
  invitationTitle: string;
  messages: WishMessageRecord[];
  busyId?: string | null;
  onApprove: (message: WishMessageRecord) => void;
  onHide: (message: WishMessageRecord) => void;
  onToggleFeatured: (message: WishMessageRecord) => void;
  onDelete: (message: WishMessageRecord) => void;
};

function initials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'IP';
}

export default function MessagesCenter({
  invitationTitle,
  messages,
  busyId,
  onApprove,
  onHide,
  onToggleFeatured,
  onDelete,
}: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MessageFilter>('todos');

  const summary = useMemo(() => ({
    total: messages.length,
    pending: messages.filter((item) => !item.aprobado).length,
    approved: messages.filter((item) => item.aprobado).length,
    featured: messages.filter((item) => item.destacado).length,
  }), [messages]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return messages.filter((item) => {
      if (filter === 'pendientes' && item.aprobado) return false;
      if (filter === 'aprobados' && !item.aprobado) return false;
      if (filter === 'destacados' && !item.destacado) return false;
      if (!term) return true;
      return `${item.nombre} ${item.mensaje}`.toLowerCase().includes(term);
    });
  }, [messages, search, filter]);

  function exportCsv() {
    if (!messages.length) return;
    const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = messages.map((item) => [
      item.nombre,
      item.mensaje,
      item.aprobado ? 'Aprobado' : 'Pendiente',
      item.destacado ? 'Sí' : 'No',
      item.created_at,
    ]);
    const csv = [
      ['Nombre', 'Mensaje', 'Estado', 'Destacado', 'Fecha'],
      ...rows,
    ].map((row) => row.map(quote).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `mensajes-${invitationTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  return (
    <section id="mensajes" className="messages-center">
      <header className="messages-center-heading">
        <div>
          <p className="eyebrow">Buzón de deseos</p>
          <h2>Mensajes para los anfitriones</h2>
          <p>Modera, destaca y consulta los buenos deseos recibidos para {invitationTitle}.</p>
        </div>
        <button type="button" className="client-secondary" onClick={exportCsv} disabled={!messages.length}>
          Exportar CSV
        </button>
      </header>

      <div className="messages-center-stats">
        <article><span>Total</span><strong>{summary.total}</strong><small>Mensajes recibidos</small></article>
        <article className="is-warning"><span>Pendientes</span><strong>{summary.pending}</strong><small>Por revisar</small></article>
        <article className="is-success"><span>Aprobados</span><strong>{summary.approved}</strong><small>Visibles para moderación</small></article>
        <article className="is-featured"><span>Destacados</span><strong>{summary.featured}</strong><small>Mensajes favoritos</small></article>
      </div>

      <div className="messages-center-toolbar">
        <label className="confirmation-search">
          <span>⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o contenido" />
        </label>
        <div className="messages-center-filters" role="group" aria-label="Filtrar mensajes">
          {([
            ['todos', 'Todos'],
            ['pendientes', 'Pendientes'],
            ['aprobados', 'Aprobados'],
            ['destacados', 'Destacados'],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="messages-center-list">
          {filtered.map((item) => {
            const busy = busyId === item.id;
            return (
              <article key={item.id} className={`${item.aprobado ? 'is-approved' : 'is-pending'}${item.destacado ? ' is-featured' : ''}`}>
                <span className="messages-center-avatar">{initials(item.nombre)}</span>
                <div className="messages-center-copy">
                  <div>
                    <strong>{item.nombre}</strong>
                    <time>{new Date(item.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                  </div>
                  <blockquote>“{item.mensaje}”</blockquote>
                  <div className="messages-center-badges">
                    <span className={item.aprobado ? 'status-approved' : 'status-pending'}>{item.aprobado ? 'Aprobado' : 'Pendiente'}</span>
                    {item.destacado && <span className="status-featured">★ Destacado</span>}
                  </div>
                </div>
                <div className="messages-center-actions">
                  {item.aprobado ? (
                    <button type="button" className="client-secondary" disabled={busy} onClick={() => onHide(item)}>Ocultar</button>
                  ) : (
                    <button type="button" className="client-primary" disabled={busy} onClick={() => onApprove(item)}>Aprobar</button>
                  )}
                  <button type="button" className="client-secondary" disabled={busy} onClick={() => onToggleFeatured(item)}>
                    {item.destacado ? 'Quitar destacado' : 'Destacar'}
                  </button>
                  <button type="button" className="client-danger-outline" disabled={busy} onClick={() => onDelete(item)}>Eliminar</button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="client-guest-empty">
          <strong>{messages.length ? 'No hay mensajes en este filtro' : 'Aún no has recibido mensajes'}</strong>
          <p>{messages.length ? 'Prueba otro filtro o término de búsqueda.' : 'Los mensajes enviados desde el Buzón de deseos aparecerán aquí.'}</p>
        </div>
      )}
    </section>
  );
}
