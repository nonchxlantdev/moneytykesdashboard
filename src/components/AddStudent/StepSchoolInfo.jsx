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
        <label className="wizard-field">
          <span>Standard</span>
          <select
            value={data.standard || "N/A"}
            onChange={event => {
              const value = event.target.value === "N/A" ? "" : event.target.value;
              update({ standard: value, form: value ? "" : data.form });
            }}
          >
            {STANDARDS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="wizard-field">
          <span>Form</span>
          <select
            value={data.form || "N/A"}
            onChange={event => {
              const value = event.target.value === "N/A" ? "" : event.target.value;
              update({ form: value, standard: value ? "" : data.standard });
            }}
          >
            {FORMS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="wizard-grid two">
        <label className="wizard-field">
          <span>School</span>
          <select
            value={data.schoolId}
            onChange={event => update({ schoolId: event.target.value, teacherId: "" })}
          >
            <option value="">Select school</option>
            {schools.map(school => (
              <option key={school.id} value={String(school.id)}>
                {school.name}
              </option>
            ))}
          </select>
        </label>
        <label className="wizard-field">
          <span>Teacher</span>
          <select
            value={data.teacherId}
            onChange={event => update({ teacherId: event.target.value })}
            disabled={!data.schoolId}
          >
            <option value="">{data.schoolId ? "Select teacher" : "Select a school first"}</option>
            {schoolTeachers.map(teacher => (
              <option key={teacher.id} value={String(teacher.id)}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
        </label>
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
