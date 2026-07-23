import { useMemo, useRef, useState } from "react";
import PageChalkBanner from "../shared/PageChalkBanner";
import RosterTable from "./RosterTable";
import ReportCardEditor from "./ReportCardEditor";
import ReportCardPreview from "./ReportCardPreview";
import ExcelImportModal from "./ExcelImportModal";
import SendReportCardModal from "./SendReportCardModal";
import {
  assignRanks,
  buildBlankCard,
  currentSchoolYear,
  ensureClassRosterCards,
  getTemplateForSchool,
  hasCompleteScores,
  parentEmailForStudent,
  recomputeCard,
  resolveClassSections,
  upsertReportCards
} from "../../utils/reportCardsStorage";
import { downloadReportCardExcelTemplate, parseReportCardExcel } from "../../utils/reportCardExcel";
import { downloadReportCardPdf, downloadReportCardsZip } from "../../utils/reportCardPdf";
import { sendReportCardEmail, sendReportCardsBulk } from "../../utils/reportCardEmail";
import "./report-cards.css";

export default function ReportCardsPage({ db, setToast }) {
  const students = db.students || [];
  const schools = db.schools || [];
  const school = schools[0] || { id: "default", name: db.school || "MoneyTykes School" };
  const template = getTemplateForSchool(school.id, school);
  const classSections = useMemo(() => resolveClassSections(students, db), [students, db]);

  const [classId, setClassId] = useState(String(classSections[0]?.id || ""));
  const [term, setTerm] = useState(template.terms?.[0] || "1st Term");
  const [schoolYear, setSchoolYear] = useState(currentSchoolYear());
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importReview, setImportReview] = useState(null);
  const [sendState, setSendState] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const classSection = classSections.find(item => String(item.id) === String(classId)) || classSections[0];

  const rosterCards = useMemo(() => {
    if (!classSection) return [];
    return ensureClassRosterCards({
      students,
      classSection,
      schoolYear,
      term,
      template
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, classSection, schoolYear, term, template, tick]);

  const rows = useMemo(() => {
    return rosterCards
      .map(card => {
        const student = students.find(item => String(item.id) === String(card.studentId));
        return student ? { student, card } : null;
      })
      .filter(Boolean);
  }, [rosterCards, students]);

  const cardsByStudent = useMemo(() => {
    const map = {};
    rows.forEach(({ student, card }) => {
      map[String(student.id)] = card;
    });
    return map;
  }, [rows]);

  function refresh() {
    setTick(value => value + 1);
  }

  function persistRoster(nextCards, message) {
    const ranked = assignRanks(nextCards.map(recomputeCard));
    upsertReportCards(ranked);
    refresh();
    if (message) setToast?.(message);
  }

  function handleSaveEditor(card) {
    const saved = recomputeCard(card);
    const others = rosterCards.filter(item => String(item.id) !== String(card.id));
    persistRoster([...others, saved], "Report card saved");
    setEditing(null);
  }

  function handleGenerateAll() {
    const next = rosterCards.map(card => {
      const computed = recomputeCard(card);
      if (computed.status === "sent") return computed;
      if (!hasCompleteScores(computed) && computed.overallAvg == null) return computed;
      if (computed.status === "draft") return computed;
      return {
        ...computed,
        status: "generated",
        generatedAt: new Date().toISOString()
      };
    });
    persistRoster(next, "Generated report cards with complete scores");
  }

  async function handleExportAll() {
    const items = rows
      .filter(({ card }) => card.status === "generated" || card.status === "sent" || card.overallAvg != null)
      .map(({ student, card }) => ({
        student,
        reportCard: card,
        template,
        className: classSection?.name
      }));
    if (!items.length) {
      setToast?.("No report cards ready to export");
      return;
    }
    await downloadReportCardsZip(items);
    setToast?.("PDF zip downloaded");
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const review = parseReportCardExcel(buffer, { students: rows.map(row => row.student), template });
    setImportReview(review);
  }

  function commitImport() {
    if (!importReview?.matched?.length || !classSection) return;
    const next = [...rosterCards];
    importReview.matched.forEach(item => {
      const index = next.findIndex(card => String(card.studentId) === String(item.student.id));
      const base =
        index >= 0
          ? next[index]
          : buildBlankCard({ student: item.student, classSection, schoolYear, term, template });

      const subjects = (template.subjects || []).map(subjectDef => {
        const imported = item.subjects[subjectDef.name];
        if (!imported) {
          return (
            base.subjects.find(subject => subject.name === subjectDef.name) || {
              name: subjectDef.name,
              instructor: subjectDef.instructor || "",
              hours: subjectDef.hours || 0,
              termScores: (template.terms || []).map(() => null),
              avg: null
            }
          );
        }
        return {
          name: imported.name,
          instructor: imported.instructor || subjectDef.instructor || "",
          hours: imported.hours ?? subjectDef.hours ?? 0,
          termScores: imported.termScores,
          avg: null
        };
      });

      const card = recomputeCard({
        ...base,
        subjects,
        comments: item.comments || base.comments,
        attendance: { ...base.attendance, ...item.attendance },
        status: base.status === "sent" || base.status === "generated" ? base.status : "draft"
      });

      if (index >= 0) next[index] = card;
      else next.push(card);
    });

    persistRoster(next, "Excel import applied");
    setImportReview(null);
  }

  async function confirmSend() {
    if (!sendState) return;
    setBusy(true);
    try {
      if (sendState.mode === "single") {
        const { student, card } = sendState;
        if (card.status !== "generated" && card.status !== "sent") {
          setToast?.("Generate this report card before sending");
          return;
        }
        const result = await sendReportCardEmail({
          reportCard: card,
          student,
          parentEmail: parentEmailForStudent(student),
          schoolName: template.schoolName
        });
        if (!result.ok) {
          setToast?.(result.error);
          return;
        }
        setToast?.("Report card sent (simulated)");
      } else {
        const targets = rows
          .filter(({ student, card }) => {
            const sendable = card.status === "generated" || card.status === "sent";
            if (!sendable) return false;
            if (sendState.wholeClass) return true;
            return selectedIds.has(String(student.id));
          })
          .map(({ student, card }) => ({
            reportCard: card,
            student,
            parentEmail: parentEmailForStudent(student),
            schoolName: template.schoolName
          }));

        if (!targets.length) {
          setToast?.("Select generated report cards to send");
          return;
        }
        const results = await sendReportCardsBulk(targets);
        const failed = results.filter(item => !item.ok).length;
        setToast?.(failed ? `Sent with ${failed} issue(s)` : `Sent ${results.length} report card(s) (simulated)`);
      }
      refresh();
      setSendState(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="report-cards-page">
      <PageChalkBanner
        eyebrow="MAIN"
        title="Report Cards"
        subtitle="Enter scores, import from Excel, export PDFs, and simulate parent delivery."
      />

      <div className="rc-body">
        <div className="form-card rc-toolbar" data-tour="rc-toolbar">
          <label>
            Class
            <select value={String(classSection?.id || "")} onChange={event => setClassId(event.target.value)}>
              {classSections.map(section => (
                <option key={section.id} value={String(section.id)}>
                  {section.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Term
            <select value={term} onChange={event => setTerm(event.target.value)}>
              {(template.terms || []).map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            School year
            <input value={schoolYear} onChange={event => setSchoolYear(event.target.value)} />
          </label>
        </div>

        <div className="rc-actions" data-tour="rc-actions">
          <button
            type="button"
            className="btn"
            title="Download a spreadsheet pre-filled with your class roster and subjects — fill in Term scores, then re-import it."
            data-tour="rc-excel-download"
            onClick={() =>
              downloadReportCardExcelTemplate({
                students: rows.map(row => row.student),
                template,
                schoolYear,
                term,
                className: classSection?.name
              })
            }
          >
            Download Excel Template
          </button>
          <button
            type="button"
            className="btn"
            title="Upload a filled-in spreadsheet to bulk-update grades for this class."
            data-tour="rc-excel-import"
            onClick={() => fileRef.current?.click()}
          >
            Import Excel
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={handleImportFile} />
          <button
            type="button"
            className="btn"
            title="Lock in report cards for every student whose grades are complete, making them ready to export or send. Doesn't change any scores."
            data-tour="rc-generate"
            onClick={handleGenerateAll}
          >
            Generate All
          </button>
          <button
            type="button"
            className="btn"
            title="Download PDF report cards for the whole class in one file."
            data-tour="rc-export-pdf"
            onClick={handleExportAll}
          >
            Export All PDF
          </button>
          <button
            type="button"
            className="btn primary-gold"
            title="Email report cards to parents — choose the whole class or specific students. Simulated until a real email service is connected."
            data-tour="rc-send"
            onClick={() => setSendState({ mode: "bulk", wholeClass: true })}
          >
            Send Report Cards
          </button>
        </div>

        {editing ? (
          <ReportCardEditor
            card={editing.card}
            student={editing.student}
            template={template}
            teachers={(db.teachers || []).filter(
              teacher => !school?.id || String(teacher.schoolId) === String(school.id)
            )}
            onChange={card => setEditing({ ...editing, card })}
            onSave={handleSaveEditor}
            onCancel={() => setEditing(null)}
          />
        ) : null}

        {preview ? (
          <div className="form-card rc-preview-panel">
            <div className="rc-preview-panel-head">
              <h2>Preview</h2>
              <button type="button" className="btn" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
            <ReportCardPreview
              reportCard={preview.card}
              student={preview.student}
              template={template}
              className={classSection?.name}
            />
          </div>
        ) : null}

        <div className="form-card rc-roster-card" data-tour="rc-roster">
          <RosterTable
            rows={rows}
            selectable
            selectedIds={selectedIds}
            onToggleSelect={id => {
              setSelectedIds(current => {
                const next = new Set(current);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
            onToggleSelectAll={checked => {
              if (!checked) {
                setSelectedIds(new Set());
                return;
              }
              setSelectedIds(
                new Set(
                  rows
                    .filter(({ card }) => card.status === "generated" || card.status === "sent")
                    .map(({ student }) => String(student.id))
                )
              );
            }}
            onEdit={(student, card) => setEditing({ student, card: { ...card } })}
            onPreview={(student, card) => setPreview({ student, card })}
            onExportPdf={(student, card) => {
              downloadReportCardPdf({
                reportCard: card,
                student,
                template,
                className: classSection?.name
              });
              setToast?.("PDF downloaded");
            }}
            onSend={(student, card) => setSendState({ mode: "single", student, card })}
          />
        </div>
      </div>

      <ExcelImportModal
        open={Boolean(importReview)}
        review={importReview}
        onCancel={() => setImportReview(null)}
        onCommit={commitImport}
      />

      <SendReportCardModal
        open={Boolean(sendState)}
        mode={sendState?.mode || "single"}
        student={sendState?.student}
        reportCard={sendState?.card}
        students={rows.map(row => row.student)}
        cardsByStudent={cardsByStudent}
        selectedIds={selectedIds}
        onChangeSelected={id => {
          setSelectedIds(current => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        }}
        wholeClass={Boolean(sendState?.wholeClass)}
        onChangeWholeClass={value => setSendState(current => ({ ...current, wholeClass: value }))}
        schoolName={template.schoolName}
        onCancel={() => setSendState(null)}
        onConfirm={confirmSend}
        busy={busy}
      />
    </div>
  );
}
