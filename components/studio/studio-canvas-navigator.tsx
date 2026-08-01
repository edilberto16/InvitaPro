"use client";

import type { TemplateSectionId } from "@/lib/template-engine";
import { STUDIO_BLOCK_REGISTRY } from "@/lib/studio/block-registry";

type Props = {
  order: TemplateSectionId[];
  visibility: Record<TemplateSectionId, boolean>;
  selectedSection: TemplateSectionId | null;
  onSelect: (sectionId: TemplateSectionId) => void;
  onToggle: (sectionId: TemplateSectionId) => void;
  onMove: (sectionId: TemplateSectionId, direction: -1 | 1) => void;
};

export default function StudioCanvasNavigator({
  order,
  visibility,
  selectedSection,
  onSelect,
  onToggle,
  onMove,
}: Props) {
  const selectedIndex = selectedSection ? order.indexOf(selectedSection) : -1;
  const selectedBlock = selectedSection ? STUDIO_BLOCK_REGISTRY[selectedSection] : null;
  const selectedLocked = Boolean(selectedBlock?.locked);

  return (
    <div className="studio-canvas-navigator" aria-label="Navegador del canvas">
      <div className="studio-canvas-navigator-track">
        {order.map((sectionId, index) => {
          const block = STUDIO_BLOCK_REGISTRY[sectionId];
          const visible = visibility[sectionId] !== false;
          const selected = selectedSection === sectionId;
          const locked = Boolean(block.locked);

          return (
            <button
              key={sectionId}
              type="button"
              className={`${selected ? "selected" : ""} ${visible ? "visible" : "hidden"}`.trim()}
              onClick={() => onSelect(sectionId)}
              title={`${block.label}${visible ? "" : " · oculto"}`}
              aria-pressed={selected}
            >
              <span className="studio-canvas-navigator-index">{index + 1}</span>
              <span className="studio-canvas-navigator-icon" aria-hidden="true">{block.icon}</span>
              <span className="studio-canvas-navigator-label">{block.label}</span>
              {!visible && <em>Oculto</em>}
              {selected && <i aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {selectedSection && selectedIndex >= 0 && (
        <div className="studio-canvas-selection-actions">
          <div>
            <small>BLOQUE ACTIVO</small>
            <strong>{selectedBlock?.label}</strong>
          </div>
          <div className="studio-canvas-selection-buttons">
            <button
              type="button"
              onClick={() => onMove(selectedSection, -1)}
              disabled={selectedIndex <= 1 || selectedSection === "hero"}
              title="Mover arriba"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMove(selectedSection, 1)}
              disabled={selectedIndex < 0 || selectedIndex >= order.length - 1 || selectedSection === "hero"}
              title="Mover abajo"
            >
              ↓
            </button>
            <button
              type="button"
              className="studio-canvas-visibility-button"
              onClick={() => onToggle(selectedSection)}
              disabled={selectedLocked}
              title={selectedLocked ? "La portada siempre permanece visible" : visibility[selectedSection] === false ? "Mostrar bloque" : "Ocultar bloque"}
            >
              {visibility[selectedSection] === false ? "Mostrar" : "Ocultar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
