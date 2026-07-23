import { useMemo, useState } from "react";

/**
 * Instructor dropdown from school teachers + template names; supports add-new inline.
 */
export default function InstructorSelect({ value, onChange, teachers = [], extraNames = [], id }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const options = useMemo(() => {
    const names = new Set();
    teachers.forEach(teacher => {
      const name = `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
      if (name) names.add(name);
    });
    extraNames.forEach(name => {
      const trimmed = String(name || "").trim();
      if (trimmed) names.add(trimmed);
    });
    if (value) names.add(String(value).trim());
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [teachers, extraNames, value]);

  if (adding) {
    return (
      <div className="rc-instructor-add">
        <input
          id={id}
          autoFocus
          value={draft}
          placeholder="New instructor name"
          aria-label="New instructor name"
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") {
              event.preventDefault();
              const name = draft.trim();
              if (name) {
                onChange(name);
                setAdding(false);
                setDraft("");
              }
            }
            if (event.key === "Escape") {
              setAdding(false);
              setDraft("");
            }
          }}
        />
        <button
          type="button"
          className="btn"
          title="Save new instructor name"
          onClick={() => {
            const name = draft.trim();
            if (!name) return;
            onChange(name);
            setAdding(false);
            setDraft("");
          }}
        >
          Add
        </button>
        <button
          type="button"
          className="btn"
          title="Cancel adding instructor"
          onClick={() => {
            setAdding(false);
            setDraft("");
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <select
      id={id}
      className="rc-instructor-select"
      value={value || ""}
      title="Choose the instructor for this subject"
      onChange={event => {
        if (event.target.value === "__add__") {
          setAdding(true);
          return;
        }
        onChange(event.target.value);
      }}
    >
      <option value="">Select instructor</option>
      {options.map(name => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
      <option value="__add__">+ Add new instructor…</option>
    </select>
  );
}
