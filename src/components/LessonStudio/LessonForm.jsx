import { Check } from "lucide-react";
import FavoriteStarButton from "../LessonsLibrary/FavoriteStarButton";
import Select from "../ui/Select";
import ContentSourceField from "./ContentSourceField";
import LessonPlanFields from "./LessonPlanFields";
import TypePicker from "./TypePicker";

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Inactive" }
];

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
              <Select
                label="Lesson Status"
                value={data.status}
                onChange={status => update({ status })}
                options={STATUS_OPTIONS}
                searchPlaceholder="Search status"
                allowClear={false}
              />
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
          <Select
            label="Subject"
            value={data.subject}
            onChange={subject => update({ subject })}
            options={subjectOptions.map(subject => ({ value: subject, label: subject }))}
            searchPlaceholder="Search subjects"
            allowClear={false}
          />
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
          isPrimary={data.type === "plan"}
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
