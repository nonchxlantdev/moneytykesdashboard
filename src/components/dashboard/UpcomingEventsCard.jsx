import { useMemo } from "react";
import { IconCalendar } from "@tabler/icons-react";
import EmptyState from "../EmptyState";
import { eventTypeMeta, formatTime12, getUpcomingEvents } from "../../utils/calendarUtils";
import { ICON_STROKE } from "../../config/navigation";

/**
 * @param {{ events: Array, onNavigate: (date?: string) => void }} props
 */
export default function UpcomingEventsCard({ events, onNavigate }) {
  const upcoming = useMemo(() => getUpcomingEvents(events, 4, 14), [events]);

  return (
    <article className="dash-card upcoming-events-card">
      <header className="dash-card-header">
        <div className="dash-card-title-wrap">
          <IconCalendar size={18} stroke={ICON_STROKE} />
          <h3 className="dash-card-title">Upcoming Events</h3>
        </div>
        <button type="button" className="link-button dash-card-link" onClick={() => onNavigate()}>
          View all →
        </button>
      </header>
      {upcoming.length ? (
        <ul className="dash-event-list">
          {upcoming.map(event => {
            const meta = eventTypeMeta(event.type);
            const isToday = new Date().toDateString() === new Date(`${event.date}T00:00:00`).toDateString();
            return (
              <li key={event.id}>
                <button type="button" className={`dash-event-item ${isToday ? "today" : ""}`} onClick={() => onNavigate(event.date)}>
                  {isToday && <span className="calendar-pulse-dot" aria-hidden="true" />}
                  <span className={`dash-badge ${meta.label.toLowerCase()}`}>{meta.label}</span>
                  <div className="dash-event-copy">
                    <strong>{event.title}</strong>
                    <span className="dash-list-meta">{event.classId || "Class"} · {formatRelative(event.date, event.time)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No upcoming events" text="Add events on the Calendar." />
      )}
    </article>
  );
}

function formatRelative(date, time) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(`${date}T00:00:00`);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  const timeLabel = formatTime12(time);
  if (diff === 0) return `Today ${timeLabel}`;
  if (diff === 1) return `Tomorrow ${timeLabel}`;
  if (diff > 1) return `In ${diff} days`;
  return target.toLocaleDateString();
}
