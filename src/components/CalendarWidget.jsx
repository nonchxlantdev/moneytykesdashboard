import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import EmptyState from "./EmptyState";
import { eventTypeMeta, formatTime12, getUpcomingEvents } from "../utils/calendarUtils";

const HIGHLIGHT_TYPES = new Set(["test", "quiz", "assignment"]);

/**
 * Dashboard widget showing upcoming tests, quizzes, and class events.
 * @param {{ events: Array, onNavigate: (date: string) => void }} props
 */
export default function CalendarWidget({ events, onNavigate }) {
  const upcoming = useMemo(() => getUpcomingEvents(events, 6, 14), [events]);

  const assessments = useMemo(
    () => upcoming.filter(event => HIGHLIGHT_TYPES.has(event.type)),
    [upcoming]
  );

  const displayEvents = assessments.length ? assessments : upcoming;

  return (
    <article className="section-panel calendar-widget">
      <div className="section-heading">
        <h2>Upcoming Tests &amp; Quizzes</h2>
        <CalendarDays size={18} />
      </div>
      {displayEvents.length ? (
        <ul className="calendar-widget-list">
          {displayEvents.map(event => {
            const meta = eventTypeMeta(event.type);
            const isToday = new Date().toDateString() === new Date(`${event.date}T00:00:00`).toDateString();
            return (
              <li key={event.id}>
                <button
                  type="button"
                  className={`calendar-widget-item ${isToday ? "today" : ""}`}
                  onClick={() => onNavigate(event.date)}
                >
                  {isToday && <span className="calendar-pulse-dot" aria-hidden="true" />}
                  <span className="calendar-type-badge" style={{ background: `${meta.color}22`, color: meta.color }}>
                    {meta.label}
                  </span>
                  <strong>{event.title}</strong>
                  <span>{event.classId || "Class"}</span>
                  <em>{formatRelative(event.date, event.time)}</em>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          title="No upcoming assessments"
          text="Add tests, quizzes, or assignments on the Calendar."
        />
      )}
      {upcoming.length > displayEvents.length && (
        <button type="button" className="link-button calendar-widget-more" onClick={() => onNavigate(upcoming[0]?.date)}>
          View all on Calendar
        </button>
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
  if (diff === 0) return `Today at ${timeLabel}`;
  if (diff === 1) return `Tomorrow at ${timeLabel}`;
  if (diff > 1) return `In ${diff} days at ${timeLabel}`;
  return `${target.toLocaleDateString()} at ${timeLabel}`;
}
