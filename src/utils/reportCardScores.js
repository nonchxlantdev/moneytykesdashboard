/** Percent scores for report cards: 0–100 only. */

export function clampPercent(value) {
  if (value === "" || value == null) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.min(100, Math.max(0, Math.round(num * 10) / 10));
}

/** Parse user input; return null for empty; reject non-numeric by returning previous or null. */
export function parsePercentInput(raw) {
  const text = String(raw ?? "").trim().replace(/%/g, "");
  if (text === "") return null;
  if (!/^-?\d*\.?\d+$/.test(text)) return undefined; // invalid — caller should ignore
  return clampPercent(text);
}

export function formatPercent(value, { empty = "—" } = {}) {
  if (value == null || value === "") return empty;
  const num = Number(value);
  if (!Number.isFinite(num)) return empty;
  return `${num}%`;
}
