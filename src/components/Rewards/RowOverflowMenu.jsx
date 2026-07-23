import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export default function RowOverflowMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointer(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    }
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`rw-overflow ${open ? "open" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className="rw-overflow-trigger"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        <MoreVertical size={16} />
      </button>
      {open ? (
        <div className="rw-overflow-menu" role="menu">
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              title={item.title || item.label}
              className={`rw-overflow-item ${item.danger ? "danger" : ""}`}
              onClick={() => {
                setOpen(false);
                item.onClick?.();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
