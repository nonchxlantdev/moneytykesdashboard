import { useState } from "react";
import { IconTrophy } from "@tabler/icons-react";
import { formatPoints } from "../../utils/points";
import { ICON_STROKE } from "../../config/navigation";

/**
 * @param {{ earners: Array, onNavigate: () => void }} props
 */
export default function LeaderboardCard({ earners, onNavigate }) {
  const [range, setRange] = useState("week");
  const top = earners.slice(0, 5);

  return (
    <article className="dash-card leaderboard-dash-card">
      <header className="dash-card-header">
        <div className="dash-card-title-wrap">
          <IconTrophy size={18} stroke={ICON_STROKE} />
          <h3 className="dash-card-title">Leaderboard</h3>
        </div>
        <select className="dash-card-select" value={range} onChange={event => setRange(event.target.value)} aria-label="Leaderboard range">
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="all">All Time</option>
        </select>
      </header>
      {top.length ? (
        <ol className="dash-leaderboard-list">
          {top.map((student, index) => (
            <li key={student.id} className="dash-list-item">
              <span className="dash-rank">{index + 1}</span>
              <span className="dash-avatar">{student.first?.[0]}{student.last?.[0]}</span>
              <span className="dash-list-name">{student.first} {student.last}</span>
              <strong className="dash-list-points">{formatPoints(student.totalEarned || 0)}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="dash-card-footnote">Award points to populate the leaderboard.</p>
      )}
      <button type="button" className="link-button dash-card-link" onClick={onNavigate}>View full leaderboard</button>
    </article>
  );
}
