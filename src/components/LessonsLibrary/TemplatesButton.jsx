import { useEffect, useRef, useState } from "react";
import { LayoutGrid } from "lucide-react";

/** Placeholder — templates library is a future prompt. */
export default function TemplatesButton() {
  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return (
    <div className="templates-btn-wrap">
      <button
        type="button"
        className="btn ghost templates-btn"
        onClick={() => {
          setShowToast(true);
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => setShowToast(false), 1600);
        }}
      >
        <LayoutGrid size={15} strokeWidth={2} />
        Browse Templates
      </button>
      {showToast ? <span className="soon-toast show">Coming soon!</span> : null}
    </div>
  );
}
