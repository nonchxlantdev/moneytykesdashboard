import { useEffect, useState } from "react";

/**
 * Styled live date and time card for the dashboard header.
 */
export default function DateCard() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "long" });
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  });

  return (
    <article className="date-card" aria-label="Current date and time">
      <p className="date-card-day">{dayFormatter.format(now)}</p>
      <p className="date-card-date">{dateFormatter.format(now)}</p>
      <p className="date-card-time">{timeFormatter.format(now)}</p>
    </article>
  );
}
