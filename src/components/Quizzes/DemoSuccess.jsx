import { Check } from "lucide-react";
import { DEMO_STUDENT } from "./quizDemoData";

export default function DemoSuccess({ finalGrade, totalPoints, onRestart, onClose }) {
  return (
    <div className="quiz-demo-success">
      <div className="quiz-demo-success-check" aria-hidden="true">
        <Check size={28} />
      </div>
      <h3>Grade saved</h3>
      <p>
        {DEMO_STUDENT.name} now has {finalGrade} out of {totalPoints} points on this quiz. In the live
        version, this would write to their student record.
      </p>
      <div className="quiz-demo-step-actions is-center">
        <button type="button" className="btn" onClick={onRestart}>
          Restart Demo
        </button>
        <button type="button" className="btn primary-gold" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
