import { formatPercent } from "../../utils/reportCardScores";
import { statusLabel } from "../../utils/reportCardsStorage";
import RowOverflowMenu from "../Rewards/RowOverflowMenu";

const STATUS_TIPS = {
  draft: "Missing one or more scores",
  ready: "All scores entered, not yet generated",
  generated: "Finalized — ready to export or send",
  sent: "Report card was sent (simulated)"
};

function statusTooltip(card) {
  if (card.status === "sent" && card.sentAt) {
    const when = new Date(card.sentAt);
    const label = Number.isNaN(when.getTime()) ? card.sentAt : when.toLocaleString();
    return `Report card was sent (simulated) on ${label}`;
  }
  return STATUS_TIPS[card.status] || STATUS_TIPS.draft;
}

export default function RosterTable({
  rows,
  onEdit,
  onPreview,
  onExportPdf,
  onSend,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  selectable
}) {
  if (!rows.length) {
    return (
      <div className="rc-empty">
        <strong>No students in this class</strong>
        <p>Add students with this class label, or pick another class.</p>
      </div>
    );
  }

  const sendableRows = rows.filter(({ card }) => card.status === "generated" || card.status === "sent");
  const allSelected = sendableRows.length > 0 && sendableRows.every(({ student }) => selectedIds.has(String(student.id)));
  const someSelected = sendableRows.some(({ student }) => selectedIds.has(String(student.id)));

  return (
    <div className="rc-roster-wrap">
      <table className="rc-roster">
        <thead>
          <tr>
            {selectable ? (
              <th className="rc-check-col">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={node => {
                    if (node) node.indeterminate = someSelected && !allSelected;
                  }}
                  disabled={!sendableRows.length}
                  onChange={event => onToggleSelectAll?.(event.target.checked)}
                  title="Select all generated or sent report cards for bulk send"
                  aria-label="Select all sendable report cards"
                />
              </th>
            ) : null}
            <th>Student</th>
            <th>Overall avg</th>
            <th>Rank</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ student, card }) => {
            const name = `${student.first || ""} ${student.last || ""}`.trim();
            const canSelect = card.status === "generated" || card.status === "sent";
            return (
              <tr key={student.id}>
                {selectable ? (
                  <td className="rc-check-col">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(String(student.id))}
                      disabled={!canSelect}
                      onChange={() => onToggleSelect(String(student.id))}
                      title={canSelect ? `Include ${name} in bulk send` : "Generate this report card before selecting"}
                      aria-label={`Select ${name}`}
                    />
                  </td>
                ) : null}
                <td>
                  <strong>{name}</strong>
                </td>
                <td>{formatPercent(card.overallAvg)}</td>
                <td>{card.rank == null ? "—" : card.rank}</td>
                <td>
                  <span className={`rc-status rc-status-${card.status}`} title={statusTooltip(card)}>
                    {statusLabel(card.status)}
                  </span>
                </td>
                <td>
                  <RowOverflowMenu
                    items={[
                      {
                        label: "Edit",
                        title: "Open the grade entry form for this student — adjust scores after import here too",
                        onClick: () => onEdit(student, card)
                      },
                      {
                        label: "Preview",
                        title: "See how this student's report card will look before exporting or sending.",
                        onClick: () => onPreview(student, card)
                      },
                      {
                        label: "Export PDF",
                        title: "Download this student's report card as a PDF.",
                        onClick: () => onExportPdf(student, card)
                      },
                      {
                        label: "Send",
                        title:
                          "Email this student's report card to their parent/guardian. Simulated until a real email service is connected.",
                        onClick: () => onSend(student, card)
                      }
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
