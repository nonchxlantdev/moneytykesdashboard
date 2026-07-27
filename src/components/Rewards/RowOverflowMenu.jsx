import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

export default function RowOverflowMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  function updatePosition() {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuWidth = menu?.offsetWidth || 160;
    const menuHeight = menu?.offsetHeight || 120;
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + gap && rect.top > spaceBelow;
    const top = openUp ? rect.top - menuHeight - gap : rect.bottom + gap;
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8
    );
    setCoords({ top, left });
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePosition();
    function onReposition() {
      updatePosition();
    }
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onPointer(event) {
      const inTrigger = wrapRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);
      if (!inTrigger && !inMenu) setOpen(false);
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
        ref={triggerRef}
        type="button"
        className="rw-overflow-trigger"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        <MoreVertical size={16} />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              className="rw-overflow-menu rw-overflow-menu-portal"
              role="menu"
              style={{ top: coords.top, left: coords.left }}
            >
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
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
