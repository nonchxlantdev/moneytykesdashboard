import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

/**
 * Searchable student dropdown for award flows.
 * @param {{ students: Array, value: string|number, onChange: (id: string) => void, placeholder?: string, required?: boolean }} props
 */
export default function StudentSelector({ students, value, onChange, placeholder = "Search students...", required = false }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = students.find(student => String(student.id) === String(value));

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students;
    return students.filter(student =>
      `${student.first} ${student.last} ${student.email || ""}`.toLowerCase().includes(term)
    );
  }, [query, students]);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function selectStudent(studentId) {
    onChange(String(studentId));
    setQuery("");
    setOpen(false);
  }

  function clearSelection(event) {
    event.stopPropagation();
    onChange("");
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="student-selector" ref={rootRef}>
      <div className="student-selector-input">
        <Search size={16} />
        <input
          type="text"
          value={open ? query : (selected ? `${selected.first} ${selected.last}` : query)}
          placeholder={placeholder}
          onChange={event => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          required={required && !value}
        />
        {value && (
          <button type="button" className="student-selector-clear" onClick={clearSelection} aria-label="Clear student">
            <X size={14} />
          </button>
        )}
      </div>
      {selected && !open && (
        <p className="student-selector-selected">Selected: <strong>{selected.first} {selected.last}</strong></p>
      )}
      {open && (
        <ul className="student-selector-list" role="listbox">
          {filtered.length ? filtered.map(student => (
            <li key={student.id}>
              <button
                type="button"
                className={String(student.id) === String(value) ? "selected" : ""}
                onMouseDown={event => event.preventDefault()}
                onClick={() => selectStudent(student.id)}
              >
                <span className="student-selector-avatar">{student.first?.[0]}{student.last?.[0]}</span>
                <span>
                  <strong>{student.first} {student.last}</strong>
                  <small>{student.classLabel || "Student"}</small>
                </span>
              </button>
            </li>
          )) : (
            <li className="student-selector-empty">No students found</li>
          )}
        </ul>
      )}
    </div>
  );
}
