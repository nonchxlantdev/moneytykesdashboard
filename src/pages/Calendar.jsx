import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, List, Plus, Trash2 } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import {
  EVENT_TYPES,
  eventTypeMeta,
  formatTime12,
  getMonthMatrix
} from "../utils/calendarUtils";

const emptyEvent = {
  title: "",
  type: "assignment",
  classId: "",
  date: "",
  time: "09:00",
  notes: ""
};

/**
 * Full teacher calendar with monthly view and list toggle.
 * @param {{ db: object, setToast: (msg: string) => void, focusDate?: string|null, onFocusHandled?: () => void }} props
 */
export default function CalendarPage({ db, setToast, focusDate, onFocusHandled }) {
  const [events, setEvents] = useLocalStorage("calendar_events", []);
  const [viewMode, setViewMode] = useState("calendar");
  const [cursor, setCursor] = useState(() => {
    const base = focusDate ? new Date(`${focusDate}T00:00:00`) : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(emptyEvent);

  const classes = useMemo(() => {
    const labels = new Set([db.className, ...db.students.map(s => s.classLabel).filter(Boolean)]);
    return [...labels];
  }, [db.className, db.students]);

  useEffect(() => {
    if (!focusDate) return;
    const focusMonth = new Date(`${focusDate}T00:00:00`);
    setCursor({ year: focusMonth.getFullYear(), month: focusMonth.getMonth() });
    onFocusHandled?.();
  }, [focusDate, onFocusHandled]);

  const monthMatrix = getMonthMatrix(cursor.year, cursor.month);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  function openCreate(date) {
    setEditingEvent(null);
    setForm({ ...emptyEvent, date, classId: classes[0] || db.className });
    setModalOpen(true);
  }

  function openEdit(event) {
    setEditingEvent(event);
    setForm({
      title: event.title,
      type: event.type,
      classId: event.classId,
      date: event.date,
      time: event.time,
      notes: event.notes || ""
    });
    setModalOpen(true);
  }

  function saveEvent(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.date) {
      setToast("Title and date are required.");
      return;
    }
    const payload = {
      id: editingEvent?.id || Date.now(),
      title: form.title.trim(),
      type: form.type,
      classId: form.classId,
      date: form.date,
      time: form.time,
      notes: form.notes.trim(),
      createdAt: editingEvent?.createdAt || new Date().toISOString()
    };
    setEvents(current => editingEvent
      ? current.map(item => item.id === editingEvent.id ? payload : item)
      : [...current, payload]);
    setModalOpen(false);
    setToast(editingEvent ? "Event updated." : "Event created.");
  }

  function deleteEvent() {
    if (!editingEvent) return;
    setEvents(current => current.filter(item => item.id !== editingEvent.id));
    setModalOpen(false);
    setToast("Event deleted.");
  }

  const listEvents = [...events].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  return (
    <section className="calendar-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Planning</p>
          <h2>Calendar</h2>
        </div>
        <div className="calendar-view-toggle">
          <button type="button" className={viewMode === "calendar" ? "active" : ""} onClick={() => setViewMode("calendar")}>
            <CalendarDays size={16} /> Month
          </button>
          <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>
            <List size={16} /> List
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <article className="section-panel calendar-month-card">
          <div className="calendar-month-header">
            <button type="button" className="icon-button" onClick={() => setCursor(current => {
              const month = current.month - 1;
              return month < 0 ? { year: current.year - 1, month: 11 } : { ...current, month };
            })} aria-label="Previous month"><ChevronLeft /></button>
            <h3>{monthLabel}</h3>
            <button type="button" className="icon-button" onClick={() => setCursor(current => {
              const month = current.month + 1;
              return month > 11 ? { year: current.year + 1, month: 0 } : { ...current, month };
            })} aria-label="Next month"><ChevronRight /></button>
          </div>
          <div className="calendar-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <span key={day}>{day}</span>)}
          </div>
          <div className="calendar-grid">
            {monthMatrix.map((date, index) => {
              if (!date) return <div className="calendar-cell empty" key={`empty-${index}`} />;
              const dayEvents = events.filter(event => event.date === date);
              return (
                <button type="button" className="calendar-cell" key={date} onClick={() => openCreate(date)}>
                  <span className="calendar-day-number">{Number(date.split("-")[2])}</span>
                  <div className="calendar-event-chips">
                    {dayEvents.map(event => {
                      const meta = eventTypeMeta(event.type);
                      return (
                        <span
                          key={event.id}
                          className="calendar-event-chip"
                          style={{ background: meta.color }}
                          onClick={chipEvent => {
                            chipEvent.stopPropagation();
                            openEdit(event);
                          }}
                        >
                          {event.title}
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </article>
      ) : (
        <article className="section-panel">
          <div className="section-heading"><h2>Upcoming Timeline</h2></div>
          {listEvents.length ? (
            <div className="calendar-list">
              {listEvents.map(event => {
                const meta = eventTypeMeta(event.type);
                return (
                  <button type="button" className="calendar-list-item" key={event.id} onClick={() => openEdit(event)}>
                    <span className="calendar-type-badge" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>
                    <strong>{event.title}</strong>
                    <span>{event.classId}</span>
                    <em>{event.date} · {formatTime12(event.time)}</em>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No events scheduled" text="Click a date on the calendar to create your first event." />
          )}
        </article>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingEvent ? "Edit Event" : "Create Event"}>
        <form className="stacked-form" onSubmit={saveEvent}>
          <label className="field-label">
            Event Title
            <input type="text" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} required />
          </label>
          <label className="field-label">
            Type
            <select value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}>
              {EVENT_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </label>
          <label className="field-label">
            Class / Subject
            <select value={form.classId} onChange={event => setForm({ ...form, classId: event.target.value })}>
              {classes.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <div className="form-grid">
            <label className="field-label">
              Date
              <input type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} required />
            </label>
            <label className="field-label">
              Time
              <input type="time" value={form.time} onChange={event => setForm({ ...form, time: event.target.value })} />
            </label>
          </div>
          <label className="field-label">
            Notes
            <textarea rows={3} value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} />
          </label>
          <div className="calendar-modal-actions">
            {editingEvent && (
              <button type="button" className="secondary-action danger-action" onClick={deleteEvent}>
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button className="primary-action teal-action" type="submit">
              <Plus size={16} /> {editingEvent ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
