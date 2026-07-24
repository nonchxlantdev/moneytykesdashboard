/**
 * My Day localStorage — tasks/notes via useLocalStorage in the page;
 * reflections need one-per-teacher-per-day upsert helpers.
 */

export const MY_DAY_TASKS_KEY = "mt.my_day.tasks.v1";
export const MY_DAY_NOTES_KEY = "mt.my_day.notes.v1";
export const MY_DAY_REFLECTIONS_KEY = "mt.my_day.reflections.v1";

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function loadReflections() {
  try {
    return JSON.parse(localStorage.getItem(MY_DAY_REFLECTIONS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveReflections(reflections) {
  localStorage.setItem(MY_DAY_REFLECTIONS_KEY, JSON.stringify(reflections));
}

/** Upserts by (teacherId, date) — replaces today's entry if one already exists. */
export function upsertReflection({ teacherId, date, mood, notes }) {
  const all = loadReflections();
  const existingIndex = all.findIndex(
    r => String(r.teacherId) === String(teacherId) && r.date === date
  );
  const entry = {
    id: existingIndex >= 0 ? all[existingIndex].id : Date.now(),
    teacherId,
    date,
    mood,
    notes,
    createdAt: existingIndex >= 0 ? all[existingIndex].createdAt : new Date().toISOString()
  };
  if (existingIndex >= 0) {
    all[existingIndex] = entry;
  } else {
    all.push(entry);
  }
  saveReflections(all);
  return entry;
}

export function getReflectionsForTeacher(teacherId) {
  return loadReflections()
    .filter(r => String(r.teacherId) === String(teacherId))
    .sort((a, b) => b.date.localeCompare(a.date));
}
