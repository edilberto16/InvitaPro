"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { TemplateSectionId } from "@/lib/template-engine";
import { STUDIO_BLOCK_REGISTRY } from "@/lib/studio/block-registry";

type DropPosition = "before" | "after";

type Props = {
  order: TemplateSectionId[];
  visibility: Record<TemplateSectionId, boolean>;
  selectedSection: TemplateSectionId | null;
  onSelect: (sectionId: TemplateSectionId) => void;
  onToggle: (sectionId: TemplateSectionId) => void;
  onMove: (sectionId: TemplateSectionId, direction: -1 | 1) => void;
  onReorder: (sourceId: TemplateSectionId, targetId: TemplateSectionId, position: DropPosition) => void;
};

export default function StudioCanvasNavigator({
  order,
  visibility,
  selectedSection,
  onSelect,
  onToggle,
  onMove,
  onReorder,
}: Props) {
  const [draggedSection, setDraggedSection] = useState<TemplateSectionId | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: TemplateSectionId; position: DropPosition } | null>(null);
  const dropTargetRef = useRef<{ id: TemplateSectionId; position: DropPosition } | null>(null);
  const pointerSourceRef = useRef<TemplateSectionId | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerDraggingRef = useRef(false);

  const selectedIndex = selectedSection ? order.indexOf(selectedSection) : -1;
  const selectedBlock = selectedSection ? STUDIO_BLOCK_REGISTRY[selectedSection] : null;
  const selectedLocked = Boolean(selectedBlock?.locked);

  function resolveDropTarget(clientX: number, clientY: number) {
    const element = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-canvas-section]");
    const targetId = element?.dataset.canvasSection as TemplateSectionId | undefined;
    if (!element || !targetId || targetId === "hero" || targetId === pointerSourceRef.current) {
      dropTargetRef.current = null;
      setDropTarget(null);
      return;
    }
    const rect = element.getBoundingClientRect();
    const position: DropPosition = clientX < rect.left + rect.width / 2 ? "before" : "after";
    dropTargetRef.current = { id: targetId, position };
    setDropTarget(dropTargetRef.current);
  }

  function finishPointerReorder() {
    const sourceId = pointerSourceRef.current;
    const target = dropTargetRef.current;
    if (sourceId && target) onReorder(sourceId, target.id, target.position);
    pointerSourceRef.current = null;
    pointerStartRef.current = null;
    pointerDraggingRef.current = false;
    setDraggedSection(null);
    dropTargetRef.current = null;
    setDropTarget(null);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>, sectionId: TemplateSectionId) {
    if (sectionId === "hero" || event.button !== 0) return;
    pointerSourceRef.current = sectionId;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    pointerDraggingRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!pointerSourceRef.current || !pointerStartRef.current) return;
    const distance = Math.hypot(event.clientX - pointerStartRef.current.x, event.clientY - pointerStartRef.current.y);
    if (!pointerDraggingRef.current && distance < 7) return;
    pointerDraggingRef.current = true;
    setDraggedSection(pointerSourceRef.current);
    resolveDropTarget(event.clientX, event.clientY);
  }

  return (
    <div className="studio-canvas-navigator" aria-label="Navegador del canvas">
      <div className="studio-canvas-navigator-track">
        {order.map((sectionId, index) => {
          const block = STUDIO_BLOCK_REGISTRY[sectionId];
          const visible = visibility[sectionId] !== false;
          const selected = selectedSection === sectionId;
          const locked = Boolean(block.locked);
          const targetPosition = dropTarget?.id === sectionId ? dropTarget.position : null;

          return (
            <button
              key={sectionId}
              type="button"
              data-canvas-section={sectionId}
              className={`${selected ? "selected" : ""} ${visible ? "visible" : "hidden"} ${draggedSection === sectionId ? "dragging" : ""} ${targetPosition ? `drop-${targetPosition}` : ""}`.trim()}
              onClick={() => {
                if (!pointerDraggingRef.current) onSelect(sectionId);
              }}
              draggable={!locked}
              onDragStart={(event) => {
                if (locked) return;
                setDraggedSection(sectionId);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", sectionId);
              }}
              onDragOver={(event) => {
                if (!draggedSection || draggedSection === sectionId || sectionId === "hero") return;
                event.preventDefault();
                const rect = event.currentTarget.getBoundingClientRect();
                dropTargetRef.current = { id: sectionId, position: event.clientX < rect.left + rect.width / 2 ? "before" : "after" };
                setDropTarget(dropTargetRef.current);
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const sourceId = (event.dataTransfer.getData("text/plain") || draggedSection) as TemplateSectionId;
                const target = dropTargetRef.current;
                if (sourceId && target) onReorder(sourceId, target.id, target.position);
                setDraggedSection(null);
                dropTargetRef.current = null;
                setDropTarget(null);
              }}
              onDragEnd={() => {
                setDraggedSection(null);
                dropTargetRef.current = null;
                setDropTarget(null);
              }}
              onPointerDown={(event) => handlePointerDown(event, sectionId)}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointerReorder}
              onPointerCancel={finishPointerReorder}
              title={`${block.label}${visible ? "" : " · oculto"}${locked ? " · fijo" : " · arrastra para mover"}`}
              aria-pressed={selected}
              aria-grabbed={draggedSection === sectionId}
            >
              <span className="studio-canvas-navigator-index">{index + 1}</span>
              <span className="studio-canvas-navigator-icon" aria-hidden="true">{block.icon}</span>
              <span className="studio-canvas-navigator-label">{block.label}</span>
              {!locked && <span className="studio-canvas-navigator-grip" aria-hidden="true">⋮⋮</span>}
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
      <p className="studio-canvas-drag-help">Arrastra cualquier bloque excepto la portada. Funciona con mouse y pantalla táctil.</p>
    </div>
  );
}
