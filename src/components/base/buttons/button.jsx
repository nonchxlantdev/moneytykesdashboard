import { isValidElement } from "react";
import { LoaderCircle } from "lucide-react";
import "./button.css";

const SIZES = new Set(["xs", "sm", "md", "lg", "xl"]);
const COLORS = new Set([
  "primary",
  "secondary",
  "tertiary",
  "link-gray",
  "link-color",
  "primary-destructive",
  "secondary-destructive",
  "tertiary-destructive",
  "link-destructive"
]);

function renderIcon(icon, className) {
  if (!icon) return null;
  if (typeof icon === "function") {
    const Icon = icon;
    return <Icon className={className} data-icon aria-hidden="true" />;
  }
  if (isValidElement(icon)) {
    return (
      <span className={className} aria-hidden="true">
        {icon}
      </span>
    );
  }
  return null;
}

/**
 * Untitled UI–compatible button API for MoneyTykes.
 *
 * @example
 * <Button color="primary-destructive" size="md">Delete project</Button>
 * <Button color="secondary" size="md">Stage for publish</Button>
 * <Button color="primary" size="md" iconLeading={<Check data-icon />}>Publish now</Button>
 */
export default function Button({
  color = "primary",
  size = "sm",
  iconLeading,
  iconTrailing,
  isDisabled = false,
  isLoading = false,
  showTextWhileLoading = false,
  className = "",
  type = "button",
  children,
  disabled,
  ...rest
}) {
  const resolvedColor = COLORS.has(color) ? color : "primary";
  const resolvedSize = SIZES.has(size) ? size : "sm";
  const off = Boolean(isDisabled || disabled || isLoading);
  const showLabel = Boolean(children) && (!isLoading || showTextWhileLoading);
  const iconOnly = !showLabel && Boolean(iconLeading || isLoading);

  return (
    <button
      type={type}
      className={`uu-btn uu-btn--${resolvedColor} uu-btn--${resolvedSize} ${isLoading ? "is-loading" : ""} ${iconOnly ? "uu-btn--icon-only" : ""} ${className}`.trim()}
      disabled={off}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <LoaderCircle className="uu-btn__spinner" data-icon aria-hidden="true" />
      ) : (
        renderIcon(iconLeading, "uu-btn__icon")
      )}
      {showLabel ? <span className="uu-btn__label">{children}</span> : null}
      {!isLoading ? renderIcon(iconTrailing, "uu-btn__icon") : null}
    </button>
  );
}

export { Button };
