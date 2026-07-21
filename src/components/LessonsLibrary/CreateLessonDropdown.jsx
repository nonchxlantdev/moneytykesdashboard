import { useEffect, useRef, useState } from "react";
import { ChevronDown, ClipboardList, Presentation, Plus, Play } from "lucide-react";

const OPTIONS = [
  {
    type: "plan",
    label: "Build a Class Lesson",
    desc: "Build a text lesson plan",
    icon: ClipboardList
  },
  {
    type: "video",
    label: "Video Lesson",
    desc: "Link a YouTube video",
    icon: Play
  },
  {
    type: "presentation",
    label: "Presentation",
    desc: "Upload slides",
    icon: Presentation
  }
];

export default function CreateLessonDropdown({ onSelectType }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className={`create-dropdown ${open ? "open" : ""}`} ref={wrapRef}>
      <button
        className="btn primary-gold"
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(value => !value)}
      >
        <Plus size={15} />
        Create Lesson
        <ChevronDown size={14} className="chev" />
      </button>
      {open ? (
        <div className="create-menu" role="menu">
          {OPTIONS.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                type="button"
                role="menuitem"
                className="create-menu-item"
                onClick={() => {
                  setOpen(false);
                  onSelectType?.(option.type);
                }}
              >
                <Icon size={16} aria-hidden="true" />
                <span>
                  <strong>{option.label}</strong>
                  <em>{option.desc}</em>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
