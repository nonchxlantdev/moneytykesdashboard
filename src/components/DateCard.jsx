import { useEffect, useState } from "react";

/**
 * Live date and time card for the dashboard.
 * @param {{ compact?: boolean, panel?: boolean }} props
 */
export default function DateCard({ compact = false, panel = false }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = compact ? 60000 : 1000;
    const timer = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(timer);
  }, [compact]);

  const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "long" });
  const shortDayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  });
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: compact ? undefined : "2-digit"
  });

  if (compact) {
    return (
      <p className="topbar-date-compact" aria-label="Current date and time">
        <strong>{shortDayFormatter.format(now)}, {shortDateFormatter.format(now)}</strong>
        {" · "}
        {timeFormatter.format(now)}
      </p>
    );
  }

  return (
    <article className={`date-card ${panel ? "panel" : ""}`} aria-label="Current date and time">
      {panel && <p className="date-card-today-label">Today</p>}
      <p className="date-card-day">{dayFormatter.format(now)}</p>
      <p className="date-card-date">{dateFormatter.format(now)}</p>
      <p className="date-card-time">{timeFormatter.format(now)}</p>
    </article>
  );
}
