import DropdownSearch from "../ui/DropdownSearch";

export default function ClassSelector({
  classes = [],
  value,
  onChange,
  label = "Class",
  placeholder = "Select class"
}) {
  const items = classes.map(item => {
    const id = typeof item === "string" ? item : item.id;
    const name = typeof item === "string" ? item : item.name || item.label;
    return { id: String(id), label: name, textValue: name };
  });

  return (
    <div className={`class-selector ${!value ? "is-placeholder" : ""}`} data-tour="students-class-filter">
      <DropdownSearch
        label={label}
        placeholder={placeholder}
        searchPlaceholder="Search classes"
        items={items}
        selectedKey={value ? String(value) : null}
        onSelectionChange={key => onChange?.(key ?? "")}
        allowClear
        className="class-selector-dd"
        aria-label={label}
      />
    </div>
  );
}
