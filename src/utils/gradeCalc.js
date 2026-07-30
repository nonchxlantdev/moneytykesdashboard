import { clampPercent } from "./reportCardScores";

/**
 * Convert a grade entry to a 0–100 percent for averaging.
 * - points mode: (rawValue / maxPoints) * 100
 * - percent mode: rawValue as percent
 * - missing → 0
 * - excused → null (exclude before averaging)
 * - late → same as graded
 *
 * Examples:
 *   entryToPercent({ status: "graded", rawValue: 18 }, { entryMode: "points", maxPoints: 20 }) → 90
 *   entryToPercent({ status: "graded", rawValue: 87 }, { entryMode: "percent" }) → 87
 *   entryToPercent({ status: "missing", rawValue: null }, { entryMode: "percent" }) → 0
 *   entryToPercent({ status: "excused", rawValue: 50 }, { entryMode: "percent" }) → null
 */
export function entryToPercent(entry, item) {
  if (!entry || !item) return null;
  if (entry.status === "excused") return null;
  if (entry.status === "missing") return 0;

  const raw = Number(entry.rawValue);
  if (!Number.isFinite(raw)) return null;

  if (item.entryMode === "points") {
    const max = Number(item.maxPoints);
    if (!Number.isFinite(max) || max <= 0) return null;
    return clampPercent((raw / max) * 100);
  }

  return clampPercent(raw);
}

/**
 * Weighted term score for one class+subject+term.
 *
 * Sanity checks (examples):
 *
 * 1) Only Quizzes populated (weight 15); Tests/Exams empty → Quizzes renormalizes to 100:
 *    quizzes avg 80 → termScore 80
 *
 * 2) dropLowest=1 on Quizzes with scores [60, 80, 90] → avg(80,90)=85
 *
 * 3) Excused entry does not participate; remaining scores average normally.
 */
export function computeTermScore({ items = [], entries = [], categories = [] } = {}) {
  const itemById = new Map(items.map(item => [String(item.id), item]));
  const categoryById = new Map(categories.map(cat => [String(cat.id), cat]));

  /** @type {Map<string, number[]>} */
  const percentsByCategory = new Map();

  entries.forEach(entry => {
    const item = itemById.get(String(entry.itemId));
    if (!item) return;
    const percent = entryToPercent(entry, item);
    if (percent == null) return;
    const catId = String(item.categoryId);
    if (!percentsByCategory.has(catId)) percentsByCategory.set(catId, []);
    percentsByCategory.get(catId).push(percent);
  });

  if (![...percentsByCategory.values()].some(list => list.length)) return null;

  const active = [];
  percentsByCategory.forEach((percents, catId) => {
    const category = categoryById.get(catId);
    const weight = Number(category?.weight) || 0;
    const dropLowest = Math.max(0, Number(category?.dropLowest) || 0);
    let surviving = [...percents].sort((a, b) => a - b);
    if (dropLowest > 0 && surviving.length > dropLowest) {
      surviving = surviving.slice(dropLowest);
    }
    if (!surviving.length) return;
    const average = surviving.reduce((sum, n) => sum + n, 0) / surviving.length;
    active.push({ weight: Math.max(0, weight), average });
  });

  if (!active.length) return null;

  const weightSum = active.reduce((sum, row) => sum + row.weight, 0);
  if (weightSum <= 0) {
    // All active categories have weight 0 — simple unweighted mean.
    const mean = active.reduce((sum, row) => sum + row.average, 0) / active.length;
    return Math.round(mean * 10) / 10;
  }

  const termScore = active.reduce((sum, row) => {
    const normalized = (row.weight / weightSum) * 100;
    return sum + row.average * (normalized / 100);
  }, 0);

  return Math.round(termScore * 10) / 10;
}

/** Map a percent through the school's letter cutoff table (display only). */
export function letterForPercent(percent, letterScale = []) {
  if (percent == null || !Number.isFinite(Number(percent))) return null;
  const value = Number(percent);
  const rows = [...(letterScale || [])]
    .map(row => ({ minPercent: Number(row.minPercent), letter: String(row.letter || "").trim() }))
    .filter(row => Number.isFinite(row.minPercent) && row.letter)
    .sort((a, b) => b.minPercent - a.minPercent);
  const match = rows.find(row => value >= row.minPercent);
  return match?.letter || null;
}

/**
 * Per-category averages for drill-down UI (after dropLowest, before weight normalize).
 * Returns [{ categoryId, name, weight, average, count }]
 */
export function computeCategoryBreakdown({ items = [], entries = [], categories = [] } = {}) {
  const itemById = new Map(items.map(item => [String(item.id), item]));
  const percentsByCategory = new Map();

  entries.forEach(entry => {
    const item = itemById.get(String(entry.itemId));
    if (!item) return;
    const percent = entryToPercent(entry, item);
    if (percent == null) return;
    const catId = String(item.categoryId);
    if (!percentsByCategory.has(catId)) percentsByCategory.set(catId, []);
    percentsByCategory.get(catId).push(percent);
  });

  return (categories || []).map(category => {
    const catId = String(category.id);
    let surviving = [...(percentsByCategory.get(catId) || [])].sort((a, b) => a - b);
    const dropLowest = Math.max(0, Number(category.dropLowest) || 0);
    if (dropLowest > 0 && surviving.length > dropLowest) {
      surviving = surviving.slice(dropLowest);
    }
    const average =
      surviving.length > 0
        ? Math.round((surviving.reduce((sum, n) => sum + n, 0) / surviving.length) * 10) / 10
        : null;
    return {
      categoryId: category.id,
      name: category.name,
      weight: Number(category.weight) || 0,
      average,
      count: surviving.length
    };
  });
}
