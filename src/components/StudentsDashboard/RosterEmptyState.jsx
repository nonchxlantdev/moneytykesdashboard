import EmptyBox from "../shared/EmptyBox";

export default function RosterEmptyState({ onAdd, onImport }) {
  return (
    <EmptyBox
      title="No students yet"
      description="Add students to begin tracking progress."
      actions={
        <>
          <button className="btn ghost" type="button" onClick={onImport}>
            Import Roster
          </button>
          <button className="btn primary" type="button" onClick={onAdd}>
            Add Student
          </button>
        </>
      }
    />
  );
}
