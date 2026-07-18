import { AlertTriangle, Trash2 } from "lucide-react";

export default function ConfirmDeleteModal({ event, onCancel, onConfirm }) {
  if (!event) return null;

  return (
    <div
      className="cal-modal-backdrop show"
      onClick={e => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
      role="presentation"
    >
      <div className="cal-modal-card" role="dialog" aria-modal="true" aria-labelledby="cal-delete-title">
        <div className="modal-icon" aria-hidden="true">
          <AlertTriangle size={22} />
        </div>
        <h3 id="cal-delete-title">Delete this event?</h3>
        <p>
          This will permanently remove <strong>{event.title}</strong> from your calendar. This
          can&apos;t be undone.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn danger-btn" onClick={() => onConfirm?.(event.id)}>
            <Trash2 size={15} />
            Delete Event
          </button>
        </div>
      </div>
    </div>
  );
}
