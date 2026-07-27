import { youtubeThumbnail } from "./youtube";

export const CREATED_LESSONS_KEY = "created_lessons";
export const LESSON_STUDIO_EDIT_KEY = "lesson_studio_edit_id";
export const LESSON_CREATE_TYPE_KEY = "mt.lesson.createType";

export function formatLessonStatus(status) {
  if (status === "Draft") return "Inactive";
  return status || "Inactive";
}

/**
 * Infer content type for type-aware library cards.
 * Legacy "document" lessons map to the merged class lesson ("plan").
 * @param {object} lesson
 * @returns {"video"|"presentation"|"plan"}
 */
export function resolveLessonType(lesson) {
  const raw = String(lesson?.type || lesson?.contentType || "").toLowerCase();
  if (raw === "document" || raw === "plan") {
    return "plan";
  }
  if (raw === "video" || raw === "presentation") {
    return raw;
  }
  if (lesson?.slideCount != null || lesson?.fileFormat === "PPT" || lesson?.fileFormat === "PPTX") {
    return "presentation";
  }
  if (lesson?.pageCount != null || lesson?.fileFormat === "PDF" || lesson?.fileFormat === "DOC" || lesson?.fileFormat === "DOCX") {
    return "plan";
  }
  return "video";
}

function normalizeLibraryStatus(status) {
  if (status === "Completed") return "completed";
  if (status === "Published") return "published";
  return "draft";
}

/**
 * Normalize a teacher-created lesson for the library grid.
 * @param {object} lesson
 */
export function mapCreatedLessonForLibrary(lesson) {
  const type = resolveLessonType(lesson);
  const statusLabel = formatLessonStatus(lesson.status);
  const thumb =
    lesson.videoThumbnailUrl ||
    lesson.thumbnail ||
    (lesson.youtubeUrl ? youtubeThumbnail(lesson.youtubeUrl) : null);

  return {
    ...lesson,
    type,
    subject: lesson.subject || "General",
    description: lesson.description || "",
    status: normalizeLibraryStatus(lesson.status),
    statusLabel,
    assignedCount: Number(lesson.assignedCount) || 0,
    videoThumbnailUrl: type === "video" ? thumb : undefined,
    durationSeconds: lesson.durationSeconds ?? null,
    pageCount: lesson.pageCount ?? null,
    fileFormat: lesson.fileFormat || null,
    slideCount: lesson.slideCount ?? null,
    module: lesson.subject || "General",
    topic: lesson.tags?.[0] || lesson.subject || "Lesson",
    grade: "Class Lesson",
    duration: "—",
    reward: 0,
    isCreated: true,
    thumbnail: thumb,
    libraryStatus: statusLabel
  };
}

let createdLessonsCache = null;

export function loadCreatedLessons() {
  if (createdLessonsCache) return createdLessonsCache;
  try {
    createdLessonsCache = JSON.parse(localStorage.getItem(CREATED_LESSONS_KEY)) || [];
    return createdLessonsCache;
  } catch {
    createdLessonsCache = [];
    return createdLessonsCache;
  }
}

export function saveCreatedLessons(lessons) {
  createdLessonsCache = lessons;
  localStorage.setItem(CREATED_LESSONS_KEY, JSON.stringify(lessons));
}
