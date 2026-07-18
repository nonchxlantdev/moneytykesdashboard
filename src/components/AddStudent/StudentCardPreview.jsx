import { UserRound } from "lucide-react";

export default function StudentCardPreview({
  firstName,
  lastName,
  avatar,
  standard,
  form,
  school
}) {
  const name = firstName || lastName ? `${firstName} ${lastName}`.trim() : "New Student";
  const level = standard || form || null;

  return (
    <div className="id-card-wrap">
      <div className="id-card">
        <div className="id-punch" aria-hidden="true">
          <span className="id-thumbtack">
            <span className="id-thumbtack-head" />
            <span className="id-thumbtack-pin" />
          </span>
        </div>
        <div
          className="id-avatar"
          style={{ background: avatar?.src ? "transparent" : "var(--icon-accent)" }}
          aria-hidden="true"
        >
          {avatar?.src ? (
            <img src={avatar.src} alt="" />
          ) : avatar?.emoji ? (
            <span>{avatar.emoji}</span>
          ) : (
            <UserRound size={22} />
          )}
        </div>
        <div className="id-name">{name}</div>
        <div className="id-sub">{level || "Standard / Form —"}</div>
        <div className="id-divider" />
        <div className="id-row">
          <span>School</span>
          <strong>{school || "—"}</strong>
        </div>
        <div className="id-stamp">MoneyTykes</div>
      </div>
      <p className="id-caption">This updates as you fill out the form →</p>
    </div>
  );
}
