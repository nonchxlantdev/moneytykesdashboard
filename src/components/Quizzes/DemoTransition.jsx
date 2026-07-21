import { useEffect, useRef, useState } from "react";
import { Rocket, Sparkles } from "lucide-react";

export default function DemoTransition({
  title,
  detail,
  icon = "rocket",
  durationMs = 1400,
  onDone
}) {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);
  const Icon = icon === "sparkles" ? Sparkles : Rocket;

  useEffect(() => {
    doneRef.current = false;
    const start = performance.now();
    let frame = 0;
    let cancelled = false;

    const tick = now => {
      if (cancelled) return;
      const ratio = Math.min(1, (now - start) / durationMs);
      setProgress(Math.round(ratio * 100));
      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [durationMs, onDone]);

  return (
    <div className="quiz-demo-transition" role="status" aria-live="polite">
      <div className="quiz-demo-transition-icon" aria-hidden="true">
        <Icon size={28} />
      </div>
      <h3>{title}</h3>
      <p>{detail}</p>
      <div className="quiz-demo-transition-bar" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
