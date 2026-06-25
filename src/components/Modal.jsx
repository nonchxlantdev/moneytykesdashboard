import { X } from "lucide-react";

/**
 * Reusable modal dialog.
 * @param {{ open: boolean, onClose: () => void, title?: string, children: React.ReactNode, className?: string }} props
 */
export default function Modal({ open, onClose, title, children, className = "" }) {
  if (!open) return null;

  return (
    <div className="mt-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`mt-modal ${className}`}
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "mt-modal-title" : undefined}
      >
        {title && (
          <header className="mt-modal-header">
            <h3 id="mt-modal-title">{title}</h3>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </header>
        )}
        <div className="mt-modal-body">{children}</div>
      </div>
    </div>
  );
}
