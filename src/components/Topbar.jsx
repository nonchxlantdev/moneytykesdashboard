import { IconMenu2, IconX } from "@tabler/icons-react";
import { ICON_STROKE } from "../config/navigation";

const PAGE_TITLES = {
  admin: "Admin",
  dashboard: null,
  "my-day": "My Day",
  students: "Students",
  "add-student": "Add student",
  lessons: "Lessons library",
  "create-lessons": "Create lessons",
  attendance: "Attendance",
  calendar: "Calendar",
  rewards: "Rewards",
  quizzes: "Quizzes & Tests",
  game: "Games"
};

const PAGE_SUBTITLES = {
  lessons: "Browse, assign, and manage learning content for your students.",
  "create-lessons": "Build lessons in the studio, edit from your library, or manage them with the options menu."
};

const MOBILE_TAB_VIEWS = new Set(["students", "attendance", "rewards"]);

/**
 * Minimal top bar — mobile menu toggle + page title only.
 * (Search box and date were pulled out for now — see git history to restore.)
 */
export default function Topbar({
  view,
  db,
  onOpenMenu,
  menuOpen = false
}) {
  const pageTitle = PAGE_TITLES[view] ?? `Welcome back, ${db.teacher.first}`;
  const pageSubtitle = PAGE_SUBTITLES[view];
  const isMobileTabView = MOBILE_TAB_VIEWS.has(view);
  const showPageMeta = view !== "dashboard" && !isMobileTabView;

  return (
    <header className={`topbar topbar-minimal app-entrance ${isMobileTabView ? "topbar-mobile-tab-view" : ""}`}>
      <div className="topbar-main">
        <button className="topbar-menu-button mobile-menu" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={onOpenMenu}>
          {menuOpen ? <IconX size={20} stroke={ICON_STROKE} /> : <IconMenu2 size={20} stroke={ICON_STROKE} />}
        </button>
      </div>

      {showPageMeta && (
        <div className="topbar-meta">
          <p className="eyebrow">{db.school} · {db.className}</p>
          <h1>{pageTitle}</h1>
          {pageSubtitle && <p className="topbar-subtitle">{pageSubtitle}</p>}
        </div>
      )}
    </header>
  );
}
