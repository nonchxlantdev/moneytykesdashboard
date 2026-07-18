import { EVENT_TYPES } from "../../utils/calendarUtils";

/**
 * FullCalendar eventContent renderer — icon bubble chip, not the default bar.
 */
export default function renderEventChip(arg, onEventChipClick) {
  const type = arg.event.extendedProps?.type || "reminder";
  const cfg = EVENT_TYPES[type] || EVENT_TYPES.reminder;

  return (
    <button
      type="button"
      className="event-chip"
      style={{ background: cfg.bg, color: cfg.color }}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        onEventChipClick?.(String(arg.event.id));
      }}
    >
      <span className="chip-icon" aria-hidden="true">
        {cfg.emoji}
      </span>
      <span className="chip-title">{arg.event.title}</span>
    </button>
  );
}
