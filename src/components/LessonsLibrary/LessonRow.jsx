import { Copy, Eye, Pencil, Play, Trash2 } from "lucide-react";
import { StatusBadge, TypeBadge } from "./LessonBadges";
import FavoriteStarButton from "./FavoriteStarButton";
import LessonRowThumbnail from "./LessonRowThumbnail";

export default function LessonRow({
  lesson,
  onStartLesson,
  onPreview,
  onEdit,
  onDuplicate,
  isFavorite,
  onToggleFavorite,
  onDeleteRequest
}) {
  return (
    <div className="lesson-row">
      <LessonRowThumbnail lesson={lesson} />

      <div className="lr-info">
        <span className="lc-subject">{lesson.subject}</span>
        <div className="lr-title-line">
          <h4>{lesson.title}</h4>
          <TypeBadge type={lesson.type} />
        </div>
        <p>{lesson.description || "No description yet."}</p>
      </div>

      <div className="lr-status">
        <StatusBadge status={lesson.status} label={lesson.statusLabel} />
      </div>

      <div className="lr-actions">
        <button
          type="button"
          className="btn small primary"
          onClick={() => onStartLesson?.(lesson)}
        >
          <Play size={13} fill="currentColor" />
          Start Lesson
        </button>
        <button
          type="button"
          className="btn small ghost"
          onClick={() => onPreview?.(lesson)}
        >
          <Eye size={13} />
          Preview
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Edit"
          onClick={() => onEdit?.(lesson)}
        >
          <Pencil size={14} />
        </button>
        <FavoriteStarButton
          active={isFavorite}
          onToggle={() => onToggleFavorite?.(lesson.id)}
        />
        <button
          type="button"
          className="icon-btn"
          aria-label="Duplicate"
          onClick={() => onDuplicate?.(lesson)}
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          className="icon-btn danger"
          aria-label="Delete lesson"
          onClick={() => onDeleteRequest?.(lesson)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
