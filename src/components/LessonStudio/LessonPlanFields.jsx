import { CircleHelp } from "lucide-react";
import NotesRichEditor, { isBlankRichText } from "./NotesRichEditor";

function LPField({ id, label, hint, value, onChange, error, rows, small, placeholder, required = true }) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="lp-field" data-lp-field={id}>
      <label htmlFor={id} className="lp-label-row">
        <span className="lp-label-text">
          {label}
          {required ? (
            <span className="req" aria-hidden="true">
              *
            </span>
          ) : null}
        </span>
        {hint ? (
          <span className="lp-help" tabIndex={0} aria-label={hint} aria-describedby={hintId}>
            <CircleHelp size={15} aria-hidden="true" />
            <span className="lp-help-tip" id={hintId} role="tooltip">
              {hint}
            </span>
          </span>
        ) : null}
      </label>
      <textarea
        id={id}
        className={`lp-textarea ${small ? "sm" : ""} ${error ? "invalid" : ""}`.trim()}
        rows={rows}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        aria-required={required}
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
  if (!data.objective.trim()) errors.objective = "Add a lesson before publishing.";
  if (!data.materials.trim()) errors.materials = "List material needs before publishing.";
  if (isBlankRichText(data.activitySteps)) errors.activitySteps = "Add notes before publishing.";
  if (!data.wrapUp.trim()) errors.wrapUp = "Add a wrap-up or assessment before publishing.";
  return errors;
}

export default function LessonPlanFields({ value, onChange, errors = {}, isPrimary = true }) {
  const required = false;
  const notesErrorId = errors.activitySteps ? "lp-activity-steps-error" : undefined;
  const notesHintId = "lp-activity-steps-hint";

  return (
    <div className={`lesson-plan-group ${isPrimary ? "is-primary" : ""}`}>
      <p className="lp-heading">
        Lesson plan <span className="field-optional">(optional fields)</span>
      </p>

      <LPField
        id="lp-objective"
        label="Lesson"
        hint="What should students learn or be able to do by the end?"
        value={value.objective}
        onChange={v => onChange({ objective: v })}
        error={errors.objective}
        rows={2}
        required={required}
        placeholder="e.g. Students will be able to distinguish between a need and a want."
      />

      <LPField
        id="lp-materials"
        label="Material Needs"
        hint="What materials or supplies do you need for this lesson?"
        value={value.materials}
        onChange={v => onChange({ materials: v })}
        error={errors.materials}
        rows={2}
        small
        required={required}
        placeholder="e.g. Worksheet handout, projector, sticky notes"
      />

      <div className="lp-field" data-lp-field="lp-activity-steps">
        <div className="lp-label-row">
          <span className="lp-label-text">
            Notes
            {required ? (
              <span className="req" aria-hidden="true">
                *
              </span>
            ) : null}
          </span>
          <span className="lp-help" tabIndex={0} aria-label="Write the actual lesson information teachers will reveal on this card." aria-describedby={notesHintId}>
            <CircleHelp size={15} aria-hidden="true" />
            <span className="lp-help-tip" id={notesHintId} role="tooltip">
              Write the actual lesson information — key facts, steps, and talking points. Use the toolbar to format text.
            </span>
          </span>
        </div>

        <NotesRichEditor
          id="lp-activity-steps"
          value={value.activitySteps}
          onChange={v => onChange({ activitySteps: v })}
          error={errors.activitySteps}
          required={required}
          describedBy={[notesHintId, notesErrorId].filter(Boolean).join(" ") || undefined}
          placeholder="Write the lesson information students will learn…"
        />

        {errors.activitySteps ? (
          <span className="lp-error" id={notesErrorId}>
            {errors.activitySteps}
          </span>
        ) : null}
      </div>

      <LPField
        id="lp-wrap-up"
        label="Wrap-up"
        hint="How will you check for understanding at the end?"
        value={value.wrapUp}
        onChange={v => onChange({ wrapUp: v })}
        error={errors.wrapUp}
        rows={2}
        small
        required={required}
        placeholder="e.g. Exit ticket with 3 quick questions"
      />
    </div>
  );
}
