import { useMemo } from "react";
import { Trophy } from "lucide-react";
import DropdownSearch from "../ui/DropdownSearch";
import StudentAvatar from "./StudentAvatar";
import { iconBgFor, studentDisplayName } from "./rewardsUtils";

export default function AwardPointsForm({
  students,
  rewards,
  selectedStudent,
  onSelectStudent,
  selectedRewardId,
  onSelectReward,
  note,
  onNoteChange,
  onAward,
  canAward
}) {
  const selectedReward = rewards.find(reward => String(reward.id) === String(selectedRewardId));

  const studentItems = useMemo(
    () =>
      (students || []).map(student => ({
        id: String(student.id),
        label: studentDisplayName(student),
        textValue: `${studentDisplayName(student)} ${student.email || ""}`,
        description: student.classLabel || student.email || undefined,
        leading: <StudentAvatar student={student} size={26} />,
        student
      })),
    [students]
  );

  const rewardItems = useMemo(
    () =>
      (rewards || []).map(reward => ({
        id: String(reward.id),
        label: `${reward.icon} ${reward.name}`,
        textValue: `${reward.name} ${reward.category || ""}`,
        description: `+${reward.pointValue} pts · ${reward.category}`,
        leading: (
          <span className="rw-reward-icon sm" style={{ background: iconBgFor(reward.icon) }}>
            {reward.icon}
          </span>
        )
      })),
    [rewards]
  );

  return (
    <section className="rw-card rw-award-form">
      <div className="rw-card-head">
        <h2>Award points</h2>
      </div>
      <p className="rw-hint">Search for a student, pick a reward, then award points.</p>

      <div className="rw-field">
        <DropdownSearch
          label="Student"
          placeholder="Select student…"
          searchPlaceholder="Search students"
          emptyText="No students found"
          items={studentItems}
          selectedKey={selectedStudent ? String(selectedStudent.id) : null}
          onSelectionChange={key => {
            if (!key) {
              onSelectStudent?.(null);
              return;
            }
            const match = students.find(student => String(student.id) === String(key));
            onSelectStudent?.(match || null);
          }}
        />
      </div>

      <div className="rw-field">
        <DropdownSearch
          label="Reward"
          placeholder="Select from Rewards Bank…"
          searchPlaceholder="Search rewards"
          emptyText="No rewards found"
          items={rewardItems}
          selectedKey={selectedRewardId ? String(selectedRewardId) : null}
          onSelectionChange={key => onSelectReward?.(key || "")}
        />
      </div>

      {selectedReward ? (
        <div className="rw-selected-reward">
          <span className="rw-reward-icon sm" style={{ background: iconBgFor(selectedReward.icon) }}>
            {selectedReward.icon}
          </span>
          <div>
            <strong>{selectedReward.name}</strong>
            <small>{selectedReward.description || "No description"}</small>
          </div>
          <em>+{selectedReward.pointValue} pts</em>
        </div>
      ) : null}

      <label className="rw-field">
        <span>
          Note <em className="rw-optional">(optional)</em>
        </span>
        <input
          type="text"
          value={note}
          placeholder="Great work on the quiz!"
          onChange={event => onNoteChange(event.target.value)}
        />
      </label>

      <button type="button" className="btn primary-gold" onClick={onAward} disabled={!canAward}>
        <Trophy size={15} />
        Award Points
      </button>
    </section>
  );
}
