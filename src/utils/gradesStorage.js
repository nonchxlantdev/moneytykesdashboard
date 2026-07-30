import { computeTermScore } from "./gradeCalc";
import {
  getTemplateForSchool,
  loadReportCards,
  recomputeCard,
  upsertReportCards
} from "./reportCardsStorage";

const CATEGORIES_KEY = "mt.grades.categories.v1";
const ITEMS_KEY = "mt.grades.items.v1";
const ENTRIES_KEY = "mt.grades.entries.v1";
const LETTER_SCALE_KEY = "mt.grades.letter_scale.v1";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function schoolKey(schoolId) {
  return String(schoolId ?? "default");
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultCategories(schoolId = null) {
  const base = [
    { name: "Quizzes", weight: 15, dropLowest: 0, allowExtraCredit: false },
    { name: "Assignments", weight: 20, dropLowest: 0, allowExtraCredit: false },
    { name: "Tests", weight: 30, dropLowest: 0, allowExtraCredit: false },
    { name: "Exams", weight: 35, dropLowest: 0, allowExtraCredit: false },
    { name: "Projects", weight: 0, dropLowest: 0, allowExtraCredit: false }
  ];
  return base.map((row, index) => ({
    id: newId("gcat"),
    schoolId: schoolId ?? null,
    order: index,
    ...row
  }));
}

export function defaultLetterScale() {
  return [
    { minPercent: 90, letter: "A" },
    { minPercent: 80, letter: "B" },
    { minPercent: 70, letter: "C" },
    { minPercent: 60, letter: "D" },
    { minPercent: 0, letter: "F" }
  ];
}

export function getCategoriesForSchool(schoolId) {
  const map = readJson(CATEGORIES_KEY, {});
  const key = schoolKey(schoolId);
  if (Array.isArray(map[key]) && map[key].length) {
    return [...map[key]].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  const seeded = defaultCategories(schoolId ?? null);
  map[key] = seeded;
  writeJson(CATEGORIES_KEY, map);
  return seeded;
}

export function saveCategoriesForSchool(schoolId, categories) {
  const map = readJson(CATEGORIES_KEY, {});
  const key = schoolKey(schoolId);
  map[key] = (categories || []).map((row, index) => ({
    ...row,
    schoolId: schoolId ?? null,
    order: row.order ?? index,
    weight: Number(row.weight) || 0,
    dropLowest: Math.max(0, Number(row.dropLowest) || 0),
    allowExtraCredit: Boolean(row.allowExtraCredit)
  }));
  writeJson(CATEGORIES_KEY, map);
  return map[key];
}

export function getLetterScaleForSchool(schoolId) {
  const map = readJson(LETTER_SCALE_KEY, {});
  const key = schoolKey(schoolId);
  if (Array.isArray(map[key]) && map[key].length) return map[key];
  const seeded = defaultLetterScale();
  map[key] = seeded;
  writeJson(LETTER_SCALE_KEY, map);
  return seeded;
}

export function saveLetterScaleForSchool(schoolId, scale) {
  const map = readJson(LETTER_SCALE_KEY, {});
  const key = schoolKey(schoolId);
  map[key] = (scale || [])
    .map(row => ({
      minPercent: Number(row.minPercent),
      letter: String(row.letter || "").trim()
    }))
    .filter(row => Number.isFinite(row.minPercent) && row.letter)
    .sort((a, b) => b.minPercent - a.minPercent);
  writeJson(LETTER_SCALE_KEY, map);
  return map[key];
}

export function loadGradeItems() {
  return readJson(ITEMS_KEY, []);
}

export function saveGradeItems(items) {
  writeJson(ITEMS_KEY, items);
}

export function upsertGradeItem(item) {
  const items = loadGradeItems();
  const next = {
    ...item,
    id: item.id || newId("gitem"),
    createdAt: item.createdAt || new Date().toISOString(),
    isGroup: Boolean(item.isGroup),
    groupStudentIds: item.isGroup ? item.groupStudentIds || [] : [],
    maxPoints: item.entryMode === "points" ? Number(item.maxPoints) || 0 : null
  };
  const index = items.findIndex(row => String(row.id) === String(next.id));
  if (index >= 0) items[index] = next;
  else items.push(next);
  saveGradeItems(items);
  return next;
}

export function deleteGradeItem(id) {
  const items = loadGradeItems().filter(item => String(item.id) !== String(id));
  saveGradeItems(items);
  const entries = loadGradeEntries().filter(entry => String(entry.itemId) !== String(id));
  saveGradeEntries(entries);
}

export function getItemsForClassSubjectTerm({ classId, subjectName, term }) {
  return loadGradeItems()
    .filter(
      item =>
        String(item.classId) === String(classId) &&
        String(item.subjectName) === String(subjectName) &&
        String(item.term) === String(term)
    )
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || String(a.title).localeCompare(String(b.title)));
}

export function loadGradeEntries() {
  return readJson(ENTRIES_KEY, []);
}

export function saveGradeEntries(entries) {
  writeJson(ENTRIES_KEY, entries);
}

export function upsertGradeEntry(entry) {
  const entries = loadGradeEntries();
  const next = {
    ...entry,
    id: entry.id || newId("gentry"),
    enteredAt: new Date().toISOString(),
    status: entry.status || "graded",
    comment: entry.comment || ""
  };
  const index = entries.findIndex(
    row =>
      String(row.id) === String(next.id) ||
      (String(row.itemId) === String(next.itemId) && String(row.studentId) === String(next.studentId))
  );
  if (index >= 0) {
    next.id = entries[index].id;
    entries[index] = { ...entries[index], ...next };
  } else {
    entries.push(next);
  }
  saveGradeEntries(entries);
  return next;
}

/** Stamp the same graded score onto every student in a group project. */
export function upsertGroupEntries(itemId, studentIds, rawValue) {
  return (studentIds || []).map(studentId =>
    upsertGradeEntry({
      itemId,
      studentId,
      rawValue,
      status: "graded",
      comment: ""
    })
  );
}

export function getEntriesForItem(itemId) {
  return loadGradeEntries().filter(entry => String(entry.itemId) === String(itemId));
}

export function getEntriesForStudent({ studentId, classId, subjectName, term }) {
  const items = getItemsForClassSubjectTerm({ classId, subjectName, term });
  const itemIds = new Set(items.map(item => String(item.id)));
  return loadGradeEntries().filter(
    entry => String(entry.studentId) === String(studentId) && itemIds.has(String(entry.itemId))
  );
}

export function ensureTermScoreSources(subject, termCount) {
  const count = Math.max(0, Number(termCount) || 0);
  const sources = [...(subject?.termScoreSources || [])];
  while (sources.length < count) sources.push("auto");
  return sources.slice(0, count);
}

/**
 * Push live gradebook term averages into Report Card subject cells marked auto.
 * Manual overrides are left alone.
 */
export function syncReportCardTermScores({
  studentId,
  classId,
  subjectName,
  schoolYear,
  schoolId = null
} = {}) {
  if (!studentId || !classId || !subjectName || !schoolYear) return [];

  const template = getTemplateForSchool(schoolId, { id: schoolId });
  const terms = template.terms || [];
  const categories = getCategoriesForSchool(schoolId);
  const cards = loadReportCards().filter(
    card =>
      String(card.studentId) === String(studentId) &&
      String(card.classId) === String(classId) &&
      String(card.schoolYear) === String(schoolYear)
  );

  if (!cards.length) return [];

  const updated = cards.map(card => {
    const subjects = (card.subjects || []).map(subject => {
      if (String(subject.name) !== String(subjectName)) return subject;
      const termScores = [...(subject.termScores || [])];
      while (termScores.length < terms.length) termScores.push(null);
      const termScoreSources = ensureTermScoreSources(subject, terms.length);

      terms.forEach((term, termIndex) => {
        if (termScoreSources[termIndex] === "manual") return;
        const items = getItemsForClassSubjectTerm({ classId, subjectName, term });
        const itemIds = new Set(items.map(item => String(item.id)));
        const entries = loadGradeEntries().filter(
          entry => String(entry.studentId) === String(studentId) && itemIds.has(String(entry.itemId))
        );
        const score = computeTermScore({ items, entries, categories });
        termScores[termIndex] = score;
        termScoreSources[termIndex] = "auto";
      });

      return { ...subject, termScores, termScoreSources };
    });

    return recomputeCard({ ...card, subjects });
  });

  upsertReportCards(updated);
  return updated;
}

/** Sync term scores for every student who has an entry (or is in the roster filter). */
export function syncReportCardTermScoresForStudents({
  studentIds = [],
  classId,
  subjectName,
  schoolYear,
  schoolId = null
} = {}) {
  const unique = [...new Set((studentIds || []).map(String))];
  unique.forEach(studentId => {
    syncReportCardTermScores({ studentId, classId, subjectName, schoolYear, schoolId });
  });
}

/** Backfill termScoreSources on existing cards loaded into memory (does not persist alone). */
export function normalizeCardSources(card, terms = []) {
  const termCount = terms.length || Math.max(...(card.subjects || []).map(s => (s.termScores || []).length), 0);
  return {
    ...card,
    subjects: (card.subjects || []).map(subject => ({
      ...subject,
      termScoreSources: ensureTermScoreSources(subject, termCount)
    }))
  };
}

/** Used by Report Card editor reset action. */
export function resetTermScoreToAuto({ card, subjectIndex, termIndex, schoolId = null }) {
  const subjects = [...(card.subjects || [])];
  const subject = subjects[subjectIndex];
  if (!subject) return card;
  const template = getTemplateForSchool(schoolId, { id: schoolId });
  const terms = template.terms || [];
  const term = terms[termIndex];
  const termScoreSources = ensureTermScoreSources(subject, terms.length || (subject.termScores || []).length);
  termScoreSources[termIndex] = "auto";

  let score = null;
  if (term) {
    const items = getItemsForClassSubjectTerm({
      classId: card.classId,
      subjectName: subject.name,
      term
    });
    const itemIds = new Set(items.map(item => String(item.id)));
    const entries = loadGradeEntries().filter(
      entry => String(entry.studentId) === String(card.studentId) && itemIds.has(String(entry.itemId))
    );
    const categories = getCategoriesForSchool(schoolId);
    score = computeTermScore({ items, entries, categories });
  }

  const termScores = [...(subject.termScores || [])];
  while (termScores.length < termScoreSources.length) termScores.push(null);
  termScores[termIndex] = score;
  subjects[subjectIndex] = { ...subject, termScores, termScoreSources };
  return recomputeCard({ ...card, subjects });
}
