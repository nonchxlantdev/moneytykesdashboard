/** @typedef {'lesson' | 'quiz' | 'test' | 'assignment' | 'reminder' | 'event'} EventType */
/** @typedef {'school' | 'class' | 'personal'} EventScope */

/**
 * Event type config — emoji bubble + soft chip colors for the school planner.
 * Keys are the source of truth; `eventTypeMeta` keeps older `value/label/color` callers working.
 * @type {Record<EventType, { label: string, emoji: string, color: string, bg: string }>}
 */
export const EVENT_TYPES = {
  lesson: {
    label: "Lesson",
    emoji: "📘",
    color: "#0f766e",
    bg: "rgba(15, 118, 110, 0.14)"
  },
  quiz: {
    label: "Quiz",
    emoji: "✏️",
    color: "#b45309",
    bg: "rgba(245, 158, 11, 0.18)"
  },
  test: {
    label: "Test",
    emoji: "📝",
    color: "#be123c",
    bg: "rgba(225, 29, 72, 0.14)"
  },
  assignment: {
    label: "Assignment",
    emoji: "📎",
    color: "#1d4ed8",
    bg: "rgba(37, 99, 235, 0.14)"
  },
  reminder: {
    label: "Reminder",
    emoji: "🔔",
    color: "#475569",
    bg: "rgba(100, 116, 139, 0.16)"
  },
  event: {
    label: "Event",
    emoji: "⭐",
    color: "#7c3aed",
    bg: "rgba(139, 92, 246, 0.16)"
  }
};

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPES).map(([value, meta]) => ({
  value,
  ...meta
}));

export const EVENT_SCOPES = [
  { value: "school", label: "Whole school" },
  { value: "class", label: "This class" },
  { value: "personal", label: "Personal" }
];

const LEGACY_TYPE_MAP = {
  test: "test",
  quiz: "quiz",
  assignment: "assignment",
  reminder: "reminder",
  lesson: "lesson",
  event: "event"
};

/**
 * @param {string} type
 * @returns {{ value: string, label: string, emoji: string, color: string, bg: string }}
 */
export function eventTypeMeta(type) {
  const key = LEGACY_TYPE_MAP[type] || "reminder";
  const meta = EVENT_TYPES[key] || EVENT_TYPES.reminder;
  return { value: key, ...meta };
}

export function formatTime12(time24) {
  if (!time24) return "";
  const [hours, minutes] = String(time24).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";
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

  if (diffDays === 0) return timeLabel ? `Today at ${timeLabel}` : "Today";
  if (diffDays === 1) return timeLabel ? `Tomorrow at ${timeLabel}` : "Tomorrow";
  if (diffDays > 1 && diffDays <= 7) {
    return timeLabel ? `In ${diffDays} days at ${timeLabel}` : `In ${diffDays} days`;
  }
  return `${eventDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}${
    timeLabel ? ` at ${timeLabel}` : ""
  }`;
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

export function getUpcomingEvents(events, limit = 5, withinDays = 14) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(startOfToday);
  end.setDate(startOfToday.getDate() + withinDays);

  return [...(events || [])]
    .filter(event => {
      if (!event?.date) return false;
      const eventDate = new Date(`${event.date}T${event.time || "00:00"}:00`);
      return eventDate >= startOfToday && eventDate <= end;
    })
    .sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time || "00:00"}:00`);
      const bDate = new Date(`${b.date}T${b.time || "00:00"}:00`);
      return aDate - bDate;
    })
    .slice(0, limit);
}

/** @deprecated Prefer FullCalendar month math; kept for any legacy callers. */
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

/**
 * Normalize a stored calendar event (adds defaults for newer fields).
 * @param {object} event
 */
export function normalizeCalendarEvent(event) {
  if (!event || typeof event !== "object") return null;
  const meta = eventTypeMeta(event.type);
  return {
    id: String(event.id ?? Date.now()),
    title: String(event.title || "").trim() || "Untitled",
    type: meta.value,
    scope: event.scope || (event.classId ? "class" : "school"),
    classId: event.classId || "",
    date: event.date || "",
    time: event.time || "",
    location: event.location || "",
    notes: event.notes || "",
    createdAt: event.createdAt || new Date().toISOString()
  };
}
