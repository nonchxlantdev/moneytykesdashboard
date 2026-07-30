import { useState } from "react";
import { AlertTriangle, Circle, Clock, EyeOff } from "lucide-react";
import { parsePercentInput } from "../../utils/reportCardScores";
import { entryToPercent } from "../../utils/gradeCalc";

export const STATUS_OPTIONS = [
  { value: "graded", label: "Graded" },
  { value: "missing", label: "Missing" },
  { value: "excused", label: "Excused" },
  { value: "late", label: "Late" }
];

const STATUS_ICONS = {
  graded: Circle,
  missing: AlertTriangle,
  excused: EyeOff,
  late: Clock
};

export function findEntry(entries = [], studentId) {
  return entries.find(entry => String(entry.studentId) === String(studentId)) || null;
}

export function displayRaw(entry) {
  if (!entry || entry.status === "excused") return "";
  if (entry.rawValue == null || entry.rawValue === "") return "";
  return entry.rawValue;
}

export function commitScoreValue(item, raw, status) {
  let nextRaw = raw;
  if (status === "missing" || status === "excused") {
    nextRaw = status === "missing" ? 0 : null;
  } else if (item.entryMode === "percent") {
    const parsed = parsePercentInput(raw);
    if (parsed === undefined) return undefined;
    nextRaw = parsed;
  } else {
    const text = String(raw ?? "").trim();
    if (text === "") {
      nextRaw = null;
    } else {
      const num = Number(text);
      if (!Number.isFinite(num)) return undefined;
      const max = Number(item.maxPoints) || 0;
      nextRaw = Math.min(max, Math.max(0, Math.round(num * 10) / 10));
    }
  }
  return nextRaw;
}

/**
 * Shared score input + status control for desktop grid and mobile list.
 */
export default function GradeScoreCell({
  studentName,
  item,
  entry,
  onCommit,
  layout = "grid"
}) {
  const [draft, setDraft] = useState(null);
  const status = entry?.status || "graded";
  const value = draft != null ? draft : displayRaw(entry);
  const percent = entry ? entryToPercent(entry, item) : null;
  const showPct = item.entryMode === "points" && status !== "excused" && status !== "missing";
  const isQuiet = status === "graded";
  const StatusIcon = STATUS_ICONS[status] || Circle;

  function flush(raw, nextStatus) {
    const resolved = commitScoreValue(item, raw, nextStatus);
    if (resolved === undefined) return;
    onCommit?.({ rawValue: resolved, status: nextStatus || "graded" });
  }

  return (
    <div className={`gr-score-cell gr-score-cell--${layout} status-${status}`}>
      <div className={`gr-score-wrap${showPct ? " has-pct" : ""}`}>
        <input
          className="gr-score-input"
          inputMode="decimal"
          value={value ?? ""}
          disabled={status === "excused"}
          placeholder={status === "missing" ? "0" : status === "excused" ? "—" : ""}
          aria-label={`${studentName} ${item.title}`}
          onChange={event => setDraft(event.target.value)}
          onBlur={event => {
            const raw = event.target.value;
            setDraft(null);
            const nextStatus = status === "excused" ? "graded" : status;
            flush(raw, nextStatus);
          }}
        />
        {showPct ? (
          <span className="gr-cell-pct" title="Converted percent">
            {percent == null ? "—" : `${percent}%`}
          </span>
        ) : null}
      </div>

      <div
        className={`gr-status-ctl ${isQuiet ? "is-quiet" : "is-exception"} gr-status-ctl--${status}`}
      >
        <StatusIcon className="gr-status-icon" size={14} strokeWidth={2.25} aria-hidden="true" />
        <select
          className={`gr-status-select gr-status-select--${status}`}
          value={status}
          aria-label={`${studentName} ${item.title} status`}
          title={`${STATUS_OPTIONS.find(option => option.value === status)?.label || "Status"}`}
          onChange={event => {
            const nextStatus = event.target.value;
            const raw =
              nextStatus === "missing"
                ? 0
                : nextStatus === "excused"
                  ? null
                  : (entry?.rawValue ?? value);
            flush(raw, nextStatus);
          }}
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function GradeStatusLegend() {
  return (
    <div className="gr-legend" aria-label="Grade status legend">
      <span className="gr-legend-item">
        <Circle className="gr-legend-icon gr-legend-icon--graded" size={12} aria-hidden="true" />
        Graded
      </span>
      <span className="gr-legend-item">
        <AlertTriangle className="gr-legend-icon gr-legend-icon--missing" size={12} aria-hidden="true" />
        Missing
      </span>
      <span className="gr-legend-item">
        <EyeOff className="gr-legend-icon gr-legend-icon--excused" size={12} aria-hidden="true" />
        Excused
      </span>
      <span className="gr-legend-item">
        <Clock className="gr-legend-icon gr-legend-icon--late" size={12} aria-hidden="true" />
        Late
      </span>
    </div>
  );
}
