import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import PageChalkBanner from "../shared/PageChalkBanner";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { getAllAttendanceRows } from "../../utils/attendanceStorage";
import {
  eventTypeMeta,
  formatTime12,
  isEventToday,
  normalizeCalendarEvent
} from "../../utils/calendarUtils";
import { loadCreatedLessons } from "../../utils/lessonsStorage";
import { getRecentAwards } from "../../utils/rewardsStorage";
import {
  getReflectionsForTeacher,
  MY_DAY_NOTES_KEY,
  MY_DAY_TASKS_KEY,
  todayIso,
  upsertReflection
} from "../../utils/myDayStorage";
import { playStampSound } from "../../utils/stampSound";
import "./my-day.css";

/** Pushpin graphic rendered as a sibling of the pinned card — never clipped by
 *  the card's own torn-edge clip-path, so it actually shows on top of it. */
function Thumbtack() {
  return <span className="my-day-thumbtack" aria-hidden="true" />;
}

const TIP_FALLBACK = "Encourage small savings habits today for a brighter tomorrow.";

/** Word-stamp moods — short on purpose so they read cleanly inside a stamp shape. */
const MOODS = [
  { id: "great", label: "Great", tone: "great" },
  { id: "good", label: "Good", tone: "good" },
  { id: "okay", label: "Okay", tone: "okay" },
  { id: "rough", label: "Rough", tone: "rough" }
];

function timeGreeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function nextBirthdayDate(dob, today = new Date()) {
  if (!dob) return null;
  const birth = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const year = today.getFullYear();
  let next = new Date(year, birth.getMonth(), birth.getDate());
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (next < startOfToday) {
    next = new Date(year + 1, birth.getMonth(), birth.getDate());
  }
  return next;
}

function formatShortDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function buildStudentAlerts(db) {
  const today = todayIso();
  const cutoff = isoDaysAgo(14);
  const students = db.students || [];
  const byId = new Map(students.map(s => [String(s.id), s]));

  const absentCounts = new Map();
  getAllAttendanceRows().forEach(row => {
    if (row.date < cutoff || row.date > today) return;
    if (row.status !== "absent" && row.status !== "sick") return;
    const key = String(row.studentId);
    absentCounts.set(key, (absentCounts.get(key) || 0) + 1);
  });

  const attendance = [...absentCounts.entries()]
    .filter(([, count]) => count >= 3)
    .map(([studentId, count]) => {
      const student = byId.get(studentId);
      const name =
        student
          ? `${student.first || ""} ${student.last || ""}`.trim()
          : `Student #${studentId}`;
      return { studentId, name, count };
    })
    .sort((a, b) => b.count - a.count);

  const awards = getRecentAwards(students, 5);

  const now = Date.now();
  const draftLessons = loadCreatedLessons()
    .filter(lesson => String(lesson.status || "").toLowerCase() === "draft")
    .map(lesson => {
      const created = lesson.createdAt ? new Date(lesson.createdAt) : null;
      const ageDays =
        created && !Number.isNaN(created.getTime())
          ? Math.floor((now - created.getTime()) / (1000 * 60 * 60 * 24))
          : 0;
      return { ...lesson, ageDays };
    })
    .filter(lesson => lesson.ageDays >= 7)
    .sort((a, b) => b.ageDays - a.ageDays);

  const todayDate = new Date();
  const birthdays = students
    .map(student => {
      const next = nextBirthdayDate(student.dob, todayDate);
      if (!next) return null;
      const days = Math.round(
        (next - new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())) /
          (1000 * 60 * 60 * 24)
      );
      if (days < 0 || days > 7) return null;
      return {
        studentId: student.id,
        name: `${student.first || ""} ${student.last || ""}`.trim() || "Student",
        days,
        dateLabel: next.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.days - b.days);

  return { attendance, awards, draftLessons, birthdays };
}

export default function MyDayPage({ db, setToast, navigate, currentTip }) {
  const teacherId = db?.teacher?.id;
  const teacherFirst = db?.teacher?.first || "there";
  const tipText = currentTip || TIP_FALLBACK;
  const today = new Date();
  const todayLabel = today
    .toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    .toUpperCase();

  const [storedEvents] = useLocalStorage("calendar_events", []);
  const [tasks, setTasks] = useLocalStorage(MY_DAY_TASKS_KEY, []);
  const [notes, setNotes] = useLocalStorage(MY_DAY_NOTES_KEY, []);
  const [taskDraft, setTaskDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [reflectionTick, setReflectionTick] = useState(0);
  const [stampingId, setStampingId] = useState(null);
  const stampTimeoutRef = useRef(null);

  const todayEvents = useMemo(
    () =>
      (storedEvents || [])
        .map(normalizeCalendarEvent)
        .filter(Boolean)
        .filter(event => isEventToday(event.date))
        .sort((a, b) => String(a.time || "").localeCompare(String(b.time || ""))),
    [storedEvents]
  );

  const myTasks = useMemo(
    () => (tasks || []).filter(task => String(task.teacherId) === String(teacherId)),
    [tasks, teacherId]
  );

  const myNotes = useMemo(
    () =>
      (notes || [])
        .filter(note => String(note.teacherId) === String(teacherId))
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))),
    [notes, teacherId]
  );

  const alerts = useMemo(() => buildStudentAlerts(db || {}), [db]);
  const hasAlerts =
    alerts.attendance.length > 0 ||
    alerts.awards.length > 0 ||
    alerts.draftLessons.length > 0 ||
    alerts.birthdays.length > 0;

  const reflections = useMemo(() => {
    void reflectionTick;
    return getReflectionsForTeacher(teacherId);
  }, [teacherId, reflectionTick]);

  const todayKey = todayIso();
  const todayReflection = reflections.find(r => r.date === todayKey);
  const [mood, setMood] = useState(todayReflection?.mood || "");
  const [reflectionNotes, setReflectionNotes] = useState(todayReflection?.notes || "");

  useEffect(() => {
    setMood(todayReflection?.mood || "");
    setReflectionNotes(todayReflection?.notes || "");
  }, [todayReflection?.id, todayReflection?.mood, todayReflection?.notes]);

  function addTask(event) {
    event.preventDefault();
    const text = taskDraft.trim();
    if (!text || teacherId == null) return;
    setTasks(current => [
      { id: Date.now(), teacherId, text, done: false, createdAt: new Date().toISOString() },
      ...(current || [])
    ]);
    setTaskDraft("");
  }

  function toggleTask(id) {
    setTasks(current => (current || []).map(task => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  function deleteTask(id) {
    setTasks(current => (current || []).filter(task => task.id !== id));
  }

  function addNote(event) {
    event.preventDefault();
    const text = noteDraft.trim();
    if (!text || teacherId == null) return;
    setNotes(current => [
      { id: Date.now(), teacherId, text, createdAt: new Date().toISOString() },
      ...(current || [])
    ]);
    setNoteDraft("");
  }

  function deleteNote(id) {
    setNotes(current => (current || []).filter(note => note.id !== id));
  }

  function saveReflection(event) {
    event.preventDefault();
    if (teacherId == null) return;
    if (!mood) {
      setToast?.("Pick a mood for today.");
      return;
    }
    upsertReflection({ teacherId, date: todayKey, mood, notes: reflectionNotes.trim() });
    setReflectionTick(n => n + 1);
    setToast?.("Reflection saved.");
  }

  useEffect(() => {
    return () => window.clearTimeout(stampTimeoutRef.current);
  }, []);

  function selectMood(id) {
    setMood(id);
    playStampSound();
    setStampingId(id);
    window.clearTimeout(stampTimeoutRef.current);
    stampTimeoutRef.current = window.setTimeout(() => {
      setStampingId(current => (current === id ? null : current));
    }, 260);
  }

  const moodMeta = id => MOODS.find(m => m.id === id);

  return (
    <>
      <PageChalkBanner
        eyebrow={`MY DAY · ${todayLabel}`}
        title={`${timeGreeting(today.getHours())}, ${teacherFirst}`}
        lead={tipText}
        tourId="my-day-banner"
      />

      <div className="my-day">
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="my-day-roughen" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.06" numOctaves="2" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        <div className="my-day-row-3">
        <div className="my-day-pin-wrap">
          <Thumbtack />
          <section className="my-day-card tilt-l" data-tour="my-day-tasks">
            <div className="my-day-card-label-row">
              <h2 className="my-day-card-label">My Tasks</h2>
            </div>

            <form className="my-day-add-line" onSubmit={addTask}>
              <input
                type="text"
                value={taskDraft}
                onChange={e => setTaskDraft(e.target.value)}
                placeholder="Add a task…"
                aria-label="New task"
              />
              <button type="submit" disabled={!taskDraft.trim()}>
                Add
              </button>
            </form>

            {myTasks.length ? (
              <ul className="my-day-task-list">
                {myTasks.map((task, index) => (
                  <li
                    key={task.id}
                    className={`${task.done ? "is-done" : ""} ${index % 2 === 0 ? "tilt-l" : "tilt-r"}`}
                  >
                    <label className="my-day-task-check">
                      <input type="checkbox" checked={Boolean(task.done)} onChange={() => toggleTask(task.id)} />
                      <span className="my-day-task-box" aria-hidden="true" />
                      <span>{task.text}</span>
                    </label>
                    <button
                      type="button"
                      className="my-day-icon-btn"
                      aria-label="Delete task"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="my-day-empty">No tasks yet — add one above.</p>
            )}
          </section>
        </div>

        <div className="my-day-pin-wrap">
          <Thumbtack />
          <section className="my-day-card tilt-r" data-tour="my-day-notes">
            <div className="my-day-card-label-row">
              <h2 className="my-day-card-label">My Notes</h2>
            </div>

            <form className="my-day-add-line" onSubmit={addNote}>
              <input
                type="text"
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
                placeholder="Jot a note…"
                aria-label="New note"
              />
              <button type="submit" disabled={!noteDraft.trim()}>
                Add
              </button>
            </form>

            {myNotes.length ? (
              <ul className="my-day-note-list">
                {myNotes.map((note, index) => (
                  <li key={note.id} className={index % 2 === 0 ? "tilt-l" : "tilt-r"}>
                    <p>{note.text}</p>
                    <button
                      type="button"
                      className="my-day-icon-btn"
                      aria-label="Delete note"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="my-day-empty">No notes yet.</p>
            )}
          </section>
        </div>

        <div className="my-day-pin-wrap my-day-focus-card">
          <Thumbtack />
          <section className="my-day-card tilt-l" data-tour="my-day-focus">
            <div className="my-day-card-label-row">
              <h2 className="my-day-card-label">Today&apos;s Focus</h2>
              <button type="button" className="my-day-text-btn" onClick={() => navigate?.("calendar")}>
                Calendar
              </button>
            </div>

            <p className="my-day-focus-eyebrow">☆ Focus for today</p>
            <p className="my-day-focus-summary">
              {todayEvents.length
                ? `${todayEvents.length} event${todayEvents.length === 1 ? "" : "s"} on the calendar today.`
                : "Nothing on the calendar for today."}
            </p>

            {todayEvents.length ? (
              <ul className="my-day-event-list">
                {todayEvents.map(event => {
                  const meta = eventTypeMeta(event.type);
                  return (
                    <li key={event.id}>
                      <time>{formatTime12(event.time) || "All day"}</time>
                      <span>
                        {event.title}
                        {meta.label ? ` · ${meta.label}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        </div>
      </div>

      <div className="my-day-row-2">
        <section className="my-day-ledger" data-tour="my-day-alerts">
          <div className="my-day-ledger-head">
            <h2 className="my-day-card-label">Student Alerts</h2>
          </div>

          {!hasAlerts ? (
            <p className="my-day-empty">No student alerts right now — you&apos;re caught up.</p>
          ) : (
            <>
              <div className="my-day-ledger-col-heads">
                <span />
                <span>Student / item</span>
                <span>Detail</span>
              </div>

              {alerts.attendance.map(item => (
                <div className="my-day-ledger-row" key={`att-${item.studentId}`}>
                  <span className="my-day-stamp-mark clay">{item.count}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <div className="my-day-ledger-sub">
                      {item.count} absence{item.count === 1 ? "" : "s"}
                    </div>
                  </div>
                  <span className="my-day-ledger-amt">14 days</span>
                </div>
              ))}

              {alerts.awards.map((record, index) => {
                const name = record.student
                  ? `${record.student.first || ""} ${record.student.last || ""}`.trim()
                  : "Student";
                return (
                  <div className="my-day-ledger-row" key={record.id || `award-${index}`}>
                    <span className="my-day-stamp-mark marigold">★</span>
                    <div>
                      <strong>{name}</strong>
                      <div className="my-day-ledger-sub">
                        {record.rewardName || "Reward"} · +{record.points || 0} pts
                      </div>
                    </div>
                    <span className="my-day-ledger-amt">Recent</span>
                  </div>
                );
              })}

              {alerts.draftLessons.map(lesson => (
                <div className="my-day-ledger-row" key={lesson.id}>
                  <span className="my-day-stamp-mark moss">P</span>
                  <div>
                    <strong>{lesson.title || "Untitled lesson"}</strong>
                    <div className="my-day-ledger-sub">Still in Draft</div>
                  </div>
                  <span className="my-day-ledger-amt">{lesson.ageDays}d</span>
                </div>
              ))}

              {alerts.birthdays.map(item => (
                <div className="my-day-ledger-row" key={`bday-${item.studentId}`}>
                  <span className="my-day-stamp-mark slate">B</span>
                  <div>
                    <strong>{item.name}</strong>
                    <div className="my-day-ledger-sub">Birthday · {item.dateLabel}</div>
                  </div>
                  <span className="my-day-ledger-amt">
                    {item.days === 0 ? "Today" : item.days === 1 ? "Tomorrow" : `${item.days}d`}
                  </span>
                </div>
              ))}
            </>
          )}
        </section>

        <div className="my-day-pin-wrap">
        <Thumbtack />
        <section className="my-day-card" data-tour="my-day-reflection">
          <div className="my-day-card-label-row">
            <h2 className="my-day-card-label">Daily Reflection</h2>
            <button type="button" className="my-day-text-btn" onClick={() => setShowHistory(v => !v)}>
              {showHistory ? "Write today" : "History"}
            </button>
          </div>

          {showHistory ? (
            reflections.length ? (
              <ul className="my-day-history-list">
                {reflections.map(entry => {
                  const meta = moodMeta(entry.mood);
                  return (
                    <li key={entry.id}>
                      <div className="my-day-history-meta">
                        <span className={`my-day-mood-chip ${meta ? meta.tone : ""}`}>
                          {meta ? meta.label : entry.mood}
                        </span>
                        <time dateTime={entry.date}>{formatShortDate(entry.date)}</time>
                      </div>
                      {entry.notes ? <p>{entry.notes}</p> : <p className="my-day-empty">No notes</p>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="my-day-empty">No reflections yet. Save one for today.</p>
            )
          ) : (
            <form className="my-day-reflection-form" onSubmit={saveReflection}>
              <p className="my-day-reflection-prompt">How did today&apos;s class go?</p>
              <div className="my-day-stamp-row" role="group" aria-label="How was today?">
                {MOODS.map(option => (
                  <div
                    key={option.id}
                    className={`my-day-mood-wrap ${mood === option.id ? "is-selected" : ""}`}
                  >
                    <button
                      type="button"
                      className={`my-day-mood-stamp ${option.tone} ${mood === option.id ? "selected" : ""} ${
                        stampingId === option.id ? "is-stamping" : ""
                      }`}
                      onClick={() => selectMood(option.id)}
                      aria-pressed={mood === option.id}
                    >
                      {option.label}
                    </button>
                  </div>
                ))}
              </div>
              <label className="my-day-textarea-label">
                Optional notes
                <textarea
                  rows={4}
                  value={reflectionNotes}
                  onChange={e => setReflectionNotes(e.target.value)}
                  placeholder="Write your notes here…"
                />
              </label>
              <div className="my-day-reflection-actions">
                <button className="my-day-primary-btn" type="submit">
                  {todayReflection ? "Update reflection" : "Save reflection"}
                </button>
                {todayReflection ? (
                  <span className="my-day-saved-hint">Saved for {formatShortDate(todayKey)}</span>
                ) : null}
              </div>
            </form>
          )}
        </section>
        </div>
      </div>
      </div>
    </>
  );
}
