import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import "./dropdown.css";

const DropdownContext = createContext(null);
const MenuContext = createContext(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("Dropdown components must be used inside Dropdown.Root");
  return ctx;
}

function Root({ children, className = "" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen(current => !current),
      close: () => setOpen(false),
      menuId
    }),
    [open, menuId]
  );

  const nodes = Children.toArray(children);
  const popover = nodes.find(child => isValidElement(child) && child.type === Popover);
  const trigger = nodes.find(child => child !== popover);

  const triggerNode =
    isValidElement(trigger) &&
    cloneElement(trigger, {
      "aria-expanded": open,
      "aria-haspopup": "menu",
      "aria-controls": open ? menuId : undefined,
      onClick: event => {
        trigger.props.onClick?.(event);
        if (!event.defaultPrevented) value.toggle();
      }
    });

  return (
    <DropdownContext.Provider value={value}>
      <div ref={rootRef} className={`uu-dropdown ${open ? "is-open" : ""} ${className}`.trim()} data-open={open || undefined}>
        {triggerNode}
        {open ? popover : null}
      </div>
    </DropdownContext.Provider>
  );
}

function Popover({ children, className = "", placement = "bottom start" }) {
  return (
    <div className={`uu-dropdown-popover placement-${placement.replace(/\s+/g, "-")} ${className}`.trim()} role="presentation">
      {children}
    </div>
  );
}

function Menu({ children, onAction, className = "" }) {
  const { menuId, close } = useDropdown();
  const menuValue = useMemo(
    () => ({
      onSelect: key => {
        onAction?.(key);
        close();
      }
    }),
    [onAction, close]
  );

  return (
    <MenuContext.Provider value={menuValue}>
      <div id={menuId} role="menu" className={`uu-dropdown-menu ${className}`.trim()} tabIndex={-1}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

function Section({ children, className = "" }) {
  return (
    <div role="group" className={`uu-dropdown-section ${className}`.trim()}>
      {children}
    </div>
  );
}

function SectionHeader({ children }) {
  return <div className="uu-dropdown-section-header">{children}</div>;
}

function Separator() {
  return <div role="separator" className="uu-dropdown-separator" />;
}

function Item({
  id,
  children,
  addon,
  icon: Icon,
  isDisabled = false,
  className = "",
  onAction
}) {
  const menu = useContext(MenuContext);
  const key = id ?? (typeof children === "string" ? children : undefined);

  return (
    <button
      type="button"
      role="menuitem"
      className={`uu-dropdown-item ${isDisabled ? "is-disabled" : ""} ${className}`.trim()}
      disabled={isDisabled}
      onClick={() => {
        if (isDisabled) return;
        onAction?.(key);
        menu?.onSelect?.(key);
      }}
    >
      {Icon ? (
        typeof Icon === "function" ? (
          <Icon className="uu-dropdown-item-icon" data-icon aria-hidden="true" />
        ) : (
          <span className="uu-dropdown-item-icon" aria-hidden="true">
            {Icon}
          </span>
        )
      ) : null}
      <span className="uu-dropdown-item-label">{children}</span>
      {addon ? <span className="uu-dropdown-item-addon">{addon}</span> : null}
    </button>
  );
}

export const Dropdown = {
  Root,
  Popover,
  Menu,
  Section,
  SectionHeader,
  Separator,
  Item
};

export default Dropdown;
