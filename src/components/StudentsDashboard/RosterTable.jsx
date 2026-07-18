import { Pencil } from "lucide-react";

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function RosterRow({ student, onView, onEdit }) {
  return (
    <div className="row" role="listitem">
      <div className="student-cell">
        <div
          className="avatar"
          style={{ background: student.avatarColor || "var(--icon-accent)" }}
          aria-hidden="true"
        >
          {student.photo ? <img src={student.photo} alt="" /> : initials(student.name)}
        </div>
        <button type="button" className="student-name-button name" onClick={() => onView?.(student)}>
          {student.name}
        </button>
      </div>
      <div className="gender">{student.gender === "female" ? "Female" : student.gender === "male" ? "Male" : "—"}</div>
      <div className="age">{student.age ? `${student.age}` : "—"}</div>
      <div className="class-label">{student.classLabel || "—"}</div>
      <div className="pts">{student.points} pts</div>
      <div className="roster-actions">
        <button
          type="button"
          className="roster-edit-button"
          onClick={() => onEdit?.(student)}
          aria-label={`Edit ${student.name}`}
        >
          <Pencil size={14} />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
}

export default function RosterTable({ students = [], onView, onEdit }) {
  return (
    <div className="roster-table" role="list">
      <div className="roster-table-head" aria-hidden="true">
        <span>Student</span>
        <span>Gender</span>
        <span>Age</span>
        <span>Class</span>
        <span>Points</span>
        <span>Actions</span>
      </div>
      {students.map(student => (
        <RosterRow key={student.id} student={student} onView={onView} onEdit={onEdit} />
      ))}
    </div>
  );
}
