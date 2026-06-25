import { useMemo } from "react";
import { IconClipboardCheck } from "@tabler/icons-react";
import { loadAttendanceRecord } from "../../utils/attendanceStorage";
import { ICON_STROKE } from "../../config/navigation";

function slugClass(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * @param {{ className: string, studentCount: number, onNavigate: () => void }} props
 */
export default function AttendanceStatCard({ className, studentCount, onNavigate }) {
  const counts = useMemo(() => {
    const classId = slugClass(className);
    const records = loadAttendanceRecord(classId, today()) || [];
    const present = records.filter(row => row.status === "present" || row.status === "late").length;
    const absent = records.filter(row => row.status === "absent" || row.status === "sick").length;
    if (!records.length && studentCount > 0) {
      return { present: studentCount, absent: 0, hasRecord: false };
    }
    return { present, absent, hasRecord: records.length > 0 };
  }, [className, studentCount]);

  return (
    <article className="dash-card attendance-stat-card">
      <header className="dash-card-header">
        <div className="dash-card-title-wrap">
          <IconClipboardCheck size={18} stroke={ICON_STROKE} />
          <h3 className="dash-card-title">Attendance</h3>
        </div>
        <span className="dash-card-chip">Today</span>
      </header>
      <div className="attendance-stat-grid">
        <div>
          <p className="dash-stat-label">Present</p>
          <p className="dash-stat-value present">{counts.present}</p>
        </div>
        <div>
          <p className="dash-stat-label">Absent</p>
          <p className="dash-stat-value absent">{counts.absent}</p>
        </div>
      </div>
      <button type="button" className="link-button dash-card-link" onClick={onNavigate}>
        {counts.hasRecord ? "View attendance" : "Take attendance"}
      </button>
    </article>
  );
}
