import { useMemo, useState } from "react";
import { getAllAttendanceRows } from "../../utils/attendanceStorage";

function slugClass(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function attendancePctForStudent(studentId, rows) {
  const mine = rows.filter(row => String(row.studentId) === String(studentId));
  if (!mine.length) return 100;
  const presentish = mine.filter(row => row.status === "present" || row.status === "late").length;
  return Math.round((presentish / mine.length) * 100);
}

const AVATAR_PALETTE = [
  "var(--icon-accent)",
  "color-mix(in srgb, var(--icon-accent) 70%, var(--gold-accent))",
  "color-mix(in srgb, var(--sidebar-active-bg) 75%, var(--icon-accent))",
  "color-mix(in srgb, var(--icon-accent) 55%, #1c2b2a)",
  "color-mix(in srgb, var(--gold-accent) 55%, var(--icon-accent))"
];

/**
 * Maps raw db students into roster models + class-level stats.
 * Stats are always derived from the same students array as the table.
 */
export default function useStudents(dbStudents = [], classFilter = "all") {
  const [loading] = useState(false);

  const attendanceRows = useMemo(() => getAllAttendanceRows(), [dbStudents]);

  const classOptions = useMemo(() => {
    const labels = [...new Set(dbStudents.map(student => student.classLabel).filter(Boolean))];
    return labels.sort((a, b) => a.localeCompare(b));
  }, [dbStudents]);

  const students = useMemo(() => {
    if (!classFilter) return [];

    const scoped = dbStudents.filter(student => student.classLabel === classFilter);

    return scoped.map((student, index) => {
      const name = `${student.first || ""} ${student.last || ""}`.trim() || "Student";
      return {
        ...student,
        name,
        points: Number(student.balance || student.totalEarned || 0),
        attendancePct: attendancePctForStudent(student.id, attendanceRows),
        avatarColor: student.avatarColor || AVATAR_PALETTE[index % AVATAR_PALETTE.length],
        classSlug: slugClass(student.classLabel || "class")
      };
    });
  }, [attendanceRows, classFilter, dbStudents]);

  const stats = useMemo(
    () => ({
      total: String(students.length),
      avgAttendance: average(students.map(student => student.attendancePct)),
      totalPoints: sum(students.map(student => student.points))
    }),
    [students]
  );

  return { students, loading, stats, classOptions };
}
