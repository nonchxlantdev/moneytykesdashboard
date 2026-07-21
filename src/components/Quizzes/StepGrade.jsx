import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { DEMO_STUDENT } from "./quizDemoData";

function useCountUp(target, durationMs = 700) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = now => {
      const ratio = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * ratio));
      if (ratio < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

export default function StepGrade({
  mcScore,
  mcBreakdown,
  saQuestion,
  saAnswer,
  saPoints,
  maxSaPoints,
  saFeedback,
  saSaved,
  finalGrade,
  totalPoints,
  onSaPointsChange,
  onSaFeedbackChange,
  onSaveSa,
  onSaveFinal
}) {
  const animatedMc = useCountUp(mcScore);

  return (
    <div className="quiz-demo-step quiz-demo-grade">
      <header className="quiz-demo-step-head">
        <h3>Grade {DEMO_STUDENT.name}</h3>
        <p>Multiple choice is ready. Review the short answer, award points, then save the final grade.</p>
      </header>

      <div className="quiz-demo-grade-grid">
        <section className="quiz-demo-grade-card">
          <h4>Auto-graded multiple choice</h4>
          <p className="quiz-demo-score-count">
            <strong>{animatedMc}</strong>
            <span> / {mcBreakdown.reduce((sum, row) => sum + row.points, 0)} pts</span>
          </p>
          <ul className="quiz-demo-mc-breakdown">
            {mcBreakdown.map(row => (
              <li key={row.id} className={row.correct ? "is-correct" : "is-wrong"}>
                <strong>{row.correct ? "Correct" : "Incorrect"}</strong>
                <span>{row.prompt}</span>
                <em>
                  {row.correct
                    ? `+${row.points} pts`
                    : `Selected: ${row.selectedLabel}`}
                </em>
              </li>
            ))}
          </ul>
        </section>

        <section className="quiz-demo-grade-card">
          <h4>Short answer grading</h4>
          <p className="quiz-demo-sa-prompt">{saQuestion?.prompt}</p>
          <blockquote className="quiz-demo-sa-answer">
            {saAnswer?.trim() || "No answer submitted."}
          </blockquote>

          <div className="quiz-demo-sa-stepper">
            <span>Points awarded</span>
            <div className="quiz-demo-stepper">
              <button
                type="button"
                aria-label="Decrease points"
                onClick={() => onSaPointsChange(Math.max(0, saPoints - 1))}
              >
                <Minus size={16} />
              </button>
              <strong aria-live="polite">
                {saPoints}/{maxSaPoints}
              </strong>
              <button
                type="button"
                aria-label="Increase points"
                onClick={() => onSaPointsChange(Math.min(maxSaPoints, saPoints + 1))}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <label className="quiz-demo-field">
            <span>Feedback note</span>
            <textarea
              rows={3}
              value={saFeedback}
              placeholder="Optional note for the student"
              onChange={event => onSaFeedbackChange(event.target.value)}
            />
          </label>

          <button type="button" className="btn" onClick={onSaveSa}>
            {saSaved ? "Short answer grade saved" : "Save Short Answer Grade"}
          </button>
        </section>
      </div>

      <div className="quiz-demo-final-bar">
        <div>
          <span>Final grade</span>
          <strong>
            {finalGrade} / {totalPoints} pts
          </strong>
        </div>
        <button type="button" className="btn primary-gold" onClick={onSaveFinal}>
          Save Grade to Student Record
        </button>
      </div>
    </div>
  );
}
