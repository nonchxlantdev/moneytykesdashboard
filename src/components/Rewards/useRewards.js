import { useMemo, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  addPointsLogEntry,
  getAllStudentPoints,
  getPointsInRange,
  getPointsLog,
  getRecentAwards,
  getStudentPoints,
  removePointsLogEntry,
  setStudentPoints
} from "../../utils/rewardsStorage";
import { iconBgFor, todayIso } from "./rewardsUtils";

const EMPTY_FORM = {
  name: "",
  pointValue: 10,
  icon: "⭐",
  description: "",
  category: "Behaviour"
};

export function useRewards({ db, setToast, update }) {
  const [rewardsBank, setRewardsBank] = useLocalStorage("rewards_bank", []);
  const [rewardForm, setRewardForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [bankCategory, setBankCategory] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRewardId, setSelectedRewardId] = useState("");
  const [awardNote, setAwardNote] = useState("");
  const [leaderboardRange, setLeaderboardRange] = useState("week");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [undoToast, setUndoToast] = useState(null);

  const teacherName = `${db.teacher?.first || "Teacher"} ${db.teacher?.last || ""}`.trim();

  const recentAwards = useMemo(() => {
    void refreshKey;
    return getRecentAwards(db.students || [], 8);
  }, [db.students, refreshKey]);

  const leaderboard = useMemo(() => {
    void refreshKey;
    return getAllStudentPoints(db.students || [])
      .map(student => ({
        ...student,
        points: getPointsInRange(getPointsLog(student.id), leaderboardRange)
      }))
      .sort((a, b) => {
        const diff = b.points - a.points;
        if (diff !== 0) return diff;
        return `${a.first} ${a.last}`.localeCompare(`${b.first} ${b.last}`);
      });
  }, [db.students, leaderboardRange, refreshKey]);

  const stats = useMemo(() => {
    void refreshKey;
    const weekPoints = (db.students || []).reduce(
      (sum, student) => sum + getPointsInRange(getPointsLog(student.id), "week"),
      0
    );
    const top = leaderboard[0];
    return {
      bankCount: rewardsBank.length,
      weekPoints,
      topStudent: top ? `${top.first} ${top.last}`.trim() : "—",
      topPoints: top?.points || 0,
      awardCount: recentAwards.length
    };
  }, [db.students, leaderboard, recentAwards.length, refreshKey, rewardsBank.length]);

  function bump() {
    setRefreshKey(current => current + 1);
  }

  function resetForm() {
    setRewardForm(EMPTY_FORM);
    setEditingId(null);
  }

  function startEdit(reward) {
    setEditingId(reward.id);
    setRewardForm({
      name: reward.name,
      pointValue: reward.pointValue,
      icon: reward.icon,
      description: reward.description || "",
      category: reward.category || "Behaviour"
    });
  }

  function saveReward() {
    if (!rewardForm.name.trim()) {
      setToast?.("Reward name is required.");
      return;
    }

    const payload = {
      name: rewardForm.name.trim(),
      pointValue: Number(rewardForm.pointValue) || 0,
      icon: rewardForm.icon,
      iconBg: iconBgFor(rewardForm.icon),
      description: rewardForm.description.trim(),
      category: rewardForm.category
    };

    if (editingId != null) {
      setRewardsBank(current =>
        current.map(item => (item.id === editingId ? { ...item, ...payload } : item))
      );
      setToast?.("Reward updated.");
    } else {
      setRewardsBank(current => [
        ...current,
        { id: Date.now(), ...payload, createdAt: todayIso() }
      ]);
      setToast?.("Reward added to Rewards Bank.");
    }
    resetForm();
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    setRewardsBank(current => current.filter(item => item.id !== pendingDelete.id));
    if (String(selectedRewardId) === String(pendingDelete.id)) setSelectedRewardId("");
    if (editingId === pendingDelete.id) resetForm();
    setPendingDelete(null);
    setToast?.("Reward removed from the bank. Past awards were not changed.");
  }

  function awardPoints() {
    const selectedReward = rewardsBank.find(
      reward => String(reward.id) === String(selectedRewardId)
    );
    if (!selectedStudent) {
      setToast?.("Select a student.");
      return;
    }
    if (!selectedReward) {
      setToast?.("Select a reward from the bank.");
      return;
    }

    const studentId = Number(selectedStudent.id);
    const entryId = Date.now();
    const awardedAt = new Date().toISOString();
    const currentPoints = getStudentPoints(studentId);
    const nextPoints = currentPoints + selectedReward.pointValue;

    setStudentPoints(studentId, nextPoints);
    addPointsLogEntry(studentId, {
      id: entryId,
      date: todayIso(),
      awardedAt,
      rewardId: selectedReward.id,
      rewardName: selectedReward.name,
      rewardIcon: selectedReward.icon,
      points: selectedReward.pointValue,
      awardedBy: teacherName,
      note: awardNote.trim()
    });

    if (update) {
      update(dbState => {
        const student = dbState.students.find(item => item.id === studentId);
        if (!student) return;
        student.balance = (student.balance || 0) + selectedReward.pointValue;
        student.totalEarned = (student.totalEarned || 0) + selectedReward.pointValue;
        student.streak = (student.streak || 0) + 1;
        student.status = "on_track";
        dbState.transactions.push({
          id: entryId + 1,
          studentId,
          amount: selectedReward.pointValue,
          description: `${selectedReward.icon} ${selectedReward.name}${
            awardNote.trim() ? `: ${awardNote.trim()}` : ""
          }`,
          date: todayIso()
        });
      });
    }

    const record = {
      id: entryId,
      studentId,
      points: selectedReward.pointValue,
      awardedAt
    };

    setAwardNote("");
    setSelectedStudent(null);
    bump();
    setToast?.(`Awarded ${selectedReward.name} to ${selectedStudent.first}!`);
    setUndoToast({
      message: `Awarded +${selectedReward.pointValue} pts`,
      record,
      expiresAt: Date.now() + 10000
    });
  }

  function undoAward(record) {
    if (!record) return;
    const studentId = Number(record.studentId);
    const points = Number(record.points) || 0;
    const current = getStudentPoints(studentId);
    setStudentPoints(studentId, Math.max(0, current - points));
    removePointsLogEntry(studentId, record.id);

    if (update) {
      update(dbState => {
        const student = dbState.students.find(item => item.id === studentId);
        if (!student) return;
        student.balance = Math.max(0, (student.balance || 0) - points);
        student.totalEarned = Math.max(0, (student.totalEarned || 0) - points);
        dbState.transactions = (dbState.transactions || []).filter(
          tx => !(tx.studentId === studentId && Math.abs((tx.id || 0) - record.id) <= 1)
        );
      });
    }

    setUndoToast(null);
    bump();
    setToast?.("Award undone.");
  }

  return {
    rewardsBank,
    rewardForm,
    setRewardForm,
    editingId,
    bankCategory,
    setBankCategory,
    selectedStudent,
    setSelectedStudent,
    selectedRewardId,
    setSelectedRewardId,
    awardNote,
    setAwardNote,
    leaderboardRange,
    setLeaderboardRange,
    pendingDelete,
    setPendingDelete,
    recentAwards,
    leaderboard,
    stats,
    undoToast,
    setUndoToast,
    saveReward,
    startEdit,
    resetForm,
    confirmDelete,
    awardPoints,
    undoAward,
    canAward: Boolean(selectedStudent && selectedRewardId)
  };
}

export function useAwardHistory(students, limit = 8, refreshKey = 0) {
  return useMemo(() => {
    void refreshKey;
    return getRecentAwards(students || [], limit);
  }, [students, limit, refreshKey]);
}
