import EmptyBox from "../shared/EmptyBox";

export default function RollCallEmptyState({ onAddStudents }) {
  return (
    <EmptyBox
      title="No students in this class"
      description="Add students to take attendance."
      actions={
        <button className="btn primary" type="button" onClick={onAddStudents}>
          Add Students
        </button>
      }
    />
  );
}
