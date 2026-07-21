import CoinSpinner from "./CoinSpinner";
import "./page-chalk-loader.css";

/**
 * Full-bleed chalkboard hold while a page is actually loading.
 * Keep mounted only when `active` — pages that render sync should not use this.
 */
export default function PageChalkLoader({ active = false, label = "Loading…" }) {
  if (!active) return null;

  return (
    <div className="page-chalk-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="page-chalk-loader-board">
        <CoinSpinner size={88} label={label} />
        <p className="page-chalk-loader-caption">{label}</p>
      </div>
    </div>
  );
}
