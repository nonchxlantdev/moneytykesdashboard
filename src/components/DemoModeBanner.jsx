/**
 * Persistent, impossible-to-miss banner when the app is running in local demo mode.
 * If this ever appears on a live production URL, the deploy is misconfigured.
 */
export default function DemoModeBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10000,
        width: "100%",
        padding: "0.65rem 1rem",
        textAlign: "center",
        fontWeight: 700,
        fontSize: "0.95rem",
        letterSpacing: "0.02em",
        color: "#10162F",
        background: "linear-gradient(90deg, #FFC928, #FF6B1A)",
        borderBottom: "3px solid #10162F",
        boxShadow: "0 4px 12px rgba(16,22,47,0.25)"
      }}
    >
      DEMO MODE — Not a live classroom. Data is local and auth is bypassed.
    </div>
  );
}
