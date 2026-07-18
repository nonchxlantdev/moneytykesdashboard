import "./page-chalk-loader.css";

/**
 * Full-bleed chalkboard hold while a page is actually loading.
 * Keep mounted only when `active` — pages that render sync should not use this.
 */
export default function PageChalkLoader({ active = false, label = "MoneyTykes" }) {
  if (!active) return null;

  return (
    <div className="page-chalk-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="page-chalk-loader-board">
        <div className="page-chalk-loader-spin" aria-hidden="true">
          <span className="page-chalk-loader-brand">{label}</span>
        </div>
        <p className="page-chalk-loader-caption">Loading…</p>
      </div>
    </div>
  );
}
