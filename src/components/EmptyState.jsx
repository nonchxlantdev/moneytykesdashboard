/**
 * Empty state placeholder for lists and panels.
 * @param {{ title: string, text?: string, icon?: React.ReactNode }} props
 */
export default function EmptyState({ title, text, icon }) {
  return (
    <div className="mt-empty-state">
      {icon && <span className="mt-empty-state-icon">{icon}</span>}
      <strong>{title}</strong>
      {text && <p>{text}</p>}
    </div>
  );
}
