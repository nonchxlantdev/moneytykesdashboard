import { useMemo, useState } from "react";
import { Bold, Italic, List, Play, Check } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { CREATED_LESSONS_KEY } from "../utils/lessonsStorage";
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
  status: "Draft"
};

/**
 * Create lessons form — saved lessons appear in the Lessons library.
 * @param {{ db: object, setToast: (msg: string) => void, navigate: (view: string) => void }} props
 */
export default function CreateLessonsPage({ db, setToast, navigate }) {
  const [, setLessons] = useLocalStorage(CREATED_LESSONS_KEY, []);
  const [form, setForm] = useState(emptyLesson);
  const [urlError, setUrlError] = useState("");
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
    setToast(form.status === "Published" ? "Lesson published to your Lessons library." : "Lesson saved as draft. View it in Lessons.");
  }

  return (
    <section className="create-lessons-page">
      <div className="create-lessons-toolbar">
        <button className="secondary-action compact create-lessons-library-link" type="button" onClick={() => navigate("lessons")}>
          <Play size={14} /> View Lessons Library
        </button>
      </div>

      <article className="section-panel create-lesson-form-card create-lesson-form-only">
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

          <div className="create-lesson-actions">
            <button className="primary-action teal-action" type="submit">
              <Play size={16} /> Save Lesson
            </button>
            <button className="secondary-action compact" type="button" onClick={() => navigate("lessons")}>
              <Check size={14} /> Go to Lessons Library
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}
