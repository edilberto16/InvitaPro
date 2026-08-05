"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  eyebrow?: string;
  itemNames?: string[];
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  eyebrow = "Confirmar eliminación",
  itemNames = [],
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onCancel, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="ip-dialog-backdrop"
      role="presentation"
      onMouseDown={() => {
        if (!busy) onCancel();
      }}
    >
      <section
        className="ip-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ip-confirm-dialog-title"
        aria-describedby="ip-confirm-dialog-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="ip-confirm-dialog-icon" aria-hidden="true">
          !
        </div>
        <div className="ip-confirm-dialog-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="ip-confirm-dialog-title">{title}</h2>
          <p id="ip-confirm-dialog-description">{description}</p>
        </div>

        {itemNames.length > 0 && (
          <div className="ip-confirm-dialog-list" aria-label="Registros que se eliminarán">
            {itemNames.slice(0, 5).map((name, index) => (
              <span key={`${name}-${index}`}>{name}</span>
            ))}
            {itemNames.length > 5 && <span>y {itemNames.length - 5} más…</span>}
          </div>
        )}

        <div className="ip-confirm-dialog-actions">
          <button type="button" className="client-secondary" disabled={busy} onClick={onCancel} autoFocus>
            {cancelLabel}
          </button>
          <button type="button" className="client-danger ip-confirm-dialog-danger" disabled={busy} onClick={onConfirm}>
            {busy ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
