import { useEffect, useRef, useState } from "react";
import { ChevronDown, ClipboardList, FileText, Presentation, Plus, Play } from "lucide-react";

const OPTIONS = [
  {
    type: "plan",
    label: "Curriculum",
    desc: "Build a text curriculum",
    icon: ClipboardList
  },
  {
    type: "video",
    label: "Video Lesson",
    desc: "Link a YouTube video",
    icon: Play
  },
  {
    type: "document",
    label: "Document",
    desc: "Upload a PDF (required)",
    icon: FileText
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
        type="button"
        className="btn primary-gold"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(current => !current)}
      >
        <Plus size={15} strokeWidth={2.5} />
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
                className="cm-item"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onSelectType?.(option.type);
                }}
              >
                <span className={`cm-icon ${option.type}`} aria-hidden="true">
                  <Icon size={16} />
                </span>
                <div>
                  <strong>{option.label}</strong>
                  <small>{option.desc}</small>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
