import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Download, FileText } from "lucide-react";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";
import {
  ATTENDANCE_STATUSES,
  getAllAttendanceRows,
  loadAttendanceRecord,
  saveAttendanceRecord
} from "../utils/attendanceStorage";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function slugClass(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Attendance tracking and reporting for classroom groups.
 * @param {{ db: object, setToast: (msg: string) => void }} props
 */
export default function AttendancePage({ db, setToast }) {
  const classes = useMemo(() => {
    const labels = new Set([db.className, ...db.students.map(student => student.classLabel).filter(Boolean)]);
    return [...labels].map(label => ({ id: slugClass(label), label }));
  }, [db.className, db.students]);

  const [mode, setMode] = useState("take");
  const [selectedClassId, setSelectedClassId] = useState(() => slugClass(db.className));
  const [selectedDate, setSelectedDate] = useState(today());
  const [editMode, setEditMode] = useState(false);
  const [entries, setEntries] = useState({});
  const [reportClassId, setReportClassId] = useState("all");
  const [reportStart, setReportStart] = useState(today());
  const [reportEnd, setReportEnd] = useState(today());
  const [reportStudent, setReportStudent] = useState("");

  const selectedClass = classes.find(item => item.id === selectedClassId) || classes[0];
  const classStudents = useMemo(
    () => db.students.filter(student => slugClass(student.classLabel || db.className) === selectedClassId),
    [db.students, selectedClassId, db.className]
  );

  const existingRecord = selectedClass ? loadAttendanceRecord(selectedClass.id, selectedDate) : null;
  const recordExists = Boolean(existingRecord?.length) && !editMode;

  useEffect(() => {
    if (!selectedClass) return;
    const record = loadAttendanceRecord(selectedClass.id, selectedDate);
    const next = {};
    classStudents.forEach(student => {
      const saved = record?.find(item => item.studentId === student.id);
      next[student.id] = {
        status: saved?.status || "present",
        note: saved?.note || ""
      };
    });
    setEntries(next);
  }, [selectedClass, selectedClassId, selectedDate, classStudents, editMode]);

  function handleClassChange(classId) {
    setSelectedClassId(classId);
    setEditMode(false);
  }

  function handleDateChange(date) {
    setSelectedDate(date);
    setEditMode(false);
  }

  function updateEntry(studentId, patch) {
    setEntries(current => ({
      ...current,
      [studentId]: { ...current[studentId], ...patch }
    }));
  }

  function saveAttendance() {
    if (!selectedClass) return;
    if (recordExists) {
      setToast("Attendance already saved for this class and date. Switch to Edit mode.");
      return;
    }
    const records = classStudents.map(student => ({
      studentId: student.id,
      studentName: `${student.first} ${student.last}`,
      status: entries[student.id]?.status || "present",
      note: entries[student.id]?.status === "other" ? entries[student.id]?.note || "" : "",
      timestamp: new Date().toISOString()
    }));
    saveAttendanceRecord(selectedClass.id, selectedDate, records);
    setEditMode(false);
    setToast("Attendance saved.");
  }

  function startEdit() {
    setEditMode(true);
  }

  const reportRows = useMemo(() => {
    return getAllAttendanceRows().filter(row => {
      const matchesClass = reportClassId === "all" || row.classId === reportClassId;
      const matchesDate = row.date >= reportStart && row.date <= reportEnd;
      const matchesStudent = !reportStudent || row.studentName.toLowerCase().includes(reportStudent.toLowerCase());
      return matchesClass && matchesDate && matchesStudent;
    });
  }, [reportClassId, reportStart, reportEnd, reportStudent]);

  const reportSummary = useMemo(() => {
    const summary = {};
    reportRows.forEach(row => {
      if (!summary[row.studentName]) {
        summary[row.studentName] = { present: 0, late: 0, absent: 0, sick: 0 };
      }
      if (summary[row.studentName][row.status] !== undefined) {
        summary[row.studentName][row.status] += 1;
      }
    });
    return summary;
  }, [reportRows]);

  function exportCsv() {
    const header = "Student Name,Date,Status,Notes,Class";
    const lines = reportRows.map(row =>
      `"${row.studentName}","${row.date}","${row.status}","${(row.note || "").replace(/"/g, '""')}","${row.classId}"`
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-report-${reportStart}-to-${reportEnd}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Attendance report exported.");
  }

  if (!classes.length) {
    return <EmptyState title="No classes found" text="Add students with class labels to begin tracking attendance." />;
  }

  return (
    <section className="attendance-page attendance-compact">
      <div className="attendance-topbar">
        <div className="attendance-mode-toggle compact">
          <button type="button" className={mode === "take" ? "active" : ""} onClick={() => setMode("take")}>
            <ClipboardCheck size={15} /> Take
          </button>
          <button type="button" className={mode === "report" ? "active" : ""} onClick={() => setMode("report")}>
            <FileText size={15} /> Report
          </button>
        </div>

        <div className="attendance-toolbar-inline">
          {mode === "take" ? (
            <>
              <label className="attendance-inline-field">
                <span>Class</span>
                <select value={selectedClassId} onChange={event => handleClassChange(event.target.value)}>
                  {classes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="attendance-inline-field">
                <span>Date</span>
                <input type="date" value={selectedDate} onChange={event => handleDateChange(event.target.value)} />
              </label>
              {recordExists && (
                <button type="button" className="secondary-action compact" onClick={startEdit}>Edit</button>
              )}
            </>
          ) : (
            <>
              <label className="attendance-inline-field">
                <span>Class</span>
                <select value={reportClassId} onChange={event => setReportClassId(event.target.value)}>
                  <option value="all">All</option>
                  {classes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="attendance-inline-field">
                <span>From</span>
                <input type="date" value={reportStart} onChange={event => setReportStart(event.target.value)} />
              </label>
              <label className="attendance-inline-field">
                <span>To</span>
                <input type="date" value={reportEnd} onChange={event => setReportEnd(event.target.value)} />
              </label>
              <label className="attendance-inline-field grow">
                <span>Student</span>
                <input type="search" value={reportStudent} placeholder="Filter..." onChange={event => setReportStudent(event.target.value)} />
              </label>
              <button type="button" className="secondary-action compact" onClick={exportCsv}>
                <Download size={15} /> Export
              </button>
            </>
          )}
        </div>
      </div>

      {mode === "take" ? (
        <>
          {recordExists && (
            <div className="attendance-warning compact">
              <AlertTriangle size={16} />
              <span>Attendance saved for this date. Use Edit to change it.</span>
            </div>
          )}

          <article className="section-panel attendance-list-card compact">
            <div className="section-heading compact">
              <h2>Roll Call</h2>
              <Badge tone="teal">{classStudents.length}</Badge>
            </div>
            {!classStudents.length ? (
              <EmptyState title="No students in this class" text="Add students to take attendance." />
            ) : (
              <div className="attendance-student-list compact">
                {classStudents.map(student => (
                  <div className="attendance-student-row compact" key={student.id}>
                    <div className="attendance-student-name">
                      <span className="attendance-avatar">{student.first?.[0]}{student.last?.[0]}</span>
                      <strong>{student.first} {student.last}</strong>
                    </div>
                    <div className="attendance-status-options compact">
                      {ATTENDANCE_STATUSES.map(status => (
                        <button
                          key={status.value}
                          type="button"
                          className={`attendance-status-btn compact ${entries[student.id]?.status === status.value ? "selected" : ""}`}
                          disabled={recordExists}
                          title={status.label}
                          onClick={() => updateEntry(student.id, { status: status.value })}
                        >
                          <span>{status.emoji}</span>
                          <small>{status.label}</small>
                        </button>
                      ))}
                    </div>
                    {entries[student.id]?.status === "other" && (
                      <input
                        className="attendance-note-input compact"
                        type="text"
                        placeholder="Note..."
                        value={entries[student.id]?.note || ""}
                        disabled={recordExists}
                        onChange={event => updateEntry(student.id, { note: event.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              className="primary-action teal-action compact"
              type="button"
              disabled={recordExists || !classStudents.length}
              onClick={saveAttendance}
            >
              Save Attendance
            </button>
          </article>
        </>
      ) : (
        <article className="section-panel attendance-report-card compact">
          <div className="section-heading compact"><h2>Report</h2></div>
          {reportRows.length ? (
            <>
              <div className="attendance-report-table compact">
                <div className="attendance-report-head">
                  <span>Student</span>
                  <span>Date</span>
                  <span>Status</span>
                  <span>Notes</span>
                </div>
                {reportRows.map((row, index) => (
                  <div className="attendance-report-row" key={`${row.studentId}-${row.date}-${index}`}>
                    <span>{row.studentName}</span>
                    <span>{row.date}</span>
                    <span><Badge tone={row.status === "present" ? "success" : "default"}>{row.status}</Badge></span>
                    <span>{row.note || "—"}</span>
                  </div>
                ))}
              </div>
              <div className="attendance-summary-grid compact">
                {Object.entries(reportSummary).map(([name, counts]) => (
                  <article className="attendance-summary-card compact" key={name}>
                    <strong>{name}</strong>
                    <p>P {counts.present} · L {counts.late} · A {counts.absent} · S {counts.sick}</p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <EmptyState title="No attendance records" text="Take attendance to populate this report." />
          )}
        </article>
      )}
    </section>
  );
}
