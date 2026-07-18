import { ChevronDown } from "lucide-react";

export default function AttendanceFilters({
  mode,
  classes,
  classId,
  onClassChange,
  date,
  onDateChange,
  reportClassId,
  onReportClassChange,
  reportStart,
  onReportStartChange,
  reportEnd,
  onReportEndChange,
  reportStudent,
  onReportStudentChange,
  onExport,
  recordExists,
  onEdit
}) {
  if (mode === "report") {
    return (
      <div className="filters-row">
        <div className="field">
          <label htmlFor="att-report-class">Class</label>
          <div className="select-wrap">
            <select
              id="att-report-class"
              value={reportClassId}
              onChange={event => onReportClassChange(event.target.value)}
            >
              <option value="">Select class</option>
              {classes.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="att-report-start">From</label>
          <div className="select-wrap">
            <input
              id="att-report-start"
              type="date"
              value={reportStart}
              onChange={event => onReportStartChange(event.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="att-report-end">To</label>
          <div className="select-wrap">
            <input
              id="att-report-end"
              type="date"
              value={reportEnd}
              onChange={event => onReportEndChange(event.target.value)}
            />
          </div>
        </div>
        <div className="field grow">
          <label htmlFor="att-report-student">Student</label>
          <div className="select-wrap">
            <input
              id="att-report-student"
              type="search"
              value={reportStudent}
              placeholder="Filter by name…"
              onChange={event => onReportStudentChange(event.target.value)}
            />
          </div>
        </div>
        <button type="button" className="btn ghost filter-export" onClick={onExport}>
          Export
        </button>
      </div>
    );
  }

  return (
    <div className="filters-row">
      <div className="field">
        <label htmlFor="att-take-class">Class</label>
        <div className="select-wrap">
          <select
            id="att-take-class"
            value={classId}
            onChange={event => onClassChange(event.target.value)}
          >
            <option value="">Select class</option>
            {classes.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="att-take-date">Date</label>
        <div className="select-wrap">
          <input
            id="att-take-date"
            type="date"
            value={date}
            onChange={event => onDateChange(event.target.value)}
          />
        </div>
      </div>
      {recordExists ? (
        <button type="button" className="btn ghost filter-edit" onClick={onEdit}>
          Edit
        </button>
      ) : null}
    </div>
  );
}
