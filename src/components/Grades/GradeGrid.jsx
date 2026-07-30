import { useMemo } from "react";
import { Trash2, Users } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { computeTermScore } from "../../utils/gradeCalc";
import { formatPercent } from "../../utils/reportCardScores";
import GradeScoreCell, { GradeStatusLegend, findEntry } from "./GradeScoreCell";

export default function GradeGrid({
  students = [],
  items = [],
  categories = [],
  entriesByItem = {},
  onEntryChange,
  onDeleteItem,
  onEnterGroupScore
}) {
  const grouped = useMemo(() => {
    const byCat = new Map();
    categories.forEach(category => {
      byCat.set(String(category.id), { category, items: [] });
    });
    items.forEach(item => {
      const key = String(item.categoryId);
      if (!byCat.has(key)) {
        byCat.set(key, {
          category: { id: item.categoryId, name: "Other", weight: 0 },
          items: []
        });
      }
      byCat.get(key).items.push(item);
    });
    return [...byCat.values()].filter(group => group.items.length > 0);
  }, [categories, items]);

  return (
    <div className="form-card gr-grid-card gr-desktop-view">
      <div className="gr-grid-toolbar">
        <GradeStatusLegend />
      </div>
      <div className="gr-grid-scroll">
        <table className="gr-grid">
          <colgroup>
            <col className="gr-col-student" />
            {grouped.flatMap(group =>
              group.items.map(item => <col key={item.id} className="gr-col-item" />)
            )}
            <col className="gr-col-term" />
          </colgroup>
          <thead>
            <tr>
              <th className="gr-sticky" rowSpan={2}>
                Student
              </th>
              {grouped.map(group => (
                <th
                  key={group.category.id}
                  className="gr-cat-head"
                  colSpan={group.items.length}
                  title={`${group.category.name} · ${group.category.weight || 0}%`}
                >
                  <span className="gr-cat-head-label">{group.category.name}</span>
                  <span className="gr-cat-weight">{group.category.weight || 0}%</span>
                </th>
              ))}
              <th className="gr-term-head" rowSpan={2}>
                Term
              </th>
            </tr>
            <tr>
              {grouped.flatMap(group =>
                group.items.map(item => (
                  <th key={item.id} className="gr-item-head">
                    <div className="gr-item-title" title={item.title}>
                      {item.title}
                    </div>
                    <div className="gr-item-meta">
                      {item.entryMode === "points" ? `/${item.maxPoints || 0}` : "%"}
                      {item.isGroup ? " · group" : ""}
                    </div>
                    <div className="gr-item-actions">
                      {item.isGroup ? (
                        <Button
                          color="secondary"
                          size="sm"
                          iconLeading={<Users data-icon />}
                          title="Enter group score"
                          aria-label={`Enter group score for ${item.title}`}
                          onClick={() => onEnterGroupScore?.(item)}
                        />
                      ) : null}
                      <Button
                        color="secondary-destructive"
                        size="sm"
                        iconLeading={<Trash2 data-icon />}
                        title="Delete item"
                        aria-label={`Delete ${item.title}`}
                        onClick={() => onDeleteItem?.(item)}
                      />
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {students.map(student => {
              const name = `${student.last || ""}, ${student.first || ""}`.replace(/^,\s*|,\s*$/g, "").trim();
              const studentEntries = Object.values(entriesByItem)
                .flat()
                .filter(entry => String(entry.studentId) === String(student.id));
              const termScore = computeTermScore({ items, entries: studentEntries, categories });

              return (
                <tr key={student.id}>
                  <th className="gr-sticky gr-student">{name || "Student"}</th>
                  {grouped.flatMap(group =>
                    group.items.map(item => {
                      const entries = entriesByItem[String(item.id)] || [];
                      const entry = findEntry(entries, student.id);
                      const status = entry?.status || "graded";
                      return (
                        <td key={`${student.id}-${item.id}`} className={`gr-cell status-${status}`}>
                          <GradeScoreCell
                            studentName={name || "Student"}
                            item={item}
                            entry={entry}
                            layout="grid"
                            onCommit={({ rawValue, status: nextStatus }) =>
                              onEntryChange?.({
                                item,
                                student,
                                rawValue,
                                status: nextStatus
                              })
                            }
                          />
                        </td>
                      );
                    })
                  )}
                  <td className="gr-term-score">{formatPercent(termScore)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
