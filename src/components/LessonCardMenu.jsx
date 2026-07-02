import { useEffect, useRef } from "react";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";

/**
 * Three-dot menu for lesson cards — edit, preview, delete.
 * @param {{
 *   open: boolean,
 *   onToggle: (event: Event) => void,
 *   onClose: () => void,
 *   onEdit: () => void,
 *   onDelete: () => void,
 *   onPreview?: () => void,
 *   variant?: "overlay" | "studio"
 * }} props
 */
export default function LessonCardMenu({ open, onToggle, onClose, onEdit, onDelete, onPreview, variant = "overlay" }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onClose]);

  return (
    <div className={`lesson-card-menu ${variant === "studio" ? "lesson-card-menu-studio" : ""}`} ref={menuRef}>
      <button
        type="button"
        className={`lesson-card-menu-trigger ${variant === "studio" ? "lesson-card-menu-trigger-studio" : ""}`}
        aria-label="Lesson options"
        aria-expanded={open}
        onClick={onToggle}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="lesson-card-menu-dropdown" role="menu">
          <button type="button" role="menuitem" onClick={onEdit}>
            <Pencil size={14} /> Edit in Studio
          </button>
          {onPreview && (
            <button type="button" role="menuitem" onClick={onPreview}>
              <Eye size={14} /> Preview
            </button>
          )}
          <button type="button" role="menuitem" className="danger" onClick={onDelete}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
