const PURGE_MARKER_KEY = "moneytykes.mock.purge.v1";
const CALENDAR_LESSONS_PURGE_KEY = "moneytykes.mock.purge.calendar_lessons.v1";

// One-time cleanup of the demo data previously seeded by src/data/seedMockData.js
const LEGACY_MOCK_KEYS = [
  "moneytykes.teacher.dashboard.v3",
  "moneytykes.seed.smdp.v1",
  "rewards_bank",
  "created_lessons",
  "calendar_events"
];

const LEGACY_MOCK_PREFIXES = ["attendance_", "student_points_", "points_log_"];

export function purgeLegacyMockData() {
  if (localStorage.getItem(PURGE_MARKER_KEY)) return;

  LEGACY_MOCK_KEYS.forEach(key => localStorage.removeItem(key));

  const staleKeys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && LEGACY_MOCK_PREFIXES.some(prefix => key.startsWith(prefix))) {
      staleKeys.push(key);
    }
  }
  staleKeys.forEach(key => localStorage.removeItem(key));

  localStorage.setItem(PURGE_MARKER_KEY, "true");
}

function isDemoLessonId(id) {
  const numericId = Number(id);
  return Number.isFinite(numericId) && numericId >= 8000 && numericId < 9000;
}

/**
 * One-time strip of seeded calendar events (demo-*) and curriculum lessons (ids 8000–8999).
 * Keeps any teacher-created calendar events / lessons.
 */
export function purgeDemoCalendarAndLessons() {
  if (localStorage.getItem(CALENDAR_LESSONS_PURGE_KEY)) return;

  try {
    const events = JSON.parse(localStorage.getItem("calendar_events") || "[]");
    if (Array.isArray(events)) {
      localStorage.setItem(
        "calendar_events",
        JSON.stringify(events.filter(event => !String(event?.id || "").startsWith("demo-")))
      );
    }
  } catch {
    localStorage.removeItem("calendar_events");
  }

  try {
    const lessons = JSON.parse(localStorage.getItem("created_lessons") || "[]");
    if (Array.isArray(lessons)) {
      localStorage.setItem(
        "created_lessons",
        JSON.stringify(lessons.filter(lesson => !isDemoLessonId(lesson?.id)))
      );
    }
  } catch {
    localStorage.removeItem("created_lessons");
  }

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("moneytykes.seed.lessons.")) {
      localStorage.removeItem(key);
    }
  });

  localStorage.setItem(CALENDAR_LESSONS_PURGE_KEY, "true");
}
