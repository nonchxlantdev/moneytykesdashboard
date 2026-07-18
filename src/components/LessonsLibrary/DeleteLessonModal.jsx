import { AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteLessonModal({ lesson, onCancel, onConfirm }) {
  if (!lesson) return null;

  return (
    <div
      className="modal-backdrop show"
      onClick={event => {
        if (event.target === event.currentTarget) onCancel?.();
      }}
      role="presentation"
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-lesson-title"
      >
        <div className="modal-icon" aria-hidden="true">
          <AlertTriangle size={22} />
        </div>
        <h3 id="delete-lesson-title">Delete this lesson?</h3>
        <p>
          This will permanently remove <strong>{lesson.title}</strong> from your library. This
          can&apos;t be undone.
        </p>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn danger-btn"
            onClick={() => onConfirm?.(lesson.id)}
          >
            <Trash2 size={15} />
            Delete Lesson
          </button>
        </div>
      </div>
    </div>
  );
}
