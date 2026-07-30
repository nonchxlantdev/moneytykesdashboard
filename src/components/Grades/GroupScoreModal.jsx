import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { parsePercentInput } from "../../utils/reportCardScores";

export default function GroupScoreModal({ item, onClose, onSave }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const memberCount = item?.groupStudentIds?.length || 0;

  function handleSubmit(event) {
    event.preventDefault();
    if (item?.entryMode === "percent") {
      const parsed = parsePercentInput(value);
      if (parsed === undefined || parsed == null) {
        setError("Enter a percent from 0 to 100.");
        return;
      }
      onSave?.(parsed);
      return;
    }
    const num = Number(String(value).trim());
    const max = Number(item?.maxPoints) || 0;
    if (!Number.isFinite(num) || num < 0) {
      setError("Enter a valid points score.");
      return;
    }
    onSave?.(Math.min(max, Math.round(num * 10) / 10));
  }

  return (
    <div className="gr-modal-backdrop" role="presentation" onClick={onClose}>
      <form
        className="gr-modal form-card gr-modal-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gr-group-score-title"
        onClick={event => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <header className="gr-modal-head">
          <div>
            <h2 id="gr-group-score-title">Enter group score</h2>
            <p>
              {item?.title} · applies to {memberCount} student{memberCount === 1 ? "" : "s"}. Each cell stays
              editable afterward.
            </p>
          </div>
          <Button color="secondary" size="md" type="button" onClick={onClose}>
            Close
          </Button>
        </header>

        <label>
          {item?.entryMode === "percent" ? "Percent (0–100)" : `Points (max ${item?.maxPoints || 0})`}
          <input
            autoFocus
            inputMode="decimal"
            value={value}
            onChange={event => {
              setValue(event.target.value);
              setError("");
            }}
            placeholder={item?.entryMode === "percent" ? "87" : "18"}
          />
        </label>

        {error ? <p className="gr-error">{error}</p> : null}

        <div className="gr-modal-actions">
          <Button color="secondary" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" size="md" type="submit">
            Apply to group
          </Button>
        </div>
      </form>
    </div>
  );
}
