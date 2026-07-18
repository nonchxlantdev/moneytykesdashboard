/**
 * Empty state for lists/tables.
 * @param {{
 *   title: string,
 *   text?: string,
 *   icon?: React.ReactNode,
 *   action?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function EmptyState({ title, text, icon, action, className = "" }) {
  return (
    <div className={`mt-empty-state ${className}`.trim()}>
      {icon ? <span className="mt-empty-state-icon">{icon}</span> : null}
      <strong>{title}</strong>
      {text ? <p>{text}</p> : null}
      {action || null}
    </div>
  );
}
