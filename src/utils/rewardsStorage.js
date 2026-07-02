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
  } else {
    start.setMonth(now.getMonth() - 1);
  }

  return log
    .filter(entry => new Date(`${entry.date}T00:00:00`) >= start)
    .reduce((sum, entry) => sum + (entry.points || 0), 0);
}
