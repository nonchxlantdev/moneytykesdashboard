/**
 * Shown when neither Supabase nor explicit demo mode is configured.
 * Fail closed — never silently grant authenticated demo access in production.
 */
export default function MisconfiguredDeployScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#F5F7FB",
        color: "#10162F",
        fontFamily: "system-ui, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: 480,
          background: "#fff",
          border: "1px solid #E1E6F0",
          borderRadius: 16,
          padding: "2rem",
          boxShadow: "0 8px 24px rgba(16,22,47,0.08)"
        }}
      >
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#5B35D5", textTransform: "uppercase" }}>
          MoneyTykes
        </p>
        <h1 style={{ margin: "0.75rem 0 0.5rem", fontSize: "1.5rem" }}>This deployment is not configured</h1>
        <p style={{ margin: 0, lineHeight: 1.5, color: "#4a5168" }}>
          Supabase is not enabled (or env vars are missing), and demo mode is not allowed. Set{" "}
          <code>VITE_USE_SUPABASE=true</code> with a valid URL and anon key for production, or set{" "}
          <code>VITE_ALLOW_DEMO_MODE=true</code> only for local prototyping.
        </p>
      </div>
    </div>
  );
}
