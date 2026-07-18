import LessonCard from "../LessonsLibrary/LessonCard";
import "../LessonsLibrary/lessons-library.css";

/**
 * Live preview using the real Lessons Library LessonCard — not a lookalike.
 */
export default function LessonCardPreview({ lesson }) {
  return (
    <div className="preview-wrap">
      <p className="preview-label">How it&apos;ll look in your library</p>
      <div className="lessons-lib preview-card-host">
        <LessonCard lesson={lesson} interactive={false} />
      </div>
      <p className="preview-caption">Updates live as you fill out the form ←</p>
    </div>
  );
}
