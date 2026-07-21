import { createPortal } from "react-dom";
import { AlertTriangle, Trash2 } from "lucide-react";

/**
 * Shared confirm-delete dialog (Rewards, reusable elsewhere).
 */
export default function ConfirmDeleteModal({
  open,
  title = "Delete this item?",
  itemLabel,
  bodyText,
  confirmLabel = "Delete",
  onCancel,
  onConfirm
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="rw-modal-backdrop"
      onClick={event => {
        if (event.target === event.currentTarget) onCancel?.();
      }}
      role="presentation"
    >
      <div className="rw-modal-card" role="dialog" aria-modal="true" aria-labelledby="rw-delete-title">
        <div className="rw-modal-icon" aria-hidden="true">
          <AlertTriangle size={22} />
        </div>
        <h3 id="rw-delete-title">{title}</h3>
        <p>
          {bodyText || (
            <>
              This will permanently remove {itemLabel ? <strong>{itemLabel}</strong> : "this item"}.
            </>
          )}
        </p>
        {itemLabel && bodyText ? (
          <p className="rw-modal-item">
            <strong>{itemLabel}</strong>
          </p>
        ) : null}
        <div className="rw-modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn danger-btn" onClick={onConfirm}>
            <Trash2 size={15} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
