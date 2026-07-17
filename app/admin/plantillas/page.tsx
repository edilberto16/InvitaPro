'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { TEMPLATE_CATALOG, TEMPLATE_COLLECTIONS } from '@/lib/template-catalog';

export default function PlantillasPage() {
  const [collection, setCollection] = useState('todas');
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState<'todas' | 'disponibles' | 'proximamente'>('todas');

  const templates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return TEMPLATE_CATALOG.filter((template) => {
      const matchesCollection = collection === 'todas' || template.collection === collection;
      const matchesAvailability = availability === 'todas'
        || (availability === 'disponibles' && template.available)
        || (availability === 'proximamente' && !template.available);
      const matchesQuery = !normalized
        || template.name.toLowerCase().includes(normalized)
        || template.description.toLowerCase().includes(normalized);
      return matchesCollection && matchesAvailability && matchesQuery;
    });
  }, [availability, collection, query]);

  const availableCount = TEMPLATE_CATALOG.filter((template) => template.available).length;
  const premiumCount = TEMPLATE_CATALOG.filter((template) => template.premium).length;

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Biblioteca visual</p>
          <h1>Plantillas</h1>
          <p>Explora los diseños disponibles y elige el punto de partida de cada invitación.</p>
        </div>
        <Link className="button button-primary" href="/admin/invitaciones">Crear invitación</Link>
      </section>

      <section className="stats-grid template-stats">
        <article className="stat-card"><span>Total</span><strong>{TEMPLATE_CATALOG.length}</strong><small>Diseños registrados</small></article>
        <article className="stat-card"><span>Disponibles</span><strong>{availableCount}</strong><small>Listos para usar</small></article>
        <article className="stat-card"><span>Premium</span><strong>{premiumCount}</strong><small>Experiencias avanzadas</small></article>
        <article className="stat-card"><span>Colecciones</span><strong>{TEMPLATE_COLLECTIONS.length - 1}</strong><small>Tipos de evento</small></article>
      </section>

      <section className="panel-card template-library-panel">
        <div className="panel-header template-library-header">
          <div>
            <h2>Catálogo de diseños</h2>
            <p>Filtra por tipo de evento, disponibilidad o nombre.</p>
          </div>
          <div className="template-library-tools">
            <label className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar plantilla" /></label>
            <select className="status-filter" value={availability} onChange={(event) => setAvailability(event.target.value as typeof availability)}>
              <option value="todas">Todas</option>
              <option value="disponibles">Disponibles</option>
              <option value="proximamente">Próximamente</option>
            </select>
          </div>
        </div>

        <div className="template-filter-row template-library-filters">
          {TEMPLATE_COLLECTIONS.map((item) => (
            <button key={item.id} type="button" className={collection === item.id ? 'active' : ''} onClick={() => setCollection(item.id)}>
              {item.label}
            </button>
          ))}
        </div>

        {templates.length === 0 ? (
          <div className="empty-state compact-empty"><div className="empty-icon">▦</div><h2>Sin resultados</h2><p>Prueba con otra búsqueda o filtro.</p></div>
        ) : (
          <div className="template-library-grid">
            {templates.map((template) => (
              <article key={template.id} className={`template-library-card theme-preview-${template.id} ${!template.available ? 'coming-soon' : ''}`}>
                <div className="template-library-preview">
                  <span className="template-library-category">{TEMPLATE_COLLECTIONS.find((item) => item.id === template.collection)?.label}</span>
                  <div className="template-library-monogram">IP</div>
                  <strong>{template.name}</strong>
                  <small>Invitación digital</small>
                </div>
                <div className="template-library-copy">
                  <div className="template-library-title">
                    <div><h3>{template.name}</h3><span>{template.premium ? 'Premium' : 'Esencial'}</span></div>
                    <em className={template.available ? 'available' : ''}>{template.badge}</em>
                  </div>
                  <p>{template.description}</p>
                  <ul>{template.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                  <footer>
                    <span className="template-color-dot" style={{ background: template.color }} aria-hidden="true" />
                    {template.available ? <Link href={`/admin/invitaciones?plantilla=${encodeURIComponent(template.id)}`} className="button button-primary">Usar plantilla</Link> : <button className="button button-ghost" disabled>En desarrollo</button>}
                  </footer>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
