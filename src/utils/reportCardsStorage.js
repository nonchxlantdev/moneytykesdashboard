/**
 * Report Cards localStorage layer (parallel to rewardsStorage / lessonsStorage).
 */

const TEMPLATE_KEY = "mt.report_card.templates.v1";
const CARDS_KEY = "mt.report_card.cards.v1";
const SEND_LOG_KEY = "mt.report_card.send_log.v1";
const SECTIONS_KEY = "mt.report_card.class_sections.v1";

export const REPORT_STATUSES = ["draft", "ready", "generated", "sent"];

export function defaultTemplate(school = {}) {
  return {
    schoolId: school.id ?? null,
    schoolName: school.name || "MoneyTykes School",
    logoUrl: "",
    motto: "Learning money skills for life",
    accentColor: "",
    terms: ["1st Term", "2nd Term", "3rd Term"],
    subjects: [
      { name: "Financial Literacy", instructor: "", hours: 40 },
      { name: "Mathematics", instructor: "", hours: 40 },
      { name: "Language Arts", instructor: "", hours: 40 }
    ],
    columns: {
      showHours: true,
      showRank: true,
      showAbsent: true,
      showTardy: true,
      showDemerits: true,
      showMerits: true,
      showProbation: true
    },
    signatureLabels: ["Homeroom Teacher", "Principal"]
  };
}

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

export function loadTemplates() {
  return readJson(TEMPLATE_KEY, {});
}

export function saveTemplates(map) {
  writeJson(TEMPLATE_KEY, map);
}

export function getTemplateForSchool(schoolId, school) {
  const map = loadTemplates();
  const key = String(schoolId ?? "default");
  if (map[key]) return { ...defaultTemplate(school), ...map[key], columns: { ...defaultTemplate().columns, ...(map[key].columns || {}) } };
  return defaultTemplate(school || { id: schoolId });
}

export function saveTemplateForSchool(schoolId, template) {
  const map = loadTemplates();
  const key = String(schoolId ?? "default");
  map[key] = { ...template, schoolId: schoolId ?? null };
  saveTemplates(map);
  return map[key];
}

export function loadReportCards() {
  return readJson(CARDS_KEY, []);
}

export function saveReportCards(cards) {
  writeJson(CARDS_KEY, cards);
}

export function upsertReportCard(card) {
  const cards = loadReportCards();
  const index = cards.findIndex(item => String(item.id) === String(card.id));
  if (index >= 0) cards[index] = card;
  else cards.push(card);
  saveReportCards(cards);
  return card;
}

export function upsertReportCards(nextCards) {
  const cards = loadReportCards();
  const byId = new Map(cards.map(card => [String(card.id), card]));
  nextCards.forEach(card => byId.set(String(card.id), card));
  const merged = Array.from(byId.values());
  saveReportCards(merged);
  return merged;
}

export function getReportCardsForClassTerm({ classId, schoolYear, term }) {
  return loadReportCards().filter(
    card =>
      String(card.classId) === String(classId) &&
      String(card.schoolYear) === String(schoolYear) &&
      String(card.term_or_terms) === String(term)
  );
}

export function getReportCardsForStudent(studentId) {
  return loadReportCards()
    .filter(card => String(card.studentId) === String(studentId))
    .sort((a, b) => String(b.schoolYear).localeCompare(String(a.schoolYear)) || String(b.term_or_terms).localeCompare(String(a.term_or_terms)));
}

export function loadSendLog() {
  return readJson(SEND_LOG_KEY, []);
}

export function appendSendLog(entry) {
  const log = loadSendLog();
  log.unshift(entry);
  writeJson(SEND_LOG_KEY, log);
  return entry;
}

export function loadClassSections() {
  return readJson(SECTIONS_KEY, []);
}

export function saveClassSections(sections) {
  writeJson(SECTIONS_KEY, sections);
}

/** Derive class sections from student classLabel values + saved sections. */
export function resolveClassSections(students = [], db = {}) {
  const saved = loadClassSections();
  const byId = new Map(saved.map(section => [String(section.id), section]));

  const labels = new Set();
  students.forEach(student => {
    const label = String(student.classLabel || "").trim();
    if (label) labels.add(label);
  });
  if (db.className) labels.add(String(db.className).trim());

  labels.forEach(name => {
    const id = slugClassId(name);
    if (!byId.has(id)) {
      byId.set(id, {
        id,
        name,
        teacherId: db.teacher?.id ?? null,
        schoolId: (db.schools || [])[0]?.id ?? null
      });
    }
  });

  const list = Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  if (!list.length) {
    const fallback = {
      id: "default-class",
      name: db.className || "Financial Literacy Class",
      teacherId: db.teacher?.id ?? null,
      schoolId: (db.schools || [])[0]?.id ?? null
    };
    return [fallback];
  }
  return list;
}

