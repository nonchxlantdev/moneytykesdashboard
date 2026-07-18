import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
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
 * Dashboard home — welcome, status, tasks, top students chart.
 * Events, quick actions, and daily tip live in EventsRail.
 */
export default function DashboardPage({ dashboard, db, navigate }) {
  const teacherLast = db.teacher?.last || "Young";
  const teacherName = `Ms. ${teacherLast}`;
  const className = db.className || "Class";
  const classId = slugClass(className) || "class";
  const teacherId = db.teacher?.id || db.teacher?.email || teacherLast;

  const attendance = useMemo(() => {
    const classId = slugClass(className);
    const records = loadAttendanceRecord(classId, todayIso()) || [];
    const studentCount = dashboard.studentCount || db.students.length || 0;
    if (!records.length) {
      return { present: studentCount, rate: studentCount ? 100 : 0 };
    }
    const present = records.filter(row => row.status === "present" || row.status === "late").length;
    return {
      present,
      rate: studentCount ? Math.round((present / studentCount) * 100) : 0
    };
  }, [className, dashboard.studentCount, db.students.length]);

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

  const leaderboard = (dashboard.leaderboard || []).slice(0, 6);

  const chartData = useMemo(
    () =>
      leaderboard.map(student => ({
        name: student.first || "Student",
        points: Number(student.totalEarned || 0),
        fullName: `${student.first || ""} ${student.last || ""}`.trim()
      })),
    [leaderboard]
  );

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
            {chartData.length ? (
              <div className="dash-home-chart" aria-label="Top students by reward points">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(10, 171, 181, 0.12)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#5a6b68", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#8a9693", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(10, 171, 181, 0.06)" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(28, 43, 42, 0.08)",
                        fontSize: 13
                      }}
                      formatter={(value) => [formatPoints(value), "Points"]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                    />
                    <Bar dataKey="points" fill="#0aabb5" radius={[10, 10, 4, 4]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
