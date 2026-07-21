import DropdownSearch from "./DropdownSearch";

/**
 * Form select API backed by the shared searchable DropdownSearch.
 */
export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  searchPlaceholder = "Search",
  disabled = false,
  required = false,
  className = "",
  allowClear,
  "aria-label": ariaLabel
}) {
  const items = options.map(option => ({
    id: String(option.value),
    label: option.label,
    textValue: option.label,
    description: option.description,
    leading: option.leading
  }));

  return (
    <DropdownSearch
      label={label}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      items={items}
      selectedKey={value === "" || value == null ? null : String(value)}
      onSelectionChange={key => onChange?.(key ?? "")}
      disabled={disabled}
      required={required}
      allowClear={allowClear ?? !required}
      className={className}
      aria-label={ariaLabel}
      emptyText="No matches found"
    />
  );
}
