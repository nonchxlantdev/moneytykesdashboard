import { useMemo, useState } from "react";
import { Bold, Check, Italic, List, Play, Search } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import {
  formatLessonText,
  isValidYoutubeUrl,
  youtubeEmbedUrl,
  youtubeThumbnail
} from "../utils/youtube";

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
  status: "Draft"
};

/**
 * Create lessons form and saved lessons library.
 * @param {{ db: object, setToast: (msg: string) => void }} props
 */
export default function CreateLessonsPage({ db, setToast }) {
  const [lessons, setLessons] = useLocalStorage("created_lessons", []);
  const [form, setForm] = useState(emptyLesson);
  const [urlError, setUrlError] = useState("");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [descriptionRef, setDescriptionRef] = useState(null);

  const subjects = useMemo(() => {
    const fromDb = new Set([db.className, ...db.students.map(s => s.classLabel).filter(Boolean)]);
    return [...new Set([...SUBJECTS, ...fromDb])];
  }, [db.className, db.students]);

  const thumbnail = isValidYoutubeUrl(form.youtubeUrl) ? youtubeThumbnail(form.youtubeUrl) : null;

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
    const lesson = {
      id: Date.now(),
      title: form.title.trim(),
      subject: form.subject,
      youtubeUrl: form.youtubeUrl.trim(),
      description: form.description.trim(),
      tags: form.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      status: form.status,
      thumbnail: youtubeThumbnail(form.youtubeUrl),
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setLessons(current => [lesson, ...current]);
    setForm(emptyLesson);
    setUrlError("");
    setToast("Lesson saved to library.");
  }

  function markCompleted(lesson) {
    setLessons(current => current.map(item => item.id === lesson.id
      ? { ...item, status: "Completed", completedAt: new Date().toISOString() }
      : item));
    setSelectedLesson(current => current ? { ...current, status: "Completed", completedAt: new Date().toISOString() } : current);
    setToast("Lesson marked as completed.");
  }

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "all" || lesson.subject === subjectFilter;
    const matchesStatus = statusFilter === "all" || lesson.status === statusFilter;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <section className="create-lessons-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Curriculum</p>
          <h2>Create Lessons</h2>
        </div>
      </div>

      <div className="create-lessons-layout">
        <article className="section-panel create-lesson-form-card">
          <div className="section-heading"><h2>Create Lesson</h2></div>
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
                rows={6}
                value={form.description}
                placeholder="Write your lesson plan. Use **bold**, *italic*, and - bullet lines."
                onChange={event => setForm({ ...form, description: event.target.value })}
              />
            </div>

            <label className="field-label">
              Tags <span className="field-optional">(optional, comma-separated)</span>
              <input type="text" value={form.tags} onChange={event => setForm({ ...form, tags: event.target.value })} />
            </label>

            <div className="lesson-status-toggle">
              <span>Status</span>
              {["Draft", "Published"].map(status => (
                <button
                  key={status}
                  type="button"
                  className={form.status === status ? "active" : ""}
                  onClick={() => setForm({ ...form, status })}
                >
                  {status}
                </button>
              ))}
            </div>

            <button className="primary-action teal-action" type="submit">
              <Play size={16} /> Save Lesson
            </button>
          </form>
        </article>

        <article className="section-panel lessons-library-card">
          <div className="section-heading"><h2>Lessons Library</h2></div>

          <div className="lessons-library-filters">
            <label className="lesson-search">
              <Search size={16} />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by title..." />
            </label>
            <select value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)}>
              <option value="all">All Subjects</option>
              {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </select>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {filteredLessons.length ? (
            <div className="created-lessons-grid">
              {filteredLessons.map(lesson => (
                <button type="button" className="created-lesson-card" key={lesson.id} onClick={() => setSelectedLesson(lesson)}>
                  <div className="created-lesson-thumb">
                    {lesson.thumbnail ? <img src={lesson.thumbnail} alt="" /> : <Play size={24} />}
                    {lesson.status === "Completed" && <span className="lesson-complete-badge"><Check size={14} /></span>}
                  </div>
                  <div className="created-lesson-body">
                    <strong>{lesson.title}</strong>
                    <Badge tone="teal">{lesson.subject}</Badge>
                    <Badge tone={lesson.status === "Completed" ? "success" : "default"}>{lesson.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="No lessons yet" text="Create your first lesson to populate the library." icon={<Play size={24} />} />
          )}
        </article>
      </div>

      <Modal open={Boolean(selectedLesson)} onClose={() => setSelectedLesson(null)} title={selectedLesson?.title}>
        {selectedLesson && (
          <div className="lesson-detail-layout">
            <div className="lesson-detail-video">
              {youtubeEmbedUrl(selectedLesson.youtubeUrl) ? (
                <iframe
                  src={youtubeEmbedUrl(selectedLesson.youtubeUrl)}
                  title={selectedLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <EmptyState title="No video attached" text="Add a YouTube URL when creating the lesson." />
              )}
            </div>
            <div className="lesson-detail-plan">
              <div className="lesson-detail-meta">
                <Badge tone="teal">{selectedLesson.subject}</Badge>
                <Badge tone={selectedLesson.status === "Completed" ? "success" : "default"}>{selectedLesson.status}</Badge>
              </div>
              <div
                className="lesson-detail-content"
                dangerouslySetInnerHTML={{ __html: formatLessonText(selectedLesson.description) }}
              />
              {selectedLesson.status !== "Completed" && (
                <button type="button" className="primary-action teal-action" onClick={() => markCompleted(selectedLesson)}>
                  <Check size={16} /> Mark as Completed
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
