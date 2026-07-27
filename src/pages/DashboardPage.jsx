import { useMemo } from "react";
import Badge from "../components/Badge";
import DataTable from "../components/ui/DataTable";
import ProgressBar from "../components/ui/ProgressBar";
import SegmentedProgress from "../components/ui/SegmentedProgress";
import ChalkboardHeader from "../components/ChalkboardHeader/ChalkboardHeader";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { loadAttendanceRecord } from "../utils/attendanceStorage";
import { loadCreatedLessons } from "../utils/lessonsStorage";
import { MY_DAY_TASKS_KEY } from "../utils/myDayStorage";
import { formatPoints } from "../utils/points";
import { getPointsLogCount } from "../utils/rewardsStorage";
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
  if (normalized === "published" || normalized === "completed" || normalized === "done" || normalized === "active") {
    return "success";
  }
  if (normalized === "draft" || normalized === "inactive") return "inactive";
  if (normalized === "pending" || normalized === "in progress" || normalized === "to do") return "pending";
  return "info";
}

function taskProgress(task) {
  if (task.done) return 100;
  const completed = Number(task.completed || 0);
  if (completed >= 100) return 100;
  if (completed > 0) return completed;
  return 0;
}

function taskStatus(task) {
  if (task.done || taskProgress(task) >= 100) return "Completed";
  if (taskProgress(task) > 0) return "In progress";
  return "To do";
}

/**
 * Dashboard home — welcome, status, My Day tasks, top students list.
 * Events, quick actions, and daily tip live in EventsRail.
 */
export default function DashboardPage({ dashboard, db, navigate }) {
  const teacherFirst = String(db.teacher?.first || "").trim();
  const teacherLast = String(db.teacher?.last || "").trim();
  const displayName = teacherFirst || teacherLast || "Teacher";
  const gender = String(db.teacher?.gender || "").toLowerCase();
  const honorific = gender === "male" ? "Mr." : gender === "female" ? "Ms." : "";
  const teacherName = honorific ? `${honorific} ${displayName}` : displayName;
  const className = db.className || "Class";
  const classId = slugClass(className) || "class";
  const teacherId = db.teacher?.id || db.teacher?.email || displayName;

  const [myDayTasks] = useLocalStorage(MY_DAY_TASKS_KEY, []);

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
      rate: total ? Math.round((done / total) * 100) : 0
    };
  }, []);

  const rewardsIssued = useMemo(() => {
    return (db.students || []).reduce((sum, student) => sum + getPointsLogCount(student.id), 0);
  }, [db.students]);

  const recentTasks = useMemo(() => {
    return [...(myDayTasks || [])]
      .filter(task => String(task.teacherId) === String(teacherId))
      .sort((a, b) => {
        if (Boolean(a.done) !== Boolean(b.done)) return a.done ? 1 : -1;
        return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      })
      .slice(0, 5)
      .map(task => ({
        ...task,
        title: task.text || task.title || "Task",
        category: "My Day"
      }));
  }, [myDayTasks, teacherId]);

  const myDayStats = useMemo(() => {
    const mine = (myDayTasks || []).filter(task => String(task.teacherId) === String(teacherId));
    const doneCount = mine.filter(task => task.done).length;
    return {
      total: mine.length,
      doneCount,
      rate: mine.length ? Math.round((doneCount / mine.length) * 100) : 0
    };
  }, [myDayTasks, teacherId]);

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
      value: `${myDayStats.rate}%`,
      meta: `${myDayStats.doneCount} of ${myDayStats.total} My Day tasks`,
      tone: "rose",
      percent: myDayStats.rate
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
        <div data-tour="class-status">
          <SegmentedProgress title="This month's class status" segments={segments} />
        </div>

        <section className="dash-home-mid" data-tour="dash-mid">
          <article className="mt-card-panel dash-home-card">
            <div className="mt-card-panel-header">
              <h3>Recent tasks</h3>
              <button type="button" className="mt-card-panel-link" onClick={() => navigate("my-day")}>
                View all
              </button>
            </div>
            <DataTable
              columns={taskColumns}
              rows={recentTasks}
              empty={
                <div className="mt-empty-state">
                  <strong>No tasks yet</strong>
                  <p>Add tasks in My Day to track your classroom to-dos here.</p>
                </div>
              }
              renderCell={(row, column) => {
                if (column.key === "name") {
                  return (
                    <div>
                      <strong>{row.title}</strong>
                      <div className="dash-v2-subtle">{row.category || "My Day"} · {formatShortDate(row.createdAt)}</div>
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
              <button type="button" className="mt-card-panel-link" onClick={() => navigate("rewards")}>
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
