export default function StepNav({ step, totalSteps, onBack, onNext, onCancel, nextDisabled = false }) {
  const isFirst = step === 1;
  const isLast = step === totalSteps;

  return (
    <div className="step-nav">
      <button className="btn" type="button" onClick={isFirst ? onCancel : onBack}>
        {isFirst ? "Cancel" : "Back"}
      </button>
      <div className="step-nav-right">
        <span className="step-count">
          Step {step} of {totalSteps}
        </span>
        <button className="btn primary" type="button" onClick={onNext} disabled={nextDisabled}>
          {isLast ? "Create Student" : "Continue"}
        </button>
      </div>
    </div>
  );
}
