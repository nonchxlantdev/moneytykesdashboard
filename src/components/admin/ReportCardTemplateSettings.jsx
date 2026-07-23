import { useMemo, useState } from "react";
import InstructorSelect from "../ReportCards/InstructorSelect";
import {
  defaultTemplate,
  getTemplateForSchool,
  saveTemplateForSchool
} from "../../utils/reportCardsStorage";

const COLUMN_TIPS = {
  showHours: "When on, the Hours column appears on every report card for this school.",
  showRank: "When on, class rank is shown on report cards and in the roster.",
  showAbsent: "When on, the Absent attendance field appears on report cards.",
  showTardy: "When on, the Tardy attendance field appears on report cards.",
  showDemerits: "When on, Demerits appear on report cards.",
  showMerits: "When on, Merits appear on report cards.",
  showProbation: "When on, the Probation note field appears on report cards."
};

export default function ReportCardTemplateSettings({ schools = [], teachers = [] }) {
  const schoolOptions = schools.length ? schools : [{ id: "default", name: "Default school" }];
  const [schoolId, setSchoolId] = useState(String(schoolOptions[0]?.id ?? "default"));
  const school = schoolOptions.find(item => String(item.id) === String(schoolId)) || schoolOptions[0];
  const [form, setForm] = useState(() => getTemplateForSchool(school?.id, school));
  const [savedNote, setSavedNote] = useState("");

  const schoolTeachers = useMemo(
    () => teachers.filter(teacher => !school?.id || String(teacher.schoolId) === String(school.id)),
    [teachers, school]
  );

  function loadSchool(nextId) {
    const nextSchool = schoolOptions.find(item => String(item.id) === String(nextId)) || schoolOptions[0];
    setSchoolId(String(nextId));
    setForm(getTemplateForSchool(nextSchool?.id, nextSchool));
    setSavedNote("");
  }

  function updateColumn(key, value) {
    setForm(current => ({ ...current, columns: { ...current.columns, [key]: value } }));
  }

  function save() {
    saveTemplateForSchool(school?.id, { ...form, schoolName: form.schoolName || school?.name });
    setSavedNote("Template saved for this school.");
  }

  const columnToggles = useMemo(
    () => [
      ["showHours", "Hours"],
      ["showRank", "Rank"],
      ["showAbsent", "Absent"],
      ["showTardy", "Tardy"],
      ["showDemerits", "Demerits"],
      ["showMerits", "Merits"],
      ["showProbation", "Probation"]
    ],
    []
  );

  return (
    <div className="rc-template-settings" data-tour="admin-template">
      <div className="rc-template-head">
        <div>
          <h3>Report Card Template</h3>
          <p>Configure the school header, terms, subjects, and optional columns used when teachers create report cards.</p>
        </div>
        <label className="rc-inline-field" title="Choose which school’s report card template to edit">
          School
          <select value={schoolId} onChange={event => loadSchool(event.target.value)}>
            {schoolOptions.map(item => (
              <option key={item.id} value={String(item.id)}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rc-template-grid">
        <label title="School name printed at the top of every report card">
          School name
          <input value={form.schoolName || ""} onChange={event => setForm({ ...form, schoolName: event.target.value })} />
        </label>
        <label title="Short motto under the school name on the report card">
          Motto
          <input value={form.motto || ""} onChange={event => setForm({ ...form, motto: event.target.value })} />
        </label>
        <label title="Optional logo image URL shown on the report card header">
          Logo URL
          <input value={form.logoUrl || ""} onChange={event => setForm({ ...form, logoUrl: event.target.value })} placeholder="https://…" />
        </label>
        <label title="Accent color for report card headers and PDF styling">
          Accent color
          <input type="color" value={form.accentColor || "#006d77"} onChange={event => setForm({ ...form, accentColor: event.target.value })} />
        </label>
      </div>

      <label className="rc-block-field" title="Term columns on the grades table — e.g. 1st Term, 2nd Term, 3rd Term">
        Terms (comma-separated)
        <input
          value={(form.terms || []).join(", ")}
          onChange={event =>
            setForm({
              ...form,
              terms: event.target.value
                .split(",")
                .map(part => part.trim())
                .filter(Boolean)
            })
          }
        />
      </label>

      <label className="rc-block-field" title="Labels under the signature lines at the bottom of each report card">
        Signature labels (comma-separated)
        <input
          value={(form.signatureLabels || []).join(", ")}
          onChange={event =>
            setForm({
              ...form,
              signatureLabels: event.target.value
                .split(",")
                .map(part => part.trim())
                .filter(Boolean)
            })
          }
        />
      </label>

      <div className="rc-toggle-row">
        {columnToggles.map(([key, label]) => (
          <label key={key} className="rc-check" title={COLUMN_TIPS[key]}>
            <input
              type="checkbox"
              checked={form.columns?.[key] !== false}
              onChange={event => updateColumn(key, event.target.checked)}
            />
            Show {label}
          </label>
        ))}
      </div>

      <div className="rc-subjects">
        <div className="rc-subjects-head">
          <strong>Default subjects</strong>
          <button
            type="button"
            className="btn"
            title="Add a subject row that pre-fills new report cards for this school"
            onClick={() =>
              setForm({
                ...form,
                subjects: [...(form.subjects || []), { name: "New subject", instructor: "", hours: 40 }]
              })
            }
          >
            Add subject
          </button>
        </div>
        {(form.subjects || []).map((subject, index) => (
          <div className="rc-subject-row" key={`${subject.name}-${index}`}>
            <input
              value={subject.name}
              title="Subject name on new report cards"
              onChange={event => {
                const subjects = form.subjects.map((item, i) => (i === index ? { ...item, name: event.target.value } : item));
                setForm({ ...form, subjects });
              }}
              placeholder="Subject"
            />
            <InstructorSelect
              value={subject.instructor || ""}
              teachers={schoolTeachers}
              extraNames={(form.subjects || []).map(item => item.instructor)}
              onChange={instructor => {
                const subjects = form.subjects.map((item, i) => (i === index ? { ...item, instructor } : item));
                setForm({ ...form, subjects });
              }}
            />
            <input
              type="number"
              value={subject.hours ?? ""}
              title="Default contact hours for this subject"
              onChange={event => {
                const subjects = form.subjects.map((item, i) =>
                  i === index ? { ...item, hours: Number(event.target.value) || 0 } : item
                );
                setForm({ ...form, subjects });
              }}
              placeholder="Hours"
            />
            <button
              type="button"
              className="btn"
              title="Remove this subject from the default list"
              onClick={() => setForm({ ...form, subjects: form.subjects.filter((_, i) => i !== index) })}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="rc-template-actions">
        <button type="button" className="btn" title="Restore the built-in default template for this school" onClick={() => setForm(defaultTemplate(school))}>
          Reset defaults
        </button>
        <button type="button" className="btn primary-gold" title="Save this template for the selected school" onClick={save}>
          Save template
        </button>
      </div>
      {savedNote ? <p className="rc-saved">{savedNote}</p> : null}
    </div>
  );
}
