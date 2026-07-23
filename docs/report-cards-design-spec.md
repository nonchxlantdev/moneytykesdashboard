# Report Cards — design spec

**Status:** design approved 2026-07-23; implemented in the teacher dashboard (localStorage prototype).

## Locked decisions

| Topic | Decision |
|-------|----------|
| Purpose | Financial-literacy / academic progress summary, structured like a school end-of-year report |
| Template | Close structural match to physical example (header, subjects × terms, totals, attendance/merits, comments, signatures) |
| Customization | Per-school under **Admin → Report Card Template** (not inside Report Cards) |
| Nav | **Main** group, after Calendar, with New badge |
| Entry | Manual editor + Excel long-format import/export |
| Instructor | Dropdown from Admin teachers (+ template names); add-new inline |
| Scores | Percent fields 0–100 with `%` display (editor, preview, PDF, import clamp) |
| Tooltips | Hover titles on toolbar, row actions, status badges, Admin column toggles |
| Export | Client-side PDF (`jspdf` + `jspdf-autotable`); bulk = zip of individual PDFs (`jszip`) |
| Send | Single row + bulk (whole class or selected); only `generated` / `sent`; simulated email |
| Classes | Class picker; sections derived from student `classLabel` (+ optional saved ClassSection records) |
| Archive | Generated/sent cards persist; history on student profile |
| Parent email | Reuses student contact email fields (`email` / guardian email aliases) |

## Status derivation

- **draft** — missing term scores  
- **ready** — all scores present, not yet generated  
- **generated** — locked for export/send  
- **sent** — simulated send completed (`ReportCardSendLog`)

## Data keys (localStorage)

- `mt.report_card.templates.v1`
- `mt.report_card.cards.v1`
- `mt.report_card.send_log.v1`
- `mt.report_card.class_sections.v1`

## Excel format

Long/normalized: one row per student × subject — `Student ID`, `Student Name`, `Subject`, `Instructor`, `Hours`, `Term 1…N`, attendance/comments columns.

## Out of scope (this pass)

- Real email delivery  
- Supabase wiring  
- Drag-and-drop template layout builder  

## Key implementation files

- `src/config/navigation.js`
- `src/pages/ReportCardsPage.jsx` → `src/components/ReportCards/*`
- `src/components/admin/ReportCardTemplateSettings.jsx`
- `src/utils/reportCardsStorage.js`, `reportCardExcel.js`, `reportCardPdf.js`, `reportCardEmail.js`
