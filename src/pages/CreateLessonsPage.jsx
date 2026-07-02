import { useEffect, useMemo, useState } from "react";
import { Bold, Italic, List, Play, Check, BookOpen, Plus, X, Search, Pencil, Trash2 } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useMediaQuery } from "../hooks/useMediaQuery";
import LessonCardMenu from "../components/LessonCardMenu";
import LessonDetailModal from "../components/LessonDetailModal";
import { CREATED_LESSONS_KEY, LESSON_STUDIO_EDIT_KEY, formatLessonStatus, mapCreatedLessonForLibrary } from "../utils/lessonsStorage";
import { isValidYoutubeUrl, youtubeThumbnail } from "../utils/youtube";

const SUBJECTS = [
  "Financial Literacy",
  "Economics",
  "Budgeting",
  "Saving",
  "Investing",
  "Mathematics",
  "Life Skills"
];

const emptyLesson = {
  title: "",
  subject: "Financial Literacy",
  youtubeUrl: "",
  description: "",
  tags: "",
  status: "Inactive"
};

function normalizeStatus(status) {
  return status === "Draft" ? "Inactive" : status || "Inactive";
}

function lessonToForm(lesson) {
  return {
    title: lesson.title || "",
    subject: lesson.subject || "Financial Literacy",
    youtubeUrl: lesson.youtubeUrl || "",
    description: lesson.description || "",
    tags: (lesson.tags || []).join(", "),
    status: lesson.status === "Completed" ? "Published" : normalizeStatus(lesson.status)
  };
}

/**
 * Create lessons studio — library panel plus editor for creating and editing lessons.
 * @param {{ db: object, setToast: (msg: string) => void, navigate: (view: string) => void }} props
 */
