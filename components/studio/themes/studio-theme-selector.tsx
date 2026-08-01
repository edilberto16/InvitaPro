"use client";

import { THEME_REGISTRY } from "@/lib/themes/theme-registry";

type Props = {
  value: string;
  onChange: (themeId: string) => void;
  onClose: () => void;
};

export default function StudioThemeSelector({ value, onChange, onClose }: Props) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="studio-theme-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div><p className="eyebrow">Theme Engine</p><h2>Elige la personalidad visual</h2><p>El tema cambia colores, tipografías, botones, espacios, sombras y movimiento sin reemplazar tu contenido.</p></div>
          <button type="button" onClick={onClose}>×</button>
        </header>
        <div className="studio-theme-grid">
          {THEME_REGISTRY.map((theme) => (
            <button key={theme.id} type="button" className={`studio-theme-card ${value === theme.id ? "selected" : ""}`} onClick={() => onChange(theme.id)}>
              <span className="studio-theme-swatch" style={{ background: `linear-gradient(135deg, ${theme.palette.background}, ${theme.palette.primary})` }}>
                <i style={{ background: theme.palette.surface }} />
              </span>
              <span className="studio-theme-copy">
                <small>{theme.collection}</small>
                <strong>{theme.name}</strong>
                <em>{theme.description}</em>
              </span>
              <span className="studio-theme-palette">
                {[theme.palette.primary,theme.palette.secondary,theme.palette.background,theme.palette.surface].map((color) => <i key={color} style={{ background: color }} />)}
              </span>
              {value === theme.id ? <b>✓ Tema actual</b> : <b>Aplicar tema</b>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
