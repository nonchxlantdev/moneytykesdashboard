import { Copy, Eye, Pencil, Play, Trash2 } from "lucide-react";
import { StatusBadge } from "./LessonBadges";
import FavoriteStarButton from "./FavoriteStarButton";
import LessonThumbnail from "./LessonThumbnail";

/**
 * Library lesson card. Pass interactive={false} for Studio live preview
 * (hides action controls).
 */
export default function LessonCard({
  lesson,
  viewMode,
  isFavorite,
  interactive = true,
  onOpen,
  onStartLesson,
  onPreview,
  onEdit,
  onDuplicate,
  onDeleteRequest,
  onToggleFavorite
}) {
  return (
    <article
      className={`lesson-card ${viewMode === "list" ? "list-mode" : ""} ${interactive ? "" : "is-preview"}`.trim()}
      onClick={interactive ? onOpen : undefined}
    >
      <LessonThumbnail lesson={lesson} />

      <div className="lc-body">
        <div className="lc-top">
          <span className="lc-subject">{lesson.subject}</span>
        </div>
        <h4>{lesson.title}</h4>
        <p>
          {lesson.description
            ? lesson.description.slice(0, 110) + (lesson.description.length > 110 ? "…" : "")
            : "No description yet."}
        </p>
        <div className="lc-meta">
          <StatusBadge status={lesson.status} label={lesson.statusLabel} />
        </div>
      </div>

      {interactive ? (
        <div className="lc-actions" onClick={event => event.stopPropagation()}>
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
            stopPropagation
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
      ) : null}
    </article>
  );
}
