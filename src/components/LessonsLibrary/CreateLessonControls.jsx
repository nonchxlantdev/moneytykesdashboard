import { useEffect, useRef, useState } from "react";
import { ChevronDown, ClipboardList, FileText, LayoutGrid, Play, Plus, Presentation } from "lucide-react";
import { LESSON_CREATE_TYPE_KEY } from "../../utils/lessonsStorage";

export function TemplatesButton() {
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="templates-btn-wrap">
      <button
        className="btn ghost templates-btn"
        type="button"
        onClick={() => {
          setShowToast(true);
          window.setTimeout(() => setShowToast(false), 1600);
        }}
      >
        <LayoutGrid size={15} />
        Browse Templates
      </button>
      {showToast ? <span className="soon-toast show">Coming soon!</span> : null}
    </div>
  );
}

const CREATE_TOAST = {
  video: "Opening video lesson studio…",
  document: "Opening document lesson studio…",
  presentation: "Opening presentation lesson studio…",
  plan: "Opening curriculum studio…",
};

const CREATE_OPTIONS = [
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

export function CreateLessonDropdown({ navigate, setToast }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onSelectType(type) {
    setOpen(false);
    try {
      sessionStorage.setItem(LESSON_CREATE_TYPE_KEY, type);
    } catch {
      /* ignore */
    }
    setToast?.(CREATE_TOAST[type] || "Opening lesson studio…");
    navigate?.("create-lessons");
  }

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
          {CREATE_OPTIONS.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                type="button"
                className="cm-item"
                role="menuitem"
                onClick={() => onSelectType(option.type)}
              >
                <span className={`cm-icon ${option.type}`}>
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
