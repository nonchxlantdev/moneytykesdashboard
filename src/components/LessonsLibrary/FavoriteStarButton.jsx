import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import "./favorite-star.css";

/**
 * Favorite star with yellow fill, shake-on-select, and split-on-deselect.
 */
export default function FavoriteStarButton({
  active = false,
  onToggle,
  className = "",
  size = 14,
  stopPropagation = false,
  label = false
}) {
  const [effect, setEffect] = useState(null); // "shake" | "break" | null
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(id => window.clearTimeout(id));
    };
  }, []);

  function handleClick(event) {
    if (stopPropagation) event.stopPropagation();
    if (effect === "break") return;

    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];

    if (active) {
      setEffect("break");
      const breakTimer = window.setTimeout(() => {
        onToggle?.();
        setEffect(null);
      }, 480);
      timersRef.current.push(breakTimer);
      return;
    }

    onToggle?.();
    setEffect("shake");
    const shakeTimer = window.setTimeout(() => setEffect(null), 520);
    timersRef.current.push(shakeTimer);
  }

  const filled = active && effect !== "break";
  const showBreak = effect === "break";
  const starSize = size;

  return (
    <button
      type="button"
      className={`favorite-star-btn ${label ? "with-label" : "icon-btn"} ${filled ? "active" : ""} ${effect || ""} ${className}`.trim()}
      aria-label={active ? "Remove favorite" : "Mark as favorite"}
      aria-pressed={active}
      onClick={handleClick}
    >
      {showBreak ? (
        <span className="star-break" aria-hidden="true">
          <span className="star-half left">
            <Star size={starSize} fill="#FFC928" color="#E5A800" strokeWidth={1.75} />
          </span>
          <span className="star-half right">
            <Star size={starSize} fill="#FFC928" color="#E5A800" strokeWidth={1.75} />
          </span>
        </span>
      ) : (
        <Star
          size={starSize}
          fill={filled ? "#FFC928" : "none"}
          color={filled ? "#E5A800" : "currentColor"}
          strokeWidth={1.75}
          className={effect === "shake" ? "star-shake-icon" : undefined}
        />
      )}
      {label ? <span>{active ? "Favorited" : "Mark as Favorite"}</span> : null}
    </button>
  );
}
