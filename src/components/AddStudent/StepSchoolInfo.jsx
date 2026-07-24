import Select from "../ui/Select";
import { classOptionsForSchool } from "../../utils/classOptions";

export default function StepSchoolInfo({ data, update, schools, teachers, classes = [], navigate, error }) {
  const schoolTeachers = teachers.filter(
    teacher => !data.schoolId || String(teacher.schoolId) === String(data.schoolId)
  );
  const currentClass = data.standard || data.form || "";
  const classOptions = classOptionsForSchool({ classes }, data.schoolId, currentClass);

  function updateSchool(schoolId) {
    const nextOptions = classOptionsForSchool({ classes }, schoolId, "");
    const keepClass = currentClass && nextOptions.includes(currentClass) ? currentClass : "";
    update({
      schoolId,
      teacherId: "",
      standard: keepClass,
      form: ""
    });
  }

  return (
    <div className="wizard-step-panel">
      <h2>School Information</h2>
      <p className="wizard-step-lead">Where this student learns and who guides them.</p>

      <div className="wizard-field">
        <Select
          label="School"
          value={data.schoolId ? String(data.schoolId) : ""}
          onChange={updateSchool}
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

      <div className="wizard-grid two">
        <div className="wizard-field">
          <Select
            label="Class"
            value={currentClass}
            onChange={value => update({ standard: value, form: "" })}
            options={classOptions.map(name => ({ value: name, label: name }))}
            placeholder={
              !data.schoolId
                ? "Select a school first"
                : classOptions.length
                  ? "Select class"
                  : "Add a class in Admin first"
            }
            searchPlaceholder="Search classes"
            required
            allowClear={false}
            disabled={!data.schoolId || (!classOptions.length && !currentClass)}
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

      {data.schoolId && !classOptions.length ? (
        <p className="wizard-inline-note">
          No classes for this school yet.{" "}
          <button type="button" className="wizard-link" onClick={() => navigate("admin")}>
            Add a class in Admin
          </button>
        </p>
      ) : (
        <p className="wizard-inline-note">
          Don&apos;t see your class, school, or a teacher listed?{" "}
          <button type="button" className="wizard-link" onClick={() => navigate("admin")}>
            + Add in Admin
          </button>
        </p>
      )}

      {error ? <p className="wizard-error">{error}</p> : null}
    </div>
  );
}
