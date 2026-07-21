import Select from "../ui/Select";

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
  const classOptions = classes.map(item => ({
    value: item.id,
    label: item.name
  }));

  if (mode === "report") {
    return (
      <div className="filters-row">
        <div className="field">
          <Select
            label="Class"
            value={reportClassId}
            onChange={onReportClassChange}
            options={classOptions}
            placeholder="Select class"
            searchPlaceholder="Search classes"
            allowClear={false}
          />
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
        <Select
          label="Class"
          value={classId}
          onChange={onClassChange}
          options={classOptions}
          placeholder="Select class"
          searchPlaceholder="Search classes"
          allowClear={false}
        />
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
