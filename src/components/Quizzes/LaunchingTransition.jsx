import DemoTransition from "./DemoTransition";

export default function LaunchingTransition({ onDone }) {
  return (
    <DemoTransition
      icon="rocket"
      title="Launching to your class…"
      detail="Publishing the quiz and notifying students."
      durationMs={1400}
      onDone={onDone}
    />
  );
}
