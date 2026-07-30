import { useMemo, useState } from "react";
import {
  computeCategoryBreakdown,
  computeTermScore,
  entryToPercent,
  letterForPercent
} from "../../utils/gradeCalc";
import {
  getCategoriesForSchool,
  getEntriesForStudent,
  getItemsForClassSubjectTerm,
  getLetterScaleForSchool
} from "../../utils/gradesStorage";
import { formatPercent } from "../../utils/reportCardScores";
import { getTemplateForSchool, slugClassId } from "../../utils/reportCardsStorage";

export default function StudentGradeDrilldown({ student, db }) {
  const school = { id: student.schoolId, name: student.schoolName };
  const template = getTemplateForSchool(student.schoolId, school);
  const categories = getCategoriesForSchool(student.schoolId);
  const letterScale = getLetterScaleForSchool(student.schoolId);
  const classId = slugClassId(student.classLabel || db?.className || "class");
  const subjects = template.subjects || [];

  const [term, setTerm] = useState(template.terms?.[0] || "1st Term");
  const [subjectName, setSubjectName] = useState(subjects[0]?.name || "Financial Literacy");

  const items = useMemo(
    () => getItemsForClassSubjectTerm({ classId, subjectName, term }),
    [classId, subjectName, term]
  );
  const entries = useMemo(
    () => getEntriesForStudent({ studentId: student.id, classId, subjectName, term }),
    [student.id, classId, subjectName, term]
  );

  const breakdown = useMemo(
    () => computeCategoryBreakdown({ items, entries, categories }),
    [items, entries, categories]
  );
  const termScore = useMemo(
    () => computeTermScore({ items, entries, categories }),
    [items, entries, categories]
  );
  const letter = letterForPercent(termScore, letterScale);

  const rows = useMemo(() => {
    const entryByItem = new Map(entries.map(entry => [String(entry.itemId), entry]));
    return items.map(item => {
      const entry = entryByItem.get(String(item.id));
      const category = categories.find(cat => String(cat.id) === String(item.categoryId));
      return {
        item,
        entry,
        categoryName: category?.name || "—",
        percent: entry ? entryToPercent(entry, item) : null
      };
    });
  }, [items, entries, categories]);

  return (
    <div className="gr-drilldown">
      <div className="gr-drilldown-head">
        <h4>Gradebook</h4>
        <div className="gr-drilldown-filters">
          <label>
            Subject
            <select value={subjectName} onChange={event => setSubjectName(event.target.value)}>
              {subjects.map(subject => (
                <option key={subject.name} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Term
            <select value={term} onChange={event => setTerm(event.target.value)}>
              {(template.terms || []).map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="gr-drilldown-summary">
        Term score: <strong>{formatPercent(termScore)}</strong>
        {letter ? ` · ${letter}` : ""}
      </p>

      <ul className="gr-breakdown">
        {breakdown.map(row => (
          <li key={row.categoryId}>
            <span>
              {row.name} ({row.weight}%)
            </span>
            <span>
              {row.average == null ? "—" : formatPercent(row.average)}
              {row.count ? ` · ${row.count} scored` : ""}
            </span>
          </li>
        ))}
      </ul>

      {rows.length ? (
        <ul className="gr-drilldown-list">
          {rows.map(({ item, entry, categoryName, percent }) => (
            <li key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>
                  {categoryName} · {item.date || "No date"}
                </span>
              </div>
              <div className="gr-drilldown-score">
                {entry?.status === "excused"
                  ? "Excused"
                  : entry?.status === "missing"
                    ? "Missing"
                    : percent == null
                      ? "—"
                      : formatPercent(percent)}
                {entry?.status && entry.status !== "graded" && entry.status !== "missing" && entry.status !== "excused"
                  ? ` · ${entry.status}`
                  : ""}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rc-muted" style={{ margin: 0 }}>
          No grade items for this subject and term yet.
        </p>
      )}
    </div>
  );
}
