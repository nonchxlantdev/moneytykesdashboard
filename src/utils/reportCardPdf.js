import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";

function plainCell(value) {
  return value == null || value === "" ? "—" : String(value);
}

function percentCell(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return `${num}%`;
}

/**
 * Build one PDF for a report card. Returns Blob.
 */
export function buildReportCardPdf({ reportCard, student, template, className }) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 48;

  const schoolName = template.schoolName || "School";
  const accent = template.accentColor || "#006d77";

  doc.setFillColor(accent);
  doc.rect(0, 0, pageWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(16, 22, 47);
  doc.text(schoolName, pageWidth / 2, y, { align: "center" });
  y += 18;

  if (template.motto) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(95, 111, 108);
    doc.text(String(template.motto), pageWidth / 2, y, { align: "center" });
    y += 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(16, 22, 47);
  doc.text("Student Report Card", pageWidth / 2, y, { align: "center" });
  y += 22;

  const studentName = `${student?.first || ""} ${student?.last || ""}`.trim() || "Student";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Student: ${studentName}`, margin, y);
  doc.text(`ID: ${student?.id ?? "—"}`, pageWidth / 2, y);
  y += 14;
  doc.text(`Class: ${className || "—"}`, margin, y);
  if (template.columns?.showRank !== false) {
    doc.text(`Rank: ${reportCard.rank == null ? "—" : reportCard.rank}`, pageWidth / 2, y);
  }
  y += 14;
  doc.text(`School Year: ${reportCard.schoolYear}`, margin, y);
  doc.text(`Term: ${reportCard.term_or_terms}`, pageWidth / 2, y);
  y += 10;

  const termHeaders = (template.terms || []).map((label, index) => label || `Term ${index + 1}`);
  const head = [["Subject", "Instructor"]];
  if (template.columns?.showHours !== false) head[0].push("Hours");
  head[0].push(...termHeaders, "Avg");

  const body = (reportCard.subjects || []).map(subject => {
    const row = [subject.name || "", subject.instructor || ""];
    if (template.columns?.showHours !== false) row.push(plainCell(subject.hours));
    (subject.termScores || []).forEach(score => row.push(percentCell(score)));
    while (row.length < head[0].length - 1) row.push("—");
    row.push(percentCell(subject.avg));
    return row;
  });

  autoTable(doc, {
    startY: y + 8,
    head,
    body,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: accent, textColor: 255 },
    margin: { left: margin, right: margin }
  });

  y = (doc.lastAutoTable?.finalY || y) + 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Overall Average: ${percentCell(reportCard.overallAvg)}`, margin, y);
  if (template.columns?.showRank !== false) {
    doc.text(`Rank: ${plainCell(reportCard.rank)}`, pageWidth / 2, y);
  }
  y += 18;

  const att = reportCard.attendance || {};
  const attBits = [];
  if (template.columns?.showAbsent !== false) attBits.push(`Absent: ${att.absent ?? 0}`);
  if (template.columns?.showTardy !== false) attBits.push(`Tardy: ${att.tardy ?? 0}`);
  if (template.columns?.showDemerits !== false) attBits.push(`Demerits: ${att.demerits ?? 0}`);
  if (template.columns?.showMerits !== false) attBits.push(`Merits: ${att.merits ?? 0}`);
  if (template.columns?.showProbation !== false) attBits.push(`Probation: ${att.probation || "—"}`);

  if (attBits.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(attBits.join("   |   "), margin, y);
    y += 18;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Comments", margin, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const comments = doc.splitTextToSize(reportCard.comments || "—", pageWidth - margin * 2);
  doc.text(comments, margin, y);
  y += comments.length * 12 + 28;

  const labels = template.signatureLabels || ["Homeroom Teacher", "Principal"];
  const colW = (pageWidth - margin * 2) / Math.max(labels.length, 1);
  labels.forEach((label, index) => {
    const x = margin + index * colW;
    doc.setDrawColor(180);
    doc.line(x, y, x + colW - 24, y);
    doc.setFontSize(8);
    doc.text(String(label), x, y + 12);
  });

  return doc.output("blob");
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadReportCardPdf(args) {
  const blob = buildReportCardPdf(args);
  const name = `${args.student?.last || "student"}-${args.reportCard.term_or_terms}-report-card.pdf`.replace(/\s+/g, "-");
  downloadBlob(blob, name);
}

export async function downloadReportCardsZip(items) {
  const zip = new JSZip();
  items.forEach(({ reportCard, student, template, className }) => {
    const blob = buildReportCardPdf({ reportCard, student, template, className });
    const filename = `${student?.last || "student"}-${student?.first || ""}-${reportCard.term_or_terms}.pdf`.replace(/\s+/g, "-");
    zip.file(filename, blob);
  });
  const out = await zip.generateAsync({ type: "blob" });
  downloadBlob(out, `report-cards-${items[0]?.reportCard?.schoolYear || "year"}.zip`);
}