export default function CreateLessonsPage({ db, setToast, navigate }) {
  const [lessons, setLessons] = useLocalStorage(CREATED_LESSONS_KEY, []);
  const [form, setForm] = useState(emptyLesson);
  const [editingId, setEditingId] = useState(null);
  const [urlError, setUrlError] = useState("");
  const [descriptionRef, setDescriptionRef] = useState(null);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [previewLesson, setPreviewLesson] = useState(null);
  const [compactPanel, setCompactPanel] = useState("library");
  const isCompactLayout = useMediaQuery("(max-width: 1180px)");

  const subjects = useMemo(() => {
    const fromDb = new Set([db.className, ...db.students.map(s => s.classLabel).filter(Boolean)]);
    return [...new Set([...SUBJECTS, ...fromDb])];
  }, [db.className, db.students]);

  const filteredLessons = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase();
    if (!query) return lessons;
    return lessons.filter(lesson =>
      `${lesson.title} ${lesson.subject} ${lesson.description || ""}`.toLowerCase().includes(query)
    );
  }, [lessons, libraryQuery]);

  const thumbnail = isValidYoutubeUrl(form.youtubeUrl) ? youtubeThumbnail(form.youtubeUrl) : null;
  const isEditing = editingId !== null;

  useEffect(() => {
    const pendingId = sessionStorage.getItem(LESSON_STUDIO_EDIT_KEY);
    if (!pendingId) return;
    sessionStorage.removeItem(LESSON_STUDIO_EDIT_KEY);
    const lesson = lessons.find(item => String(item.id) === pendingId);
    if (!lesson) return;
    setEditingId(lesson.id);
    setForm(lessonToForm(lesson));
    setUrlError("");
    setOpenMenuId(null);
  }, []);

  function validateYoutubeUrl(url) {
    if (!url.trim()) {
      setUrlError("");
      return;
    }
    setUrlError(isValidYoutubeUrl(url) ? "" : "Enter a valid YouTube URL.");
  }

  function applyFormat(prefix, suffix = prefix) {
    if (!descriptionRef) return;
    const { selectionStart, selectionEnd, value } = descriptionRef;
    const selected = value.slice(selectionStart, selectionEnd);
    const next = `${value.slice(0, selectionStart)}${prefix}${selected}${suffix}${value.slice(selectionEnd)}`;
    setForm(current => ({ ...current, description: next }));
  }

  function addBullet() {
    setForm(current => ({ ...current, description: `${current.description}${current.description ? "\n" : ""}- ` }));
  }

  function startEditing(lesson) {
    setEditingId(lesson.id);
    setForm(lessonToForm(lesson));
    setUrlError("");
    setOpenMenuId(null);
    if (isCompactLayout) {
      setCompactPanel("studio");
    }
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyLesson);
    setUrlError("");
    if (isCompactLayout) {
      setCompactPanel("library");
    }
  }

  function deleteLesson(lesson) {
    const confirmed = window.confirm(`Delete "${lesson.title}"? This cannot be undone.`);
    if (!confirmed) return;
    setLessons(current => current.filter(item => item.id !== lesson.id));
    if (editingId === lesson.id) {
      cancelEditing();
    }
    setOpenMenuId(null);
    setToast("Lesson deleted.");
  }

  function deleteEditingLesson() {
    const lesson = lessons.find(item => item.id === editingId);
    if (lesson) {
      deleteLesson(lesson);
    }
  }

  function submitLesson(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setToast("Lesson title is required.");
      return;
    }
    if (form.youtubeUrl && !isValidYoutubeUrl(form.youtubeUrl)) {
      setToast("Please enter a valid YouTube URL.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      subject: form.subject,
      youtubeUrl: form.youtubeUrl.trim(),
      description: form.description.trim(),
      tags: form.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      status: form.status,
      thumbnail: youtubeThumbnail(form.youtubeUrl)
    };

    if (isEditing) {
      setLessons(current => current.map(item => item.id === editingId
        ? {
          ...item,
          ...payload,
          status: item.status === "Completed" ? "Completed" : payload.status
        }
        : item));
      setToast(payload.status === "Published" ? "Lesson updated and published." : "Lesson updated.");
      cancelEditing();
      return;
    }

    const lesson = {
      id: Date.now(),
      ...payload,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setLessons(current => [lesson, ...current]);
    setForm(emptyLesson);
    setUrlError("");
    setToast(form.status === "Published" ? "Lesson published to your library." : "Lesson saved as inactive.");
    if (isCompactLayout) {
      setCompactPanel("library");
    }
  }

  return (
    <section className="create-lessons-page">
      <div className="create-lessons-toolbar">
        <button className="secondary-action compact create-lessons-library-link" type="button" onClick={() => navigate("lessons")}>
          <Play size={14} /> <span className="create-lessons-library-link-text">View Full Lessons Library</span>
        </button>
      </div>

      {isCompactLayout && (
        <div className="create-lessons-mobile-tabs" role="tablist" aria-label="Create lessons panels">
          <button
            type="button"
            role="tab"
            className={compactPanel === "library" ? "active" : ""}
            aria-selected={compactPanel === "library"}
            onClick={() => setCompactPanel("library")}
          >
            <BookOpen size={15} /> Library <span className="create-lessons-tab-count">{lessons.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            className={compactPanel === "studio" ? "active" : ""}
            aria-selected={compactPanel === "studio"}
            onClick={() => setCompactPanel("studio")}
          >
            <Pencil size={15} /> {isEditing ? "Edit Lesson" : "Lesson Studio"}
          </button>
        </div>
      )}

      <div className={`create-lessons-layout ${isCompactLayout ? `compact-panel-${compactPanel}` : ""}`}>
        <aside className="section-panel create-lessons-library-panel">
          <div className="section-heading create-lessons-library-heading">
            <h2><BookOpen size={18} /> Your Lesson Library</h2>
            <span className="create-lessons-count">{lessons.length}</span>
          </div>

          <label className="lesson-search create-lessons-library-search">
            <Search size={16} />
            <input
              value={libraryQuery}
              onChange={event => setLibraryQuery(event.target.value)}
              placeholder="Search your lessons..."
            />
          </label>

          {filteredLessons.length ? (
            <div className="studio-lesson-list">
              {filteredLessons.map(lesson => {
                const libraryLesson = mapCreatedLessonForLibrary(lesson);
                const active = editingId === lesson.id;
                return (
                  <article
                    className={`studio-lesson-row ${active ? "active" : ""}`}
                    key={lesson.id}
                    onClick={() => startEditing(lesson)}
                    onKeyDown={event => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        startEditing(lesson);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                  >
                    <div className="studio-lesson-thumb" aria-hidden="true">
                      {lesson.thumbnail ? (
                        <img src={lesson.thumbnail} alt="" />
                      ) : (
                        <span className="studio-lesson-thumb-placeholder"><Play size={16} /></span>
                      )}
                    </div>

                    <div className="studio-lesson-details">
                      <h3>{lesson.title}</h3>
                      <p className="studio-lesson-subline">
                        <span>{lesson.subject}</span>
                        <span className="studio-lesson-dot">·</span>
                        <span>{formatLessonStatus(lesson.status)}</span>
                        {active && (
                          <>
                            <span className="studio-lesson-dot">·</span>
                            <span className="studio-lesson-editing-label">Editing</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="studio-lesson-actions" onClick={event => event.stopPropagation()}>
                      <button
                        type="button"
                        className="studio-lesson-edit-btn"
                        onClick={() => startEditing(lesson)}
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <LessonCardMenu
                        variant="studio"
                        open={openMenuId === lesson.id}
                        onToggle={event => {
                          event.stopPropagation();
                          setOpenMenuId(current => current === lesson.id ? null : lesson.id);
                        }}
                        onClose={() => setOpenMenuId(null)}
                        onEdit={() => startEditing(lesson)}
                        onPreview={() => {
                          setPreviewLesson(libraryLesson);
                          setOpenMenuId(null);
                        }}
                        onDelete={() => deleteLesson(lesson)}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="create-lessons-empty">
              <BookOpen size={28} />
              <p>{lessons.length ? "No lessons match your search." : "Saved lessons appear here. Create your first lesson in the studio."}</p>
            </div>
          )}
        </aside>

        <article className="section-panel create-lesson-form-card">
          <div className="section-heading create-lesson-studio-heading">
            <h2>{isEditing ? "Edit Lesson" : "Lesson Studio"}</h2>
            <div className="lesson-studio-heading-actions">
              {isEditing && (
                <button
                  className="lesson-studio-delete-icon"
                  type="button"
                  aria-label="Delete lesson"
                  onClick={deleteEditingLesson}
                >
                  <Trash2 size={18} />
                </button>
              )}
              {isEditing && (
                <button className="secondary-action compact" type="button" onClick={cancelEditing}>
                  <Plus size={14} /> New Lesson
                </button>
              )}
            </div>
          </div>

          <form className="stacked-form" onSubmit={submitLesson}>
            <label className="field-label">
              Lesson Title
              <input type="text" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} required />
            </label>

            <label className="field-label">
              Subject
              <select value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })}>
                {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </label>

            <label className="field-label">
              YouTube URL
              <input
                type="url"
                value={form.youtubeUrl}
                placeholder="https://www.youtube.com/watch?v=..."
                onChange={event => setForm({ ...form, youtubeUrl: event.target.value })}
                onBlur={event => validateYoutubeUrl(event.target.value)}
              />
              {urlError && <span className="field-error">{urlError}</span>}
              {thumbnail && <img className="lesson-youtube-preview" src={thumbnail} alt="YouTube thumbnail preview" />}
            </label>

            <div className="field-label">
              Lesson Plan / Description
              <div className="lesson-editor-toolbar">
                <button type="button" onClick={() => applyFormat("**")} aria-label="Bold"><Bold size={15} /></button>
                <button type="button" onClick={() => applyFormat("*")} aria-label="Italic"><Italic size={15} /></button>
                <button type="button" onClick={addBullet} aria-label="Bullet list"><List size={15} /></button>
              </div>
              <textarea
                ref={setDescriptionRef}
                rows={8}
                value={form.description}
                placeholder="Write your lesson plan. Use **bold**, *italic*, and - bullet lines."
                onChange={event => setForm({ ...form, description: event.target.value })}
              />
            </div>

            <label className="field-label">
              Tags <span className="field-optional">(optional, comma-separated)</span>
              <input type="text" value={form.tags} onChange={event => setForm({ ...form, tags: event.target.value })} />
            </label>

            <div className="field-label lesson-status-field">
              <span className="lesson-status-label">Status</span>
              <div className="lesson-status-segmented" role="group" aria-label="Lesson status">
                {["Inactive", "Published"].map(status => (
                  <button
                    key={status}
                    type="button"
                    className={normalizeStatus(form.status) === status ? "active" : ""}
                    aria-pressed={normalizeStatus(form.status) === status}
                    onClick={() => setForm({ ...form, status })}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <p className="lesson-status-hint">
                {form.status === "Published" ? "Visible in your lessons library for class use." : "Hidden from class until you publish."}
              </p>
            </div>

            <footer className="lesson-studio-footer">
              <div className="lesson-studio-footer-actions">
                <button className="primary-action teal-action lesson-studio-save" type="submit">
                  {isEditing ? <Check size={16} /> : <Play size={16} />}
                  {isEditing ? "Update Lesson" : "Save Lesson"}
                </button>
                {isEditing ? (
                  <button className="secondary-action lesson-studio-cancel" type="button" onClick={cancelEditing}>
                    <X size={14} /> Cancel
                  </button>
                ) : !isCompactLayout ? (
                  <button className="secondary-action lesson-studio-cancel" type="button" onClick={() => navigate("lessons")}>
                    <Check size={14} /> Go to Library
                  </button>
                ) : null}
              </div>
            </footer>
          </form>
        </article>
      </div>

      <LessonDetailModal
        lesson={previewLesson}
        onClose={() => setPreviewLesson(null)}
        onMarkComplete={() => setPreviewLesson(null)}
      />
    </section>
  );
}
