import { useMemo } from "react";
import { eventTypeMeta, formatTime12, getUpcomingEvents } from "../utils/calendarUtils";
import "../dashboard-v2.css";

const PLACE_TONES = {
  online: "violet",
  virtual: "violet",
  zoom: "violet",
  "school hall": "teal",
  classroom: "teal",
  hall: "teal",
  library: "green",
  gym: "amber",
  test: "rose",
  quiz: "amber",
  assignment: "violet",
  reminder: "teal"
};

const QUICK_ACTIONS = [
  { label: "Add lesson", view: "create-lessons" },
  { label: "Take attendance", view: "attendance" },
  { label: "Create quiz", view: "calendar" },
  { label: "Play a game", view: "game" }
];

function eventDayParts(date) {
  const d = new Date(`${date}T00:00:00`);
  return {
    month: d.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    num: d.toLocaleDateString(undefined, { day: "2-digit" })
  };
}

function formatEventWhen(event) {
  if (event.endDate && event.endDate !== event.date) {
    const start = new Date(`${event.date}T00:00:00`);
    const end = new Date(`${event.endDate}T00:00:00`);
    const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const endLabel = end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    return `${startLabel} – ${endLabel}`;
  }

  const timeLabel = formatTime12(event.time);
  if (!timeLabel) return "All day";
  if (event.endTime) {
    const endLabel = formatTime12(event.endTime);
    return endLabel ? `${timeLabel} – ${endLabel}` : timeLabel;
  }
  return timeLabel;
}

function eventPlace(event) {
  const location = String(event.location || "").trim();
  if (location) {
    return {
      label: location,
      tone: PLACE_TONES[location.toLowerCase()] || "teal",
      showDot: true
    };
  }

  if (!event.time && !event.endDate) {
    return { label: "All day", tone: "teal", showDot: false };
  }

  if (event.classId) {
    return {
      label: event.classId,
      tone: "teal",
      showDot: true
    };
  }

  const meta = eventTypeMeta(event.type);
  return {
    label: meta.label,
    tone: PLACE_TONES[event.type] || "teal",
    showDot: true
  };
}

function SproutMark() {
  return (
    <svg className="dash-home-rail-tip-art" viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="40" rx="14" ry="5" fill="#c5ced8" />
      <path d="M16 38h16c0 3.5-3.6 6-8 6s-8-2.5-8-6z" fill="#9aa7b5" />
      <path d="M24 36V18" stroke="#2f9e44" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 26c-5-1-9-5-9-10 6 1 9 5 9 10z" fill="#49c96b" />
      <path d="M24 22c5-1 9-5 9-10-6 1-9 5-9 10z" fill="#35b457" />
    </svg>
  );
}

/**
 * Fixed full-viewport-height events rail — rendered as an app-shell sibling
 * (like Sidebar) so its `position: fixed` isn't captured by the animated
 * per-page motion.div's transform containing block.
 */
export default function EventsRail({ calendarEvents = [], navigate, currentTip }) {
  const upcoming = useMemo(() => getUpcomingEvents(calendarEvents, 12, 60), [calendarEvents]);
  const tipText = currentTip || "Encourage small savings habits today for a brighter tomorrow.";

  return (
    <aside className="dash-home-rail" aria-label="Events and shortcuts">
      <div className="dash-home-rail-inner mt-card-panel">
        <section className="dash-home-rail-section dash-home-rail-events" aria-label="Events">
          <div className="mt-card-panel-header">
            <h3>Events</h3>
            <button type="button" className="dash-home-rail-link" onClick={() => navigate("calendar")}>
              View calendar
            </button>
          </div>

          <div className="dash-home-events-scroll">
            {upcoming.length ? (
              <ul className="dash-home-events">
                {upcoming.map(event => {
                  const parts = eventDayParts(event.date);
                  const when = formatEventWhen(event);
                  const place = eventPlace(event);
                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        className="dash-home-event"
                        onClick={() => navigate("calendar", { focusDate: event.date })}
                      >
                        <span className="dash-home-event-date">
                          <em>{parts.month}</em>
                          <strong>{parts.num}</strong>
                        </span>
                        <span className="dash-home-event-body">
                          <strong>{event.title}</strong>
                          <span className="dash-home-event-when">{when}</span>
                          <span className={`dash-home-event-place tone-${place.tone}`}>
                            {place.showDot ? <i aria-hidden="true" /> : null}
                            {place.label}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-empty-state dash-home-events-empty">
                <strong>No upcoming events</strong>
                <p>Add quizzes, tests, or activities on the Calendar.</p>
              </div>
            )}
          </div>
        </section>

        <section className="dash-home-rail-section dash-home-rail-quick" aria-label="Quick actions">
          <h3 className="dash-home-rail-section-title">Quick actions</h3>
          <ul className="dash-home-rail-quick-list">
            {QUICK_ACTIONS.map(action => (
              <li key={action.label}>
                <button
                  type="button"
                  className="dash-home-rail-quick-item"
                  onClick={() => navigate(action.view)}
                >
                  <span className="dash-home-rail-quick-dot" aria-hidden="true" />
                  <span>{action.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <article className="dash-home-rail-tip" aria-label="Daily tip">
          <header className="dash-home-rail-tip-header">
            <p className="dash-home-rail-tip-label">Daily tip!</p>
            <SproutMark />
          </header>
          <p className="dash-home-rail-tip-text">{tipText}</p>
        </article>
      </div>
    </aside>
  );
}
