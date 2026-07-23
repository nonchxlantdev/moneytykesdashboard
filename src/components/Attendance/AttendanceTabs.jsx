import { ClipboardCheck, FileText } from "lucide-react";

export default function AttendanceTabs({ active, onChange }) {
  return (
    <div className="tab-group" role="tablist" aria-label="Attendance mode" data-tour="attendance-tabs">
      <button
        type="button"
        role="tab"
        aria-selected={active === "take"}
        className={active === "take" ? "tab active" : "tab"}
        onClick={() => onChange("take")}
      >
        <ClipboardCheck size={15} />
        Take
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "report"}
        className={active === "report" ? "tab active" : "tab"}
        onClick={() => onChange("report")}
      >
        <FileText size={15} />
        Report
      </button>
    </div>
  );
}
