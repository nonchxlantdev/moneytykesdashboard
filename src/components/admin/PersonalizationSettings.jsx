import { useTheme } from "../../themes/ThemeContext";
import "./personalization-settings.css";

const THEMES = [
  {
    id: "teal-gold",
    label: "Teal + Gold",
    recommended: true,
    swatch: ["#0B4B4E", "#123E35", "#F6CC69"]
  },
  {
    id: "chalkboard-green",
    label: "Chalkboard Green",
    swatch: ["#193220", "#29422F", "#F6CC69"]
  },
  {
    id: "navy-gold",
    label: "Navy + Gold",
    swatch: ["#0C2D4F", "#0A2443", "#F6CC69"]
  },
  {
    id: "soft-teal-mint",
    label: "Soft Teal + Mint",
    swatch: ["#389191", "#B8DEDC", "#73B1AC"]
  }
];

export default function PersonalizationSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="mt-admin-card admin-personalization" aria-labelledby="admin-theme-heading">
      <div className="mt-admin-card-header">
        <div>
          <h2 id="admin-theme-heading">Personalization</h2>
          <p>Choose a color scheme for the teacher dashboard.</p>
        </div>
      </div>

      <h3 className="admin-theme-title">Dashboard theme</h3>
      <p className="admin-card-sub">Preview swatches, then select a theme. Your choice is saved on this device.</p>

      <div className="theme-grid">
        {THEMES.map(item => (
          <button
            key={item.id}
            type="button"
            className={`theme-option ${theme === item.id ? "selected" : ""}`}
            onClick={() => setTheme(item.id)}
            aria-pressed={theme === item.id}
          >
            <div className="theme-swatches" aria-hidden="true">
              {item.swatch.map(color => (
                <span key={color} style={{ background: color }} />
              ))}
            </div>
            <span className="theme-label">{item.label}</span>
            {item.recommended ? <span className="theme-badge">Recommended</span> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
