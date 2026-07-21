import { ClipboardList, Play, Presentation } from "lucide-react";

const TYPES = [
  {
    id: "plan",
    label: "Build a Class Lesson",
    desc: "Build a text lesson plan",
    icon: ClipboardList,
    tone: "plan"
  },
  {
    id: "video",
    label: "Video Lesson",
    desc: "Link a YouTube video",
    icon: Play,
    tone: "video"
  },
  {
    id: "presentation",
    label: "Presentation",
    desc: "Upload slides",
    icon: Presentation,
    tone: "slides"
  }
];

export default function TypePicker({ selected, onSelect }) {
  return (
    <div className="type-picker" role="radiogroup" aria-label="Lesson content type">
      {TYPES.map(type => {
        const Icon = type.icon;
        const active = selected === type.id || (type.id === "plan" && selected === "document");
        return (
          <button
            key={type.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={`type-card ${active ? "active" : ""}`}
            onClick={() => onSelect(type.id)}
          >
            <div className={`tc-icon ${type.tone}`} aria-hidden="true">
              <Icon size={22} />
            </div>
            <strong>{type.label}</strong>
            <span>{type.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
