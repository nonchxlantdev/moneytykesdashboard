import { useMemo, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  CREATED_LESSONS_KEY,
  LESSON_STUDIO_EDIT_KEY,
  mapCreatedLessonForLibrary,
  saveCreatedLessons
} from "../../utils/lessonsStorage";

/**
 * TEMP placeholder subject taxonomy until a real backend list exists.
 * Intentionally general (not financial-literacy-only).
 */
export const TEMP_SUBJECT_OPTIONS = [
  "Math",
  "English",
  "Literature",
  "Belizean History",
  "History",
  "Science",
  "Geography",
  "Financial Literacy",
  "Life Skills"
];

export const CONTENT_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "plan", label: "Class Lessons" },
  { value: "video", label: "Videos" },
  { value: "presentation", label: "Presentations" }
];

export const STATUS_TABS = ["All Lessons", "Published", "Completed", "Inactive", "Favorites"];

export default function useLessonsLibrary() {
  const [createdLessons, setCreatedLessons] = useLocalStorage(CREATED_LESSONS_KEY, []);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Lessons");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [contentType, setContentType] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const lessons = useMemo(
    () => createdLessons.map(mapCreatedLessonForLibrary),
    [createdLessons]
  );
  const favorites = useMemo(
    () => createdLessons.filter(lesson => lesson.isFavorite).map(lesson => lesson.id),
    [createdLessons]
  );

  const subjectOptions = useMemo(() => {
    const fromLessons = lessons.map(lesson => lesson.subject).filter(Boolean);
    return [...new Set([...TEMP_SUBJECT_OPTIONS, ...fromLessons])].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [lessons]);

  const stats = useMemo(
    () => ({
      total: lessons.length,
      published: lessons.filter(lesson => lesson.status === "published").length,
      completed: lessons.filter(lesson => lesson.status === "completed").length,
      inactive: lessons.filter(lesson => lesson.status === "draft").length
    }),
    [lessons]
  );

  const filteredLessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons.filter(lesson => {
      const matchesQuery =
        !q ||
        `${lesson.title} ${lesson.subject} ${lesson.description || ""}`
          .toLowerCase()
          .includes(q);
      const matchesSubject =
        subjectFilter === "All Subjects" || lesson.subject === subjectFilter;
      const matchesType = contentType === "all" || lesson.type === contentType;

      let matchesTab = true;
      if (activeTab === "Favorites") {
        matchesTab = favorites.includes(lesson.id);
      } else if (activeTab === "Published") {
        matchesTab = lesson.status === "published";
      } else if (activeTab === "Completed") {
        matchesTab = lesson.status === "completed";
      } else if (activeTab === "Inactive") {
        matchesTab = lesson.status === "draft";
      }

      return matchesQuery && matchesSubject && matchesType && matchesTab;
    });
  }, [activeTab, contentType, favorites, lessons, query, subjectFilter]);

  function toggleFavorite(lessonId) {
    const next = createdLessons.map(lesson =>
      lesson.id === lessonId ? { ...lesson, isFavorite: !lesson.isFavorite } : lesson
    );
    saveCreatedLessons(next);
    setCreatedLessons(next);
  }

  function markCompleted(lesson) {
    if (!lesson) return;
    setCreatedLessons(current =>
      current.map(item =>
        item.id === lesson.id
          ? { ...item, status: "Completed", completedAt: new Date().toISOString() }
          : item
      )
    );
    setSelectedLesson(current =>
      current?.id === lesson.id
        ? {
            ...current,
            status: "completed",
            statusLabel: "Completed",
            libraryStatus: "Completed",
            completedAt: new Date().toISOString()
          }
        : current
    );
  }

  function editInStudio(lesson) {
    sessionStorage.setItem(LESSON_STUDIO_EDIT_KEY, String(lesson.id));
    setOpenMenuId(null);
  }

  function duplicateLesson(lesson) {
    const source = createdLessons.find(item => item.id === lesson.id);
    if (!source) return;
    const copy = {
      ...source,
      id: Date.now(),
      title: `${lesson.title} (Copy)`,
      status: "Inactive",
      isFavorite: false,
      createdAt: new Date().toISOString()
    };
    delete copy.completedAt;
    const next = [copy, ...createdLessons];
    saveCreatedLessons(next);
    setCreatedLessons(next);
  }

  function togglePublish(lesson) {
    if (!lesson || lesson.status === "completed") return;
    const nextStatus = lesson.status === "published" ? "Inactive" : "Published";
    const next = createdLessons.map(item =>
      item.id === lesson.id ? { ...item, status: nextStatus } : item
    );
    saveCreatedLessons(next);
    setCreatedLessons(next);
  }

  function requestDelete(lesson) {
    setPendingDelete(lesson);
    setOpenMenuId(null);
  }

  function cancelDelete() {
    setPendingDelete(null);
  }

  /**
   * Optimistic delete — localStorage is the current persistence layer.
   * Returns { ok, previous } so the UI can roll back if needed later.
   */
  function confirmDelete(lessonId) {
    const previous = createdLessons;
    const next = previous.filter(item => item.id !== lessonId);
    try {
      saveCreatedLessons(next);
      setCreatedLessons(next);
      if (selectedLesson?.id === lessonId) setSelectedLesson(null);
      setPendingDelete(null);
      setOpenMenuId(null);
      return { ok: true, previous };
    } catch {
      setCreatedLessons(previous);
      saveCreatedLessons(previous);
      setPendingDelete(null);
      return { ok: false, previous };
    }
  }

  return {
    lessons,
    filteredLessons,
    stats,
    subjectOptions,
    query,
    setQuery,
    activeTab,
    setActiveTab,
    subjectFilter,
    setSubjectFilter,
    contentType,
    setContentType,
    viewMode,
    setViewMode,
    favorites,
    toggleFavorite,
    selectedLesson,
    setSelectedLesson,
    openMenuId,
    setOpenMenuId,
    pendingDelete,
    markCompleted,
    editInStudio,
    duplicateLesson,
    togglePublish,
    requestDelete,
    cancelDelete,
    confirmDelete
  };
}
