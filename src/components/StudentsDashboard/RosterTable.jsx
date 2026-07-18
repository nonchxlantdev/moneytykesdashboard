function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function RosterRow({ student, onView }) {
  return (
    <button type="button" className="row" onClick={() => onView?.(student)}>
      <div
        className="avatar"
        style={{ background: student.avatarColor || "var(--icon-accent)" }}
        aria-hidden="true"
      >
        {student.photo ? <img src={student.photo} alt="" /> : initials(student.name)}
      </div>
      <div className="name">{student.name}</div>
      <div className="completion-cell">
        <div className="mini-bar" aria-hidden="true">
          <span style={{ width: `${student.completionPct}%` }} />
        </div>
        <span className="pct">{student.completionPct}%</span>
      </div>
      <div className="pts">{student.points} pts</div>
    </button>
  );
}

export default function RosterTable({ students = [], onView }) {
  return (
    <div className="roster-table" role="list">
      <div className="roster-table-head" aria-hidden="true">
        <span>Student</span>
        <span>Completion</span>
        <span>Points</span>
      </div>
      {students.map(student => (
        <RosterRow key={student.id} student={student} onView={onView} />
      ))}
    </div>
  );
}
