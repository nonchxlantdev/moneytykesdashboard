import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import EmptyState from "./EmptyState";
import { eventTypeMeta, formatTime12 } from "../utils/calendarUtils";

function formatRelative(date, time) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(`${date}T00:00:00`);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  const timeLabel = formatTime12(time);
  if (diff === 0) return `Today at ${timeLabel}`;
  if (diff === 1) return `Tomorrow at ${timeLabel}`;
  if (diff > 1) return `In ${diff} days at ${timeLabel}`;
  return `${target.toLocaleDateString()} at ${timeLabel}`;
}

/**
 * Dashboard widget showing upcoming calendar events.
 * @param {{ events: Array, onNavigate: (date: string) => void }} props
 */
export default function CalendarWidget({ events, onNavigate }) {
  const upcoming = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    return [...events]
      .filter(event => {
        const eventDate = new Date(`${event.date}T${event.time || "00:00"}:00`);
        return eventDate >= now && eventDate <= end;
      })
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
      .slice(0, 5);
  }, [events]);

  return (
    <article className="section-panel calendar-widget">
      <div className="section-heading">
        <h2>Upcoming Events</h2>
        <CalendarDays size={18} />
      </div>
      {upcoming.length ? (
        <ul className="calendar-widget-list">
          {upcoming.map(event => {
            const meta = eventTypeMeta(event.type);
            const isToday = new Date().toDateString() === new Date(`${event.date}T00:00:00`).toDateString();
            return (
              <li key={event.id}>
                <button type="button" className={`calendar-widget-item ${isToday ? "today" : ""}`} onClick={() => onNavigate(event.date)}>
                  {isToday && <span className="calendar-pulse-dot" aria-hidden="true" />}
                  <span className="calendar-type-badge" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>
                  <strong>{event.title}</strong>
                  <span>{event.classId || "Class"}</span>
                  <em>{formatRelative(event.date, event.time)}</em>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No upcoming events" text="Events in the next 7 days will appear here." />
      )}
    </article>
  );
}
