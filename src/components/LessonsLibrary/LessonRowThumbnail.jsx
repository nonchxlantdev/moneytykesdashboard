import { ClipboardList, Play, Presentation } from "lucide-react";

function formatDuration(seconds) {
  if (seconds == null || !Number.isFinite(Number(seconds))) return null;
  const total = Math.max(0, Math.round(Number(seconds)));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/** Compact 120×68 thumbnail for list rows — no type/page-count badges. */
export default function LessonRowThumbnail({ lesson }) {
  switch (lesson.type) {
    case "plan":
    case "document":
      return (
        <div className="lr-thumb plan-thumb">
          <div className="file-icon plan sm" aria-hidden="true">
            <ClipboardList size={18} />
          </div>
        </div>
      );
    case "presentation":
      return (
        <div className="lr-thumb slides-thumb">
          <div className="file-icon slides sm" aria-hidden="true">
            <Presentation size={18} />
          </div>
        </div>
      );
    case "video":
    default: {
      const duration = formatDuration(lesson.durationSeconds);
      return (
        <div
          className="lr-thumb video-thumb"
          style={
            lesson.videoThumbnailUrl
              ? { backgroundImage: `url(${lesson.videoThumbnailUrl})` }
              : undefined
          }
        >
          <div className="yt-play sm" aria-hidden="true">
            <Play size={12} fill="currentColor" />
          </div>
          {duration ? <span className="lr-duration">{duration}</span> : null}
        </div>
      );
    }
  }
}
