/** Fixed pastel backgrounds per emoji — content identifiers, not theme chrome. */
export const REWARD_ICON_BG = {
  "⭐": "#fff6d8",
  "🏆": "#ffe8cc",
  "💰": "#e6f7f0",
  "🎯": "#e8f0ff",
  "🚀": "#efe8ff",
  "📚": "#e8f5ff",
  "💡": "#fff8d6",
  "🎖️": "#ffe9d6",
  "🌟": "#fff4cc",
  "💎": "#e6f4ff",
  "🔥": "#ffe6e0",
  "✨": "#f3e8ff",
  "🎁": "#ffe8f0",
  "📈": "#e6f7ef",
  "👑": "#fff0cc",
  "🎉": "#ffe8f5",
  "🤝": "#e8f5f2",
  "⏰": "#eef2ff"
};

export const REWARD_ICONS = Object.keys(REWARD_ICON_BG);
export const REWARD_CATEGORIES = ["Behaviour", "Academic", "Participation", "Effort", "All"];

export function iconBgFor(icon) {
  return REWARD_ICON_BG[icon] || "#fff6d8";
}

export function studentDisplayName(student) {
  return `${student?.first || ""} ${student?.last || ""}`.trim() || "Student";
}

export function studentInitials(student) {
  return `${student?.first?.[0] || ""}${student?.last?.[0] || ""}`.toUpperCase() || "?";
}

/** Stable avatar tone index from student id (0–3). */
export function avatarToneIndex(student) {
  const id = String(student?.id || student?.first || "0");
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % 4;
  return hash;
}

export function formatRelativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
