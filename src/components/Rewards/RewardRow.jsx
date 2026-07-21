import RowOverflowMenu from "./RowOverflowMenu";
import { iconBgFor } from "./rewardsUtils";

export default function RewardRow({ reward, onEdit, onDeleteRequest }) {
  return (
    <div className="rw-reward-row">
      <div className="rw-reward-icon" style={{ background: iconBgFor(reward.icon) }}>
        {reward.icon}
      </div>
      <div className="rw-reward-info">
        <strong>{reward.name}</strong>
        <span>{reward.category}</span>
      </div>
      <div className="rw-reward-pts">+{reward.pointValue} pts</div>
      <RowOverflowMenu
        items={[
          { label: "Edit", onClick: () => onEdit?.(reward) },
          { label: "Delete", danger: true, onClick: () => onDeleteRequest?.(reward) }
        ]}
      />
    </div>
  );
}