export function slugClassId(value) {
  return String(value || "class")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "class";
}

export function currentSchoolYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

export function emptyAttendance() {
  return { absent: 0, tardy: 0, demerits: 0, merits: 0, probation: "" };
}

export function buildBlankCard({ student, classSection, schoolYear, term, template }) {
  const subjects = (template.subjects || []).map(subject => ({
    name: subject.name,
    instructor: subject.instructor || "",
    hours: Number(subject.hours) || 0,
    termScores: (template.terms || []).map(() => null),
    avg: null
  }));

  return {
    id: `rc-${student.id}-${classSection.id}-${schoolYear}-${term}`.replace(/\s+/g, "-"),
    studentId: student.id,
    classId: classSection.id,
    schoolYear,
    term_or_terms: term,
    subjects,
    overallAvg: null,
    rank: null,
    attendance: emptyAttendance(),
    comments: "",
    status: "draft",
    generatedAt: null,
    sentAt: null
  };
}

export function subjectAverage(termScores = []) {
  const nums = termScores.map(Number).filter(value => Number.isFinite(value));
  if (!nums.length) return null;
  return Math.round((nums.reduce((sum, n) => sum + n, 0) / nums.length) * 10) / 10;
}

export function overallAverage(subjects = []) {
  const avgs = subjects.map(subject => subjectAverage(subject.termScores)).filter(value => value !== null);
  if (!avgs.length) return null;
  return Math.round((avgs.reduce((sum, n) => sum + n, 0) / avgs.length) * 10) / 10;
}

/** True when every subject has a numeric score for every template term slot. */
export function hasCompleteScores(card) {
  const subjects = card?.subjects || [];
  if (!subjects.length) return false;
  return subjects.every(subject => {
    const scores = subject.termScores || [];
    if (!scores.length) return false;
    return scores.every(score => score !== null && score !== "" && Number.isFinite(Number(score)));
  });
}

/**
 * Status derivation (design-locked):
 * draft = missing scores; ready = all scores present but not generated;
 * generated / sent are sticky until regenerated or resent.
 */
export function deriveStatus(card) {
  if (card?.status === "sent") return "sent";
  if (card?.status === "generated") return "generated";
  return hasCompleteScores(card) ? "ready" : "draft";
}

export function recomputeCard(card) {
  const subjects = (card.subjects || []).map(subject => ({
    ...subject,
    avg: subjectAverage(subject.termScores)
  }));
  const next = {
    ...card,
    subjects,
    overallAvg: overallAverage(subjects)
  };
  return {
    ...next,
    status: deriveStatus(next)
  };
}

export function assignRanks(cards) {
  const ranked = [...cards].sort((a, b) => {
    const av = a.overallAvg == null ? -1 : a.overallAvg;
    const bv = b.overallAvg == null ? -1 : b.overallAvg;
    return bv - av;
  });
  let place = 1;
  return ranked.map((card, index) => {
    if (card.overallAvg == null) return { ...card, rank: null };
    if (index > 0 && ranked[index - 1].overallAvg === card.overallAvg) {
      return { ...card, rank: ranked[index - 1].rank };
    }
    const next = { ...card, rank: place };
    place += 1;
    return next;
  });
}

export function ensureClassRosterCards({ students, classSection, schoolYear, term, template }) {
  const existing = getReportCardsForClassTerm({
    classId: classSection.id,
    schoolYear,
    term
  });
  const byStudent = new Map(existing.map(card => [String(card.studentId), card]));
  const classStudents = students.filter(
    student => slugClassId(student.classLabel || classSection.name) === String(classSection.id) || student.classLabel === classSection.name
  );

  const roster = classStudents.length
    ? classStudents
    : students.filter(student => !student.classLabel || student.classLabel === classSection.name);

  const cards = roster.map(student => {
    const found = byStudent.get(String(student.id));
    if (found) return recomputeCard(found);
    return recomputeCard(buildBlankCard({ student, classSection, schoolYear, term, template }));
  });

  return assignRanks(cards);
}

export function parentEmailForStudent(student) {
  return String(student?.emailGuardian || student?.guardianEmail || student?.parentEmail || student?.email || "").trim();
}

export function statusLabel(status) {
  return (
    {
      draft: "Draft",
      ready: "Ready",
      generated: "Generated",
      sent: "Sent"
    }[status] || "Draft"
  );
}
