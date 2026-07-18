import { BookOpen, Check, MonitorPlay, Play, X } from "lucide-react";
import Badge from "./Badge";
import { formatLessonText, youtubeEmbedUrl } from "../utils/youtube";
import { formatLessonStatus } from "../utils/lessonsStorage";

function PlanSection({ title, body }) {
  if (!body?.trim()) return null;
  return (
    <div className="lesson-app-plan-section">
      <h4>{title}</h4>
      <div
        className="lesson-app-content"
        dangerouslySetInnerHTML={{ __html: formatLessonText(body) }}
      />
    </div>
  );
}

/**
 * Compact lesson preview modal.
 * @param {{
 *   lesson: object|null,
 *   onClose: () => void,
 *   onMarkComplete: () => void,
 *   onPresent?: (lesson: object) => void
 * }} props
 */
export default function LessonDetailModal({ lesson, onClose, onMarkComplete, onPresent }) {
  if (!lesson) return null;

  const embedUrl = youtubeEmbedUrl(lesson.youtubeUrl);
  const isCompleted = lesson.status === "Completed" || lesson.status === "completed";
  const plan = lesson.lessonPlan || {};
  const objective = plan.objective || lesson.objective || "";
  const materials = plan.materials || lesson.materials || "";
  const activitySteps = plan.activitySteps || lesson.activitySteps || "";
  const wrapUp = plan.wrapUp || lesson.wrapUp || "";
  const hasStructuredPlan = Boolean(
    objective || materials || activitySteps || wrapUp
  );

  return (
    <div className="lesson-app-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="lesson-app-modal"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-app-title"
      >
        <button type="button" className="lesson-app-close" onClick={onClose} aria-label="Close lesson">
          <X size={18} />
        </button>

        <div className="lesson-app-hero">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : lesson.thumbnail || lesson.videoThumbnailUrl ? (
            <img
              src={lesson.thumbnail || lesson.videoThumbnailUrl}
              alt=""
              className="lesson-app-hero-image"
            />
          ) : (
            <div className="lesson-app-hero-placeholder">
              <Play size={36} />
              <span>No video attached</span>
            </div>
          )}
          <div className="lesson-app-hero-gradient" aria-hidden="true" />
        </div>

        <div className="lesson-app-scroll">
          <header className="lesson-app-header">
            <p className="lesson-app-eyebrow">{lesson.subject}</p>
            <h2 id="lesson-app-title">{lesson.title}</h2>
            <div className="lesson-app-badges">
              <Badge tone="teal">{lesson.subject}</Badge>
              <Badge tone={isCompleted ? "success" : "default"}>
                {lesson.statusLabel || formatLessonStatus(lesson.status)}
              </Badge>
              {lesson.tags?.slice(0, 2).map(tag => (
                <span className="lesson-app-tag" key={tag}>{tag}</span>
              ))}
            </div>
          </header>

          <article className="lesson-app-plan-card">
            <div className="lesson-app-plan-heading">
              <BookOpen size={16} />
              <h3>Lesson Plan</h3>
            </div>
            {hasStructuredPlan ? (
              <div className="lesson-app-plan-sections">
                <PlanSection title="Objective" body={objective} />
                <PlanSection title="Materials Needed" body={materials} />
                <PlanSection title="Notes" body={activitySteps} />
                <PlanSection title="Wrap-up / Assessment" body={wrapUp} />
              </div>
            ) : lesson.description ? (
              <div
                className="lesson-app-content"
                dangerouslySetInnerHTML={{ __html: formatLessonText(lesson.description) }}
              />
            ) : (
              <p className="lesson-app-empty-plan">No lesson plan notes yet. Add details when creating the lesson.</p>
            )}
          </article>
        </div>

        <footer className="lesson-app-footer lesson-app-footer-split">
          {onPresent ? (
            <button
              type="button"
              className="primary-action teal-action lesson-app-present-btn"
              onClick={() => onPresent(lesson)}
            >
              <MonitorPlay size={16} /> Present to Class
            </button>
          ) : null}
          {isCompleted ? (
            <div className="lesson-app-completed">
              <Check size={16} />
              <span>Lesson completed</span>
            </div>
          ) : (
            <button type="button" className="secondary-action lesson-app-complete-btn" onClick={onMarkComplete}>
              <Check size={16} /> Mark as Completed
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
