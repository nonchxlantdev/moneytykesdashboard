import "./page-shell.css";

/** Shared dashed empty-state shell — copy and actions vary by page. */
export default function EmptyBox({ title, description, actions = null }) {
  return (
    <div className="empty-box">
      <div className="t">{title}</div>
      {description ? <div className="d">{description}</div> : null}
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}
