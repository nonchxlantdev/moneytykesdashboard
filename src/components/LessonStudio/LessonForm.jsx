import { Check } from "lucide-react";
import FavoriteStarButton from "../LessonsLibrary/FavoriteStarButton";
import ContentSourceField from "./ContentSourceField";
import LessonPlanFields from "./LessonPlanFields";
import TypePicker from "./TypePicker";

export default function LessonForm({
  data,
  update,
  selectType,
  setSourceValue,
  subjectOptions,
  urlError,
  fileError,
  isStoringFile,
  isEditing,
  planErrors,
  onSaveDraft,
  onPublish
}) {
  return (
    <div className="lesson-form">
      <section className="studio-section">
        <h2>Content type</h2>
        <TypePicker selected={data.type} onSelect={selectType} />
      </section>

      <section className="studio-section">
        <h2>{isEditing ? "Edit lesson details" : "Lesson details"}</h2>

        {isEditing ? (
          <div className="studio-edit-controls">
            <div className="studio-field">
              <label htmlFor="studio-status">Lesson Status</label>
              <select
                id="studio-status"
                value={data.status}
                onChange={event => update({ status: event.target.value })}
              >
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="draft">Inactive</option>
              </select>
            </div>
            <FavoriteStarButton
              active={data.isFavorite}
              onToggle={() => update({ isFavorite: !data.isFavorite })}
              size={17}
              label
            />
          </div>
        ) : null}

        <div className="studio-field">
          <label htmlFor="studio-title">Lesson Title</label>
          <input
            id="studio-title"
            type="text"
            value={data.title}
            onChange={event => update({ title: event.target.value })}
            placeholder="e.g. Introduction to Saving"
            required
          />
        </div>

        <div className="studio-field">
          <label htmlFor="studio-subject">Subject</label>
          <select
            id="studio-subject"
            value={data.subject}
            onChange={event => update({ subject: event.target.value })}
          >
            {subjectOptions.map(subject => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <ContentSourceField
          type={data.type}
          value={data.sourceValue}
          fileName={data.fileName}
          error={data.type === "video" ? urlError : fileError}
          isStoring={isStoringFile}
          onChange={setSourceValue}
        />

        <LessonPlanFields
          value={{
            objective: data.objective,
            materials: data.materials,
            activitySteps: data.activitySteps,
            wrapUp: data.wrapUp
          }}
          onChange={update}
          errors={planErrors}
        />

        <div className="studio-field">
          <label htmlFor="studio-tags">
            Tags <span className="field-optional">(optional, comma-separated)</span>
          </label>
          <input
            id="studio-tags"
            type="text"
            value={data.tags}
            onChange={event => update({ tags: event.target.value })}
            placeholder="e.g. saving, beginner"
          />
        </div>
      </section>

      <div className="studio-actions">
        {isEditing ? (
          <button
            className="btn primary-gold"
            type="button"
            onClick={onPublish}
            disabled={isStoringFile}
          >
            <Check size={15} />
            Save Changes
          </button>
        ) : (
          <>
            <button className="btn" type="button" onClick={onSaveDraft} disabled={isStoringFile}>
              Save as Draft
            </button>
            <button
              className="btn primary-gold"
              type="button"
              onClick={onPublish}
              disabled={isStoringFile}
            >
              <Check size={15} />
              Publish Lesson
            </button>
          </>
        )}
      </div>
    </div>
  );
}
