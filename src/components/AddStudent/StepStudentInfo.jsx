const AVATAR_FILES = [
  "bullbasaur.png",
  "charmander.png",
  "ditto.png",
  "eevee.png",
  "gastly.png",
  "jigglypuff.png",
  "pikachu.png",
  "snorlax.png",
  "voltorb.png"
];

function avatarSrc(fileName) {
  return `${import.meta.env.BASE_URL}avatars/${fileName}`;
}

export default function StepStudentInfo({ data, update, error }) {
  return (
    <div className="wizard-step-panel">
      <h2>Student Information</h2>
      <p className="wizard-step-lead">Basics for their classroom profile.</p>

      <div className="wizard-grid two">
        <label className="wizard-field">
          <span>First Name</span>
          <input
            value={data.firstName}
            onChange={event => update({ firstName: event.target.value })}
            placeholder="e.g. Maya"
            required
          />
        </label>
        <label className="wizard-field">
          <span>Last Name</span>
          <input
            value={data.lastName}
            onChange={event => update({ lastName: event.target.value })}
            placeholder="e.g. Rivera"
            required
          />
        </label>
      </div>

      <div className="wizard-grid student-meta">
        <label className="wizard-field">
          <span>Date of Birth</span>
          <input
            type="date"
            value={data.dob}
            onChange={event => update({ dob: event.target.value })}
            required
          />
        </label>
        <label className="wizard-field">
          <span>Age</span>
          <input
            type="number"
            min={4}
            max={18}
            inputMode="numeric"
            value={data.age ?? ""}
            onChange={event => {
              const raw = event.target.value;
              if (raw === "") {
                update({ age: null });
                return;
              }
              const age = Number(raw);
              update({ age: Number.isFinite(age) ? age : null });
            }}
            placeholder="e.g. 10"
            required
          />
        </label>
      </div>

      <div className="wizard-field">
        <span>Avatar</span>
        <div className="avatar-grid" role="listbox" aria-label="Choose an avatar">
          {AVATAR_FILES.map(fileName => {
            const src = avatarSrc(fileName);
            const selected = data.avatar?.src === src || data.avatar?.fileName === fileName;
            return (
              <button
                key={fileName}
                type="button"
                role="option"
                aria-selected={selected}
                className={`avatar-option ${selected ? "selected" : ""}`}
                onClick={() => update({ avatar: { src, fileName } })}
                aria-label={`Choose ${fileName.replace(".png", "")} avatar`}
              >
                <img src={src} alt="" />
              </button>
            );
          })}
        </div>
      </div>

      {error ? <p className="wizard-error">{error}</p> : null}
    </div>
  );
}
