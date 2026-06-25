import { useMemo, useState } from "react";
import { Gift, Minus, Plus, Trophy, Users, X } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import StudentSelector from "../components/StudentSelector";
import Badge from "../components/Badge";
import {
  addPointsLogEntry,
  getAllStudentPoints,
  getPointsInRange,
  getPointsLog,
  getStudentPoints,
  setStudentPoints
} from "../utils/rewardsStorage";

const REWARD_ICONS = ["⭐", "🏆", "💰", "🎯", "🚀", "📚", "💡", "🎖️", "🌟", "💎", "🔥", "✨", "🎁", "📈", "👑", "🎉"];
const REWARD_CATEGORIES = ["Behaviour", "Academic", "Participation", "Effort"];

const emptyRewardForm = {
  name: "",
  pointValue: 10,
  icon: "⭐",
  description: "",
  category: "Behaviour"
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "";
}

function studentInitials(student) {
  return `${student.first?.[0] || ""}${student.last?.[0] || ""}`.toUpperCase();
}

/**
 * Teacher rewards dashboard with bank, point awards, leaderboard, and history.
 * @param {{ db: object, setToast: (msg: string) => void }} props
 */
export default function RewardsPage({ db, setToast }) {
  const [rewardsBank, setRewardsBank] = useLocalStorage("rewards_bank", []);
  const [rewardForm, setRewardForm] = useState(emptyRewardForm);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedRewardId, setSelectedRewardId] = useState("");
  const [awardNote, setAwardNote] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStudentIds, setBulkStudentIds] = useState([]);
  const [leaderboardRange, setLeaderboardRange] = useState("week");
  const [historyStudent, setHistoryStudent] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const teacherName = `${db.teacher?.first || "Teacher"} ${db.teacher?.last || ""}`.trim();
  const selectedReward = rewardsBank.find(reward => String(reward.id) === String(selectedRewardId));

  const leaderboard = useMemo(() => {
    void refreshKey;
    return getAllStudentPoints(db.students)
      .map(student => ({
        ...student,
        rangePoints: getPointsInRange(getPointsLog(student.id), leaderboardRange)
      }))
      .sort((a, b) => b.rangePoints - a.rangePoints)
      .slice(0, 5);
  }, [db.students, leaderboardRange, refreshKey]);

  const maxLeaderboardPoints = Math.max(...leaderboard.map(entry => entry.rangePoints), 1);

  function bumpRefresh() {
    setRefreshKey(current => current + 1);
  }

  function createReward(event) {
    event.preventDefault();
    if (!rewardForm.name.trim()) {
      setToast("Reward name is required.");
      return;
    }
    const newReward = {
      id: Date.now(),
      name: rewardForm.name.trim(),
      pointValue: Number(rewardForm.pointValue) || 0,
      icon: rewardForm.icon,
      description: rewardForm.description.trim(),
      category: rewardForm.category,
      createdAt: today()
    };
    setRewardsBank(current => [...current, newReward]);
    setRewardForm(emptyRewardForm);
    setToast("Reward added to Rewards Bank.");
  }

  function adjustPointValue(delta) {
    setRewardForm(current => ({
      ...current,
      pointValue: Math.max(0, Number(current.pointValue) + delta)
    }));
  }

  function toggleBulkStudent(studentId) {
    setBulkStudentIds(current =>
      current.includes(studentId)
        ? current.filter(id => id !== studentId)
        : [...current, studentId]
    );
  }

  function awardPoints() {
    if (!selectedReward) {
      setToast("Select a reward from the bank.");
      return;
    }

    const targetIds = bulkMode
      ? bulkStudentIds
      : selectedStudentId
        ? [Number(selectedStudentId)]
        : [];

    if (!targetIds.length) {
      setToast(bulkMode ? "Select at least one student." : "Select a student.");
      return;
    }

    targetIds.forEach(studentId => {
      const currentPoints = getStudentPoints(studentId);
      const nextPoints = currentPoints + selectedReward.pointValue;
      setStudentPoints(studentId, nextPoints);
      addPointsLogEntry(studentId, {
        id: Date.now() + studentId,
        date: today(),
        rewardId: selectedReward.id,
        rewardName: selectedReward.name,
        rewardIcon: selectedReward.icon,
        points: selectedReward.pointValue,
        awardedBy: teacherName,
        note: awardNote.trim()
      });
    });

    setAwardNote("");
    if (!bulkMode) setSelectedStudentId("");
    if (bulkMode) setBulkStudentIds([]);
    bumpRefresh();
    setToast(
      targetIds.length > 1
        ? `Awarded ${selectedReward.name} to ${targetIds.length} students.`
        : `${selectedReward.name} awarded successfully.`
    );
  }

  function openHistory(student) {
    setHistoryStudent(student);
  }

  const historyLog = historyStudent ? getPointsLog(historyStudent.id) : [];

  return (
    <section className="rewards-dashboard" aria-label="Rewards dashboard">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Motivation</p>
          <h2>Rewards Dashboard</h2>
        </div>
      </div>

      <div className="rewards-grid-top">
        <article className="section-panel rewards-create-card">
          <div className="section-heading"><h2>Create Reward</h2></div>
          <form className="stacked-form rewards-create-form" onSubmit={createReward}>
            <label className="field-label">
              Reward Name
              <input
                type="text"
                value={rewardForm.name}
                placeholder='e.g. "Star Student"'
                onChange={event => setRewardForm({ ...rewardForm, name: event.target.value })}
                required
              />
            </label>

            <label className="field-label">
              Point Value
              <span className="point-stepper">
                <button type="button" onClick={() => adjustPointValue(-5)} aria-label="Decrease points"><Minus size={16} /></button>
                <input
                  type="number"
                  min="0"
                  value={rewardForm.pointValue}
                  onChange={event => setRewardForm({ ...rewardForm, pointValue: Number(event.target.value) })}
                  required
                />
                <button type="button" onClick={() => adjustPointValue(5)} aria-label="Increase points"><Plus size={16} /></button>
              </span>
            </label>

            <div className="field-label">
              Icon / Badge
              <div className="reward-icon-grid" role="group" aria-label="Choose reward icon">
                {REWARD_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`reward-icon-choice ${rewardForm.icon === icon ? "selected" : ""}`}
                    onClick={() => setRewardForm({ ...rewardForm, icon })}
                    aria-label={`Select ${icon} icon`}
                    aria-pressed={rewardForm.icon === icon}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <label className="field-label">
              Category
              <select
                value={rewardForm.category}
                onChange={event => setRewardForm({ ...rewardForm, category: event.target.value })}
              >
                {REWARD_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Description <span className="field-optional">(optional)</span>
              <input
                type="text"
                value={rewardForm.description}
                placeholder="Short description"
                onChange={event => setRewardForm({ ...rewardForm, description: event.target.value })}
              />
            </label>

            <button className="primary-action teal-action" type="submit">
              <Gift size={16} /> Add to Rewards Bank
            </button>
          </form>
        </article>

        <article className="section-panel rewards-bank-card">
          <div className="section-heading">
            <h2>Rewards Bank</h2>
            <Badge tone="teal">{rewardsBank.length} saved</Badge>
          </div>
          {rewardsBank.length ? (
            <div className="rewards-bank-grid">
              {rewardsBank.map(reward => (
                <button
                  key={reward.id}
                  type="button"
                  className={`rewards-bank-item ${String(selectedRewardId) === String(reward.id) ? "selected" : ""}`}
                  onClick={() => setSelectedRewardId(String(reward.id))}
                >
                  <span className="rewards-bank-icon">{reward.icon}</span>
                  <span className="rewards-bank-copy">
                    <strong>{reward.name}</strong>
                    <small>{reward.category}</small>
                  </span>
                  <em>+{reward.pointValue} pts</em>
                </button>
              ))}
            </div>
          ) : (
            <div className="rewards-empty-state">
              <Gift size={28} />
              <strong>No rewards yet</strong>
              <p>Create your first reward to start building your bank.</p>
            </div>
          )}
        </article>
      </div>

      <div className="rewards-grid-bottom">
        <article className="section-panel rewards-award-card">
          <div className="section-heading">
            <h2>Award Points</h2>
            <button
              type="button"
              className={`bulk-toggle ${bulkMode ? "active" : ""}`}
              onClick={() => {
                setBulkMode(!bulkMode);
                setBulkStudentIds([]);
                setSelectedStudentId("");
              }}
            >
              <Users size={15} /> {bulkMode ? "Bulk Mode On" : "Bulk Award"}
            </button>
          </div>

          <div className="rewards-award-form">
            {!bulkMode ? (
              <label className="field-label">
                Student
                <StudentSelector
                  students={db.students}
                  value={selectedStudentId}
                  onChange={setSelectedStudentId}
                  required
                />
              </label>
            ) : (
              <div className="field-label">
                Select Students
                <div className="bulk-student-list">
                  {db.students.length ? db.students.map(student => (
                    <label key={student.id} className="bulk-student-row">
                      <input
                        type="checkbox"
                        checked={bulkStudentIds.includes(student.id)}
                        onChange={() => toggleBulkStudent(student.id)}
                      />
                      <span className="bulk-student-avatar">{studentInitials(student)}</span>
                      <span>{student.first} {student.last}</span>
                    </label>
                  )) : (
                    <p className="rewards-inline-empty">Add students to award points.</p>
                  )}
                </div>
              </div>
            )}

            <label className="field-label">
              Reward
              <select
                value={selectedRewardId}
                onChange={event => setSelectedRewardId(event.target.value)}
                required
              >
                <option value="">Select from Rewards Bank</option>
                {rewardsBank.map(reward => (
                  <option key={reward.id} value={reward.id}>
                    {reward.icon} {reward.name} (+{reward.pointValue} pts)
                  </option>
                ))}
              </select>
            </label>

            {selectedReward && (
              <div className="selected-reward-preview">
                <span>{selectedReward.icon}</span>
                <div>
                  <strong>{selectedReward.name}</strong>
                  <small>{selectedReward.description || "No description"}</small>
                </div>
                <em>+{selectedReward.pointValue} pts</em>
              </div>
            )}

            <label className="field-label">
              Note <span className="field-optional">(optional)</span>
              <input
                type="text"
                value={awardNote}
                placeholder="Great work on the quiz!"
                onChange={event => setAwardNote(event.target.value)}
              />
            </label>

            <button className="primary-action teal-action" type="button" onClick={awardPoints}>
              <Trophy size={16} /> Award Points
            </button>
          </div>
        </article>

        <article className="section-panel rewards-leaderboard-card">
          <div className="section-heading">
            <h2>Leaderboard</h2>
            <div className="leaderboard-range-toggle">
              <button
                type="button"
                className={leaderboardRange === "week" ? "active" : ""}
                onClick={() => setLeaderboardRange("week")}
              >
                This Week
              </button>
              <button
                type="button"
                className={leaderboardRange === "month" ? "active" : ""}
                onClick={() => setLeaderboardRange("month")}
              >
                This Month
              </button>
            </div>
          </div>

          {leaderboard.length ? (
            <ol className="rewards-leaderboard-list">
              {leaderboard.map((student, index) => (
                <li key={student.id}>
                  <span className="leaderboard-rank">{index + 1}</span>
                  <button type="button" className="leaderboard-student" onClick={() => openHistory(student)}>
                    <span className="leaderboard-avatar">{studentInitials(student)}</span>
                    <span className="leaderboard-name">{student.first} {student.last}</span>
                  </button>
                  <div className="leaderboard-points">
                    <strong>{student.rangePoints} pts</strong>
                    <span className="leaderboard-bar">
                      <span style={{ width: `${(student.rangePoints / maxLeaderboardPoints) * 100}%` }} />
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rewards-empty-state compact">
              <Trophy size={24} />
              <strong>No points yet</strong>
              <p>Award points to see the leaderboard.</p>
            </div>
          )}
        </article>
      </div>

      {historyStudent && (
        <div className="rewards-history-modal-backdrop" onClick={() => setHistoryStudent(null)}>
          <div className="rewards-history-modal" onClick={event => event.stopPropagation()} role="dialog" aria-labelledby="point-history-title">
            <header>
              <div>
                <p className="eyebrow">Point History</p>
                <h3 id="point-history-title">{historyStudent.first} {historyStudent.last}</h3>
                <p>{getStudentPoints(historyStudent.id)} total points</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setHistoryStudent(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            {historyLog.length ? (
              <div className="rewards-history-table">
                <div className="rewards-history-head">
                  <span>Date</span>
                  <span>Reward</span>
                  <span>Points</span>
                  <span>Awarded By</span>
                  <span>Note</span>
                </div>
                {historyLog.map(entry => (
                  <div className="rewards-history-row" key={entry.id}>
                    <span>{formatDate(entry.date)}</span>
                    <span>{entry.rewardIcon} {entry.rewardName}</span>
                    <span>+{entry.points}</span>
                    <span>{entry.awardedBy}</span>
                    <span>{entry.note || "—"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rewards-empty-state compact">
                <p>No point history for this student yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
