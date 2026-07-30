import { useEffect, useState } from "react";
import Select from "../ui/Select";
import { computeTermScore } from "../../utils/gradeCalc";
import { formatPercent } from "../../utils/reportCardScores";
import GradeScoreCell, { GradeStatusLegend, findEntry } from "./GradeScoreCell";

/**
 * Phone-width grading list — one item at a time, one row per student.
 * Mirrors roster/roll-call list conventions (name + controls stacked).
 */
export default function GradeMobileList({
  students = [],
  items = [],
  categories = [],
  entriesByItem = {},
  onEntryChange
}) {
  const [itemId, setItemId] = useState(String(items[0]?.id || ""));

  useEffect(() => {
    if (!items.length) {
      setItemId("");
      return;
    }
    if (!items.some(item => String(item.id) === String(itemId))) {
      setItemId(String(items[0].id));
    }
  }, [items, itemId]);

  const activeItem = items.find(item => String(item.id) === String(itemId)) || items[0] || null;
  const entries = activeItem ? entriesByItem[String(activeItem.id)] || [] : [];

  return (
    <div className="form-card gr-mobile-view">
      <div className="gr-mobile-head">
        <Select
          label="Grade item"
          value={activeItem ? String(activeItem.id) : ""}
          onChange={value => setItemId(String(value || ""))}
          options={items.map(item => ({
            value: String(item.id),
            label: `${item.title}${item.entryMode === "points" ? ` /${item.maxPoints || 0}` : " %"}`
          }))}
          placeholder="Select item"
          searchPlaceholder="Search items"
          required
          allowClear={false}
        />
        <GradeStatusLegend />
      </div>

      {!activeItem ? (
        <p className="gr-mobile-empty">No grade items for this filter.</p>
      ) : (
        <div className="gr-mobile-list" role="list">
          {students.map(student => {
            const name = `${student.last || ""}, ${student.first || ""}`.replace(/^,\s*|,\s*$/g, "").trim();
            const entry = findEntry(entries, student.id);
            const studentEntries = Object.values(entriesByItem)
              .flat()
              .filter(row => String(row.studentId) === String(student.id));
            const termScore = computeTermScore({ items, entries: studentEntries, categories });
            const status = entry?.status || "graded";

            return (
              <div key={student.id} className={`gr-mobile-row status-${status}`} role="listitem">
                <div className="gr-mobile-row-top">
                  <span className="gr-mobile-name">{name || "Student"}</span>
                  <span className="gr-mobile-term" title="Term score">
                    {formatPercent(termScore)}
                  </span>
                </div>
                <GradeScoreCell
                  studentName={name || "Student"}
                  item={activeItem}
                  entry={entry}
                  layout="mobile"
                  onCommit={({ rawValue, status: nextStatus }) =>
                    onEntryChange?.({
                      item: activeItem,
                      student,
                      rawValue,
                      status: nextStatus
                    })
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
