import EmptyBox from "../shared/EmptyBox";

export default function RosterEmptyState({ onAdd, onImport }) {
  return (
    <EmptyBox
      title="No students yet"
      description={
        onAdd
          ? "Add students to begin tracking progress."
          : "Ask a school administrator to add students to this class."
      }
      actions={
        onAdd || onImport ? (
          <>
            {onImport ? (
              <button className="btn ghost" type="button" onClick={onImport}>
                Import Roster
              </button>
            ) : null}
            {onAdd ? (
              <button className="btn primary" type="button" onClick={onAdd}>
                Add Student
              </button>
            ) : null}
          </>
        ) : null
      }
    />
  );
}
