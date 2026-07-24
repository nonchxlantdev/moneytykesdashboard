/**
 * Class name options — Admin `db.classes` is the source of truth.
 * Orphan student labels stay selectable so edits/filters don't drop unknown values.
 */
export function classLabelOptions(db = {}, currentLabel = "") {
  const names = new Set(
    (db.classes || [])
      .map(item => String(item.name || "").trim())
      .filter(Boolean)
  );
  (db.students || []).forEach(student => {
    const label = String(student.classLabel || "").trim();
    if (label) names.add(label);
  });
  if (db.className) names.add(String(db.className).trim());
  const current = String(currentLabel || "").trim();
  if (current) names.add(current);
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

/** Classes available for a school (plus any orphan current label). */
export function classOptionsForSchool(db = {}, schoolId, currentLabel = "") {
  const all = db.classes || [];
  const scoped = schoolId
    ? all.filter(item => {
        const itemSchool = item.schoolId;
        // Legacy/bootstrapped rows may lack schoolId — still offer them.
        if (itemSchool == null || itemSchool === "") return true;
        return String(itemSchool) === String(schoolId);
      })
    : all;
  const names = new Set(scoped.map(item => String(item.name || "").trim()).filter(Boolean));
  const current = String(currentLabel || "").trim();
  if (current) names.add(current);
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}
