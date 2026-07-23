import InstructorSelect from "./InstructorSelect";
import { formatPercent, parsePercentInput } from "../../utils/reportCardScores";
import { recomputeCard } from "../../utils/reportCardsStorage";

export default function ReportCardEditor({
  card,
  student,
  template,
  teachers = [],
  onChange,
  onSave,
  onCancel
}) {
  const terms = template.terms || [];
  const columns = template.columns || {};
  const name = `${student?.first || ""} ${student?.last || ""}`.trim();
  const templateInstructors = (template.subjects || []).map(subject => subject.instructor).filter(Boolean);

  function updateSubject(index, patch) {
    const subjects = card.subjects.map((subject, i) => (i === index ? { ...subject, ...patch } : subject));
    onChange(recomputeCard({ ...card, subjects }));
  }

  function updateScore(subjectIndex, termIndex, raw) {
    const parsed = parsePercentInput(raw);
    if (parsed === undefined) return; // reject non-numeric
    const subjects = card.subjects.map((subject, i) => {
      if (i !== subjectIndex) return subject;
      const termScores = [...(subject.termScores || [])];
      while (termScores.length < terms.length) termScores.push(null);
      termScores[termIndex] = parsed;
      return { ...subject, termScores };
    });
    onChange(recomputeCard({ ...card, subjects }));
  }

  function updateAttendance(key, value) {
    onChange({
      ...card,
      attendance: { ...card.attendance, [key]: value }
    });
  }

  return (
    <div className="rc-editor form-card">
      <header className="rc-editor-head">
        <div>
          <h2>Edit report card</h2>
          <p>
            {name} · {card.term_or_terms} · {card.schoolYear}
          </p>
        </div>
        <div className="rc-editor-actions">
          <button type="button" className="btn" title="Discard changes and close the editor" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn primary-gold"
            title="Save scores, attendance, and comments for this student"
            onClick={() => onSave(card)}
          >
            Save
          </button>
        </div>
      </header>

      <div className="rc-editor-table-wrap">
        <table className="rc-editor-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Instructor</th>
              {columns.showHours !== false ? <th>Hours</th> : null}
              {terms.map((term, index) => (
                <th key={term}>{term || `Term ${index + 1}`}</th>
              ))}
              <th>Avg</th>
            </tr>
          </thead>
          <tbody>
            {card.subjects.map((subject, subjectIndex) => (
              <tr key={subject.name}>
                <td>{subject.name}</td>
                <td>
                  <InstructorSelect
                    value={subject.instructor || ""}
                    teachers={teachers}
                    extraNames={[...templateInstructors, ...(card.subjects || []).map(item => item.instructor)]}
                    onChange={instructor => updateSubject(subjectIndex, { instructor })}
                  />
                </td>
                {columns.showHours !== false ? (
                  <td>
                    <input
                      type="number"
                      min="0"
                      title="Contact hours for this subject"
                      value={subject.hours ?? ""}
                      onChange={event => updateSubject(subjectIndex, { hours: Number(event.target.value) || 0 })}
                    />
                  </td>
                ) : null}
                {terms.map((_, termIndex) => (
                  <td key={`${subject.name}-${termIndex}`}>
                    <div className="rc-percent-field" title="Enter a percentage score from 0 to 100">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="100"
                        step="0.1"
                        className="rc-percent-input"
                        value={subject.termScores?.[termIndex] ?? ""}
                        onChange={event => updateScore(subjectIndex, termIndex, event.target.value)}
                        onBlur={event => {
                          const parsed = parsePercentInput(event.target.value);
                          if (parsed === undefined) {
                            updateScore(subjectIndex, termIndex, subject.termScores?.[termIndex] ?? "");
                            return;
                          }
                          updateScore(subjectIndex, termIndex, parsed == null ? "" : String(parsed));
                        }}
                        aria-label={`${subject.name} ${terms[termIndex] || `Term ${termIndex + 1}`} percent`}
                      />
                      <span className="rc-percent-suffix" aria-hidden="true">
                        %
                      </span>
                    </div>
                  </td>
                ))}
                <td>{formatPercent(subject.avg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rc-editor-grid">
        <label>
          Overall average
          <input value={formatPercent(card.overallAvg, { empty: "" })} readOnly title="Auto-calculated from subject averages" />
        </label>
        {columns.showRank !== false ? (
          <label>
            Rank (override)
            <input
              type="number"
              min="1"
              title="Class rank by overall average — override if needed"
              value={card.rank ?? ""}
              onChange={event =>
                onChange({ ...card, rank: event.target.value === "" ? null : Number(event.target.value) })
              }
            />
          </label>
        ) : null}
        {columns.showAbsent !== false ? (
          <label>
            Absent
            <input
              type="number"
              min="0"
              title="Days absent"
              value={card.attendance?.absent ?? 0}
              onChange={event => updateAttendance("absent", Number(event.target.value) || 0)}
            />
          </label>
        ) : null}
        {columns.showTardy !== false ? (
          <label>
            Tardy
            <input
              type="number"
              min="0"
              title="Times tardy"
              value={card.attendance?.tardy ?? 0}
              onChange={event => updateAttendance("tardy", Number(event.target.value) || 0)}
            />
          </label>
        ) : null}
        {columns.showDemerits !== false ? (
          <label>
            Demerits
            <input
              type="number"
              min="0"
              title="Demerit count"
              value={card.attendance?.demerits ?? 0}
              onChange={event => updateAttendance("demerits", Number(event.target.value) || 0)}
            />
          </label>
        ) : null}
        {columns.showMerits !== false ? (
          <label>
            Merits
            <input
              type="number"
              min="0"
              title="Merit count"
              value={card.attendance?.merits ?? 0}
              onChange={event => updateAttendance("merits", Number(event.target.value) || 0)}
            />
          </label>
        ) : null}
        {columns.showProbation !== false ? (
          <label className="rc-span-2">
            Probation
            <input
              title="Probation note shown on the report card"
              value={card.attendance?.probation || ""}
              onChange={event => updateAttendance("probation", event.target.value)}
            />
          </label>
        ) : null}
        <label className="rc-span-2">
          Comments
          <textarea
            rows={3}
            title="Teacher comments printed on the report card"
            value={card.comments || ""}
            onChange={event => onChange({ ...card, comments: event.target.value })}
          />
        </label>
      </div>
    </div>
  );
}
