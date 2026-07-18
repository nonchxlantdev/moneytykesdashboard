import { useEffect, useState } from "react";

function nowParts() {
  const now = new Date();
  return {
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
  };
}

export default function ChalkClock() {
  const [clock, setClock] = useState(nowParts);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(nowParts()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <time className="chalkboard-clock" dateTime={new Date().toISOString()}>
      <strong>{clock.time}</strong>
      <span>{clock.date}</span>
    </time>
  );
}
