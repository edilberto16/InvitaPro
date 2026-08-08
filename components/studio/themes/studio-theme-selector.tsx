"use client";

import { useMemo, useState } from "react";
import { THEME_REGISTRY } from "@/lib/themes/theme-registry";

type Props = {
  value: string;
  onPreview: (themeId: string | null) => void;
  onChange: (themeId: string) => void;
  onClose: () => void;
};

const FAVORITES_KEY = "invitapro-theme-favorites";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function StudioThemeSelector({ value, onPreview, onChange, onClose }: Props) {
  const [selectedTheme, setSelectedTheme] = useState(value);
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("Todos");
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = window.localStorage.getItem(FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const collections = useMemo(
    () => ["Todos", "Favoritos", ...Array.from(new Set(THEME_REGISTRY.map((theme) => theme.collection)))],
    [],
  );

  const filteredThemes = useMemo(() => {
    const term = normalize(query.trim());
    return THEME_REGISTRY.filter((theme) => {
      const matchesCollection =
        collection === "Todos" ||
        (collection === "Favoritos" ? favorites.includes(theme.id) : theme.collection === collection);
      const haystack = normalize(`${theme.name} ${theme.collection} ${theme.description}`);
      return matchesCollection && (!term || haystack.includes(term));
    }).sort((a, b) => {
      const favoriteDifference = Number(favorites.includes(b.id)) - Number(favorites.includes(a.id));
      return favoriteDifference || a.collection.localeCompare(b.collection) || a.name.localeCompare(b.name);
    });
  }, [collection, favorites, query]);

  function toggleFavorite(themeId: string) {
    setFavorites((current) => {
      const next = current.includes(themeId)
        ? current.filter((item) => item !== themeId)
        : [...current, themeId];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  function selectTheme(themeId: string) {
    setSelectedTheme(themeId);
    onPreview(themeId);
  }

  function closeWithoutApplying() {
    onPreview(null);
    onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={closeWithoutApplying}>
      <section className="studio-theme-modal studio-theme-gallery" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p className="eyebrow">Theme Gallery</p>
            <h2>Elige la personalidad visual</h2>
            <p>Explora colores, tipografías, superficies y movimiento sin reemplazar tu contenido.</p>
          </div>
          <button type="button" onClick={closeWithoutApplying} aria-label="Cerrar">×</button>
        </header>

        <div className="studio-theme-gallery-tools">
          <label className="studio-theme-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar tema, colección o estilo..."
              autoFocus
            />
            {query && <button type="button" onClick={() => setQuery("")}>×</button>}
          </label>
          <nav className="studio-theme-filters" aria-label="Colecciones de temas">
            {collections.map((item) => (
              <button
                key={item}
                type="button"
                className={collection === item ? "active" : ""}
                onClick={() => setCollection(item)}
              >
                {item === "Favoritos" ? "★ " : ""}{item}
              </button>
            ))}
          </nav>
        </div>

        <div className="studio-theme-gallery-body">
          <div className="studio-theme-results-heading">
            <div><strong>{collection}</strong><small>{filteredThemes.length} temas disponibles</small></div>
            <span>Haz clic para previsualizar</span>
          </div>
          {filteredThemes.length ? (
            <div className="studio-theme-grid">
              {filteredThemes.map((theme) => {
                const selected = selectedTheme === theme.id;
                const favorite = favorites.includes(theme.id);
                return (
                  <article
                    key={theme.id}
                    className={`studio-theme-card ${selected ? "selected" : ""}`}
                    onMouseEnter={() => onPreview(theme.id)}
                    onMouseLeave={() => onPreview(selectedTheme)}
                    onClick={() => selectTheme(theme.id)}
                  >
                    <button
                      type="button"
                      className={`studio-theme-favorite ${favorite ? "active" : ""}`}
                      onClick={(event) => { event.stopPropagation(); toggleFavorite(theme.id); }}
                      aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                      {favorite ? "★" : "☆"}
                    </button>
                    <span className="studio-theme-swatch" style={{ background: `linear-gradient(145deg, ${theme.palette.background}, ${theme.palette.primary})` }}>
                      <i style={{ background: theme.palette.surface, boxShadow: theme.shadow }} />
                      <b style={{ color: theme.palette.text, fontFamily: theme.typography.heading }}>Aa</b>
                    </span>
                    <span className="studio-theme-copy">
                      <small>{theme.collection}</small>
                      <strong>{theme.name}</strong>
                      <em>{theme.description}</em>
                    </span>
                    <span className="studio-theme-palette">
                      {[theme.palette.primary, theme.palette.secondary, theme.palette.background, theme.palette.surface].map((color, index) => (
                        <i key={`${color}-${index}`} style={{ background: color }} />
                      ))}
                    </span>
                    <b>{selected ? "✓ Vista previa activa" : "Previsualizar"}</b>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="studio-theme-empty"><span>🎨</span><strong>No encontramos temas</strong><p>Prueba otra búsqueda o colección.</p></div>
          )}
        </div>

        <footer className="studio-theme-gallery-footer">
          <div>
            <small>Tema seleccionado</small>
            <strong>{THEME_REGISTRY.find((theme) => theme.id === selectedTheme)?.name}</strong>
          </div>
          <button type="button" className="client-secondary" onClick={closeWithoutApplying}>Cancelar</button>
          <button type="button" className="studio-publish-button" onClick={() => onChange(selectedTheme)}>Aplicar tema</button>
        </footer>
      </section>
    </div>
  );
}
