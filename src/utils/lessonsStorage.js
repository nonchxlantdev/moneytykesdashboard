export const CREATED_LESSONS_KEY = "created_lessons";
export const LESSON_STUDIO_EDIT_KEY = "lesson_studio_edit_id";

/**
 * Normalize a teacher-created lesson for the library grid.
 * @param {object} lesson
 */
export function mapCreatedLessonForLibrary(lesson) {
  return {
    ...lesson,
    module: lesson.subject || "General",
    topic: lesson.tags?.[0] || lesson.subject || "Lesson",
    grade: "Class Lesson",
    duration: "—",
    reward: 0,
    isCreated: true,
    libraryStatus: lesson.status === "Completed" ? "Completed" : lesson.status === "Published" ? "Published" : "Draft"
  };
}

export function loadCreatedLessons() {
  try {
    return JSON.parse(localStorage.getItem(CREATED_LESSONS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCreatedLessons(lessons) {
  localStorage.setItem(CREATED_LESSONS_KEY, JSON.stringify(lessons));
}
