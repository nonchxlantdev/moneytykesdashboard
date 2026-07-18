export default function StepGuardianInfo({ data, update, error }) {
  return (
    <div className="wizard-step-panel">
      <h2>Guardian Information</h2>
      <p className="wizard-step-lead">Who we should contact about this student.</p>

      <label className="wizard-field">
        <span>Parent / Guardian Name</span>
        <input
          value={data.guardianName}
          onChange={event => update({ guardianName: event.target.value })}
          placeholder="Full name"
        />
      </label>

      <label className="wizard-field">
        <span>Phone Number</span>
        <input
          type="tel"
          value={data.guardianPhone}
          onChange={event => update({ guardianPhone: event.target.value })}
          placeholder="+501 600-0000"
        />
        <small className="wizard-hint">Include country code when possible.</small>
      </label>

      {error ? <p className="wizard-error">{error}</p> : null}
    </div>
  );
}
