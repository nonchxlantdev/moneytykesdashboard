import { useMemo, useState } from "react";
import { BookOpen, Check, Heart, Pencil, Play, Search, Trophy, Users } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Badge from "../components/Badge";
import LessonCardMenu from "../components/LessonCardMenu";
import LessonDetailModal from "../components/LessonDetailModal";
import { CREATED_LESSONS_KEY, LESSON_STUDIO_EDIT_KEY, formatLessonStatus, mapCreatedLessonForLibrary } from "../utils/lessonsStorage";
import { formatPoints } from "../utils/points";

/**
 * Lessons library — displays teacher-created lessons from Create Lessons.
 * @param {{ setToast: (msg: string) => void, navigate: (view: string) => void }} props
 */
export default function LessonsLibraryPage({ setToast, navigate }) {
  const [createdLessons, setCreatedLessons] = useLocalStorage(CREATED_LESSONS_KEY, []);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Lessons");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [favorites, setFavorites] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const lessons = useMemo(
    () => createdLessons.map(mapCreatedLessonForLibrary),
    [createdLessons]
  );

  const subjects = useMemo(
    () => [...new Set(lessons.map(lesson => lesson.subject).filter(Boolean))],
    [lessons]
  );

  const stats = useMemo(() => ({
    total: lessons.length,
    published: lessons.filter(lesson => lesson.status === "Published").length,
    completed: lessons.filter(lesson => lesson.status === "Completed").length,
    drafts: lessons.filter(lesson => lesson.status === "Draft" || lesson.status === "Inactive").length
  }), [lessons]);

  const filteredLessons = lessons.filter(lesson => {
    const matchesQuery = `${lesson.title} ${lesson.subject} ${lesson.description || ""}`.toLowerCase().includes(query.toLowerCase());
    const matchesTab = activeTab === "All Lessons"
      || (activeTab === "Favorites" ? favorites.includes(lesson.id) : lesson.libraryStatus === activeTab || lesson.status === activeTab)
      || (activeTab === "Published" && lesson.status === "Published")
      || (activeTab === "Inactive" && (lesson.status === "Draft" || lesson.status === "Inactive"));
    const matchesSubject = subjectFilter === "All Subjects" || lesson.subject === subjectFilter;
    return matchesQuery && matchesTab && matchesSubject;
  });

  function toggleFavorite(event, lessonId) {
    event.stopPropagation();
    setFavorites(current => current.includes(lessonId)
      ? current.filter(id => id !== lessonId)
      : [...current, lessonId]);
  }

  function markCompleted(event, lesson) {
    event?.stopPropagation();
    setCreatedLessons(current => current.map(item => item.id === lesson.id
      ? { ...item, status: "Completed", completedAt: new Date().toISOString() }
      : item));
    setSelectedLesson(current => current?.id === lesson.id
      ? { ...current, status: "Completed", libraryStatus: "Completed", completedAt: new Date().toISOString() }
      : current);
    setToast("Lesson marked as completed.");
  }

  function editInStudio(event, lesson) {
    event?.stopPropagation();
    sessionStorage.setItem(LESSON_STUDIO_EDIT_KEY, String(lesson.id));
    setOpenMenuId(null);
    navigate("create-lessons");
  }

  function deleteLesson(event, lesson) {
    event?.stopPropagation();
    const confirmed = window.confirm(`Delete "${lesson.title}"? This cannot be undone.`);
    if (!confirmed) return;
    setCreatedLessons(current => current.filter(item => item.id !== lesson.id));
    if (selectedLesson?.id === lesson.id) {
      setSelectedLesson(null);
    }
    setOpenMenuId(null);
    setToast("Lesson deleted.");
  }

  return (
    <section className="lessons-library" aria-label="Lessons library">
      <div className="lesson-stats-grid">
        {[
          { label: "Total Lessons", value: stats.total, meta: "In your library", icon: BookOpen },
          { label: "Published", value: stats.published, meta: "Ready for class", icon: Users },
          { label: "Completed", value: stats.completed, meta: "Finished lessons", icon: Check },
          { label: "Inactive", value: stats.drafts, meta: "Not published yet", icon: Pencil }
        ].map(({ label, value, meta, icon: Icon }) => (
          <article className="lesson-stat-card" key={label}>
            <span className="lesson-stat-icon"><Icon /></span>
            <span><small>{label}</small><strong>{value}</strong><em>{meta}</em></span>
          </article>
        ))}
      </div>

      <div className="lesson-filter-bar">
        <select value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)} aria-label="Subject">
          <option>All Subjects</option>
          {subjects.map(value => <option key={value}>{value}</option>)}
        </select>
        <label className="lesson-search">
          <Search />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search lessons..." />
        </label>
        <button className="secondary-action compact lesson-create-link" type="button" onClick={() => navigate("create-lessons")}>
          <Pencil size={14} /> Create Lesson
        </button>
      </div>

      <div className="lesson-tabs" role="tablist" aria-label="Lesson status">
        {["All Lessons", "Published", "Completed", "Inactive", "Favorites"].map(tab => (
          <button
            className={activeTab === tab ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredLessons.length ? (
        <div className="lesson-card-grid">
          {filteredLessons.map(lesson => (
            <article className="lesson-card" key={lesson.id} onClick={() => setSelectedLesson(lesson)}>
              <div className="lesson-thumbnail">
                {lesson.thumbnail ? <img src={lesson.thumbnail} alt="" /> : <Play size={32} />}
                <span className="lesson-play"><Play fill="currentColor" /></span>
                {lesson.status === "Completed" && <span className="lesson-complete-badge"><Check size={14} /></span>}
                <LessonCardMenu
                  open={openMenuId === lesson.id}
                  onToggle={event => {
                    event.stopPropagation();
                    setOpenMenuId(current => current === lesson.id ? null : lesson.id);
                  }}
                  onClose={() => setOpenMenuId(null)}
                  onEdit={() => editInStudio(null, lesson)}
                  onDelete={() => deleteLesson(null, lesson)}
                />
                <button
                  className={`lesson-favorite ${favorites.includes(lesson.id) ? "active" : ""}`}
                  type="button"
                  aria-label="Toggle favorite"
                  onClick={event => toggleFavorite(event, lesson.id)}
                >
                  <Heart fill={favorites.includes(lesson.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="lesson-card-body">
                <div className="lesson-card-heading">
                  <span>{lesson.subject}</span>
                  <Badge tone={lesson.status === "Completed" ? "success" : "teal"}>{formatLessonStatus(lesson.status)}</Badge>
                </div>
                <h2>{lesson.title}</h2>
                <p>{lesson.description ? lesson.description.slice(0, 80) : lesson.subject}</p>
                <div className="lesson-card-footer">
                  <span className="lesson-status"><Play /> {lesson.libraryStatus}</span>
                  {lesson.reward > 0 && <strong className="lesson-reward"><Trophy size={14} /> {formatPoints(lesson.reward)}</strong>}
                </div>
                {lesson.status !== "Completed" && (
                  <button
                    className="lesson-complete-button"
                    type="button"
                    onClick={event => markCompleted(event, lesson)}
                  >
                    <Check size={14} /> Mark Completed
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="lesson-empty">
          <BookOpen />
          <h2>No lessons in your library yet</h2>
          <p>Create a lesson and it will appear here once saved.</p>
          <button className="primary-action teal-action" type="button" onClick={() => navigate("create-lessons")}>
            <Pencil size={16} /> Create Your First Lesson
          </button>
        </div>
      )}

      <LessonDetailModal
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
        onMarkComplete={() => markCompleted(null, selectedLesson)}
      />
    </section>
  );
}
