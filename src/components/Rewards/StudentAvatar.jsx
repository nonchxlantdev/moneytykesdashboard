export default function StudentAvatar({ student, size = 34, className = "" }) {
  const initials = `${student?.first?.[0] || ""}${student?.last?.[0] || ""}`.toUpperCase() || "?";
  const tone = (() => {
    const id = String(student?.id || student?.first || "0");
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % 4;
    return hash;
  })();

  if (student?.photo) {
    return (
      <img
        className={`rw-avatar has-photo ${className}`.trim()}
        src={student.photo}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`rw-avatar tone-${tone} ${className}`.trim()}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.36)) }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
