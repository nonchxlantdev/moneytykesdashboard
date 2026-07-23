export default function ExcelImportModal({ open, review, onCancel, onCommit }) {
  if (!open) return null;

  return (
    <div className="rc-modal-backdrop" role="presentation" onClick={event => event.target === event.currentTarget && onCancel?.()}>
      <div className="rc-modal" role="dialog" aria-modal="true" aria-labelledby="rc-import-title">
        <h3 id="rc-import-title">Review Excel import</h3>
        <p>
          Matched <strong>{review?.matched?.length || 0}</strong> student(s).{" "}
          {review?.failed?.length ? (
            <>
              <strong>{review.failed.length}</strong> row(s) could not be matched.
            </>
          ) : (
            "All rows matched."
          )}
        </p>

        {review?.matched?.length ? (
          <ul className="rc-import-list">
            {review.matched.map(item => (
              <li key={item.student.id}>
                {item.student.first} {item.student.last} — {Object.keys(item.subjects).length} subject row(s)
              </li>
            ))}
          </ul>
        ) : null}

        {review?.failed?.length ? (
          <div className="rc-import-failed">
            <strong>Unmatched rows</strong>
            <ul>
              {review.failed.slice(0, 8).map(item => (
                <li key={`${item.row}-${item.studentName}`}>
                  Row {item.row}: {item.studentName || item.studentId || "—"} — {item.reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rc-modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn primary-gold" onClick={onCommit} disabled={!review?.matched?.length}>
            Commit import
          </button>
        </div>
      </div>
    </div>
  );
}
