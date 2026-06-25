export const EVENT_TYPES = [
  { value: "test", label: "Test", color: "#ef4444" },
  { value: "quiz", label: "Quiz", color: "#f59e0b" },
  { value: "assignment", label: "Assignment", color: "#3b82f6" },
  { value: "reminder", label: "Reminder", color: "#94a3b8" }
];

export function eventTypeMeta(type) {
  return EVENT_TYPES.find(item => item.value === type) || EVENT_TYPES[3];
}

export function formatTime12(time24) {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function relativeEventTime(date, time) {
  const eventDate = new Date(`${date}T${time || "00:00"}:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
  const timeLabel = formatTime12(time);

  if (diffDays === 0) return `Today at ${timeLabel}`;
  if (diffDays === 1) return `Tomorrow at ${timeLabel}`;
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days at ${timeLabel}`;
  return `${eventDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at ${timeLabel}`;
}

export function isEventToday(date) {
  const now = new Date();
  const eventDate = new Date(`${date}T00:00:00`);
  return (
    eventDate.getFullYear() === now.getFullYear()
    && eventDate.getMonth() === now.getMonth()
    && eventDate.getDate() === now.getDate()
  );
}

export function getUpcomingEvents(events, limit = 5, withinDays = 7) {
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + withinDays);

  return [...events]
    .filter(event => {
      const eventDate = new Date(`${event.date}T${event.time || "00:00"}:00`);
      return eventDate >= now && eventDate <= end;
    })
    .sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time || "00:00"}:00`);
      const bDate = new Date(`${b.date}T${b.time || "00:00"}:00`);
      return aDate - bDate;
    })
    .slice(0, limit);
}

export function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < startOffset; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push(date);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
