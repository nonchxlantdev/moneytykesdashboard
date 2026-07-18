import { ArrowRight } from "lucide-react";
import PageChalkBanner from "../shared/PageChalkBanner";
import LessonCardPreview from "./LessonCardPreview";
import LessonForm from "./LessonForm";
import useLessonStudioForm from "./useLessonStudioForm";
import "./lesson-studio.css";

const PLAN_FIELD_ORDER = ["objective", "materials", "activitySteps", "wrapUp"];
const PLAN_FIELD_SELECTOR = {
  objective: "[data-lp-field='lp-objective']",
  materials: "[data-lp-field='lp-materials']",
  activitySteps: "[data-lp-field='lp-activity-steps']",
  wrapUp: "[data-lp-field='lp-wrap-up']"
};

export default function LessonStudio({ setToast, navigate }) {
  const studio = useLessonStudioForm();

  function scrollToFirstPlanError(errors) {
    const firstKey = PLAN_FIELD_ORDER.find(key => errors?.[key]);
    if (!firstKey) return;
    const node = document.querySelector(PLAN_FIELD_SELECTOR[firstKey]);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    node?.querySelector("textarea")?.focus();
  }

  function handleSave(mode) {
    const result = studio.save(mode);
    if (!result.ok) {
      if (result.planErrors) {
        scrollToFirstPlanError(result.planErrors);
      }
      setToast?.(result.error);
      return;
    }
    setToast?.(result.message);
    if (mode === "published" || mode === "selected") {
      navigate?.("lessons");
    }
  }

  return (
    <div className="lesson-studio">
      <PageChalkBanner
        eyebrow="Content Studio"
        title="Create Lessons"
        subtitle="Build a lesson and see exactly how it'll look in your library before you publish."
        actions={
          <button
            type="button"
            className="btn ghost library-link"
            onClick={() => navigate?.("lessons")}
          >
            View Full Lessons Library
            <ArrowRight size={14} />
          </button>
        }
      />

      <div className="lesson-studio-body">
        <div className="studio-layout">
          <LessonForm
            data={studio.data}
            update={studio.update}
            selectType={studio.selectType}
            setSourceValue={studio.setSourceValue}
            subjectOptions={studio.subjectOptions}
            urlError={studio.urlError}
            fileError={studio.fileError}
            isStoringFile={studio.isStoringFile}
            isEditing={studio.isEditing}
            planErrors={studio.planErrors}
            onSaveDraft={() => handleSave("draft")}
            onPublish={() => handleSave(studio.isEditing ? "selected" : "published")}
          />
          <aside className="studio-preview-col">
            <LessonCardPreview lesson={studio.previewLesson} />
          </aside>
        </div>
      </div>
    </div>
  );
}
