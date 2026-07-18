import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  MonitorPlay,
  Play,
  Presentation,
  X
} from "lucide-react";
import { useTheme } from "../../themes/ThemeContext";
import { getLessonFile } from "../../utils/lessonFileStorage";
import { formatLessonText, youtubeEmbedUrl } from "../../utils/youtube";
import useStepReveal from "./useStepReveal";
import "./presentation-mode.css";

const PLAN_STEPS = [
  { key: "objective", title: "Objective", fallback: "objective" },
  { key: "materials", title: "Materials Needed", fallback: "materials" },
  { key: "activitySteps", title: "Notes", fallback: "activitySteps" },
  { key: "wrapUp", title: "Wrap-up / Assessment", fallback: "wrapUp" }
];

function buildSteps(lesson) {
  const plan = lesson?.lessonPlan || {};
  return PLAN_STEPS.map(step => ({
    title: step.title,
    body: String(plan[step.key] || lesson?.[step.fallback] || "").trim()
  }));
}

/**
 * Full-screen Present to Class / Preview mode — theme-aware via data-theme on the portal root.
 * Video is a standalone stage; lesson-plan copy lives in the plan panel.
 * Pass isPreview to use the same layout without marking the lesson complete.
 */
export default function PresentationMode({ lesson, isPreview = false, onClose, onComplete }) {
  const { theme } = useTheme();
  const steps = buildSteps(lesson);
  const { currentStep, visitedSteps, goTo, next, prev } = useStepReveal(steps.length);
  const embedUrl = youtubeEmbedUrl(lesson?.youtubeUrl);
  const thumb = lesson?.videoThumbnailUrl || lesson?.thumbnail;
  const [localFileUrl, setLocalFileUrl] = useState(null);
  const [localFile, setLocalFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileLoadError, setFileLoadError] = useState("");
  const allVisited = visitedSteps.size >= steps.length;
  const activeStep = steps[currentStep];
  const isPdf =
    localFile?.type === "application/pdf" ||
    String(localFile?.name || lesson?.fileName || "")
      .toLowerCase()
      .endsWith(".pdf");

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose?.();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [next, prev, onClose]);

  useEffect(() => {
    if (lesson?.type === "video" || !lesson?.fileId) {
      setLocalFile(null);
      setLocalFileUrl(null);
      setFileLoadError("");
      return undefined;
    }

    let cancelled = false;
    let objectUrl;
    setFileLoading(true);
    setFileLoadError("");

    getLessonFile(lesson.fileId)
      .then(record => {
        if (cancelled) return;
        if (!record?.blob) {
          setFileLoadError("This local file could not be found. Upload it again in Lesson Studio.");
          return;
        }
        objectUrl = URL.createObjectURL(record.blob);
        setLocalFile(record);
        setLocalFileUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setFileLoadError("This local file could not be opened. Upload it again in Lesson Studio.");
        }
      })
      .finally(() => {
        if (!cancelled) setFileLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [lesson?.fileId, lesson?.type]);

  if (!lesson) return null;

  return createPortal(
    <div className={`present-portal ${isPreview ? "is-preview" : ""}`} data-theme={theme}>
      <div
        className="present-shell"
        role="dialog"
        aria-modal="true"
        aria-label={isPreview ? "Lesson preview" : "Present to class"}
      >
        {isPreview ? (
          <div className="present-preview-banner" role="status">
            <Eye size={15} aria-hidden="true" />
            <span>
              Preview only — this is not a live lesson. Students are not being taught right now.
            </span>
          </div>
        ) : null}

        <header className="present-top">
          <div className="present-top-copy">
            <p className={`pt-eyebrow ${isPreview ? "preview" : ""}`}>
              {isPreview ? (
                <Eye size={14} aria-hidden="true" />
              ) : (
                <MonitorPlay size={14} aria-hidden="true" />
              )}
              {isPreview ? "Preview Mode" : "Present to Class"}
            </p>
            <h1>{lesson.title}</h1>
            <p className="pt-subject">{lesson.subject}</p>
          </div>
          <button
            type="button"
            className="present-close"
            onClick={onClose}
            aria-label={isPreview ? "Exit preview" : "Exit presentation"}
          >
            <X size={18} />
          </button>
        </header>

        <div className="present-body has-media">
          <section className="present-stage" aria-label="Lesson media">
            {lesson.type === "video" && embedUrl ? (
              <div className="present-media">
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : lesson.type === "video" && thumb ? (
              <div
                className="present-media present-media-thumb"
                style={{ backgroundImage: `url(${thumb})` }}
              >
                <div className="present-media-empty">
                  <Play size={28} />
                  <span>No playable video linked</span>
                </div>
              </div>
            ) : lesson.type === "video" ? (
              <div className="present-media present-media-placeholder">
                <Play size={36} />
                <span>No video for this lesson</span>
              </div>
            ) : fileLoading ? (
              <div className="present-media present-file-state">
                <span className="present-file-spinner" aria-hidden="true" />
                <strong>Opening {lesson.fileName || "lesson file"}…</strong>
              </div>
            ) : localFileUrl && isPdf ? (
              <div className="present-media present-file-viewer">
                <iframe
                  src={localFileUrl}
                  title={lesson.fileName || lesson.title}
                  className="present-pdf-frame"
                />
              </div>
            ) : localFileUrl ? (
              <div className="present-media present-file-state">
                {lesson.type === "presentation" ? (
                  <Presentation size={42} aria-hidden="true" />
                ) : (
                  <FileText size={42} aria-hidden="true" />
                )}
                <strong>{localFile?.name || lesson.fileName}</strong>
                <p>
                  {lesson.type === "presentation"
                    ? "PowerPoint files need conversion to PDF before slides can play in the browser."
                    : "Document lessons require a PDF. Re-upload this lesson as a PDF to present it in class."}
                </p>
                <a
                  className="present-file-download"
                  href={localFileUrl}
                  download={localFile?.name || lesson.fileName}
                >
                  <Download size={16} />
                  Download and open
                </a>
              </div>
            ) : (
              <div className="present-media present-file-state present-file-error">
                {lesson.type === "presentation" ? (
                  <Presentation size={42} aria-hidden="true" />
                ) : (
                  <FileText size={42} aria-hidden="true" />
                )}
                <strong>{lesson.fileName || "No file attached"}</strong>
                <p>
                  {fileLoadError ||
                    "Upload this file again in Lesson Studio to present it from this browser."}
                </p>
              </div>
            )}
          </section>

          <aside className="present-nav" aria-label="Lesson plan">
            <p className="pn-heading">Lesson plan</p>
            <ol className="pn-steps">
              {steps.map((step, index) => {
                const visited = visitedSteps.has(index);
                const current = currentStep === index;
                return (
                  <li key={step.title}>
                    <button
                      type="button"
                      className={`pn-step ${current ? "current" : ""} ${visited ? "visited" : ""}`}
                      onClick={() => goTo(index)}
                    >
                      <span className="pn-index">{index + 1}</span>
                      <span className="pn-title">{step.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="present-plan-copy">
              <p className="present-step-label">
                Step {currentStep + 1} of {steps.length}
              </p>
              <h2>{activeStep?.title}</h2>
              <div
                className={`present-step-body ${visitedSteps.has(currentStep) ? "revealed" : ""}`}
              >
                {activeStep?.body ? (
                  <div
                    className="present-step-html"
                    dangerouslySetInnerHTML={{
                      __html: formatLessonText(activeStep.body)
                    }}
                  />
                ) : (
                  <p className="present-step-empty">No notes for this section yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        <footer className="present-bottom">
          <button
            type="button"
            className="bb-nav"
            onClick={prev}
            disabled={currentStep === 0}
            aria-label="Previous step"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="bb-dots" role="tablist" aria-label="Steps">
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                className={`bb-dot ${currentStep === index ? "active" : ""} ${visitedSteps.has(index) ? "visited" : ""}`}
                aria-label={`Go to ${step.title}`}
                aria-current={currentStep === index ? "step" : undefined}
                onClick={() => goTo(index)}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button type="button" className="bb-nav" onClick={next} aria-label="Next step">
              <ChevronRight size={18} />
            </button>
          ) : isPreview ? (
            <button type="button" className="bb-complete preview-exit" onClick={onClose}>
              <Eye size={16} />
              Exit Preview
            </button>
          ) : (
            <button
              type="button"
              className="bb-complete"
              onClick={() => {
                onComplete?.(lesson);
                onClose?.();
              }}
            >
              <Check size={16} />
              {allVisited ? "Mark complete" : "Finish"}
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
