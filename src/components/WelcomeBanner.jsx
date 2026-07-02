/**
 * Dashboard welcome hero — modeled on update design.json.
 */
export default function WelcomeBanner({ teacherName, className, studentCount, onViewAnalytics, assetPath }) {
  return (
    <article className="welcome-banner welcome-banner-v2" aria-label="Welcome">
      <div className="welcome-banner-copy">
        <h2>Welcome back, {teacherName}</h2>
        <p className="welcome-banner-subtitle">
          Your <span className="welcome-highlight">{className}</span> class has{" "}
          <span className="welcome-highlight">{studentCount} students</span>
        </p>
        <button type="button" className="welcome-banner-cta" onClick={onViewAnalytics}>
          View Analytics
        </button>
      </div>
      <img
        className="welcome-banner-art"
        src={assetPath("assets/boss-tyker.png")}
        alt=""
        aria-hidden="true"
      />
    </article>
  );
}
