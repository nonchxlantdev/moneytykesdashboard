import { IconBell, IconLayoutGrid, IconLogout, IconMenu2, IconMessageCircle, IconSearch, IconX } from "@tabler/icons-react";
import { ICON_SIZE, ICON_STROKE } from "../config/navigation";

const PAGE_TITLES = {
  admin: "Admin",
  dashboard: null,
  students: "Students",
  lessons: "Lessons Library",
  "create-lessons": "Create Lessons",
  attendance: "Attendance",
  calendar: "Calendar",
  rewards: "Rewards",
  leaderboard: "Leaderboard",
  reports: "Reports",
  "financial-zone": "Financial Zone",
  game: "Money Moves Live",
  settings: "Class Settings"
};

const PAGE_SUBTITLES = {
  lessons: "Browse, assign, and manage learning content for your students.",
  "create-lessons": "Lessons you save here appear in the Lessons library."
};

/**
 * App topbar — modeled on update design.json, preserves logout + page context.
 * @param {{
 *   view: string,
 *   db: object,
 *   search: string,
 *   setSearch: (value: string) => void,
 *   onOpenMenu: () => void,
 *   onLogout: () => void,
 *   setToast: (msg: string) => void
 * }} props
 */
export default function Topbar({ view, db, search, setSearch, onOpenMenu, menuOpen = false, onLogout, setToast }) {
  const pageTitle = PAGE_TITLES[view] ?? `Welcome back, ${db.teacher.first}`;
  const pageSubtitle = PAGE_SUBTITLES[view];
  const showMeta = view !== "dashboard";

  function notifySoon(label) {
    setToast(`${label} coming soon.`);
  }

  return (
    <header className="topbar app-entrance">
      <div className="topbar-main">
        <button className="topbar-menu-button mobile-menu" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={onOpenMenu}>
          {menuOpen ? <IconX size={20} stroke={ICON_STROKE} /> : <IconMenu2 size={20} stroke={ICON_STROKE} />}
        </button>

        <label className="topbar-search">
          <IconSearch size={16} stroke={ICON_STROKE} className="topbar-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={search}
            placeholder="Search for students, classes..."
            onChange={event => setSearch(event.target.value)}
            aria-label="Search for students and classes"
          />
        </label>

        <div className="topbar-actions">
          <button type="button" className="topbar-icon-button" title="Messages" aria-label="Messages" onClick={() => notifySoon("Messages")}>
            <IconMessageCircle size={20} stroke={ICON_STROKE} />
          </button>
          <button type="button" className="topbar-icon-button has-badge" title="Notifications" aria-label="Notifications" onClick={() => notifySoon("Notifications")}>
            <IconBell size={20} stroke={ICON_STROKE} />
            <span className="topbar-icon-badge" aria-hidden="true" />
          </button>
          <button type="button" className="topbar-icon-button" title="Apps" aria-label="Apps" onClick={() => notifySoon("Apps")}>
            <IconLayoutGrid size={20} stroke={ICON_STROKE} />
          </button>
          <button className="topbar-logout-button logout-button" type="button" onClick={onLogout}>
            <IconLogout size={ICON_SIZE} stroke={ICON_STROKE} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {showMeta && (
        <div className="topbar-meta">
          <p className="eyebrow">{db.school} · {db.className}</p>
          <h1>{pageTitle}</h1>
          {pageSubtitle && <p className="topbar-subtitle">{pageSubtitle}</p>}
        </div>
      )}
    </header>
  );
}
