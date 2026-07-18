import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { EVENT_SCOPES, EVENT_TYPE_OPTIONS, normalizeCalendarEvent } from "../../utils/calendarUtils";

const emptyForm = {
  title: "",
  type: "assignment",
  scope: "class",
  classId: "",
  date: "",
  time: "09:00",
  location: "",
  notes: ""
};

/**
 * Create / edit event modal for the school planner calendar.
 */
export default function CreateEventModal({
  open,
  event,
  defaultDate,
  classes = [],
  defaultClassId = "",
  onClose,
  onSave
}) {
  const [form, setForm] = useState(emptyForm);
  const editing = Boolean(event?.id);

  useEffect(() => {
    if (!open) return;
    if (event) {
      const normalized = normalizeCalendarEvent(event);
      setForm({
        title: normalized.title,
        type: normalized.type,
        scope: normalized.scope,
        classId: normalized.classId,
        date: normalized.date,
        time: normalized.time || "",
        location: normalized.location,
        notes: normalized.notes
      });
      return;
    }
    setForm({
      ...emptyForm,
      date: defaultDate || new Date().toISOString().slice(0, 10),
      classId: defaultClassId || classes[0] || ""
    });
  }, [open, event, defaultDate, defaultClassId, classes]);

  if (!open) return null;

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    onSave?.({
      ...(event || {}),
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
      time: form.time || "",
      classId: form.scope === "class" ? form.classId : form.classId || ""
    });
  }

  return (
    <div
      className="cal-modal-backdrop show"
      onClick={e => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="presentation"
    >
      <div
        className="cal-modal-card cal-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-create-title"
      >
        <header className="cal-create-modal-head">
          <div>
            <p className="eyebrow">Planner</p>
            <h3 id="cal-create-title">{editing ? "Edit event" : "Create event"}</h3>
          </div>
          <button type="button" className="cal-icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <form className="cal-create-form" onSubmit={handleSubmit}>
          <label className="field-label">
            Title
            <input
              type="text"
              value={form.title}
              onChange={e => update("title", e.target.value)}
              placeholder="e.g. Mid-term quiz"
              required
            />
          </label>

          <label className="field-label">
            Type
            <select value={form.type} onChange={e => update("type", e.target.value)}>
              {EVENT_TYPE_OPTIONS.map(type => (
                <option key={type.value} value={type.value}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Scope
            <select value={form.scope} onChange={e => update("scope", e.target.value)}>
              {EVENT_SCOPES.map(scope => (
                <option key={scope.value} value={scope.value}>
                  {scope.label}
                </option>
              ))}
            </select>
          </label>

          {form.scope === "class" ? (
            <label className="field-label">
              Class / subject
              <select value={form.classId} onChange={e => update("classId", e.target.value)}>
                {classes.length ? (
                  classes.map(item => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))
                ) : (
                  <option value="">No classes yet</option>
                )}
              </select>
            </label>
          ) : null}

          <div className="cal-create-grid">
            <label className="field-label">
              Date
              <input
                type="date"
                value={form.date}
                onChange={e => update("date", e.target.value)}
                required
              />
            </label>
            <label className="field-label">
              Time
              <input
                type="time"
                value={form.time}
                onChange={e => update("time", e.target.value)}
              />
            </label>
          </div>

          <label className="field-label">
            Location
            <input
              type="text"
              value={form.location}
              onChange={e => update("location", e.target.value)}
              placeholder="Classroom, hall, online…"
            />
          </label>

          <label className="field-label">
            Notes
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => update("notes", e.target.value)}
              placeholder="Optional details for this event"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              <Plus size={15} />
              {editing ? "Save changes" : "Create event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
