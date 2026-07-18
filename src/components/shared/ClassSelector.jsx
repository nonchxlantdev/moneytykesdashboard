export default function ClassSelector({
  classes = [],
  value,
  onChange,
  label = "Class",
  placeholder = "Select class"
}) {
  return (
    <label className={`class-selector ${!value ? "is-placeholder" : ""}`}>
      <span className="class-selector-label">{label}</span>
      <span className="class-selector-field">
        <select
          value={value || ""}
          onChange={event => onChange(event.target.value)}
          aria-label={label}
        >
          <option value="">{placeholder}</option>
          {classes.map(item => {
            const id = typeof item === "string" ? item : item.id;
            const name = typeof item === "string" ? item : item.name || item.label;
            return (
              <option key={id} value={id}>
                {name}
              </option>
            );
          })}
        </select>
      </span>
    </label>
  );
}
