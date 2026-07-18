import { AlertTriangle, Download } from "lucide-react";
import Badge from "../Badge";
import EmptyBox from "../shared/EmptyBox";
import AttendanceFilters from "./AttendanceFilters";
import AttendanceHeader from "./AttendanceHeader";
import AttendanceTabs from "./AttendanceTabs";
import RollCall from "./RollCall";
import useAttendance from "./useAttendance";
import "./attendance.css";

const STUDENTS_CLASS_PREFILL_KEY = "mt.students.classFilter";

export default function AttendancePage({ db, setToast, navigate }) {
  const attendance = useAttendance(db);

  function goAddStudents() {
    const label = attendance.selectedClass?.name || attendance.selectedClass?.label;
    if (label) {
      try {
        sessionStorage.setItem(STUDENTS_CLASS_PREFILL_KEY, label);
      } catch {
        /* ignore */
      }
    }
    navigate("students");
  }

  function exportCsv() {
    const header = "Student Name,Date,Status,Notes,Class";
    const lines = attendance.reportRows.map(
      row =>
        `"${row.studentName}","${row.date}","${row.status}","${(row.note || "").replace(/"/g, '""')}","${row.classId}"`
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-report-${attendance.reportStart}-to-${attendance.reportEnd}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast("Attendance report exported.");
  }

  if (!attendance.classes.length) {
    return (
      <div className="attendance-dash">
        <AttendanceHeader navigate={navigate} />
        <div className="attendance-dash-body">
          <EmptyBox
            title="No classes found"
            description="Add students with class labels to begin tracking attendance."
            actions={
              <button className="btn primary" type="button" onClick={goAddStudents}>
                Add Students
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-dash">
      <AttendanceHeader navigate={navigate} />

      <div className="attendance-dash-body">
        <div className="attendance-toolbar">
          <AttendanceTabs active={attendance.mode} onChange={attendance.setMode} />
          <AttendanceFilters
            mode={attendance.mode}
            classes={attendance.classes}
            classId={attendance.classId}
            onClassChange={attendance.setClassId}
            date={attendance.date}
            onDateChange={attendance.setDate}
            reportClassId={attendance.reportClassId}
            onReportClassChange={attendance.setReportClassId}
            reportStart={attendance.reportStart}
            onReportStartChange={attendance.setReportStart}
            reportEnd={attendance.reportEnd}
            onReportEndChange={attendance.setReportEnd}
            reportStudent={attendance.reportStudent}
            onReportStudentChange={attendance.setReportStudent}
            onExport={exportCsv}
            recordExists={attendance.recordExists}
            onEdit={attendance.startEdit}
          />
        </div>

        {attendance.mode === "take" ? (
          <>
            {attendance.recordExists ? (
              <div className="attendance-warning">
                <AlertTriangle size={16} />
                <span>Attendance saved for this date. Use Edit to change it.</span>
              </div>
            ) : null}
            <RollCall
              students={attendance.students}
              attendance={attendance.attendance}
              onStatusChange={attendance.setStatus}
              presentCount={attendance.presentCount}
              recordExists={attendance.recordExists}
              onMarkAllPresent={attendance.markAllPresent}
              onSave={() => attendance.save(setToast)}
              onAddStudents={goAddStudents}
            />
          </>
        ) : (
          <article className="report-card">
            <div className="report-card-head">
              <h2>Report</h2>
              <button type="button" className="btn ghost" onClick={exportCsv}>
                <Download size={15} />
                Export
              </button>
            </div>
            {attendance.reportRows.length ? (
              <>
                <div className="report-table">
                  <div className="report-table-head">
                    <span>Student</span>
                    <span>Date</span>
                    <span>Status</span>
                    <span>Notes</span>
                  </div>
                  {attendance.reportRows.map((row, index) => (
                    <div className="report-table-row" key={`${row.studentId}-${row.date}-${index}`}>
                      <span>{row.studentName}</span>
                      <span>{row.date}</span>
                      <span>
                        <Badge tone={row.status === "present" ? "success" : "default"}>{row.status}</Badge>
                      </span>
                      <span>{row.note || "—"}</span>
                    </div>
                  ))}
                </div>
                <div className="report-summary-grid">
                  {Object.entries(attendance.reportSummary).map(([name, counts]) => (
                    <article className="report-summary-card" key={name}>
                      <strong>{name}</strong>
                      <p>
                        P {counts.present} · L {counts.late} · A {counts.absent} · S {counts.sick}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <EmptyBox
                title="No attendance records"
                description="Take attendance to populate this report."
              />
            )}
          </article>
        )}
      </div>
    </div>
  );
}
