'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { TEMPLATE_CATALOG, TEMPLATE_COLLECTIONS, type TemplateDefinition } from '@/lib/template-catalog';

type AvailabilityFilter = 'todas' | 'disponibles' | 'premium';
type SortOption = 'destacadas' | 'nombre' | 'coleccion';

const FEATURED_IDS = new Set(['elegante-classic', 'romantic-garden', 'luxury-black', 'golden-night', 'espacial', 'lanzamiento']);
const NEW_IDS = new Set(['modern-editorial', 'luxury-pink', 'superheroes', 'networking']);
const POPULAR_IDS = new Set(['elegante-classic', 'romantic-garden', 'princess-rose', 'safari']);

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
}

function EyeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.75"/></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'is-filled' : ''}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>;
}

function SparklesIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.2 3.4L16.5 8l-3.3 1.5L12 13l-1.2-3.5L7.5 8l3.3-1.6L12 3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Zm14-2 1 2.8 2.5 1.2-2.5 1.2L19 20l-1-2.8-2.5-1.2 2.5-1.2L19 12Z"/></svg>;
}

function collectionName(template: TemplateDefinition) {
  return TEMPLATE_COLLECTIONS.find((item) => item.id === template.collection)?.label ?? template.collection;
}

export default function PlantillasPage() {
  const [collection, setCollection] = useState('todas');
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState<AvailabilityFilter>('todas');
  const [sortBy, setSortBy] = useState<SortOption>('destacadas');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = { todas: TEMPLATE_CATALOG.length };
    for (const template of TEMPLATE_CATALOG) counts[template.collection] = (counts[template.collection] ?? 0) + 1;
    return counts;
  }, []);

  const templates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = TEMPLATE_CATALOG.filter((template) => {
      const matchesCollection = collection === 'todas' || template.collection === collection;
      const matchesAvailability = availability === 'todas'
        || (availability === 'disponibles' && template.available)
        || (availability === 'premium' && template.premium);
      const matchesQuery = !normalized
        || template.name.toLowerCase().includes(normalized)
        || template.description.toLowerCase().includes(normalized)
        || template.features.some((feature) => feature.toLowerCase().includes(normalized));
      return matchesCollection && matchesAvailability && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'nombre') return a.name.localeCompare(b.name, 'es');
      if (sortBy === 'coleccion') return collectionName(a).localeCompare(collectionName(b), 'es') || a.name.localeCompare(b.name, 'es');
      const featuredDifference = Number(FEATURED_IDS.has(b.id)) - Number(FEATURED_IDS.has(a.id));
      return featuredDifference || Number(b.premium) - Number(a.premium) || a.name.localeCompare(b.name, 'es');
    });
  }, [availability, collection, query, sortBy]);

  const premiumCount = TEMPLATE_CATALOG.filter((template) => template.premium).length;
  const featuredCount = TEMPLATE_CATALOG.filter((template) => FEATURED_IDS.has(template.id)).length;

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="page-stack template-marketplace-page">
      <section className="page-heading template-marketplace-heading">
        <div>
          <p className="eyebrow">Marketplace creativo</p>
          <h1>Plantillas</h1>
          <p>Encuentra el diseño ideal, revísalo y úsalo como punto de partida para tu próxima invitación.</p>
        </div>
        <Link className="button button-primary template-heading-action" href="/admin/invitaciones">
          Ver mis invitaciones <ArrowIcon />
        </Link>
      </section>

      <section className="template-marketplace-stats" aria-label="Resumen del catálogo">
        <article><span>Diseños</span><strong>{TEMPLATE_CATALOG.length}</strong><small>Disponibles en el catálogo</small></article>
        <article><span>Premium</span><strong>{premiumCount}</strong><small>Experiencias avanzadas</small></article>
        <article><span>Destacadas</span><strong>{featuredCount}</strong><small>Selección recomendada</small></article>
        <article><span>Colecciones</span><strong>{TEMPLATE_COLLECTIONS.length - 1}</strong><small>Tipos de evento</small></article>
      </section>

      <section className="panel-card template-marketplace-panel">
        <div className="template-marketplace-toolbar">
          <div className="template-marketplace-search">
            <SearchIcon />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, estilo o función" aria-label="Buscar plantilla" />
          </div>
          <select value={availability} onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)} aria-label="Filtrar plantillas">
            <option value="todas">Todas las plantillas</option>
            <option value="disponibles">Disponibles</option>
            <option value="premium">Solo premium</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} aria-label="Ordenar plantillas">
            <option value="destacadas">Orden: destacadas</option>
            <option value="nombre">Orden: nombre</option>
            <option value="coleccion">Orden: colección</option>
          </select>
        </div>

        <div className="template-marketplace-tabs" role="tablist" aria-label="Colecciones">
          {TEMPLATE_COLLECTIONS.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={collection === item.id} className={collection === item.id ? 'active' : ''} onClick={() => setCollection(item.id)}>
              <span>{item.label}</span><strong>{collectionCounts[item.id] ?? 0}</strong>
            </button>
          ))}
        </div>

        <div className="template-marketplace-results">
          <div><strong>{templates.length}</strong> {templates.length === 1 ? 'plantilla encontrada' : 'plantillas encontradas'}</div>
          {(query || collection !== 'todas' || availability !== 'todas') && (
            <button type="button" onClick={() => { setQuery(''); setCollection('todas'); setAvailability('todas'); }}>Limpiar filtros</button>
          )}
        </div>

        {templates.length === 0 ? (
          <div className="empty-state compact-empty"><div className="empty-icon">▦</div><h2>Sin resultados</h2><p>Prueba con otra búsqueda o colección.</p></div>
        ) : (
          <div className="template-marketplace-grid">
            {templates.map((template) => {
              const isFavorite = favorites.has(template.id);
              return (
                <article key={template.id} className={`template-marketplace-card theme-preview-${template.id}`}>
                  <div className="template-marketplace-preview">
                    <div className="template-preview-topline">
                      <span>{collectionName(template)}</span>
                      <button type="button" className="template-favorite-button" aria-label={isFavorite ? `Quitar ${template.name} de favoritos` : `Agregar ${template.name} a favoritos`} onClick={() => toggleFavorite(template.id)}>
                        <HeartIcon filled={isFavorite} />
                      </button>
                    </div>
                    <div className="template-preview-stage">
                      <small>Invitación digital</small>
                      <strong>{template.name}</strong>
                      <span className="template-preview-divider" />
                      <em>Tu historia comienza aquí</em>
                    </div>
                    <div className="template-card-badges">
                      {template.premium && <span className="premium"><SparklesIcon /> Premium</span>}
                      {NEW_IDS.has(template.id) && <span className="new">Nueva</span>}
                      {POPULAR_IDS.has(template.id) && <span className="popular">Popular</span>}
                    </div>
                  </div>

                  <div className="template-marketplace-copy">
                    <div className="template-marketplace-title">
                      <div><h2>{template.name}</h2><p>{template.description}</p></div>
                      <span className="template-color-dot" style={{ background: template.color }} aria-hidden="true" />
                    </div>
                    <div className="template-feature-chips">
                      {template.features.slice(0, 3).map((feature) => <span key={feature}>{feature}</span>)}
                    </div>
                    <footer>
                      <button type="button" className="button button-ghost template-preview-button" onClick={() => setSelectedTemplate(template)}><EyeIcon /> Vista previa</button>
                      <Link href={`/admin/invitaciones?plantilla=${encodeURIComponent(template.id)}`} className="button button-primary">Usar plantilla <ArrowIcon /></Link>
                    </footer>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedTemplate && (
        <div className="template-preview-modal" role="dialog" aria-modal="true" aria-labelledby="template-preview-title" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelectedTemplate(null); }}>
          <div className="template-preview-dialog">
            <button type="button" className="template-preview-close" aria-label="Cerrar vista previa" onClick={() => setSelectedTemplate(null)}>×</button>
            <div className={`template-preview-large theme-preview-${selectedTemplate.id}`}>
              <span>{collectionName(selectedTemplate)}</span>
              <small>Invitación digital</small>
              <strong>{selectedTemplate.name}</strong>
              <i />
              <em>Una celebración inolvidable</em>
            </div>
            <div className="template-preview-details">
              <p className="eyebrow">Vista previa</p>
              <h2 id="template-preview-title">{selectedTemplate.name}</h2>
              <p>{selectedTemplate.description}</p>
              <ul>{selectedTemplate.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              <div className="template-preview-modal-actions">
                <button type="button" className="button button-ghost" onClick={() => setSelectedTemplate(null)}>Seguir explorando</button>
                <Link href={`/admin/invitaciones?plantilla=${encodeURIComponent(selectedTemplate.id)}`} className="button button-primary">Usar esta plantilla <ArrowIcon /></Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
