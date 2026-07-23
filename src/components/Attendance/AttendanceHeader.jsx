import { ClipboardCheck, UserPlus } from "lucide-react";
import PageChalkBanner from "../shared/PageChalkBanner";

export default function AttendanceHeader({ navigate }) {
  return (
    <PageChalkBanner
      eyebrow="Roll call"
      title="Attendance"
      lead="Mark who’s here today, then review reports when you need them."
      tourId="attendance-banner"
      actions={
        <>
          <button type="button" className="btn ghost" onClick={() => navigate("students")}>
            <ClipboardCheck size={16} />
            <span>View Students</span>
          </button>
          <button type="button" className="btn primary" onClick={() => navigate("add-student")}>
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
        </>
      }
    />
  );
}
