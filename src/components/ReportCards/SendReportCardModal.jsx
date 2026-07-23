import { parentEmailForStudent } from "../../utils/reportCardsStorage";

export default function SendReportCardModal({
  open,
  mode = "single",
  student,
  reportCard,
  students = [],
  cardsByStudent = {},
  selectedIds,
  onChangeSelected,
  wholeClass,
  onChangeWholeClass,
  schoolName,
  onCancel,
  onConfirm,
  busy
}) {
  if (!open) return null;

  const singleEmail = parentEmailForStudent(student);
  const sendable = students.filter(item => {
    const card = cardsByStudent[String(item.id)];
    return card && (card.status === "generated" || card.status === "sent");
  });

  return (
    <div className="rc-modal-backdrop" role="presentation" onClick={event => event.target === event.currentTarget && onCancel?.()}>
      <div className="rc-modal" role="dialog" aria-modal="true" aria-labelledby="rc-send-title">
        <h3 id="rc-send-title">{mode === "bulk" ? "Send report cards" : "Send report card"}</h3>

        {mode === "single" ? (
          <>
            <p>
              Simulate sending <strong>{student?.first} {student?.last}</strong>&apos;s report card to the parent/guardian email
              on file.
            </p>
            <p className="rc-send-email">
              <strong>To:</strong> {singleEmail || "No email on file"}
            </p>
            <p className="rc-send-preview">
              Dear Parent/Guardian, please find the report card for {student?.first} ({reportCard?.term_or_terms},{" "}
              {reportCard?.schoolYear}) from {schoolName || "your school"}. This is a simulated send.
            </p>
            {!singleEmail ? <p className="rc-warn">Add a guardian email on the student profile before sending.</p> : null}
            {reportCard && reportCard.status !== "generated" && reportCard.status !== "sent" ? (
              <p className="rc-warn">Generate this report card before sending.</p>
            ) : null}
          </>
        ) : (
          <>
            <p>Choose who should receive a simulated report card email.</p>
            <label className="rc-radio">
              <input type="radio" checked={wholeClass} onChange={() => onChangeWholeClass(true)} />
              Whole class (sendable students only)
            </label>
            <label className="rc-radio">
              <input type="radio" checked={!wholeClass} onChange={() => onChangeWholeClass(false)} />
              Select specific students
            </label>
            {!wholeClass ? (
              <ul className="rc-send-checklist">
                {sendable.map(item => (
                  <li key={item.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(String(item.id))}
                        onChange={() => onChangeSelected(String(item.id))}
                      />
                      {item.first} {item.last}
                      <span className="rc-muted">{parentEmailForStudent(item) || "no email"}</span>
                    </label>
                  </li>
                ))}
                {!sendable.length ? <li className="rc-warn">No generated report cards yet.</li> : null}
              </ul>
            ) : (
              <p className="rc-muted">{sendable.length} student(s) ready to send.</p>
            )}
          </>
        )}

        <div className="rc-modal-actions">
          <button type="button" className="btn" title="Close without sending" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn primary-gold"
            title="Simulate email delivery and mark report card(s) as Sent"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Sending…" : "Simulate Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
