/**
 * Format a numeric value as reward points.
 * @param {number|string} value
 * @returns {string}
 */
export function formatPoints(value) {
  const points = Math.round(Number(value || 0));
  return `${points.toLocaleString()} pts`;
}

/**
 * Compact label for point values in tables and badges.
 * @param {number|string} value
 * @returns {string}
 */
export function formatPointsShort(value) {
  return formatPoints(value);
}
