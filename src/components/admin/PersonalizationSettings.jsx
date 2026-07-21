import { useTheme } from "../../themes/ThemeContext";
import { THEME_OPTIONS, THEME_TOKENS } from "../../themes/themeTokens";
import "./personalization-settings.css";

function ThemeThumbnailMock({ themeId }) {
  const t = THEME_TOKENS[themeId] || THEME_TOKENS["teal-gold"];
  const line = t.headerIsLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.18)";

  return (
    <div className="thumb-mock" aria-hidden="true">
      <div className="thumb-sidebar" style={{ background: t.sidebarBg }}>
        <span className="thumb-active-pill" style={{ background: t.activePillBg }} />
        <span className="thumb-line" style={{ background: line }} />
        <span className="thumb-line" style={{ background: line }} />
      </div>
      <div className="thumb-body">
        <div className="thumb-header" style={{ background: t.headerBg }}>
          <span
            className="thumb-gold-dot"
            style={{
              background: t.headerIsLight ? t.darkTextColor : t.accentColor,
              width: t.headerIsLight ? 16 : 10,
              borderRadius: t.headerIsLight ? 2 : "50%"
            }}
          />
        </div>
        <div className="thumb-content">
          <span className="thumb-card-block" />
          <span className="thumb-btn" style={{ background: t.accentColor }} />
        </div>
      </div>
    </div>
  );
}

export default function PersonalizationSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="admin-personalization form-card" aria-labelledby="admin-theme-heading">
      <div className="admin-personalization-head">
        <h2 id="admin-theme-heading">Personalization</h2>
        <p>Choose a color scheme for the teacher dashboard. Your choice is saved on this device.</p>
      </div>

      <div className="theme-thumb-grid">
        {THEME_OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`theme-thumb-card ${theme === opt.id ? "selected" : ""}`}
            onClick={() => setTheme(opt.id)}
            aria-pressed={theme === opt.id}
          >
            {opt.recommended ? <span className="thumb-rec">Recommended</span> : null}
            <ThemeThumbnailMock themeId={opt.id} />
            <span className="thumb-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
