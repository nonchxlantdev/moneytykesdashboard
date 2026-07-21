import { DEMO_STEPS } from "./quizDemoData";

export default function DemoProgressBar({ current }) {
  const activeIndex =
    current === "launching"
      ? 2
      : current === "grading" || current === "success"
        ? 4
        : Number(current) || 1;

  return (
    <div className="demo-progress-track" aria-label="Demo progress">
      {DEMO_STEPS.map((label, index) => {
        const n = index + 1;
        const status = n < activeIndex ? "done" : n === activeIndex ? "active" : "";
        return (
          <div key={label} className="demo-progress-unit">
            <div className={`demo-progress-step ${status}`}>
              <span>{n}</span>
              {label}
            </div>
            {index < DEMO_STEPS.length - 1 ? <div className="demo-progress-line" aria-hidden="true" /> : null}
          </div>
        );
      })}
    </div>
  );
}
