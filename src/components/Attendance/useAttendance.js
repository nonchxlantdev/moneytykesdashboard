import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllAttendanceRows,
  loadAttendanceRecord,
  saveAttendanceRecord
} from "../../utils/attendanceStorage";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function slugClass(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const AVATAR_PALETTE = [
  "var(--icon-accent)",
  "color-mix(in srgb, var(--icon-accent) 70%, var(--gold-accent))",
  "color-mix(in srgb, var(--sidebar-active-bg) 75%, var(--icon-accent))",
  "color-mix(in srgb, var(--icon-accent) 55%, #1c2b2a)",
  "color-mix(in srgb, var(--gold-accent) 55%, var(--icon-accent))"
];

export default function useAttendance(db) {
  const classes = useMemo(() => {
    const labels = new Set(
      [db.className, ...(db.students || []).map(student => student.classLabel)].filter(Boolean)
    );
    return [...labels].map(label => ({ id: slugClass(label), name: label, label }));
  }, [db.className, db.students]);

  const [mode, setMode] = useState("take");
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [reportClassId, setReportClassId] = useState("");
  const [reportStart, setReportStart] = useState(today);
  const [reportEnd, setReportEnd] = useState(today);
  const [reportStudent, setReportStudent] = useState("");

  const selectedClass = classes.find(item => item.id === classId) || null;

  // Default to the teacher's class (or first available) so roll call isn't empty
  // when the dashboard already shows students.
  useEffect(() => {
    if (classId || !classes.length) return;
    const preferred = classes.find(item => item.label === db.className || item.name === db.className);
    setClassId(preferred?.id || classes[0].id);
  }, [classId, classes, db.className]);

  const students = useMemo(() => {
    if (!selectedClass) return [];
    return (db.students || [])
      .filter(student => slugClass(student.classLabel || db.className) === selectedClass.id)
      .map((student, index) => ({
        ...student,
        name: `${student.first || ""} ${student.last || ""}`.trim() || "Student",
        avatarColor: student.avatarColor || AVATAR_PALETTE[index % AVATAR_PALETTE.length]
      }));
  }, [db.className, db.students, selectedClass]);

  const existingRecord = selectedClass ? loadAttendanceRecord(selectedClass.id, date) : null;
  const recordExists = Boolean(existingRecord?.length) && !editMode;

  useEffect(() => {
    if (!selectedClass) {
      setAttendance({});
      return;
    }
    const record = loadAttendanceRecord(selectedClass.id, date);
    const next = {};
    students.forEach(student => {
      const saved = record?.find(item => String(item.studentId) === String(student.id));
      next[student.id] = saved?.status || "present";
    });
    setAttendance(next);
  }, [date, editMode, selectedClass, students]);

  const presentCount = useMemo(
    () => Object.values(attendance).filter(status => status === "present").length,
    [attendance]
  );

  const setStatus = useCallback((studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  }, []);

  const markAllPresent = useCallback(() => {
    setAttendance(Object.fromEntries(students.map(student => [student.id, "present"])));
  }, [students]);

  const save = useCallback(
    setToast => {
      if (!selectedClass) return;
      if (recordExists) {
        setToast?.("Attendance already saved for this class and date. Switch to Edit mode.");
        return;
      }
      const records = students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        status: attendance[student.id] || "present",
        note: "",
        timestamp: new Date().toISOString()
      }));
      saveAttendanceRecord(selectedClass.id, date, records);
      setEditMode(false);
      setToast?.("Attendance saved.");
    },
    [attendance, date, recordExists, selectedClass, students]
  );

  const reportRows = useMemo(() => {
    return getAllAttendanceRows().filter(row => {
      const matchesClass = !reportClassId || row.classId === reportClassId;
      const matchesDate = row.date >= reportStart && row.date <= reportEnd;
      const matchesStudent =
        !reportStudent || row.studentName.toLowerCase().includes(reportStudent.toLowerCase());
      return matchesClass && matchesDate && matchesStudent;
    });
  }, [reportClassId, reportEnd, reportStart, reportStudent]);

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

  return {
    mode,
    setMode,
    classes,
    classId: selectedClass?.id || classId || "",
    setClassId: next => {
      setClassId(next);
      setEditMode(false);
    },
    date,
    setDate: next => {
      setDate(next);
      setEditMode(false);
    },
    students,
    attendance,
    setStatus,
    markAllPresent,
    presentCount,
    recordExists,
    startEdit: () => setEditMode(true),
    save,
    selectedClass,
    reportClassId,
    setReportClassId,
    reportStart,
    setReportStart,
    reportEnd,
    setReportEnd,
    reportStudent,
    setReportStudent,
    reportRows,
    reportSummary
  };
}
