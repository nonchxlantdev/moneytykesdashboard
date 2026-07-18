function LPField({ id, label, hint, value, onChange, error, rows, small, placeholder }) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="lp-field" data-lp-field={id}>
      <label htmlFor={id}>
        {label}
        <span className="req" aria-hidden="true">
          *
        </span>
      </label>
      {hint ? <span className="lp-hint">{hint}</span> : null}
      <textarea
        id={id}
        className={`lp-textarea ${small ? "sm" : ""} ${error ? "invalid" : ""}`.trim()}
        rows={rows}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      />
      {error ? (
        <span className="lp-error" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function validateLessonPlan(data) {
  const errors = {};
  if (!data.objective.trim()) errors.objective = "Add an objective before publishing.";
  if (!data.materials.trim()) errors.materials = "List materials before publishing.";
  if (!data.activitySteps.trim()) errors.activitySteps = "Add notes before publishing.";
  if (!data.wrapUp.trim()) errors.wrapUp = "Add a wrap-up or assessment before publishing.";
  return errors;
}

export default function LessonPlanFields({ value, onChange, errors = {} }) {
  return (
    <div className="lesson-plan-group">
      <p className="lp-heading">Lesson Plan</p>

      <LPField
        id="lp-objective"
        label="🎯 Objective"
        hint="What should students learn or be able to do by the end?"
        value={value.objective}
        onChange={v => onChange({ objective: v })}
        error={errors.objective}
        rows={2}
        placeholder="e.g. Students will be able to distinguish between a need and a want."
      />

      <LPField
        id="lp-materials"
        label="🧰 Materials Needed"
        value={value.materials}
        onChange={v => onChange({ materials: v })}
        error={errors.materials}
        rows={2}
        small
        placeholder="e.g. Worksheet handout, projector, sticky notes"
      />

      <LPField
        id="lp-activity-steps"
        label="📋 Notes"
        hint="Teacher notes or talking points for this lesson"
        value={value.activitySteps}
        onChange={v => onChange({ activitySteps: v })}
        error={errors.activitySteps}
        rows={4}
        placeholder={"Key talking points, reminders, or classroom notes…"}
      />

      <LPField
        id="lp-wrap-up"
        label="✅ Wrap-up / Assessment"
        hint="How will you check for understanding?"
        value={value.wrapUp}
        onChange={v => onChange({ wrapUp: v })}
        error={errors.wrapUp}
        rows={2}
        small
        placeholder="e.g. Exit ticket with 3 quick questions"
      />
    </div>
  );
}
