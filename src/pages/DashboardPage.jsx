import { useMemo } from "react";
import Badge from "../components/Badge";
import DataTable from "../components/ui/DataTable";
import ProgressBar from "../components/ui/ProgressBar";
import SegmentedProgress from "../components/ui/SegmentedProgress";
import ChalkboardHeader from "../components/ChalkboardHeader/ChalkboardHeader";
import { loadAttendanceRecord } from "../utils/attendanceStorage";
import { loadCreatedLessons } from "../utils/lessonsStorage";
import { formatPoints } from "../utils/points";
import { getPointsLog } from "../utils/rewardsStorage";
import "../dashboard-v2.css";

function slugClass(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatShortDate(value) {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function statusTone(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "published" || normalized === "completed" || normalized === "active") return "success";
  if (normalized === "draft" || normalized === "inactive") return "inactive";
  if (normalized === "pending" || normalized === "in progress") return "pending";
  return "info";
}

function taskProgress(task) {
  const completed = Number(task.completed || 0);
  if (completed >= 100) return 100;
  if (completed > 0) return completed;
  return 0;
}

function taskStatus(task) {
  const progress = taskProgress(task);
  if (progress >= 100) return "Completed";
  if (progress > 0) return "In progress";
  return "Not started";
}

/**
 * Dashboard home — welcome, status, tasks, top students list.
 * Events, quick actions, and daily tip live in EventsRail.
 */
export default function DashboardPage({ dashboard, db, navigate }) {
  const teacherLast = String(db.teacher?.last || "Young").trim() || "Young";
  const teacherName = `Ms. ${teacherLast}`;
  const className = db.className || "Class";
  const classId = slugClass(className) || "class";
  const teacherId = db.teacher?.id || db.teacher?.email || teacherLast;

  const attendance = useMemo(() => {
    const classStudents = (db.students || []).filter(
      student => (student.classLabel || className) === className
    );
    const studentCount = classStudents.length || dashboard.studentCount || 0;
    const records = loadAttendanceRecord(slugClass(className), todayIso()) || [];
    if (!records.length) {
      return { present: studentCount, rate: studentCount ? 100 : 0 };
    }
    const present = records.filter(row => row.status === "present" || row.status === "late").length;
    return {
      present,
      rate: studentCount ? Math.round((present / studentCount) * 100) : 0
    };
  }, [className, dashboard.studentCount, db.students]);

  const lessonStats = useMemo(() => {
    const lessons = loadCreatedLessons();
    const total = lessons.length;
    const published = lessons.filter(lesson => lesson.status === "Published").length;
    const completed = lessons.filter(lesson => lesson.status === "Completed").length;
    const done = published + completed;
    return {
      total,
      published,
      completed,
      rate: total ? Math.round((done / total) * 100) : dashboard.completionRate || 0
    };
  }, [dashboard.completionRate]);

  const rewardsIssued = useMemo(() => {
    return (db.students || []).reduce((sum, student) => sum + getPointsLog(student.id).length, 0);
  }, [db.students]);

  const recentTasks = useMemo(() => {
    return [...(db.tasks || [])]
      .sort((a, b) => String(b.createdAt || b.due || "").localeCompare(String(a.createdAt || a.due || "")))
      .slice(0, 5);
  }, [db.tasks]);

  const topStudents = (dashboard.leaderboard || []).slice(0, 5);

  const segments = [
    {
      label: "Lesson completion",
      value: `${lessonStats.rate}%`,
      meta: `${lessonStats.published + lessonStats.completed} of ${lessonStats.total || 0} lessons`,
      tone: "violet",
      percent: lessonStats.rate
    },
    {
      label: "Attendance today",
      value: `${attendance.rate}%`,
      meta: `${attendance.present} present`,
      tone: attendance.rate >= 90 ? "success" : attendance.rate >= 70 ? "pending" : "danger",
      percent: attendance.rate
    },
    {
      label: "Rewards issued",
      value: rewardsIssued,
      meta: "Awards logged",
      tone: "achieve",
      percent: Math.min(100, rewardsIssued * 8)
    },
    {
      label: "Task progress",
      value: `${dashboard.completionRate || 0}%`,
      meta: `${dashboard.taskCount || 0} tasks`,
      tone: "rose",
      percent: dashboard.completionRate || 0
    }
  ];

  const taskColumns = [
    { key: "name", header: "Name" },
    { key: "status", header: "Status" },
    { key: "progress", header: "Progress", width: "28%" }
  ];

  return (
    <div className="dash-home">
      <ChalkboardHeader
        teacherName={teacherName}
        classId={classId}
        userId={teacherId}
      />

      <div className="dash-home-main">
        <SegmentedProgress title="This month's class status" segments={segments} />

        <section className="dash-home-mid">
          <article className="mt-card-panel dash-home-card">
            <div className="mt-card-panel-header">
              <h3>Recent tasks</h3>
              <button type="button" className="mt-card-panel-link" onClick={() => navigate("create-lessons")}>
                View all
              </button>
            </div>
            <DataTable
              columns={taskColumns}
              rows={recentTasks}
              empty={
                <div className="mt-empty-state">
                  <strong>No tasks yet</strong>
                  <p>Create a lesson or task to start tracking class progress.</p>
                </div>
              }
              renderCell={(row, column) => {
                if (column.key === "name") {
                  return (
                    <div>
                      <strong>{row.title}</strong>
                      <div className="dash-v2-subtle">{row.category || "General"} · {formatShortDate(row.due || row.createdAt)}</div>
                    </div>
                  );
                }
                if (column.key === "status") {
                  const status = taskStatus(row);
                  return <Badge tone={statusTone(status)}>{status}</Badge>;
                }
                if (column.key === "progress") {
                  const progress = taskProgress(row);
                  return (
                    <div className="dash-v2-progress-cell">
                      <ProgressBar value={progress} tone={progress >= 100 ? "success" : progress > 0 ? "pending" : "primary"} />
                      <span className="mt-data-num">{progress}%</span>
                    </div>
                  );
                }
                return null;
              }}
            />
          </article>

          <article className="mt-card-panel dash-home-card">
            <div className="mt-card-panel-header">
              <h3>Top students</h3>
              <button type="button" className="mt-card-panel-link" onClick={() => navigate("leaderboard")}>
                View all
              </button>
            </div>
            {topStudents.length ? (
              <ol className="dash-home-top-list" aria-label="Top students by reward points">
                {topStudents.map((student, index) => {
                  const name = `${student.first || ""} ${student.last || ""}`.trim() || "Student";
                  return (
                    <li className="dash-home-top-item" key={student.id}>
                      <span className={`dash-home-top-rank is-${index + 1}`}>{index + 1}</span>
                      <div className="dash-home-top-copy">
                        <strong>{name}</strong>
                        <span>{student.classLabel || "Class"}</span>
                      </div>
                      <em className="dash-home-top-points">{formatPoints(student.totalEarned || 0)}</em>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="mt-empty-state">
                <strong>No points awarded yet</strong>
                <p>Award points from Rewards to see top students here.</p>
              </div>
            )}
          </article>
        </section>
      </div>
    </div>
  );
}
