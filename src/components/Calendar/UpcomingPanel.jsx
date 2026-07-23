import { CalendarDays } from "lucide-react";
import { eventTypeMeta, getUpcomingEvents, relativeEventTime } from "../../utils/calendarUtils";

/**
 * Upcoming events side panel for the school planner.
 */
export default function UpcomingPanel({ events = [], onSelect, onCreate }) {
  const upcoming = getUpcomingEvents(events, 8, 21);

  return (
    <aside className="cal-upcoming" data-tour="calendar-upcoming">
      <header className="cal-upcoming-head">
        <div className="cal-upcoming-title">
          <span className="cal-upcoming-icon" aria-hidden="true">
            <CalendarDays size={16} />
          </span>
          <h3>Upcoming</h3>
        </div>
        <button type="button" className="btn primary cal-upcoming-add" onClick={onCreate}>
          New
        </button>
      </header>

      {upcoming.length ? (
        <ul className="cal-upcoming-list">
          {upcoming.map(event => {
            const meta = eventTypeMeta(event.type);
            return (
              <li key={event.id}>
                <button
                  type="button"
                  className="cal-upcoming-item"
                  onClick={() => onSelect?.(event)}
                >
                  <span
                    className="cal-upcoming-emoji"
                    style={{ background: meta.bg, color: meta.color }}
                    aria-hidden="true"
                  >
                    {meta.emoji}
                  </span>
                  <span className="cal-upcoming-copy">
                    <strong>{event.title}</strong>
                    <em>{relativeEventTime(event.date, event.time)}</em>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="cal-upcoming-empty">
          <p>Nothing scheduled in the next few weeks.</p>
          <button type="button" className="btn" onClick={onCreate}>
            Add an event
          </button>
        </div>
      )}
    </aside>
  );
}
