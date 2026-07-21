import DemoTransition from "./DemoTransition";

export default function GradingTransition({ onDone }) {
  return (
    <DemoTransition
      icon="sparkles"
      title="Auto-grading multiple choice…"
      detail="Checking selected answers against the answer key."
      durationMs={1400}
      onDone={onDone}
    />
  );
}
