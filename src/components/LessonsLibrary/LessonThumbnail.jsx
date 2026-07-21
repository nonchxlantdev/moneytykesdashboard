import { ClipboardList, Play, Presentation } from "lucide-react";

function formatDuration(seconds) {
  if (seconds == null || !Number.isFinite(Number(seconds))) return null;
  const total = Math.max(0, Math.round(Number(seconds)));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function LessonThumbnail({ lesson }) {
  switch (lesson.type) {
    case "plan":
    case "document":
      return (
        <div className="lc-thumb plan-thumb">
          <div className="file-icon plan" aria-hidden="true">
            <ClipboardList size={28} />
          </div>
          <span className="lc-type-badge plan">Class Lesson</span>
          <span className="lc-filetype">
            {lesson.fileName
              ? `${lesson.fileFormat || "PDF"}${lesson.pageCount != null ? ` · ${lesson.pageCount} pages` : ""}`
              : "Class Lesson"}
          </span>
        </div>
      );
    case "presentation":
      return (
        <div className="lc-thumb slides-thumb">
          <div className="file-icon slides" aria-hidden="true">
            <Presentation size={28} />
          </div>
          <span className="lc-type-badge slides">Slides</span>
          <span className="lc-filetype">
            {lesson.slideCount != null ? `${lesson.slideCount} slides` : "Presentation"}
          </span>
        </div>
      );
    case "video":
    default: {
      const duration = formatDuration(lesson.durationSeconds);
      return (
        <div
          className="lc-thumb video-thumb"
          style={
            lesson.videoThumbnailUrl
              ? { backgroundImage: `url(${lesson.videoThumbnailUrl})` }
              : undefined
          }
        >
          <div className="yt-play" aria-hidden="true">
            <Play size={18} fill="currentColor" />
          </div>
          <span className="lc-type-badge video">Video</span>
          {duration ? <span className="lc-duration">{duration}</span> : null}
        </div>
      );
    }
  }
}
