import { Fragment } from "react";

export const STEPS = ["Student", "School", "Guardian", "Review"];

export default function WizardProgress({ current }) {
  return (
    <div className="wizard-progress" aria-label={`Step ${current} of ${STEPS.length}`}>
      {STEPS.map((label, index) => {
        const stepNum = index + 1;
        const status = stepNum < current ? "done" : stepNum === current ? "active" : "";
        return (
          <Fragment key={label}>
            <div className={`w-step ${status}`}>
              <div className="w-dot" aria-hidden="true">
                {status === "done" ? "✓" : stepNum}
              </div>
              <span>{label}</span>
            </div>
            {index < STEPS.length - 1 ? <div className="w-line" aria-hidden="true" /> : null}
          </Fragment>
        );
      })}
    </div>
  );
}
