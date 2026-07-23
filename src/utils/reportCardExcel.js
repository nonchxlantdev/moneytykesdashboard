import * as XLSX from "xlsx";
import { clampPercent } from "./reportCardScores";

/**
 * Long/normalized Excel template: one row per student × subject.
 */
export function downloadReportCardExcelTemplate({ students, template, schoolYear, term, className }) {
  const terms = template.terms || [];
  const header = [
    "Student ID",
    "Student Name",
    "Subject",
    "Instructor",
    "Hours",
    ...terms.map((_, index) => `Term ${index + 1}`),
    "Comments",
    "Absent",
    "Tardy",
    "Demerits",
    "Merits",
    "Probation"
  ];

  const rows = [];
  students.forEach(student => {
    const name = `${student.first || ""} ${student.last || ""}`.trim();
    (template.subjects || []).forEach(subject => {
      rows.push([
        student.id,
        name,
        subject.name,
        subject.instructor || "",
        subject.hours ?? "",
        ...terms.map(() => ""),
        "",
        "",
        "",
        "",
        "",
        ""
      ]);
    });
  });

  const sheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Report Cards");
  const filename = `report-card-template-${String(className || "class").replace(/\s+/g, "-")}-${schoolYear}-${term}.xlsx`;
  XLSX.writeFile(book, filename);
}

export function parseReportCardExcel(fileBuffer, { students, template }) {
  const book = XLSX.read(fileBuffer, { type: "array" });
  const sheet = book.Sheets[book.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const terms = template.terms || [];

  const byId = new Map(students.map(student => [String(student.id), student]));
  const byName = new Map(
    students.map(student => [`${student.first || ""} ${student.last || ""}`.trim().toLowerCase(), student])
  );

  const matched = new Map();
  const failed = [];

  rows.forEach((row, index) => {
    const studentId = String(row["Student ID"] ?? row["StudentId"] ?? "").trim();
    const studentName = String(row["Student Name"] ?? row["StudentName"] ?? "").trim();
    let student = studentId ? byId.get(studentId) : null;
    if (!student && studentName) student = byName.get(studentName.toLowerCase()) || null;

    if (!student) {
      failed.push({ row: index + 2, studentId, studentName, reason: "No matching student" });
      return;
    }

    const subjectName = String(row.Subject || "").trim();
    if (!subjectName) {
      failed.push({ row: index + 2, studentId, studentName, reason: "Missing subject" });
      return;
    }

    if (!matched.has(String(student.id))) {
      matched.set(String(student.id), {
        student,
        subjects: {},
        comments: "",
        attendance: { absent: 0, tardy: 0, demerits: 0, merits: 0, probation: "" }
      });
    }

    const entry = matched.get(String(student.id));
    const termScores = terms.map((_, i) => {
      const raw = row[`Term ${i + 1}`];
      if (raw === "" || raw == null) return null;
      const cleaned = String(raw).replace(/%/g, "").trim();
      return clampPercent(cleaned);
    });

    entry.subjects[subjectName] = {
      name: subjectName,
      instructor: String(row.Instructor || ""),
      hours: Number(row.Hours) || 0,
      termScores
    };

    if (row.Comments) entry.comments = String(row.Comments);
    if (row.Absent !== "") entry.attendance.absent = Number(row.Absent) || 0;
    if (row.Tardy !== "") entry.attendance.tardy = Number(row.Tardy) || 0;
    if (row.Demerits !== "") entry.attendance.demerits = Number(row.Demerits) || 0;
    if (row.Merits !== "") entry.attendance.merits = Number(row.Merits) || 0;
    if (row.Probation !== "") entry.attendance.probation = String(row.Probation);
  });

  return {
    matched: Array.from(matched.values()),
    failed
  };
}
