const STATUSES = ["present", "late", "absent"];

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function RollCallRow({ student, status, onChange, disabled = false }) {
  return (
    <div className="row">
      <div
        className="avatar"
        style={{ background: student.avatarColor || "var(--icon-accent)" }}
        aria-hidden="true"
      >
        {student.photo ? <img src={student.photo} alt="" /> : initials(student.name)}
      </div>
      <div className="name">{student.name}</div>
      <div className="status-pills" role="group" aria-label={`Attendance for ${student.name}`}>
        {STATUSES.map(item => (
          <button
            key={item}
            type="button"
            className={`status-pill ${item}${status === item ? " active" : ""}`}
            disabled={disabled}
            onClick={() => onChange(item)}
          >
            {capitalize(item)}
          </button>
        ))}
      </div>
    </div>
  );
}
