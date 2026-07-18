import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Accessible custom select matching form controls.
 * @param {{
 *   id?: string,
 *   label?: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   options: Array<{ value: string, label: string }>,
 *   placeholder?: string,
 *   disabled?: boolean,
 *   required?: boolean,
 *   className?: string,
 *   'aria-label'?: string,
 * }} props
 */
export default function Select({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  disabled = false,
  required = false,
  className = "",
  "aria-label": ariaLabel,
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const listId = `${selectId}-listbox`;
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selected = options.find(option => option.value === value);
  const display = selected?.label ?? placeholder;

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function commit(next) {
    onChange(next);
    setOpen(false);
  }

  function onTriggerKeyDown(event) {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      const idx = Math.max(0, options.findIndex(option => option.value === value));
      setActiveIndex(idx);
    }
  }

  function onListKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(i => Math.min(options.length - 1, (i < 0 ? -1 : i) + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(i => Math.max(0, (i < 0 ? options.length : i) - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (activeIndex >= 0 && options[activeIndex]) commit(options[activeIndex].value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const control = (
    <div className={`mt-select ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        id={selectId}
        className="mt-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel || label}
        disabled={disabled}
        onClick={() => !disabled && setOpen(current => !current)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={`mt-select-value ${selected ? "" : "is-placeholder"}`}>{display}</span>
        <ChevronDown className="mt-select-chevron" size={16} aria-hidden="true" />
      </button>
      {open && (
        <ul
          id={listId}
          className="mt-select-list"
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={activeIndex >= 0 ? `${selectId}-opt-${activeIndex}` : undefined}
          onKeyDown={onListKeyDown}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${selectId}-opt-${index}`}
              role="option"
              aria-selected={option.value === value}
              data-active={index === activeIndex}
              className="mt-select-option"
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          value={value || ""}
          required
          onChange={() => {}}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
        />
      )}
    </div>
  );

  if (!label) return control;

  return (
    <label className="mt-field" htmlFor={selectId}>
      <span className="mt-field-label">{label}</span>
      {control}
    </label>
  );
}
