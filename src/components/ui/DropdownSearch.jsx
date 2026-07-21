import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import "./dropdown-search.css";

function matchesQuery(item, query) {
  if (!query) return true;
  const haystack = `${item.textValue || item.label || ""} ${item.description || ""}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

/**
 * Searchable dropdown inspired by Untitled UI + react-aria Autocomplete.
 */
export default function DropdownSearch({
  label,
  buttonLabel,
  placeholder = "Select…",
  searchPlaceholder = "Search",
  items = [],
  selectedKey = null,
  onSelectionChange,
  selectionMode = "single",
  selectedKeys,
  onSelectedKeysChange,
  emptyText = "No matches found",
  className = "",
  allowClear = true,
  disabled = false,
  required = false,
  "aria-label": ariaLabel
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedItem = useMemo(
    () => items.find(item => String(item.id) === String(selectedKey)) || null,
    [items, selectedKey]
  );

  const multiKeys = useMemo(() => {
    if (selectionMode !== "multiple") return new Set();
    return selectedKeys instanceof Set ? selectedKeys : new Set(selectedKeys || []);
  }, [selectionMode, selectedKeys]);

  const filtered = useMemo(() => items.filter(item => matchesQuery(item, query)), [items, query]);

  const triggerText = (() => {
    if (selectionMode === "multiple") {
      const count = multiKeys.size;
      if (count === 0) return buttonLabel || placeholder;
      if (count === 1) {
        const only = items.find(item => multiKeys.has(String(item.id)));
        return only?.label || `${count} selected`;
      }
      return `${count} selected`;
    }
    return selectedItem?.label || buttonLabel || placeholder;
  })();

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = event => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };

    const onKeyDown = event => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const toggleOpen = () => {
    if (disabled) return;
    setOpen(prev => {
      const next = !prev;
      if (!next) setQuery("");
      return next;
    });
  };

  const selectSingle = id => {
    onSelectionChange?.(String(id));
    setOpen(false);
    setQuery("");
  };

  const toggleMulti = id => {
    const key = String(id);
    const next = new Set(multiKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectedKeysChange?.(next);
  };

  return (
    <div className={`mt-dd-search ${disabled ? "is-disabled" : ""} ${className}`.trim()} ref={rootRef}>
      {label ? <span className="mt-dd-label">{label}</span> : null}

      <button
        type="button"
        className={`mt-dd-trigger group ${open ? "is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel || label || undefined}
        disabled={disabled}
        onClick={toggleOpen}
      >
        <span
          className={`mt-dd-trigger-text ${
            !selectedItem && selectionMode === "single" ? "is-placeholder" : ""
          }`}
        >
          {selectionMode === "single" && selectedItem?.leading ? (
            <span className="mt-dd-trigger-leading">{selectedItem.leading}</span>
          ) : null}
          {triggerText}
        </span>
        <span className="mt-dd-trigger-actions">
          {allowClear && !disabled && selectionMode === "single" && selectedKey != null && selectedKey !== "" ? (
            <span
              className="mt-dd-clear"
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                onSelectionChange?.(null);
              }}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectionChange?.(null);
                }
              }}
            >
              <X size={14} />
            </span>
          ) : null}
          <ChevronDown size={16} className="mt-dd-chevron" aria-hidden="true" />
        </span>
      </button>

      {open && !disabled ? (
        <div className="mt-dd-popover" role="presentation">
          <div className="mt-dd-search-field">
            <Search size={16} className="mt-dd-search-icon" aria-hidden="true" />
            <input
              ref={searchRef}
              className="mt-dd-search-input"
              type="search"
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={event => setQuery(event.target.value)}
              onClick={event => event.stopPropagation()}
            />
          </div>

          <ul
            id={listId}
            className="mt-dd-menu"
            role="listbox"
            aria-multiselectable={selectionMode === "multiple"}
          >
            {filtered.length === 0 ? (
              <li className="mt-dd-empty" role="presentation">
                {emptyText}
              </li>
            ) : (
              filtered.map(item => {
                const id = String(item.id);
                const selected =
                  selectionMode === "multiple" ? multiKeys.has(id) : String(selectedKey) === id;

                return (
                  <li key={id} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      className={`mt-dd-item ${selected ? "is-selected" : ""}`}
                      onClick={() => {
                        if (selectionMode === "multiple") toggleMulti(id);
                        else selectSingle(id);
                      }}
                    >
                      {selectionMode === "multiple" ? (
                        <span className={`mt-dd-check ${selected ? "is-on" : ""}`} aria-hidden="true" />
                      ) : null}
                      {item.leading ? <span className="mt-dd-item-leading">{item.leading}</span> : null}
                      <span className="mt-dd-item-copy">
                        <span className="mt-dd-item-label">{item.label}</span>
                        {item.description ? (
                          <span className="mt-dd-item-desc">{item.description}</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}

      {required ? (
        <input
          tabIndex={-1}
          aria-hidden="true"
          value={selectionMode === "multiple" ? (multiKeys.size ? "1" : "") : selectedKey || ""}
          required
          onChange={() => {}}
          className="mt-dd-required-mirror"
        />
      ) : null}
    </div>
  );
}
