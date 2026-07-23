import RollCallEmptyState from "./RollCallEmptyState";
import RollCallRow from "./RollCallRow";

export default function RollCall({
  students,
  attendance,
  onStatusChange,
  presentCount,
  recordExists,
  onMarkAllPresent,
  onSave,
  onAddStudents
}) {
  return (
    <article className="roll-call-card" data-tour="attendance-roll-call">
      <div className="roll-call-head">
        <div className="roll-call-title">
          <h2>Roll Call</h2>
          <span className="count-badge">
            {presentCount}/{students.length} present
          </span>
        </div>
        {students.length ? (
          <button
            type="button"
            className="btn ghost"
            disabled={recordExists}
            onClick={onMarkAllPresent}
          >
            Mark all present
          </button>
        ) : null}
      </div>

      {!students.length ? (
        <RollCallEmptyState onAddStudents={onAddStudents} />
      ) : (
        <div className="roll-call-list" role="list">
          {students.map(student => (
            <RollCallRow
              key={student.id}
              student={student}
              status={attendance[student.id] || "present"}
              disabled={recordExists}
              onChange={status => onStatusChange(student.id, status)}
            />
          ))}
        </div>
      )}

      <div className="roll-call-footer">
        <button
          type="button"
          className="btn primary"
          disabled={recordExists || !students.length}
          onClick={onSave}
        >
          Save attendance
        </button>
      </div>
    </article>
  );
}
