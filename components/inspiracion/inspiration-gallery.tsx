'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { categories, inspirationItems } from './inspiration-data';

export function InspirationGallery() {
  const [active, setActive] = useState<(typeof categories)[number]>('Todos');
  const visible = useMemo(
    () => active === 'Todos' ? inspirationItems : inspirationItems.filter((item) => item.category === active),
    [active]
  );

  return (
    <>
      <div className="inspiration-filters" role="tablist" aria-label="Filtrar inspiraciones">
        {categories.map((category) => (
          <button
            type="button"
            role="tab"
            aria-selected={active === category}
            className={active === category ? 'is-active' : ''}
            onClick={() => setActive(category)}
            key={category}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="inspiration-grid">
        {visible.map((item, index) => (
          <article className={`inspiration-card inspiration-card--${item.theme} ${index === 0 && active === 'Todos' ? 'is-featured' : ''}`} key={item.slug}>
            <div className="inspiration-card-media" style={{ backgroundImage: `url(${item.image})` }}>
              <span className="inspiration-category">{item.category}</span>
              <button className="inspiration-heart" type="button" aria-label={`Guardar ${item.title}`}>♡</button>
              <div className="inspiration-card-overlay">
                <span className="inspiration-eyebrow">{item.eyebrow}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <Link href={`/inspiracion/${item.slug}`}>Ver experiencia <span>↗</span></Link>
              </div>
            </div>
            <div className="inspiration-tags">
              {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && <p className="inspiration-empty">Pronto agregaremos más experiencias en esta categoría.</p>}
    </>
  );
}
