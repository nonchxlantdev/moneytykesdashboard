import { Minus, Plus } from "lucide-react";

export default function PointStepper({ value, onChange, step = 5 }) {
  const current = Number(value) || 0;

  return (
    <div className="rw-point-block">
      <div className="rw-point-stepper">
        <button
          type="button"
          className="rw-stepper-btn"
          onClick={() => onChange(Math.max(0, current - step))}
          aria-label="Decrease points"
        >
          <Minus size={16} />
        </button>
        <span className="rw-stepper-val" aria-live="polite">
          {current}
        </span>
        <button
          type="button"
          className="rw-stepper-btn"
          onClick={() => onChange(current + step)}
          aria-label="Increase points"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="rw-quick-picks">
        {[5, 10, 25, 50].map(chip => (
          <button
            key={chip}
            type="button"
            className={`rw-qp-chip ${current === chip ? "active" : ""}`}
            onClick={() => onChange(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
