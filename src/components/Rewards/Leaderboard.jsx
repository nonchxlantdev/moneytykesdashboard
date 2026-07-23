import StudentAvatar from "./StudentAvatar";
import { studentDisplayName } from "./rewardsUtils";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ students = [], timeframe, onTimeframeChange, onSelectStudent }) {
  const sorted = [...students].sort((a, b) => {
    const diff = (b.points || 0) - (a.points || 0);
    if (diff !== 0) return diff;
    return studentDisplayName(a).localeCompare(studentDisplayName(b));
  });
  const maxPoints = sorted[0]?.points || 1;

  return (
    <section className="rw-card rw-leaderboard" data-tour="rewards-leaderboard">
      <div className="rw-card-head">
        <h2>Leaderboard</h2>
        <div className="rw-range-toggle" role="group" aria-label="Leaderboard timeframe">
          <button
            type="button"
            className={timeframe === "week" ? "active" : ""}
            onClick={() => onTimeframeChange?.("week")}
          >
            This Week
          </button>
          <button
            type="button"
            className={timeframe === "month" ? "active" : ""}
            onClick={() => onTimeframeChange?.("month")}
          >
            This Month
          </button>
        </div>
      </div>

      {sorted.length ? (
        <div className="rw-lb-list">
          {sorted.map((student, index) => (
            <button
              key={student.id}
              type="button"
              className="rw-lb-row"
              onClick={() => onSelectStudent?.(student)}
            >
              <span className={`rw-lb-rank ${index < 3 ? "medal" : ""}`}>
                {index < 3 ? MEDALS[index] : index + 1}
              </span>
              <StudentAvatar student={student} size={34} />
              <div className="rw-lb-info">
                <strong>{studentDisplayName(student)}</strong>
                <div className="rw-lb-bar">
                  <span style={{ width: `${Math.max(6, (student.points / maxPoints) * 100)}%` }} />
                </div>
              </div>
              <span className="rw-lb-pts">{student.points} pts</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="rw-empty compact">
          <strong>No points yet</strong>
          <p>Award points to see the leaderboard.</p>
        </div>
      )}
    </section>
  );
}
