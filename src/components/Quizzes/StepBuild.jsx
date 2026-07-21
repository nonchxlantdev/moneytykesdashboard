import { Plus, Trash2 } from "lucide-react";
import { optionLabel } from "./quizDemoData";

function QuestionEditor({
  question,
  index,
  canRemove,
  onUpdateQuestion,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onSetQuestionType,
  onRemoveQuestion
}) {
  const isMc = question.type === "multiple_choice";
  const options = question.options || [];

  return (
    <article className="quiz-demo-q-card is-editable">
      <div className="quiz-demo-q-meta">
        <span className="quiz-demo-q-num">Q{index + 1}</span>
        <label className="quiz-demo-type-select">
          <span className="sr-only">Question type</span>
          <select
            value={question.type}
            onChange={event => onSetQuestionType(question.id, event.target.value)}
          >
            <option value="multiple_choice">Multiple choice</option>
            <option value="short_answer">Short answer</option>
          </select>
        </label>
        <label className="quiz-demo-pts-edit">
          <span className="sr-only">Points</span>
          <input
            type="number"
            min={1}
            max={50}
            value={question.points}
            onChange={event =>
              onUpdateQuestion(question.id, { points: Math.max(1, Number(event.target.value) || 1) })
            }
          />
          <span>pts</span>
        </label>
        {canRemove ? (
          <button
            type="button"
            className="quiz-demo-q-remove"
            aria-label={`Remove question ${index + 1}`}
            onClick={() => onRemoveQuestion(question.id)}
          >
            <Trash2 size={14} />
          </button>
        ) : null}
      </div>

      <label className="quiz-demo-prompt-field">
        <span className="sr-only">Question prompt</span>
        <textarea
          rows={2}
          value={question.prompt}
          placeholder="Type your question…"
          onChange={event => onUpdateQuestion(question.id, { prompt: event.target.value })}
        />
      </label>

      {isMc ? (
        <div className="quiz-demo-mc-editor">
          <p className="quiz-demo-mc-help">Type each answer. Select the circle next to the correct one.</p>
          <ul className="quiz-demo-options is-editable" role="radiogroup" aria-label={`Correct answer for question ${index + 1}`}>
            {options.map((option, optionIndex) => {
              const letter = optionLabel(optionIndex);
              return (
                <li key={option.id} className={option.correct ? "is-correct" : ""}>
                  <label className="quiz-demo-option-correct">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={Boolean(option.correct)}
                      onChange={() => onUpdateOption(question.id, option.id, { correct: true })}
                      aria-label={`Mark ${letter} as correct`}
                    />
                    <span className="quiz-demo-option-letter">{letter}.</span>
                  </label>
                  <input
                    type="text"
                    value={option.text}
                    placeholder={`Option ${letter}`}
                    onChange={event =>
                      onUpdateOption(question.id, option.id, { text: event.target.value })
                    }
                  />
                  {options.length > 2 ? (
                    <button
                      type="button"
                      className="quiz-demo-option-remove"
                      aria-label={`Remove option ${letter}`}
                      onClick={() => onRemoveOption(question.id, option.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {options.length < 8 ? (
            <button type="button" className="quiz-demo-add-option" onClick={() => onAddOption(question.id)}>
              <Plus size={14} />
              Add option {optionLabel(options.length)}.
            </button>
          ) : null}
        </div>
      ) : (
        <div className="quiz-demo-sa-box">
          <p className="quiz-demo-sa-preview">Short answer format: students will type a free response in a text box.</p>
        </div>
      )}
    </article>
  );
}

export default function StepBuild({
  questions,
  summary,
  onAddQuestion,
  onUpdateQuestion,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onSetQuestionType,
  onRemoveQuestion,
  onContinue
}) {
  return (
    <div className="quiz-demo-step">
      <header className="quiz-demo-step-head">
        <h3>Build your quiz</h3>
        <p>Choose a question type, then fill in the prompt and answers. Point totals update as you go.</p>
      </header>

      <div className="quiz-demo-tip" role="note">
        Tip: Pick multiple choice for labeled A. B. C. D. options, or short answer for a written response. Multiple choice grades itself later. Short answers wait for you.
      </div>

      <div className="quiz-demo-stats">
        <span>
          <strong>{summary.count}</strong> questions
        </span>
        <span>
          <strong>{summary.mc}</strong> multiple choice
        </span>
        <span>
          <strong>{summary.sa}</strong> short answer
        </span>
        <span>
          <strong>{summary.points}</strong> pts total
        </span>
      </div>

      <div className="quiz-demo-q-list">
        {questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={index}
            canRemove={questions.length > 1}
            onUpdateQuestion={onUpdateQuestion}
            onUpdateOption={onUpdateOption}
            onAddOption={onAddOption}
            onRemoveOption={onRemoveOption}
            onSetQuestionType={onSetQuestionType}
            onRemoveQuestion={onRemoveQuestion}
          />
        ))}
      </div>

      <div className="quiz-demo-step-actions">
        <button type="button" className="btn" onClick={onAddQuestion}>
          <Plus size={16} />
          Add Another Question
        </button>
        <button type="button" className="btn primary-gold" onClick={onContinue}>
          Continue to Launch
        </button>
      </div>
    </div>
  );
}
