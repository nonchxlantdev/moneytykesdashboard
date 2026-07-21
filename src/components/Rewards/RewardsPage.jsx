import { useEffect, useState } from "react";
import { Gift, Star, Trophy, Users } from "lucide-react";
import PageChalkBanner from "../shared/PageChalkBanner";
import ConfirmDeleteModal from "../shared/ConfirmDeleteModal";
import AwardPointsForm from "./AwardPointsForm";
import CreateRewardForm from "./CreateRewardForm";
import Leaderboard from "./Leaderboard";
import RecentlyAwardedFeed from "./RecentlyAwardedFeed";
import RewardsBank from "./RewardsBank";
import RewardsTabs from "./RewardsTabs";
import { useRewards } from "./useRewards";
import "./rewards.css";

function StatCard({ label, value, hint, tone = "accent", icon: Icon }) {
  return (
    <article className={`rw-stat tone-${tone}`}>
      <div className="rw-stat-top">
        <span className="rw-stat-label">{label}</span>
        {Icon ? (
          <span className="rw-stat-icon" aria-hidden="true">
            <Icon size={16} />
          </span>
        ) : null}
      </div>
      <strong className="rw-stat-value">{value}</strong>
      {hint ? <span className="rw-stat-hint">{hint}</span> : null}
    </article>
  );
}

/**
 * Rewards Dashboard — manage bank, award points, recent feed, leaderboard.
 */
export default function RewardsPage({ db, setToast, update }) {
  const [tab, setTab] = useState("manage");
  const rewards = useRewards({ db, setToast, update });

  useEffect(() => {
    if (!rewards.undoToast) return undefined;
    const remaining = Math.max(0, rewards.undoToast.expiresAt - Date.now());
    const timer = window.setTimeout(() => rewards.setUndoToast(null), remaining || 1);
    return () => window.clearTimeout(timer);
  }, [rewards.undoToast, rewards.setUndoToast]);

  return (
    <section className="rewards-dash" aria-label="Rewards dashboard">
      <PageChalkBanner
        eyebrow="MOTIVATION"
        title="Rewards Dashboard"
        subtitle="Create rewards, award points, and track your class leaderboard."
      />

      <div className="rw-body">
      <div className="rw-stats">
        <StatCard
          label="Rewards in bank"
          value={rewards.stats.bankCount}
          hint="Saved templates"
          tone="accent"
          icon={Gift}
        />
        <StatCard
          label="Points this week"
          value={rewards.stats.weekPoints}
          hint="Awarded to class"
          tone="gold"
          icon={Star}
        />
        <StatCard
          label="Top student"
          value={rewards.stats.topStudent}
          hint={
            rewards.stats.topPoints
              ? `${rewards.stats.topPoints} pts · ${rewards.leaderboardRange}`
              : "No points yet"
          }
          tone="teal"
          icon={Trophy}
        />
        <StatCard
          label="Recent awards"
          value={rewards.stats.awardCount}
          hint="Showing latest"
          tone="orange"
          icon={Users}
        />
      </div>

      <RewardsTabs active={tab} onChange={setTab} />

      {tab === "manage" ? (
        <div className="rw-manage-grid">
          <CreateRewardForm
            value={rewards.rewardForm}
            onChange={rewards.setRewardForm}
            onSubmit={rewards.saveReward}
            editingId={rewards.editingId}
            onCancelEdit={rewards.resetForm}
          />
          <RewardsBank
            rewards={rewards.rewardsBank}
            category={rewards.bankCategory}
            onCategoryChange={rewards.setBankCategory}
            onEdit={reward => {
              rewards.startEdit(reward);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDeleteRequest={rewards.setPendingDelete}
          />
        </div>
      ) : (
        <div className="rw-award-grid">
          <div className="rw-award-col">
            <AwardPointsForm
              students={db.students || []}
              rewards={rewards.rewardsBank}
              selectedStudent={rewards.selectedStudent}
              onSelectStudent={rewards.setSelectedStudent}
              selectedRewardId={rewards.selectedRewardId}
              onSelectReward={rewards.setSelectedRewardId}
              note={rewards.awardNote}
              onNoteChange={rewards.setAwardNote}
              onAward={rewards.awardPoints}
              canAward={rewards.canAward}
            />
            <RecentlyAwardedFeed records={rewards.recentAwards} onUndo={rewards.undoAward} />
          </div>
          <Leaderboard
            students={rewards.leaderboard}
            timeframe={rewards.leaderboardRange}
            onTimeframeChange={rewards.setLeaderboardRange}
          />
        </div>
      )}
      </div>

      <ConfirmDeleteModal
        open={Boolean(rewards.pendingDelete)}
        title="Delete this reward?"
        itemLabel={rewards.pendingDelete?.name}
        bodyText="This will remove it from the Rewards Bank. Past awards already given won't be affected — history keeps a snapshot of the reward name, icon, and points."
        confirmLabel="Delete Reward"
        onCancel={() => rewards.setPendingDelete(null)}
        onConfirm={rewards.confirmDelete}
      />

      {rewards.undoToast ? (
        <div className="rw-undo-toast" role="status">
          <span>{rewards.undoToast.message}</span>
          <button type="button" onClick={() => rewards.undoAward(rewards.undoToast.record)}>
            Undo
          </button>
        </div>
      ) : null}
    </section>
  );
}
