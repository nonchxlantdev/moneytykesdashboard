import LessonRow from "./LessonRow";

export default function LessonList({
  lessons,
  onStartLesson,
  onPreview,
  onEdit,
  onDuplicate,
  favorites,
  onToggleFavorite,
  onDeleteRequest
}) {
  return (
    <div className="lesson-list" aria-label="Lesson list" data-tour="lessons-grid">
      {lessons.map(lesson => (
        <LessonRow
          key={lesson.id}
          lesson={lesson}
          onStartLesson={onStartLesson}
          onPreview={onPreview}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          isFavorite={favorites.includes(lesson.id)}
          onToggleFavorite={onToggleFavorite}
          onDeleteRequest={onDeleteRequest}
        />
      ))}
    </div>
  );
}
