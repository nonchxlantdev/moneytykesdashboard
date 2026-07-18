const PURGE_MARKER_KEY = "moneytykes.mock.purge.v1";

// One-time cleanup of the demo data previously seeded by src/data/seedMockData.js
// (now removed). Runs once per browser, guarded by PURGE_MARKER_KEY.
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
