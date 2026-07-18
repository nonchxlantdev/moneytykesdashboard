import { useCallback, useState } from "react";

export default function useStepReveal(totalSteps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState(() => new Set([0]));

  const goTo = useCallback(
    step => {
      if (step < 0 || step >= totalSteps) return;
      setCurrentStep(step);
      setVisitedSteps(prev => new Set(prev).add(step));
    },
    [totalSteps]
  );

  const next = useCallback(() => {
    setCurrentStep(current => {
      if (current >= totalSteps - 1) return current;
      const step = current + 1;
      setVisitedSteps(prev => new Set(prev).add(step));
      return step;
    });
  }, [totalSteps]);

  const prev = useCallback(() => {
    setCurrentStep(current => Math.max(0, current - 1));
  }, []);

  return { currentStep, visitedSteps, goTo, next, prev };
}
