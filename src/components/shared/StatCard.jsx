import "./stat-card.css";

/**
 * Shared summary stat card (Students, Lessons, …).
 * @param {{
 *   label: string,
 *   value: React.ReactNode,
 *   foot?: string,
 *   icon?: React.ComponentType<{ size?: number, strokeWidth?: number }>,
 *   tone?: string
 * }} props
 */
export default function StatCard({ label, value, foot, icon: Icon, tone }) {
  return (
    <div className={`stat-card ${tone || ""}`.trim()}>
      <div className="stat-icon" aria-hidden="true">
        {Icon ? <Icon size={18} strokeWidth={2} /> : null}
      </div>
      <div className="stat-copy">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {foot ? <div className="stat-foot">{foot}</div> : null}
      </div>
    </div>
  );
}
