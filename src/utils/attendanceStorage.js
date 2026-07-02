export function attendanceKey(classId, date) {
  return `attendance_${classId}_${date}`;
}

export function loadAttendanceRecord(classId, date) {
  try {
    const raw = localStorage.getItem(attendanceKey(classId, date));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAttendanceRecord(classId, date, records) {
  localStorage.setItem(attendanceKey(classId, date), JSON.stringify(records));
}

export function getAllAttendanceKeys() {
  const keys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("attendance_")) keys.push(key);
  }
  return keys;
}

export function parseAttendanceKey(key) {
  const match = key.match(/^attendance_(.+)_(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  return { classId: match[1], date: match[2] };
}

export function getAllAttendanceRows() {
  return getAllAttendanceKeys().flatMap(key => {
    const parsed = parseAttendanceKey(key);
    if (!parsed) return [];
    try {
      const records = JSON.parse(localStorage.getItem(key)) || [];
      return records.map(record => ({
        ...record,
        classId: parsed.classId,
        date: parsed.date
      }));
    } catch {
      return [];
    }
  });
}

export const ATTENDANCE_STATUSES = [
  { value: "present", label: "Present", emoji: "✅" },
  { value: "late", label: "Late", emoji: "🕐" },
  { value: "absent", label: "Absent", emoji: "❌" },
  { value: "sick", label: "Sick", emoji: "🤒" },
  { value: "other", label: "Other", emoji: "📝" }
];
