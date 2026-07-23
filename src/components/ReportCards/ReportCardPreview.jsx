import { formatPercent } from "../../utils/reportCardScores";
import "./report-cards.css";

export default function ReportCardPreview({ reportCard, student, template, className }) {
  const terms = template?.terms || [];
  const columns = template?.columns || {};
  const att = reportCard?.attendance || {};
  const studentName = `${student?.first || ""} ${student?.last || ""}`.trim() || "Student";

  return (
    <article className="rc-preview" style={template?.accentColor ? { ["--rc-accent"]: template.accentColor } : undefined}>
      <header className="rc-preview-header">
        {template?.logoUrl ? <img className="rc-preview-logo" src={template.logoUrl} alt="" /> : null}
        <div>
          <p className="rc-preview-school">{template?.schoolName || "School"}</p>
          {template?.motto ? <p className="rc-preview-motto">{template.motto}</p> : null}
          <h2>Student Report Card</h2>
        </div>
      </header>

      <div className="rc-preview-meta">
        <span>
          <strong>Student</strong> {studentName}
        </span>
        <span>
          <strong>ID</strong> {student?.id ?? "—"}
        </span>
        <span>
          <strong>Class</strong> {className || "—"}
        </span>
        <span>
          <strong>Year</strong> {reportCard?.schoolYear}
        </span>
        <span>
          <strong>Term</strong> {reportCard?.term_or_terms}
        </span>
        {columns.showRank !== false ? (
          <span>
            <strong>Rank</strong> {reportCard?.rank == null ? "—" : reportCard.rank}
          </span>
        ) : null}
      </div>

      <div className="rc-preview-table-wrap">
        <table className="rc-preview-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Instructor</th>
              {columns.showHours !== false ? <th>Hours</th> : null}
              {terms.map(term => (
                <th key={term}>{term}</th>
              ))}
              <th>Avg</th>
            </tr>
          </thead>
          <tbody>
            {(reportCard?.subjects || []).map(subject => (
              <tr key={subject.name}>
                <td>{subject.name}</td>
                <td>{subject.instructor || "—"}</td>
                {columns.showHours !== false ? <td>{subject.hours ?? "—"}</td> : null}
                {(subject.termScores || []).map((score, index) => (
                  <td key={`${subject.name}-${index}`}>{formatPercent(score)}</td>
                ))}
                <td>{formatPercent(subject.avg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rc-preview-totals">
        <span>
          Overall average: <strong>{formatPercent(reportCard?.overallAvg)}</strong>
        </span>
        {columns.showRank !== false ? (
          <span>
            Rank: <strong>{reportCard?.rank == null ? "—" : reportCard.rank}</strong>
          </span>
        ) : null}
      </div>

      <div className="rc-preview-attendance">
        {columns.showAbsent !== false ? <span>Absent: {att.absent ?? 0}</span> : null}
        {columns.showTardy !== false ? <span>Tardy: {att.tardy ?? 0}</span> : null}
        {columns.showDemerits !== false ? <span>Demerits: {att.demerits ?? 0}</span> : null}
        {columns.showMerits !== false ? <span>Merits: {att.merits ?? 0}</span> : null}
        {columns.showProbation !== false ? <span>Probation: {att.probation || "—"}</span> : null}
      </div>

      <div className="rc-preview-comments">
        <strong>Comments</strong>
        <p>{reportCard?.comments || "—"}</p>
      </div>

      <div className="rc-preview-signatures">
        {(template?.signatureLabels || ["Homeroom Teacher", "Principal"]).map(label => (
          <div key={label} className="rc-sig">
            <span className="rc-sig-line" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
