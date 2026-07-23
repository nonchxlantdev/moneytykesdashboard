import { Gift } from "lucide-react";
import RewardRow from "./RewardRow";
import { REWARD_CATEGORIES } from "./rewardsUtils";

export default function RewardsBank({
  rewards = [],
  category,
  onCategoryChange,
  onEdit,
  onDeleteRequest
}) {
  const filters = REWARD_CATEGORIES;
  const filtered =
    category === "All" ? rewards : rewards.filter(reward => reward.category === category);

  return (
    <section className="rw-card rw-bank" data-tour="rewards-bank">
      <div className="rw-card-head">
        <h2>Rewards Bank</h2>
        <span className="rw-bank-count">{rewards.length} saved</span>
      </div>

      <div className="rw-filter-chips" role="group" aria-label="Filter by category">
        {filters.map(filter => (
          <button
            key={filter}
            type="button"
            className={`rw-filter-chip ${category === filter ? "active" : ""}`}
            onClick={() => onCategoryChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="rw-bank-list">
          {filtered.map(reward => (
            <RewardRow
              key={reward.id}
              reward={reward}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="rw-empty">
          <Gift size={26} />
          <strong>No rewards yet</strong>
          <p>{category === "All" ? "Create your first reward to build the bank." : `No ${category} rewards yet.`}</p>
        </div>
      )}
    </section>
  );
}
