const REWARDS_BANK_KEY = "rewards_bank";

export function studentPointsKey(studentId) {
  return `student_points_${studentId}`;
}

export function pointsLogKey(studentId) {
  return `points_log_${studentId}`;
}

export function loadRewardsBank() {
  try {
    return JSON.parse(localStorage.getItem(REWARDS_BANK_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveRewardsBank(rewards) {
  localStorage.setItem(REWARDS_BANK_KEY, JSON.stringify(rewards));
}

export function getStudentPoints(studentId) {
  try {
    const value = localStorage.getItem(studentPointsKey(studentId));
    return value !== null ? Number(JSON.parse(value)) : 0;
  } catch {
    return 0;
  }
}

export function setStudentPoints(studentId, points) {
  localStorage.setItem(studentPointsKey(studentId), JSON.stringify(Number(points)));
}

export function getPointsLog(studentId) {
  try {
    return JSON.parse(localStorage.getItem(pointsLogKey(studentId))) || [];
  } catch {
    return [];
  }
}

export function addPointsLogEntry(studentId, entry) {
  const log = getPointsLog(studentId);
  log.unshift(entry);
  localStorage.setItem(pointsLogKey(studentId), JSON.stringify(log));
}

/** Award logs store reward name/icon/points snapshots — safe if the bank reward is deleted. */
export function removePointsLogEntry(studentId, entryId) {
  const next = getPointsLog(studentId).filter(entry => String(entry.id) !== String(entryId));
  localStorage.setItem(pointsLogKey(studentId), JSON.stringify(next));
  return next;
}

export function getAllStudentPoints(students) {
  return students.map(student => ({
    ...student,
    totalPoints: getStudentPoints(student.id)
  }));
}

export function getPointsInRange(log, range) {
  const now = new Date();
  const start = new Date(now);

  if (range === "week") {
    start.setDate(now.getDate() - 7);
  } else if (range === "month") {
    start.setMonth(now.getMonth() - 1);
  } else {
    start.setFullYear(2000);
  }

  return log
    .filter(entry => {
      const stamp = entry.awardedAt || `${entry.date}T12:00:00`;
      return new Date(stamp) >= start;
    })
    .reduce((sum, entry) => sum + (entry.points || 0), 0);
}

/**
 * Flatten recent awards across the roster (newest first).
 * Each record includes denormalized reward fields from the log snapshot.
 */
export function getRecentAwards(students = [], limit = 8) {
  const rows = [];
  students.forEach(student => {
    getPointsLog(student.id).forEach(entry => {
      rows.push({
        ...entry,
        studentId: student.id,
        student,
        awardedAt: entry.awardedAt || `${entry.date}T12:00:00`
      });
    });
  });
  return rows
    .sort((a, b) => String(b.awardedAt).localeCompare(String(a.awardedAt)))
    .slice(0, limit);
}
