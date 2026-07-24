export default function StepReview({ data, schoolName, teacherName }) {
  const rows = [
    { label: "Name", value: `${data.firstName} ${data.lastName}`.trim() || "—" },
    { label: "Gender", value: data.gender === "male" ? "Male" : data.gender === "female" ? "Female" : "—" },
    { label: "Date of Birth", value: data.dob || "—" },
    { label: "Age", value: data.age != null ? String(data.age) : "—" },
    { label: "Class", value: data.standard || data.form || "—" },
    { label: "School", value: schoolName || "—" },
    { label: "Teacher", value: teacherName || "—" },
    { label: "Guardian", value: data.guardianName || "—" },
    { label: "Phone", value: data.guardianPhone || "—" }
  ];

  return (
    <div className="wizard-step-panel">
      <h2>Review & Create</h2>
      <p className="wizard-step-lead">Confirm everything looks right before adding the student.</p>

      <div className="review-grid">
        {rows.map(row => (
          <div className="review-row" key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
