import { Undo2 } from "lucide-react";
import StudentAvatar from "./StudentAvatar";
import { formatRelativeTime, studentDisplayName } from "./rewardsUtils";

const UNDO_WINDOW_MS = 10 * 60 * 1000;

export default function RecentlyAwardedFeed({ records = [], onUndo }) {
  return (
    <section className="rw-card rw-recent">
      <div className="rw-card-head">
        <h2>Recently awarded</h2>
      </div>

      {records.length ? (
        <div className="rw-recent-list">
          {records.map(record => {
            const canUndo =
              Date.now() - new Date(record.awardedAt).getTime() < UNDO_WINDOW_MS;
            return (
              <div key={`${record.studentId}-${record.id}`} className="rw-recent-item">
                <StudentAvatar student={record.student} size={34} />
                <div className="rw-recent-info">
                  <strong>{studentDisplayName(record.student)}</strong>
                  <span>
                    {record.rewardIcon} {record.rewardName} · +{record.points} pts
                  </span>
                </div>
                <div className="rw-recent-meta">
                  <span className="rw-recent-time">{formatRelativeTime(record.awardedAt)}</span>
                  {canUndo && onUndo ? (
                    <button
                      type="button"
                      className="rw-undo-btn"
                      onClick={() => onUndo(record)}
                      title="Undo this award"
                    >
                      <Undo2 size={14} />
                      Undo
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rw-empty compact">
          <strong>No awards yet</strong>
          <p>Awarded points will show up here.</p>
        </div>
      )}
    </section>
  );
}
