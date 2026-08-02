'use client';

import { useMemo, useState } from 'react';
import type { UnifiedGuestRecord } from '../../lib/services/guest-unified.service';

export type ManagedGuest = UnifiedGuestRecord;

type Segment = 'todos' | 'pendientes' | 'confirmados' | 'rechazados' | 'sin_telefono' | 'con_mesa' | 'checkin';

type Props = {
  invitationTitle: string;
  guests: ManagedGuest[];
  onImport: () => void;
  onShareGeneral: () => void;
  onOpenGuest: (guest: ManagedGuest) => void;
  onShareGuest: (guest: ManagedGuest) => void;
  onDeleteGuests: (guests: ManagedGuest[]) => void;
  onExport: () => void;
};

function initials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'IP'
  );
}

function normalizedStatus(value: string) {
  if (value === 'confirmado') return 'Confirmado';
  if (['no_asistira', 'rechazado'].includes(value)) return 'No asistirá';
  return 'Pendiente';
}

export default function GuestManagementCenter({
  invitationTitle,
  guests,
  onImport,
  onShareGeneral,
  onOpenGuest,
  onShareGuest,
  onDeleteGuests,
  onExport,
}: Props) {
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<Segment>('todos');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const stats = useMemo(() => {
    const confirmed = guests.filter((guest) => guest.estado === 'confirmado').length;
    const rejected = guests.filter((guest) => ['no_asistira', 'rechazado'].includes(guest.estado)).length;
    const arrived = guests.filter((guest) => (guest.checkin_adultos || 0) + (guest.checkin_ninos || 0) > 0).length;
    return { total: guests.length, confirmed, pending: Math.max(guests.length - confirmed - rejected, 0), rejected, arrived };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return guests.filter((guest) => {
      const matchesSearch = !term || [guest.nombre, guest.telefono, guest.correo, guest.codigo, guest.mesa]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
      if (!matchesSearch) return false;
      if (segment === 'pendientes') return guest.estado === 'pendiente';
      if (segment === 'confirmados') return guest.estado === 'confirmado';
      if (segment === 'rechazados') return ['no_asistira', 'rechazado'].includes(guest.estado);
      if (segment === 'sin_telefono') return !guest.telefono;
      if (segment === 'con_mesa') return Boolean(guest.mesa);
      if (segment === 'checkin') return (guest.checkin_adultos || 0) + (guest.checkin_ninos || 0) > 0;
      return true;
    });
  }, [guests, search, segment]);

  const allVisibleSelected = filteredGuests.length > 0 && filteredGuests.every((guest) => selectedIds.includes(guest.id));
  const selectedGuests = guests.filter((guest) => selectedIds.includes(guest.id) && !guest.readonly_record);

  function toggleGuest(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleVisible() {
    const visibleIds = filteredGuests.map((guest) => guest.id);
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  }

  return (
    <section id="invitados" className="guest-management-center">
      <header className="guest-management-header">
        <div>
          <p className="eyebrow">Gestión de invitados</p>
          <h2>{invitationTitle}</h2>
          <p>Importa, segmenta y administra tu lista de invitados desde un solo lugar.</p>
        </div>
        <div className="guest-management-actions">
          <button className="client-secondary" type="button" onClick={onExport} disabled={!guests.length}>Exportar CSV</button>
          <button className="client-secondary" type="button" onClick={onImport}>Importar CSV</button>
          <button className="client-primary" type="button" onClick={onShareGeneral}>Enviar invitación</button>
        </div>
      </header>

      <div className="guest-management-stats">
        <article><span>Total</span><strong>{stats.total}</strong></article>
        <article><span>Confirmados</span><strong>{stats.confirmed}</strong></article>
        <article><span>Pendientes</span><strong>{stats.pending}</strong></article>
        <article><span>No asistirán</span><strong>{stats.rejected}</strong></article>
        <article><span>Check-in</span><strong>{stats.arrived}</strong></article>
      </div>

      <div className="guest-management-toolbar">
        <label className="client-guest-search guest-management-search">
          <span>⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, teléfono, correo, código o mesa" />
        </label>
        <div className="guest-segment-tabs" role="tablist" aria-label="Segmentos de invitados">
          {([
            ['todos', 'Todos'],
            ['pendientes', 'Pendientes'],
            ['confirmados', 'Confirmados'],
            ['rechazados', 'No asistirán'],
            ['sin_telefono', 'Sin teléfono'],
            ['con_mesa', 'Con mesa'],
            ['checkin', 'Check-in'],
          ] as const).map(([id, label]) => (
            <button key={id} type="button" className={segment === id ? 'active' : ''} onClick={() => setSegment(id)}>{label}</button>
          ))}
        </div>
      </div>

      {filteredGuests.length > 0 && (
        <div className="client-guest-bulkbar guest-management-bulkbar">
          <div className="guest-management-bulkbar-summary">
            <label className="guest-management-select-visible">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} />
              <span>Seleccionar visibles</span>
            </label>
            <span className="guest-management-selected-count">
              <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'seleccionado' : 'seleccionados'}
            </span>
          </div>
          <button type="button" className="client-danger guest-management-delete-selected" disabled={!selectedGuests.length} onClick={() => onDeleteGuests(selectedGuests)}>
            Eliminar seleccionados
          </button>
        </div>
      )}

      {filteredGuests.length ? (
        <div className="guest-management-list">
          {filteredGuests.map((guest) => (
            <article key={guest.id} className={selectedIds.includes(guest.id) ? 'is-selected' : ''}>
              <label className="client-guest-checkbox" aria-label={`Seleccionar ${guest.nombre}`}>
                <input type="checkbox" checked={selectedIds.includes(guest.id)} disabled={guest.readonly_record} onChange={() => toggleGuest(guest.id)} />
              </label>
              <span className="client-guest-avatar">{initials(guest.nombre)}</span>
              <div className="client-guest-info">
                <strong>{guest.nombre}</strong>
                <small>{guest.telefono || 'Sin teléfono'}{guest.correo ? ` · ${guest.correo}` : ''}</small>
                <span>{guest.adultos_permitidos} adulto(s) · {guest.ninos_permitidos} niño(s){guest.mesa ? ` · ${guest.mesa}` : ''}{guest.codigo ? ` · Código ${guest.codigo}` : ''}</span>
                {guest.mensaje?.trim() && <span className="guest-management-comment">“{guest.mensaje.trim()}”</span>}
                {guest.source === 'confirmation' && <span className="guest-management-origin">RSVP público</span>}
              </div>
              <span className={`client-guest-status status-${guest.estado}`}>{normalizedStatus(guest.estado)}</span>
              <div className="guest-management-row-actions">
                {!guest.readonly_record && <button type="button" className="client-secondary" onClick={() => onOpenGuest(guest)}>Ver ficha</button>}
                <button type="button" className="client-secondary" onClick={() => onShareGuest(guest)} disabled={!guest.telefono}>WhatsApp</button>
                {!guest.readonly_record && <button type="button" className="client-danger-outline" onClick={() => onDeleteGuests([guest])}>Eliminar</button>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="client-guest-empty">
          <strong>{guests.length ? 'No hay resultados para este segmento' : 'No hay invitados cargados'}</strong>
          <p>{guests.length ? 'Cambia el filtro o la búsqueda.' : 'Importa un CSV para comenzar a organizar y compartir tu invitación.'}</p>
          {!guests.length && <button className="client-primary" type="button" onClick={onImport}>Importar invitados</button>}
        </div>
      )}
    </section>
  );
}
