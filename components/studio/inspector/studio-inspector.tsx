"use client";

import type { TemplateSectionId } from "@/lib/template-engine";
import type { StudioBlockDefinition, StudioBlockVariant } from "@/lib/studio/block-registry";
import type { StudioSectionSettings } from "@/lib/studio/studio-types";

type Props = {
  sectionId: TemplateSectionId;
  definition: StudioBlockDefinition;
  visible: boolean;
  variant?: string;
  variants?: StudioBlockVariant[];
  settings: StudioSectionSettings;
  accentColor: string;
  onEdit: () => void;
  onToggle: () => void;
  onMove: (direction: -1 | 1) => void;
  onVariantChange: (value: string) => void;
  onSettingsChange: (settings: StudioSectionSettings) => void;
  onAccentColorChange: (value: string) => void;
};

const alignmentOptions: Array<{ value: StudioSectionSettings["alignment"]; label: string }> = [
  { value: "left", label: "Izquierda" },
  { value: "center", label: "Centro" },
  { value: "right", label: "Derecha" },
];

const animationOptions: Array<{ value: StudioSectionSettings["animation"]; label: string }> = [
  { value: "inherit", label: "De la plantilla" },
  { value: "none", label: "Sin animación" },
  { value: "fade", label: "Desvanecer" },
  { value: "slide-up", label: "Subir suavemente" },
  { value: "zoom", label: "Zoom suave" },
];

const spacingOptions: Array<{ value: StudioSectionSettings["spacing"]; label: string }> = [
  { value: "compact", label: "Compacto" },
  { value: "normal", label: "Normal" },
  { value: "airy", label: "Amplio" },
];

const surfaceOptions: Array<{ value: StudioSectionSettings["surface"]; label: string }> = [
  { value: "inherit", label: "De la plantilla" },
  { value: "transparent", label: "Transparente" },
  { value: "soft", label: "Suave" },
  { value: "card", label: "Tarjeta" },
];

export default function StudioInspector({
  sectionId,
  definition,
  visible,
  variant,
  variants,
  settings,
  accentColor,
  onEdit,
  onToggle,
  onMove,
  onVariantChange,
  onSettingsChange,
  onAccentColorChange,
}: Props) {
  const update = <K extends keyof StudioSectionSettings>(key: K, value: StudioSectionSettings[K]) =>
    onSettingsChange({ ...settings, [key]: value });

  return (
    <aside className="studio-inspector" aria-label={`Inspector de ${definition.label}`}>
      <header className="studio-inspector-header">
        <span className="studio-inspector-icon">{definition.icon}</span>
        <div>
          <small>INSPECTOR PRO</small>
          <strong>{definition.label}</strong>
          <p>{definition.description}</p>
        </div>
      </header>

      <section className="studio-inspector-section">
        <div className="studio-inspector-section-title">
          <strong>Contenido</strong>
          <span>Bloque seleccionado</span>
        </div>
        <button type="button" className="client-primary studio-inspector-full" onClick={onEdit}>
          Editar contenido
        </button>
      </section>

      {variants?.length ? (
        <section className="studio-inspector-section">
          <div className="studio-inspector-section-title"><strong>Variante</strong><span>Composición visual</span></div>
          <select value={variant || variants[0].value} onChange={(event) => onVariantChange(event.target.value)}>
            {variants.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </section>
      ) : null}

      <section className="studio-inspector-section">
        <div className="studio-inspector-section-title"><strong>Alineación</strong><span>Texto y contenido</span></div>
        <div className="studio-inspector-segmented">
          {alignmentOptions.map((option) => (
            <button key={option.value} type="button" className={(settings.alignment || "center") === option.value ? "active" : ""} onClick={() => update("alignment", option.value)}>
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="studio-inspector-section studio-inspector-grid">
        <label><span>Espaciado</span><select value={settings.spacing || "normal"} onChange={(event) => update("spacing", event.target.value as StudioSectionSettings["spacing"])}>{spacingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Superficie</span><select value={settings.surface || "inherit"} onChange={(event) => update("surface", event.target.value as StudioSectionSettings["surface"])}>{surfaceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className="studio-inspector-grid-wide"><span>Animación</span><select value={settings.animation || "inherit"} onChange={(event) => update("animation", event.target.value as StudioSectionSettings["animation"])}>{animationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      </section>

      <section className="studio-inspector-section">
        <div className="studio-inspector-section-title"><strong>Color de acento</strong><span>Identidad global</span></div>
        <label className="studio-inspector-color">
          <input type="color" value={accentColor} onChange={(event) => onAccentColorChange(event.target.value)} />
          <input type="text" value={accentColor} onChange={(event) => onAccentColorChange(event.target.value)} maxLength={7} />
        </label>
      </section>

      <section className="studio-inspector-section">
        <div className="studio-inspector-section-title"><strong>Acciones</strong><span>Orden y visibilidad</span></div>
        <div className="studio-inspector-actions">
          <button type="button" className="client-secondary" disabled={definition.locked} onClick={onToggle}>{visible ? "Ocultar" : "Mostrar"}</button>
          <button type="button" className="client-secondary" disabled={sectionId === "hero"} onClick={() => onMove(-1)}>↑ Subir</button>
          <button type="button" className="client-secondary" disabled={sectionId === "hero"} onClick={() => onMove(1)}>↓ Bajar</button>
        </div>
      </section>
    </aside>
  );
}
