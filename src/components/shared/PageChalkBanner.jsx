import "./page-shell.css";

/**
 * Shared chalk banner for Students / Attendance / Add Student.
 * Uses --header-bg / --header-text so Soft Teal + Mint stays readable.
 */
export default function PageChalkBanner({
  eyebrow,
  title,
  lead,
  subtitle,
  controls = null,
  actions = null,
  tourId = "page-banner"
}) {
  const supporting = subtitle || lead;

  return (
    <header className="page-chalk" data-tour={tourId || undefined}>
      <div className="page-chalk-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {supporting ? <p className="page-chalk-lead">{supporting}</p> : null}
      </div>
      {(controls || actions) && (
        <div className="page-chalk-controls">
          {controls}
          {actions ? <div className="page-chalk-actions">{actions}</div> : null}
        </div>
      )}
    </header>
  );
}
