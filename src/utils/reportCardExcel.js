import { clampPercent } from "./reportCardScores";

function triggerXlsxDownload(buffer, filename) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Long/normalized Excel template: one row per student × subject.
 * Column layout matches the previous xlsx export for teacher compatibility.
 * exceljs is loaded on demand so the login shell does not pull Node-ish deps at boot.
 */
export async function downloadReportCardExcelTemplate({ students, template, schoolYear, term, className }) {
  const ExcelJS = (await import("exceljs")).default;
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

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report Cards");
  sheet.addRow(header);

  students.forEach(student => {
    const name = `${student.first || ""} ${student.last || ""}`.trim();
    (template.subjects || []).forEach(subject => {
      sheet.addRow([
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

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `report-card-template-${String(className || "class").replace(/\s+/g, "-")}-${schoolYear}-${term}.xlsx`;
  triggerXlsxDownload(buffer, filename);
}

function sheetRowsToObjects(sheet) {
  const values = sheet.getSheetValues();
  // exceljs getSheetValues is 1-indexed; index 0 is empty
  const dataRows = values.slice(1).filter(row => row && row.length);
  if (!dataRows.length) return [];
  const headerCells = dataRows[0];
  const headers = [];
  for (let i = 1; i < headerCells.length; i += 1) {
    headers[i] = String(headerCells[i] ?? "").trim();
  }
  return dataRows.slice(1).map(row => {
    const obj = {};
    for (let i = 1; i < headers.length; i += 1) {
      const key = headers[i];
      if (!key) continue;
      const cell = row[i];
      obj[key] = cell == null ? "" : cell;
    }
    return obj;
  });
}

export async function parseReportCardExcel(fileBuffer, { students, template }) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  const sheet = workbook.worksheets[0];
  const rows = sheet ? sheetRowsToObjects(sheet) : [];
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
