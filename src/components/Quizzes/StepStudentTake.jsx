import { useEffect, useMemo, useState } from "react";
import { DEMO_STUDENT, optionLabel } from "./quizDemoData";

export default function StepStudentTake({
  questions,
  answers,
  onAnswer,
  timeLimitMinutes,
  onSubmit
}) {
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.max(30, timeLimitMinutes * 60));

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const progress = Math.round(((index + 1) / questions.length) * 100);

  const clock = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }, [secondsLeft]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft(current => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!question) return null;

  const canAdvance =
    question.type === "multiple_choice"
      ? Boolean(answers[question.id])
      : String(answers[question.id] || "").trim().length > 0;

  return (
    <div className="quiz-demo-step quiz-demo-take">
      <header className="quiz-demo-take-bar">
        <div>
          <p className="quiz-demo-preview-kicker">Student view</p>
          <strong>{DEMO_STUDENT.name}</strong>
          <span>{DEMO_STUDENT.classLabel}</span>
        </div>
        <div className="quiz-demo-timer" aria-live="polite">
          <span>Time left</span>
          <strong className={secondsLeft <= 30 ? "is-low" : ""}>{clock}</strong>
        </div>
      </header>

      <div className="quiz-demo-take-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="quiz-demo-take-count">
        Question {index + 1} of {questions.length}
      </p>

      <article className="quiz-demo-take-card">
        <div className="quiz-demo-q-meta">
          <span className={`quiz-demo-q-type is-${question.type}`}>
            {question.type === "multiple_choice" ? "Multiple choice" : "Short answer"}
          </span>
          <span className="quiz-demo-q-pts">{question.points} pts</span>
        </div>
        <h3>{question.prompt}</h3>

        {question.type === "multiple_choice" ? (
          <div className="quiz-demo-choice-list" role="radiogroup" aria-label={question.prompt}>
            {(question.options || []).map((option, optionIndex) => {
              const selected = answers[question.id] === option.id;
              const letter = optionLabel(optionIndex);
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`quiz-demo-choice ${selected ? "is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => onAnswer(question.id, option.id)}
                >
                  <span className="quiz-demo-choice-letter">{letter}.</span>
                  <span>{option.text || `Option ${letter}`}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <textarea
            className="quiz-demo-sa-input"
            rows={5}
            value={answers[question.id] || ""}
            placeholder={question.placeholder || "Write your answer here…"}
            onChange={event => onAnswer(question.id, event.target.value)}
          />
        )}
      </article>

      <div className="quiz-demo-step-actions">
        <button
          type="button"
          className="btn"
          disabled={index === 0}
          onClick={() => setIndex(current => Math.max(0, current - 1))}
        >
          Back
        </button>
        {isLast ? (
          <button type="button" className="btn primary-gold" disabled={!canAdvance} onClick={onSubmit}>
            Submit Quiz
          </button>
        ) : (
          <button
            type="button"
            className="btn primary-gold"
            disabled={!canAdvance}
            onClick={() => setIndex(current => Math.min(questions.length - 1, current + 1))}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
