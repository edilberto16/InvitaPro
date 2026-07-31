"use client";

export type StudioEditorSection = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

type Props = {
  active: string;
  sections: StudioEditorSection[];
  activeBlocks: number;
  totalBlocks: number;
  isVisible: (sectionId: string) => boolean;
  onSelect: (sectionId: string) => void;
};

export default function StudioSectionNavigation({
  active,
  sections,
  activeBlocks,
  totalBlocks,
  isVisible,
  onSelect,
}: Props) {
  return (
    <nav className="studio-section-list" aria-label="Secciones del editor">
      <button
        type="button"
        className={active === "estructura" ? "active studio-structure-entry" : "studio-structure-entry"}
        onClick={() => onSelect("estructura")}
      >
        <span>☰</span>
        <div>
          <strong>Estructura</strong>
          <small>Ordena y muestra tus bloques</small>
        </div>
        <em className="on">{activeBlocks}/{totalBlocks}</em>
      </button>

      {sections.map((section) => {
        const visible = isVisible(section.id);
        return (
          <button
            type="button"
            key={section.id}
            className={active === section.id ? "active" : ""}
            onClick={() => onSelect(section.id)}
          >
            <span>{section.icon}</span>
            <div>
              <strong>{section.label}</strong>
              <small>{section.description}</small>
            </div>
            <em className={visible ? "on" : "off"}>{visible ? "Visible" : "Oculto"}</em>
          </button>
        );
      })}
    </nav>
  );
}
