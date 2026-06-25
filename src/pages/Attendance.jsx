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
    <section className="attendance-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Classroom</p>
          <h2>Attendance</h2>
        </div>
        <div className="attendance-mode-toggle">
          <button type="button" className={mode === "take" ? "active" : ""} onClick={() => setMode("take")}>
            <ClipboardCheck size={16} /> Take Attendance
          </button>
          <button type="button" className={mode === "report" ? "active" : ""} onClick={() => setMode("report")}>
            <FileText size={16} /> View Report
          </button>
        </div>
      </div>

      {mode === "take" ? (
        <>
          <div className="attendance-toolbar section-panel">
            <label className="field-label">
              Class / Group
              <select value={selectedClassId} onChange={event => handleClassChange(event.target.value)}>
                {classes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="field-label">
              Date
              <input type="date" value={selectedDate} onChange={event => handleDateChange(event.target.value)} />
            </label>
          </div>

          {recordExists && (
            <div className="attendance-warning section-panel">
              <AlertTriangle size={18} />
              <div>
                <strong>Attendance already recorded for this class and date.</strong>
                <p>Use Edit mode to update the saved record.</p>
              </div>
              <button type="button" className="secondary-action" onClick={startEdit}>Edit Attendance</button>
            </div>
          )}

          <article className="section-panel attendance-list-card">
            <div className="section-heading">
              <h2>Students</h2>
              <Badge tone="teal">{classStudents.length} enrolled</Badge>
            </div>
            {!classStudents.length ? (
              <EmptyState title="No students in this class" text="Add students to take attendance." />
            ) : (
              <div className="attendance-student-list">
                {classStudents.map(student => (
                  <div className="attendance-student-row" key={student.id}>
                    <div className="attendance-student-name">
                      <span className="attendance-avatar">{student.first?.[0]}{student.last?.[0]}</span>
                      <strong>{student.first} {student.last}</strong>
                    </div>
                    <div className="attendance-status-options">
                      {ATTENDANCE_STATUSES.map(status => (
                        <button
                          key={status.value}
                          type="button"
                          className={`attendance-status-btn ${entries[student.id]?.status === status.value ? "selected" : ""}`}
                          disabled={recordExists}
                          onClick={() => updateEntry(student.id, { status: status.value })}
                        >
                          <span>{status.emoji}</span>
                          <small>{status.label}</small>
                        </button>
                      ))}
                    </div>
                    {entries[student.id]?.status === "other" && (
                      <input
                        className="attendance-note-input"
                        type="text"
                        placeholder="Add a short note..."
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
              className="primary-action teal-action"
              type="button"
              disabled={recordExists || !classStudents.length}
              onClick={saveAttendance}
            >
              Save Attendance
            </button>
          </article>
        </>
      ) : (
        <>
          <div className="attendance-toolbar section-panel">
            <label className="field-label">
              Class
              <select value={reportClassId} onChange={event => setReportClassId(event.target.value)}>
                <option value="all">All Classes</option>
                {classes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="field-label">
              Start Date
              <input type="date" value={reportStart} onChange={event => setReportStart(event.target.value)} />
            </label>
            <label className="field-label">
              End Date
              <input type="date" value={reportEnd} onChange={event => setReportEnd(event.target.value)} />
            </label>
            <label className="field-label">
              Student Name
              <input type="search" value={reportStudent} placeholder="Filter by name..." onChange={event => setReportStudent(event.target.value)} />
            </label>
            <button type="button" className="secondary-action" onClick={exportCsv}>
              <Download size={16} /> Export CSV
            </button>
          </div>

          <article className="section-panel">
            <div className="section-heading"><h2>Attendance Report</h2></div>
            {reportRows.length ? (
              <>
                <div className="attendance-report-table">
                  <div className="attendance-report-head">
                    <span>Student Name</span>
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
                <div className="attendance-summary-grid">
                  {Object.entries(reportSummary).map(([name, counts]) => (
                    <article className="attendance-summary-card" key={name}>
                      <strong>{name}</strong>
                      <p>Present {counts.present} · Late {counts.late} · Absent {counts.absent} · Sick {counts.sick}</p>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="No attendance records" text="Take attendance to populate this report." />
            )}
          </article>
        </>
      )}
    </section>
  );
}
