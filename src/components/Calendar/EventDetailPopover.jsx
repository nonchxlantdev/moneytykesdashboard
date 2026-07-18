import { MapPin, Pencil, Trash2, X } from "lucide-react";
import { EVENT_SCOPES, eventTypeMeta, formatTime12 } from "../../utils/calendarUtils";

/**
 * Lightweight detail popover for a calendar event.
 */
export default function EventDetailPopover({ event, anchorRect, onClose, onEdit, onDelete }) {
  if (!event) return null;

  const meta = eventTypeMeta(event.type);
  const scopeLabel = EVENT_SCOPES.find(item => item.value === event.scope)?.label || "School";
  const timeLabel = formatTime12(event.time);
  const top = Math.min((anchorRect?.bottom || 120) + 8, window.innerHeight - 280);
  const left = Math.min(Math.max((anchorRect?.left || 24), 16), window.innerWidth - 320);

  return (
    <>
      <button type="button" className="cal-popover-backdrop" aria-label="Close event details" onClick={onClose} />
      <aside
        className="cal-event-popover"
        style={{ top, left }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-event-popover-title"
      >
        <header className="cal-event-popover-head">
          <span className="event-chip" style={{ background: meta.bg, color: meta.color }}>
            <span className="chip-icon" aria-hidden="true">
              {meta.emoji}
            </span>
            {meta.label}
          </span>
          <button type="button" className="cal-icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <h3 id="cal-event-popover-title">{event.title}</h3>
        <p className="cal-event-popover-meta">
          {event.date}
          {timeLabel ? ` · ${timeLabel}` : " · All day"}
          {` · ${scopeLabel}`}
        </p>

        {event.classId ? <p className="cal-event-popover-line">Class: {event.classId}</p> : null}
        {event.location ? (
          <p className="cal-event-popover-line">
            <MapPin size={14} /> {event.location}
          </p>
        ) : null}
        {event.notes ? <p className="cal-event-popover-notes">{event.notes}</p> : null}

        <div className="cal-event-popover-actions">
          <button type="button" className="btn" onClick={() => onEdit?.(event)}>
            <Pencil size={15} /> Edit
          </button>
          <button type="button" className="btn danger-btn" onClick={() => onDelete?.(event)}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </aside>
    </>
  );
}
