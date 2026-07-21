import Select from "../ui/Select";
import { DEMO_STUDENT } from "./quizDemoData";

const CLASS_OPTIONS = [
  { value: "form-2", label: "Form 2 · Money Basics" },
  { value: "form-3", label: "Form 3 · Smart Spending" },
  { value: "std-5", label: "Standard 5 · Saving Goals" }
];

const TIME_OPTIONS = [
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "20", label: "20 minutes" },
  { value: "30", label: "30 minutes" }
];

export default function StepLaunch({ launch, summary, onChange, onBack, onLaunch }) {
  return (
    <div className="quiz-demo-step">
      <header className="quiz-demo-step-head">
        <h3>Launch to your class</h3>
        <p>Choose who gets it, when it is due, and how long students have to finish.</p>
      </header>

      <div className="quiz-demo-tip" role="note">
        Tip: Because this quiz mixes multiple choice and short answer, students will not see a final grade the moment they submit. Multiple choice grades instantly. Short answers wait for you.
      </div>

      <div className="quiz-demo-launch-grid">
        <div className="quiz-demo-launch-fields">
          <Select
            label="Class"
            value={launch.classId}
            onChange={classId => onChange({ classId })}
            options={CLASS_OPTIONS}
            searchPlaceholder="Search classes"
            allowClear={false}
          />
          <label className="quiz-demo-field">
            <span>Due date</span>
            <input
              type="date"
              value={launch.dueDate}
              onChange={event => onChange({ dueDate: event.target.value })}
            />
          </label>
          <Select
            label="Time limit"
            value={String(launch.timeLimitMinutes)}
            onChange={value => onChange({ timeLimitMinutes: Number(value) })}
            options={TIME_OPTIONS}
            searchPlaceholder="Search"
            allowClear={false}
          />
          <label className="quiz-demo-check">
            <input
              type="checkbox"
              checked={launch.allowRetakes}
              onChange={event => onChange({ allowRetakes: event.target.checked })}
            />
            <span>Allow retakes</span>
          </label>
        </div>

        <aside className="quiz-demo-preview-card">
          <p className="quiz-demo-preview-kicker">Students will see</p>
          <h4>Needs, Savings & Earning</h4>
          <ul>
            <li>{summary.count} questions · {summary.points} points</li>
            <li>{launch.timeLimitMinutes} minute time limit</li>
            <li>Due {launch.dueDate || "soon"}</li>
            <li>{launch.allowRetakes ? "Retakes allowed" : "One attempt only"}</li>
            <li>Assigned to {CLASS_OPTIONS.find(c => c.value === launch.classId)?.label || "class"}</li>
          </ul>
          <p className="quiz-demo-preview-note">
            Example student view for {DEMO_STUDENT.name}.
          </p>
        </aside>
      </div>

      <div className="quiz-demo-step-actions">
        <button type="button" className="btn" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn primary-gold" onClick={onLaunch}>
          Launch Quiz
        </button>
      </div>
    </div>
  );
}
