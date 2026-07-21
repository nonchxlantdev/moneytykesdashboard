import Select from "../ui/Select";

const STANDARDS = ["N/A", "Standard 1", "Standard 2", "Standard 3", "Standard 4", "Standard 5", "Standard 6"];
const FORMS = ["N/A", "Form 1", "Form 2", "Form 3", "Form 4", "Form 5"];

export default function StepSchoolInfo({ data, update, schools, teachers, navigate, error }) {
  const schoolTeachers = teachers.filter(
    teacher => !data.schoolId || String(teacher.schoolId) === String(data.schoolId)
  );

  return (
    <div className="wizard-step-panel">
      <h2>School Information</h2>
      <p className="wizard-step-lead">Where this student learns and who guides them.</p>

      <div className="wizard-grid two">
        <div className="wizard-field">
          <Select
            label="Standard"
            value={data.standard || "N/A"}
            onChange={raw => {
              const value = raw === "N/A" ? "" : raw;
              update({ standard: value, form: value ? "" : data.form });
            }}
            options={STANDARDS.map(option => ({ value: option, label: option }))}
            searchPlaceholder="Search standards"
            allowClear={false}
          />
        </div>
        <div className="wizard-field">
          <Select
            label="Form"
            value={data.form || "N/A"}
            onChange={raw => {
              const value = raw === "N/A" ? "" : raw;
              update({ form: value, standard: value ? "" : data.standard });
            }}
            options={FORMS.map(option => ({ value: option, label: option }))}
            searchPlaceholder="Search forms"
            allowClear={false}
          />
        </div>
      </div>

      <div className="wizard-grid two">
        <div className="wizard-field">
          <Select
            label="School"
            value={data.schoolId ? String(data.schoolId) : ""}
            onChange={schoolId => update({ schoolId, teacherId: "" })}
            options={schools.map(school => ({
              value: String(school.id),
              label: school.name
            }))}
            placeholder="Select school"
            searchPlaceholder="Search schools"
            required
            allowClear={false}
          />
        </div>
        <div className="wizard-field">
          <Select
            label="Teacher"
            value={data.teacherId ? String(data.teacherId) : ""}
            onChange={teacherId => update({ teacherId })}
            options={schoolTeachers.map(teacher => ({
              value: String(teacher.id),
              label: `${teacher.firstName} ${teacher.lastName}`
            }))}
            placeholder={data.schoolId ? "Select teacher" : "Select a school first"}
            searchPlaceholder="Search teachers"
            disabled={!data.schoolId}
            required
            allowClear={false}
          />
        </div>
      </div>

      <p className="wizard-inline-note">
        Don&apos;t see your school or a teacher listed?{" "}
        <button type="button" className="wizard-link" onClick={() => navigate("admin")}>
          + Add in Admin
        </button>
      </p>

      {error ? <p className="wizard-error">{error}</p> : null}
    </div>
  );
}
