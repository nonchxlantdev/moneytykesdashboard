import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calculator,
  CalendarDays,
  Camera,
  ChevronRight,
  ChevronLeft,
  ClipboardCheck,
  X,
  ClipboardList,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Lightbulb,
  Lock,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Phone,
  Upload,
  Volume2,
  VolumeX,
  PiggyBank,
  Play,
  RotateCcw,
  Settings,
  ShieldAlert,
  School,
  Search,
  Timer,
  Trophy,
  Star,
  AlertTriangle,
  User,
  UserPlus,
  Users
} from "lucide-react";
import { moneyMoveQuestions } from "./moneyMoveQuestions";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import PageChalkLoader from "./components/shared/PageChalkLoader";
import { useSupabaseCoreSync } from "./data/useSupabaseCoreSync";
import RewardsPage from "./pages/RewardsPage";
import ReportCardsPage from "./pages/ReportCardsPage";
import AttendancePage from "./pages/Attendance";
import CreateLessonsPage from "./pages/CreateLessonsPage";
import LessonsLibraryPage from "./pages/LessonsLibraryPage";
import Topbar from "./components/Topbar";
import EventsRail from "./components/EventsRail";
import Select from "./components/ui/Select";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { purgeLegacyMockData } from "./utils/purgeMockData";
import { seedMockData } from "./data/seedMockData";
import { formatPoints } from "./utils/points";
import "../styles.css";
import "./fonts.css";
import "./design-tokens.css";
import "./themes/dashboard-themes.css";
import "./react.css";
import "./responsive.css";
import "./theme-light.css";
import "./dashboard-v2.css";
import "./shell-v2.css";
import "./students.css";
import "./components/ui.css";
import "./components/ui/shell-components.css";
import DashboardPage from "./pages/DashboardPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import MyDayPage from "./components/MyDay/MyDayPage";
import QuizzesPage from "./pages/QuizzesPage";
import GamesLibrary from "./components/Games/GamesLibrary";
import "./components/Games/games.css";
import HowToTour from "./components/Help/HowToTour";
import { hasSeenHowTo } from "./data/helpTips";
import AdminDashboard from "./components/admin/AdminDashboard";
import StudentsDashboard from "./components/StudentsDashboard/StudentsDashboard";
import AddStudentWizard from "./components/AddStudent/AddStudentWizard";
import { ThemeProvider } from "./themes/ThemeContext";
import { getReportCardsForStudent, getTemplateForSchool, statusLabel } from "./utils/reportCardsStorage";
import { downloadReportCardPdf } from "./utils/reportCardPdf";
import "./components/ReportCards/report-cards.css";

import { navSections, ICON_SIZE, ICON_STROKE } from "./config/navigation";
import { buttonTap, fadeUp } from "./lib/motion";

const CalendarPage = React.lazy(() => import("./pages/Calendar"));
const STORAGE_KEY = "moneytykes.teacher.dashboard.v3";
const assetPath = path => `${import.meta.env.BASE_URL}${path}`;

const mobileTabItems = [
  { label: "Home", view: "dashboard", icon: Home },
  { label: "Students", view: "students", icon: Users },
  { label: "Attendance", view: "attendance", icon: ClipboardCheck },
  { label: "Rewards", view: "rewards", icon: Gift }
];

const gameCategories = [
  { title: "Money Math", subtitle: "Crunch it. Solve it.", icon: Calculator, tone: "blue", image: "moneymath.png" },
  { title: "Save Smart", subtitle: "Spend less. Save more.", icon: PiggyBank, tone: "green", image: "savesmart.png" },
  { title: "Hustle Mode", subtitle: "Work. Create. Earn.", icon: Lightbulb, tone: "purple", image: "hustlemode.png" },
  { title: "Real Life", subtitle: "Smart choices. Real impact.", icon: Home, tone: "orange", image: "reallife.png" },
  { title: "Money Moves", subtitle: "Big risks. Bigger rewards.", icon: ShieldAlert, tone: "teal", image: "moneymoves.png" }
];

const financialTips = [
  "Set a savings goal before spending your money.",
  "Small savings today can grow into big rewards tomorrow.",
  "Track what you earn, save, and spend each week.",
  "Needs come before wants when making smart money choices.",
  "Saving a little from every reward helps build strong habits.",
  "Before buying something, ask yourself if it helps your goal.",
  "A budget is a simple plan for your money.",
  "Earning money takes effort, planning, and responsibility.",
  "Smart savers think before they spend.",
  "Good money habits start with small daily choices.",
  "Compare prices before spending your money.",
  "Rewards feel better when you earn them through effort.",
  "Saving for a goal teaches patience and discipline.",
  "Track your progress to stay motivated.",
  "Sharing, saving, and spending are all parts of money management.",
  "Every coin has a job when you make a money plan.",
  "Learning about money now helps you make better choices later.",
  "Celebrate progress, even when the goal is not finished yet.",
  "A smart spender knows the difference between need and want.",
  "Confidence with money grows through practice."
];

const emptyStudentForm = { first: "", last: "", email: "", age: "", dateOfBirth: "", classLabel: "", schoolId: "", teacherId: "", guardian: "", phone: "", photo: "" };
const studentGradeOptions = ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5", "Standard 1", "Standard 2", "Standard 3", "Standard 4", "Standard 5"];
const studentAvatars = [
  "bullbasaur.png",
  "charmander.png",
  "ditto.png",
  "eevee.png",
  "gastly.png",
  "jigglypuff.png",
  "pikachu.png",
  "snorlax.png",
  "voltorb.png"
];

function createDatabase() {
  return {
    teacher: { id: 1, first: "Shamira", last: "Young", email: "shamira.young@moneytykes.school" },
    school: "MoneyTykes Classroom",
    className: "Financial Literacy Class",
    students: [],
    schools: [],
    teachers: [],
    tasks: [],
    rewards: [],
    redemptions: [],
    transactions: [],
    tips: [
      "Encourage students to set savings goals. Small steps today build financial confidence.",
      "Ask students to separate needs from wants before spending reward points.",
      "A clear point goal gives every reward a purpose before it gets spent."
    ]
  };
}

function resolveDefaultSchoolFilter(db) {
  const match = (db.schools || []).find(school => school.name === db.school);
  return match ? String(match.id) : "all";
}

function loadDatabase() {
  purgeLegacyMockData();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || createDatabase();
    return normalizeDatabase(saved);
  } catch {
    return createDatabase();
  }
}

function normalizeDatabase(saved) {
  const defaults = createDatabase();
  const teacher = { ...defaults.teacher, ...(saved.teacher || {}) };
  // Migrate the pre-existing placeholder surname so already-saved browsers
  // pick up the current default teacher identity instead of the old one.
  if (teacher.last === "Advisor") teacher.last = defaults.teacher.last;
  if (teacher.first === "Amara") {
    teacher.first = defaults.teacher.first;
    if (!teacher.email || teacher.email.startsWith("amara.")) {
      teacher.email = defaults.teacher.email;
    }
  }
  const teachers = (saved.teachers || []).map(item => {
    if (item.firstName !== "Amara") return item;
    return {
      ...item,
      firstName: defaults.teacher.first,
      email:
        !item.email || String(item.email).startsWith("amara.")
          ? defaults.teacher.email
          : item.email
    };
  });
  return {
    ...defaults,
    ...saved,
    teacher,
    students: saved.students || [],
    schools: saved.schools || [],
    teachers,
    tasks: saved.tasks || [],
    rewards: saved.rewards || [],
    redemptions: saved.redemptions || [],
    transactions: saved.transactions || [],
    tips: saved.tips || defaults.tips
  };
}

function App() {
  const isLoginRoute = window.location.pathname.replace(/\/$/, "").endsWith("/login");
  const { bootstrapping, isAuthenticated, supabaseMode, isAdmin, profile, signOut } = useAuth();
  const [db, setDb] = useState(loadDatabase);
  const [view, setView] = useState("dashboard");
  const [currentTip, setCurrentTip] = useState(() => randomFinancialTip());
  const [howToOpen, setHowToOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState(() => resolveDefaultSchoolFilter(loadDatabase()));
  const [range, setRange] = useState("month");
  const [toast, setToast] = useState("");
  const [sidebarHidden, setSidebarHidden] = useState(() => {
    try {
      return localStorage.getItem("sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });
  const [studentFocus, setStudentFocus] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [calendarFocusDate, setCalendarFocusDate] = useState(null);
  const [calendarEvents] = useLocalStorage("calendar_events", []);
  const [pageLoading, setPageLoading] = useState(false);
  const mainContentRef = useRef(null);
  const pageLoadTimerRef = useRef(null);
  const { refresh: refreshCoreData } = useSupabaseCoreSync({
    enabled: supabaseMode && isAuthenticated,
    setDb,
    setToast
  });

  // Sync signed-in profile into the local db.teacher singleton used by headers/pages.
  useEffect(() => {
    if (!profile) return;
    setDb(current => ({
      ...current,
      teacher: {
        ...current.teacher,
        id: profile.id,
        first: profile.first_name || current.teacher?.first || "",
        last: profile.last_name || current.teacher?.last || "",
        email: profile.email || current.teacher?.email || ""
      }
    }));
  }, [profile]);

  // Session gate: Supabase mode requires auth for the dashboard; send authed users away from /login.
  useEffect(() => {
    if (bootstrapping) return;
    const base = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    if (supabaseMode && !isAuthenticated && !isLoginRoute) {
      window.location.replace(`${base}login`);
      return;
    }
    if (isAuthenticated && isLoginRoute) {
      window.location.replace(base);
    }
  }, [bootstrapping, isAuthenticated, isLoginRoute, supabaseMode]);

  // Teachers must not land on Admin even via deep link / tour.
  useEffect(() => {
    if (view !== "admin") return;
    if (isAdmin) return;
    setView("dashboard");
    setToast("Admin is only available to school administrators.");
  }, [isAdmin, view]);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(db)), [db]);
  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", String(sidebarHidden));
    } catch {
      // Persist is best-effort.
    }
  }, [sidebarHidden]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") closeSidebarMenu();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  // Ruler cursor app-wide (incl. portals); chalkboard keeps red chalk / eraser
  useEffect(() => {
    if (isLoginRoute) return undefined;
    const root = document.documentElement;
    root.classList.add("mt-app-ruler-cursor");
    root.style.setProperty(
      "--ruler-cursor",
      `url("${assetPath("cursors/ruler-cursor.svg")}") 4 28, auto`
    );
    root.style.setProperty(
      "--chalk-cursor",
      `url("${assetPath("cursors/chalk-cursor.svg")}") 4 28, crosshair`
    );
    root.style.setProperty(
      "--eraser-cursor",
      `url("${assetPath("cursors/eraser-cursor.svg")}") 16 16, cell`
    );
    return () => {
      root.classList.remove("mt-app-ruler-cursor");
      root.style.removeProperty("--ruler-cursor");
      root.style.removeProperty("--chalk-cursor");
      root.style.removeProperty("--eraser-cursor");
    };
  }, [isLoginRoute]);

  // First-login spotlight walkthrough (once until Skip/Finish)
  useEffect(() => {
    if (isLoginRoute) return undefined;
    if (hasSeenHowTo()) return undefined;
    // Expand sidebar so nav targets are easy to see
    setSidebarHidden(false);
    setView("dashboard");
    const timer = window.setTimeout(() => setHowToOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [isLoginRoute]);

  function openHowToWalkthrough() {
    setSidebarHidden(false);
    setHowToOpen(true);
  }
  const dashboard = useMemo(() => buildDashboard(db, range), [db, range]);

  function update(mutator, message) {
    setDb(current => {
      const next = structuredClone(current);
      mutator(next);
      return next;
    });
    if (message) setToast(message);
  }

  function closeSidebarMenu() {
    setMenuOpen(false);
  }

  function openSidebarMenu() {
    setSidebarHidden(false);
    setMenuOpen(true);
  }

  function toggleSidebarMenu() {
    if (menuOpen) {
      closeSidebarMenu();
      return;
    }
    openSidebarMenu();
  }

  function navigate(nextView, options = {}) {
    if (nextView === "quiz-test") nextView = "quizzes";
    if (nextView === "add-student" && !isAdmin && !options.editStudentId) {
      setToast("Only school administrators can create students.");
      return;
    }
    if (pageLoadTimerRef.current) {
      window.clearTimeout(pageLoadTimerRef.current);
      pageLoadTimerRef.current = null;
    }

    const applyView = () => {
      setView(nextView);
      if (options.focusDate) setCalendarFocusDate(options.focusDate);
      if (nextView === "add-student") {
        setEditingStudentId(options.editStudentId ?? null);
      } else if (nextView !== "students") {
        setEditingStudentId(null);
      }
      setCurrentTip(current => randomFinancialTip(current));
      closeSidebarMenu();
      requestAnimationFrame(() => {
        mainContentRef.current?.scrollTo({ top: 0, behavior: "auto" });
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    };

    // Most routes are local/sync — open immediately.
    // Pass { wait: true } (or a Promise in options.wait) only when something actually needs to load.
    if (!options.wait || nextView === view) {
      setPageLoading(false);
      applyView();
      return;
    }

    setPageLoading(true);
    const finish = () => {
      applyView();
      setPageLoading(false);
      pageLoadTimerRef.current = null;
    };

    if (typeof options.wait?.then === "function") {
      Promise.resolve(options.wait).finally(() => {
        pageLoadTimerRef.current = window.setTimeout(finish, 180);
      });
      return;
    }

    pageLoadTimerRef.current = window.setTimeout(finish, 450);
  }

  const pageProps = {
    db,
    dashboard,
    search,
    setSearch,
    status,
    setStatus,
    schoolFilter,
    setSchoolFilter,
    range,
    setRange,
    currentTip,
    studentFocus,
    setStudentFocus,
    editingStudentId,
    setEditingStudentId,
    update,
    navigate,
    setToast,
    calendarEvents,
    isAdmin,
    refreshCoreData
  };

  if (bootstrapping) {
    return (
      <div className="app-shell react-app theme-light" style={{ minHeight: "100vh" }}>
        <PageChalkLoader active />
      </div>
    );
  }

  if (isLoginRoute) return <LoginPage />;

  return (
    <ThemeProvider
      className={`app-shell react-app theme-light mt-app-ruler-cursor ${sidebarHidden ? "sidebar-collapsed" : ""} ${view === "game" ? "game-active" : ""}`}
      style={{
        "--ruler-cursor": `url("${assetPath("cursors/ruler-cursor.svg")}") 4 28, auto`,
        "--chalk-cursor": `url("${assetPath("cursors/chalk-cursor.svg")}") 4 28, crosshair`,
        "--eraser-cursor": `url("${assetPath("cursors/eraser-cursor.svg")}") 16 16, cell`
      }}
    >
      <Sidebar
        currentView={view}
        open={menuOpen}
        navigate={navigate}
        collapsed={sidebarHidden}
        toggleCollapsed={() => setSidebarHidden(!sidebarHidden)}
        closeMenu={closeSidebarMenu}
        onOpenHowTo={openHowToWalkthrough}
        isAdmin={isAdmin}
        onSignOut={signOut}
      />
      {menuOpen && <button className="sidebar-backdrop" type="button" aria-label="Close navigation menu" onClick={closeSidebarMenu} />}
      <main
        className={`dashboard ${view === "game" ? "game-view" : ""} ${view === "dashboard" ? "dashboard-view" : ""} ${view === "students" ? "students-view" : ""} ${view === "attendance" ? "attendance-view" : ""} ${view === "add-student" ? "add-student-view" : ""} ${view === "lessons" ? "lessons-view" : ""} ${view === "create-lessons" ? "create-lessons-view" : ""} ${view === "calendar" ? "calendar-view" : ""} ${view === "rewards" ? "rewards-view" : ""} ${view === "quizzes" ? "quizzes-view" : ""} ${view === "my-day" ? "coming-soon-view" : ""} ${view === "admin" ? "admin-view" : ""} ${view === "report-cards" ? "report-cards-view" : ""}`}
        ref={mainContentRef}
      >
        <Topbar
          view={view}
          db={db}
          onOpenMenu={toggleSidebarMenu}
          menuOpen={menuOpen}
        />

        <div className="view active page-swap">
          <PageChalkLoader active={pageLoading} />
          {!pageLoading && view === "admin" && isAdmin && (
            <AdminDashboard db={db} update={update} onCoreRefresh={refreshCoreData} />
          )}
          {!pageLoading && view === "dashboard" && <DashboardPage {...pageProps} />}
          {!pageLoading && view === "my-day" && (
            <MyDayPage db={db} setToast={setToast} navigate={navigate} currentTip={currentTip} />
          )}
          {!pageLoading && view === "students" && <Students {...pageProps} />}
          {!pageLoading && view === "add-student" && <AddStudentPage {...pageProps} />}
          {!pageLoading && view === "lessons" && <LessonsLibraryPage setToast={setToast} navigate={navigate} />}
          {!pageLoading && view === "create-lessons" && <CreateLessonsPage db={db} setToast={setToast} navigate={navigate} />}
          {!pageLoading && view === "quizzes" && <QuizzesPage />}
          {!pageLoading && view === "attendance" && <AttendancePage db={db} setToast={setToast} navigate={navigate} />}
          {!pageLoading && view === "calendar" && (
            <React.Suspense fallback={<PageChalkLoader active />}>
              <CalendarPage
                db={db}
                setToast={setToast}
                focusDate={calendarFocusDate}
                onFocusHandled={() => setCalendarFocusDate(null)}
              />
            </React.Suspense>
          )}
          {!pageLoading && view === "rewards" && <RewardsPage db={db} setToast={setToast} update={update} />}
          {!pageLoading && view === "report-cards" && <ReportCardsPage db={db} setToast={setToast} />}
          {!pageLoading && view === "game" && <GameDashboard setToast={setToast} />}
        </div>
      </main>

      {view === "dashboard" && (
        <EventsRail calendarEvents={calendarEvents} navigate={navigate} currentTip={currentTip} />
      )}

      <HowToTour
        open={howToOpen}
        onClose={() => setHowToOpen(false)}
        onBeforeStep={step => {
          if (step?.view) setView(step.view);
          if (step?.clickSelector) {
            window.setTimeout(() => {
              document.querySelector(step.clickSelector)?.click();
            }, 80);
          }
        }}
      />

      <MobileTabBar
        view={view}
        menuOpen={menuOpen}
        navigate={navigate}
        onOpenMenu={toggleSidebarMenu}
      />
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </ThemeProvider>
  );
}

function Sidebar({ currentView, open, navigate, collapsed, toggleCollapsed, closeMenu, onOpenHowTo, isAdmin = false, onSignOut }) {
  const logoSrc = `${import.meta.env.BASE_URL}Logo.png`;
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const visibleSections = useMemo(
    () =>
      navSections
        .map(section => ({
          ...section,
          items: section.items.filter(item => {
            if (item.view === "admin") return Boolean(isAdmin);
            return true;
          })
        }))
        .filter(section => section.items.length > 0 || section.label === "System"),
    [isAdmin]
  );

  async function goToLogin() {
    try {
      await onSignOut?.();
    } catch {
      /* still leave the app */
    }
    const base = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    window.location.href = `${base}login`;
  }

  return (
    <aside
      className={`sidebar ${open ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
      data-tour="sidebar"
      aria-label="Primary navigation"
    >
      <button
        className="sidebar-toggle"
        type="button"
        aria-label={open ? "Close menu" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={() => {
          if (open) closeMenu();
          else toggleCollapsed();
        }}
      >
        {open ? (
          <X size={14} strokeWidth={2.25} />
        ) : (
          <ChevronLeft
            className={collapsed ? "is-flipped" : undefined}
            size={14}
            strokeWidth={2.25}
          />
        )}
      </button>

      <div className="sidebar-scroll mt-sidebar-scroll">
        {visibleSections.map(section => (
          <nav className="nav-section" key={section.label} aria-label={section.label}>
            <p className="nav-section-label">{section.label}</p>
            <div className="nav-list">
              {section.items.map(item => (
                <NavButton
                  key={item.view}
                  item={item}
                  active={
                    currentView === item.view
                    || (item.view === "students" && (currentView === "add-student" || currentView === "attendance"))
                    || (item.view === "lessons" && currentView === "create-lessons")
                  }
                  navigate={navigate}
                  showLabel={!collapsed}
                  collapsed={collapsed}
                  tourId={item.tourId}
                />
              ))}
              {section.label === "System" ? (
                <>
                  <button
                    type="button"
                    className="nav-item"
                    title="How To walkthrough"
                    aria-label="How To walkthrough"
                    data-tour="nav-howto"
                    onClick={() => {
                      closeMenu?.();
                      onOpenHowTo?.();
                    }}
                  >
                    <Lightbulb size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
                    {!collapsed ? <span className="label nav-item-label">How To</span> : null}
                  </button>
                  <button
                    type="button"
                    className="nav-item sidebar-logout"
                    title="Log out"
                    aria-label="Log out"
                    data-tour="nav-logout"
                    onClick={() => setLogoutConfirmOpen(true)}
                  >
                    <LogOut size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
                    {!collapsed ? <span className="label nav-item-label">Log out</span> : null}
                  </button>
                </>
              ) : null}
            </div>
          </nav>
        ))}
      </div>

      <div className="sidebar-brand">
        <img src={logoSrc} alt="MoneyTykes" />
      </div>

      {logoutConfirmOpen
        ? createPortal(
            <div
              className="modal-backdrop show logout-confirm-backdrop"
              role="presentation"
              onClick={event => {
                if (event.target === event.currentTarget) setLogoutConfirmOpen(false);
              }}
            >
              <div
                className="modal-card logout-confirm-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-confirm-title"
              >
                <div className="modal-icon logout-confirm-icon" aria-hidden="true">
                  <LogOut size={22} />
                </div>
                <h3 id="logout-confirm-title">Log out?</h3>
                <p>You&apos;ll be returned to the login screen. You can sign back in anytime.</p>
                <div className="modal-actions">
                  <button type="button" className="btn" onClick={() => setLogoutConfirmOpen(false)}>
                    Stay signed in
                  </button>
                  <button type="button" className="btn primary" onClick={goToLogin}>
                    Log out
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </aside>
  );
}

function MobileTabBar({ view, menuOpen, navigate, onOpenMenu }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || view === "game") return null;

  return createPortal(
    <nav className="mobile-tabbar" aria-label="Mobile navigation">
      {mobileTabItems.map(item => (
        <NavButton key={item.view} item={item} active={view === item.view} navigate={navigate} compact />
      ))}
      <button
        type="button"
        className={`mobile-tab ${menuOpen ? "active" : ""}`}
        aria-label="Open navigation menu"
        onClick={onOpenMenu}
      >
        <Menu />
        <span>Menu</span>
      </button>
    </nav>,
    document.body
  );
}

function NavButton({ item, active, navigate, compact = false, showLabel = true, collapsed = false, tourId }) {
  const Icon = item.icon;
  const className = compact ? "mobile-tab" : "nav-item";
  const badgeText = item.badge?.text ?? (item.badge?.count != null ? String(item.badge.count) : null);

  return (
    <motion.button
      className={`${className} ${active ? "active" : ""}`}
      type="button"
      title={item.label}
      aria-label={collapsed || compact ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      data-tour={tourId || undefined}
      onClick={() => navigate(item.view)}
      {...(compact ? {} : { ...buttonTap })}
    >
      {compact ? (
        <Icon />
      ) : (
        <>
          <Icon size={ICON_SIZE} stroke={ICON_STROKE} aria-hidden="true" />
          {showLabel ? <span className="label nav-item-label">{item.label}</span> : null}
          {showLabel && badgeText ? (
            <span className={`nav-item-badge ${item.badge?.variant || "gray"} ${item.badge?.variant === "soon" ? "nav-soon-badge" : ""}`}>
              {badgeText}
            </span>
          ) : null}
        </>
      )}
    </motion.button>
  );
}

function Students({ db, update, studentFocus, setStudentFocus, navigate, setToast, isAdmin }) {
  const [viewingStudent, setViewingStudent] = useState(null);

  function deleteStudent(student) {
    if (!isAdmin) {
      setToast?.("Only school administrators can delete students.");
      return;
    }
    if (!window.confirm(`Delete ${student.first} ${student.last}? This cannot be undone.`)) return;
    update(dbState => {
      dbState.students = dbState.students.filter(item => item.id !== student.id);
      dbState.transactions = dbState.transactions.filter(item => item.studentId !== student.id);
    }, "Student deleted");
    if (viewingStudent?.id === student.id) setViewingStudent(null);
  }

  function openEditStudent(student) {
    setViewingStudent(null);
    navigate("add-student", { editStudentId: student.id });
  }

  return (
    <>
      {viewingStudent && (
        <StudentProfile
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
          onEdit={() => openEditStudent(viewingStudent)}
          onDelete={deleteStudent}
        />
      )}
      <StudentsDashboard
        db={db}
        update={update}
        navigate={navigate}
        setToast={setToast}
        studentFocus={studentFocus}
        setStudentFocus={setStudentFocus}
        onViewStudent={setViewingStudent}
        onEditStudent={openEditStudent}
        onDeleteStudent={deleteStudent}
        canCreateStudents={Boolean(isAdmin)}
      />
    </>
  );
}

function calculateAgeFromDob(dateOfBirth) {
  if (!dateOfBirth) return "";
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? String(age) : "";
}

function AddStudentPage({ db, update, navigate, editingStudentId, setEditingStudentId, refreshCoreData }) {
  const editingStudent = editingStudentId
    ? db.students.find(student => student.id === editingStudentId)
    : null;

  function returnToStudents() {
    setEditingStudentId(null);
    navigate("students");
  }

  return (
    <AddStudentWizard
      db={db}
      update={update}
      navigate={navigate}
      editingStudent={editingStudent}
      onCancel={returnToStudents}
      onSuccess={returnToStudents}
      onCoreRefresh={refreshCoreData}
    />
  );
}

function StudentForm({ db, update, editingStudent, onCancelEdit, onSuccess, fullPage = false }) {
  const [form, setForm] = useState(emptyStudentForm);
  const [photoDragActive, setPhotoDragActive] = useState(false);
  const photoInputRef = useRef(null);
  const assignedTeachers = db.teachers.filter(teacher => teacher.schoolId === Number(form.schoolId));
  const gradeOptions = useMemo(() => {
    if (!form.classLabel || studentGradeOptions.includes(form.classLabel)) return studentGradeOptions;
    return [form.classLabel, ...studentGradeOptions];
  }, [form.classLabel]);

  useEffect(() => {
    if (!editingStudent) {
      setForm(emptyStudentForm);
      return;
    }
    setForm({
      first: editingStudent.first || "",
      last: editingStudent.last || "",
      email: editingStudent.email || "",
      age: String(editingStudent.age || ""),
      dateOfBirth: "",
      classLabel: editingStudent.classLabel || "",
      schoolId: editingStudent.schoolId ? String(editingStudent.schoolId) : "",
      teacherId: editingStudent.teacherId ? String(editingStudent.teacherId) : "",
      guardian: editingStudent.guardian || "",
      phone: editingStudent.phone || "",
      photo: editingStudent.photo || ""
    });
  }, [editingStudent]);

  function submit(event) {
    event.preventDefault();
    const school = db.schools.find(item => item.id === Number(form.schoolId));
    const teacher = db.teachers.find(item => item.id === Number(form.teacherId));
    if (!school || !teacher) return;
    const resolvedAge = form.dateOfBirth ? calculateAgeFromDob(form.dateOfBirth) : form.age;
    const studentPayload = {
      ...form,
      age: Number(resolvedAge),
      schoolId: school.id,
      schoolName: school.name,
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`
    };
    delete studentPayload.dateOfBirth;
    update(db => {
      if (editingStudent) {
        const student = db.students.find(item => item.id === editingStudent.id);
        if (!student) return;
        Object.assign(student, studentPayload);
        return;
      }
      db.students.push({ id: Date.now(), balance: 0, totalEarned: 0, streak: 0, status: "inactive", ...studentPayload });
    }, editingStudent ? "Student updated" : "Student added");
    setForm(emptyStudentForm);
    onSuccess?.();
  }

  function applyPhotoFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setForm(current => ({ ...current, photo: String(reader.result || "") }));
    reader.readAsDataURL(file);
  }

  function updatePhoto(event) {
    const file = event.target.files?.[0];
    if (file) applyPhotoFile(file);
    event.target.value = "";
  }

  function handlePhotoDrop(event) {
    event.preventDefault();
    setPhotoDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) applyPhotoFile(file);
  }

  function chooseAvatar(fileName) {
    setForm(current => ({ ...current, photo: assetPath(`avatars/${fileName}`) }));
  }

  function updateSchool(schoolId) {
    setForm(current => ({ ...current, schoolId, teacherId: "" }));
  }

  function updateDateOfBirth(dateOfBirth) {
    setForm(current => ({
      ...current,
      dateOfBirth,
      age: calculateAgeFromDob(dateOfBirth) || current.age
    }));
  }

  const computedAge = form.dateOfBirth ? calculateAgeFromDob(form.dateOfBirth) : form.age;

  if (fullPage) {
    return (
      <form className="add-student-form" onSubmit={submit}>
        <div className="add-student-layout">
          <aside className="add-student-photo-card">
            <h3 className="add-student-card-title">Student Photo</h3>
            <div className="add-student-photo-preview-wrap">
              <span className="add-student-photo-preview">
                {form.photo ? <img src={form.photo} alt="" /> : <User size={36} strokeWidth={1.5} />}
              </span>
              <button
                type="button"
                className="add-student-photo-camera"
                onClick={() => photoInputRef.current?.click()}
                aria-label="Change photo"
              >
                <Camera size={14} />
              </button>
            </div>

            <label
              className={`add-student-upload-zone ${photoDragActive ? "is-dragging" : ""}`}
              onDragEnter={event => { event.preventDefault(); setPhotoDragActive(true); }}
              onDragOver={event => event.preventDefault()}
              onDragLeave={event => { event.preventDefault(); setPhotoDragActive(false); }}
              onDrop={handlePhotoDrop}
            >
              <Upload size={22} />
              <strong>Upload photo</strong>
              <span>or drag and drop</span>
              <small>PNG or JPG up to 5 MB</small>
              <input ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={updatePhoto} hidden />
            </label>

            <div className="add-student-avatar-divider">
              <span>or choose an avatar</span>
            </div>

            <div className="add-student-avatar-grid" aria-label="Choose a student avatar">
              {studentAvatars.map(fileName => {
                const src = assetPath(`avatars/${fileName}`);
                return (
                  <button
                    className={`add-student-avatar-choice ${form.photo === src ? "selected" : ""}`}
                    type="button"
                    key={fileName}
                    onClick={() => chooseAvatar(fileName)}
                    aria-label={`Choose ${fileName.replace(".png", "")} avatar`}
                  >
                    <img src={src} alt="" />
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="add-student-fields">
            <section className="add-student-info-card">
              <header className="add-student-info-card-header">
                <span className="add-student-info-card-icon"><User size={18} /></span>
                <h3>Student Information</h3>
              </header>
              <div className="add-student-field-grid add-student-field-grid-2">
                <Field label="First Name" placeholder="Enter first name" icon={User} value={form.first} onChange={first => setForm({ ...form, first })} required />
                <Field label="Last Name" placeholder="Enter last name" icon={User} value={form.last} onChange={last => setForm({ ...form, last })} required />
                <Field label="Email Address" placeholder="Enter email address" icon={Mail} type="email" value={form.email} onChange={email => setForm({ ...form, email })} required className="add-student-field-span-2" />
              </div>
              <div className="add-student-field-grid add-student-field-grid-age">
                <Field label="Date of Birth" placeholder="Select date" icon={CalendarDays} type="date" value={form.dateOfBirth} onChange={updateDateOfBirth} helpText="Age will be calculated automatically" />
                <Field label="Age" placeholder="--" icon={Calculator} type="number" value={computedAge} onChange={age => setForm({ ...form, age })} readOnly={Boolean(form.dateOfBirth)} required={!form.dateOfBirth} />
                <label className="field-label">
                  Grade / Form
                  <span className="input-with-icon">
                    <GraduationCap />
                    <Select
                      aria-label="Grade / Form"
                      value={form.classLabel}
                      onChange={classLabel => setForm({ ...form, classLabel })}
                      placeholder="Select grade"
                      required
                      options={gradeOptions.map(grade => ({ value: grade, label: grade }))}
                    />
                  </span>
                </label>
              </div>
            </section>

            <section className="add-student-info-card">
              <header className="add-student-info-card-header">
                <span className="add-student-info-card-icon"><School size={18} /></span>
                <h3>School Information</h3>
              </header>
              <div className="add-student-field-grid add-student-field-grid-2">
                <label className="field-label">
                  School
                  <span className="input-with-icon">
                    <School />
                    <Select
                      aria-label="School"
                      value={String(form.schoolId || "")}
                      onChange={updateSchool}
                      placeholder="Search and select school"
                      required
                      options={db.schools.map(school => ({ value: String(school.id), label: school.name }))}
                    />
                  </span>
                </label>
                <label className="field-label">
                  Teacher
                  <span className="input-with-icon">
                    <Users />
                    <Select
                      aria-label="Teacher"
                      value={String(form.teacherId || "")}
                      onChange={teacherId => setForm({ ...form, teacherId })}
                      placeholder="Search and select teacher"
                      required
                      disabled={!form.schoolId}
                      options={assignedTeachers.map(teacher => ({
                        value: String(teacher.id),
                        label: `${teacher.firstName} ${teacher.lastName}`
                      }))}
                    />
                  </span>
                </label>
              </div>
              {(!db.schools.length || !db.teachers.length) && <p className="mt-student-form-note">Create a school and teacher in Admin before assigning students.</p>}
            </section>

            <section className="add-student-info-card">
              <header className="add-student-info-card-header">
                <span className="add-student-info-card-icon"><Users size={18} /></span>
                <h3>Guardian Information</h3>
              </header>
              <div className="add-student-field-grid add-student-field-grid-2">
                <Field label="Parent / Guardian Name" placeholder="Enter parent or guardian name" icon={User} value={form.guardian} onChange={guardian => setForm({ ...form, guardian })} />
                <Field label="Phone Number" placeholder="Enter phone number" icon={Phone} type="tel" value={form.phone} onChange={phone => setForm({ ...form, phone })} helpText="Include country code (e.g. +501 600-0000)" />
              </div>
            </section>
          </div>
        </div>

        <div className="add-student-form-footer">
          <button className="secondary-action add-student-cancel-btn" type="button" onClick={onCancelEdit}>Cancel</button>
          <button className="primary-action teal-action add-student-submit-btn" type="submit">
            <UserPlus size={16} />
            {editingStudent ? "Save Changes" : "Create Student"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className="section-panel students-form-card">
      <div className="section-heading students-card-heading">
        <span className="card-heading-icon"><UserPlus /></span>
        <h2>{editingStudent ? "Update Student" : "Add Student"}</h2>
      </div>
      <form className="stacked-form" onSubmit={submit}>
        <section className="add-student-section add-student-photo-section">
          <h3 className="add-student-section-title">Photo</h3>
          <div className="add-student-photo-row">
            <span className="mt-student-photo-preview add-student-photo-preview">
              {form.photo ? <img src={form.photo} alt="" /> : initials(form)}
            </span>
            <div className="add-student-photo-side">
              <p className="add-student-photo-help">Upload a photo or pick an avatar below.</p>
              <label className="add-student-upload-btn">
                <UserPlus size={14} />
                Upload photo
                <input type="file" accept="image/*" onChange={updatePhoto} hidden />
              </label>
            </div>
          </div>
          <div className="mt-student-avatar-grid" aria-label="Choose a student avatar">
            {studentAvatars.map(fileName => {
              const src = assetPath(`avatars/${fileName}`);
              return (
                <button className={`mt-student-avatar-choice ${form.photo === src ? "selected" : ""}`} type="button" key={fileName} onClick={() => chooseAvatar(fileName)} aria-label={`Choose ${fileName.replace(".png", "")} avatar`}>
                  <img src={src} alt="" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="add-student-section">
          <h3 className="add-student-section-title">Basic Information</h3>
          <div className="form-grid">
            <Field label="First Name" placeholder="First name" icon={User} value={form.first} onChange={first => setForm({ ...form, first })} required />
            <Field label="Last Name" placeholder="Last name" icon={User} value={form.last} onChange={last => setForm({ ...form, last })} required />
          </div>
          <Field label="Email" placeholder="Email address" icon={Mail} type="email" value={form.email} onChange={email => setForm({ ...form, email })} required />
          <div className="form-grid">
            <Field label="Age" placeholder="Age" icon={Users} type="number" value={form.age} onChange={age => setForm({ ...form, age })} required />
            <Field label="Standard / Form" placeholder="e.g. Form 3" icon={School} value={form.classLabel} onChange={classLabel => setForm({ ...form, classLabel })} required />
          </div>
        </section>

        <section className="add-student-section">
          <h3 className="add-student-section-title">School & Teacher</h3>
          <div className="form-grid">
            <label className="field-label">School<span className="input-with-icon"><School /><Select aria-label="School" value={String(form.schoolId || "")} onChange={updateSchool} placeholder="Select school" required options={db.schools.map(school => ({ value: String(school.id), label: school.name }))} /></span></label>
            <label className="field-label">Teacher<span className="input-with-icon"><Users /><Select aria-label="Teacher" value={String(form.teacherId || "")} onChange={teacherId => setForm({ ...form, teacherId })} placeholder="Select teacher" required disabled={!form.schoolId} options={assignedTeachers.map(teacher => ({ value: String(teacher.id), label: `${teacher.firstName} ${teacher.lastName}` }))} /></span></label>
          </div>
          {(!db.schools.length || !db.teachers.length) && <p className="mt-student-form-note">Create a school and teacher in Admin before assigning students.</p>}
        </section>

        <section className="add-student-section">
          <h3 className="add-student-section-title">Guardian Contact</h3>
          <div className="form-grid">
            <Field label="Parent / Guardian" placeholder="Parent / Guardian" icon={User} value={form.guardian} onChange={guardian => setForm({ ...form, guardian })} />
            <Field label="Contact Number" placeholder="Contact number" icon={Phone} type="tel" value={form.phone} onChange={phone => setForm({ ...form, phone })} />
          </div>
        </section>

        <div className="mt-student-form-actions">
          <button className="primary-action teal-action" type="submit"><UserPlus /> {editingStudent ? "Update Student" : "Add Student"}</button>
          <button className="secondary-action" type="button" onClick={onCancelEdit}>
            {editingStudent ? "Cancel Edit" : "Cancel"}
          </button>
        </div>
      </form>
    </article>
  );
}

function GameDashboard({ setToast }) {
  const audioRef = useRef(null);
  const [stage, setStage] = useState("select");
  const [teams, setTeams] = useState([{ id: 1, name: "Team Tykes", score: 0 }]);
  const [teamCount, setTeamCount] = useState(1);
  const [usedTiles, setUsedTiles] = useState([]);
  const [questionPool, setQuestionPool] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [resetConfirmationOpen, setResetConfirmationOpen] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.12;
    audioRef.current.muted = audioMuted;
  }, [audioMuted]);

  useEffect(() => {
    if (!activeQuestion || !timerRunning || showAnswer || timeLeft <= 0) return undefined;
    const timerId = setTimeout(() => {
      setTimeLeft(current => {
        if (current <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearTimeout(timerId);
  }, [activeQuestion, timerRunning, showAnswer, timeLeft]);

  function openLoading() {
    setStage("loading");
  }

  function startSetup() {
    setStage("teams");
  }

  function updateTeamCount(nextCount) {
    const count = Math.min(5, Math.max(1, Number(nextCount)));
    setTeamCount(count);
    setTeams(current => Array.from({ length: count }, (_, index) => {
      return current[index] || { id: index + 1, name: `Team ${index + 1}`, score: 0 };
    }));
    setSelectedTeamId(1);
  }

  function updateTeamName(index, name) {
    setTeams(current => current.map((team, teamIndex) => teamIndex === index ? { ...team, name } : team));
  }

  function beginGame(event) {
    event.preventDefault();
    const readyTeams = teams.slice(0, teamCount).map((team, index) => ({
      id: index + 1,
      name: team.name.trim() || `Team ${index + 1}`,
      score: 0
    }));
    setTeams(readyTeams);
    setSelectedTeamId(readyTeams[0].id);
    setUsedTiles([]);
    setQuestionPool(shuffleQuestions(moneyMoveQuestions));
    setActiveQuestion(null);
    setShowAnswer(false);
    setStage("play");
    requestAnimationFrame(() => {
      if (!audioRef.current) return;
      audioRef.current.volume = 0.12;
      audioRef.current.muted = audioMuted;
      audioRef.current.play().catch(() => {});
    });
  }

  function chooseTile(category, value) {
    const bankCategory = category.questionCategory || category.title;
    const source = questionPool.length ? questionPool : shuffleQuestions(moneyMoveQuestions);
    const questionIndex = source.findIndex(item => item.category === bankCategory && item.value === value);
    const fallbackOptions = shuffleQuestions(moneyMoveQuestions).filter(item => item.category === bankCategory && item.value === value);
    const question = questionIndex >= 0 ? source[questionIndex] : fallbackOptions[0];
    if (!question) return;
    if (questionIndex >= 0) {
      setQuestionPool(source.filter((_, index) => index !== questionIndex));
    }
    const seconds = secondsForValue(value);
    setActiveQuestion({ ...question, boardTitle: category.title, tileId: tileId(category.title, value), seconds });
    setTimeLeft(seconds);
    setTimerRunning(false);
    setShowAnswer(false);
  }

  function awardPoints() {
    if (!activeQuestion) return;
    setTeams(current => current.map(team => team.id === Number(selectedTeamId) ? { ...team, score: team.score + activeQuestion.value } : team));
    closeQuestion(true);
  }

  function closeQuestion(markUsed) {
    if (markUsed && activeQuestion) setUsedTiles(current => [...new Set([...current, activeQuestion.tileId])]);
    setActiveQuestion(null);
    setShowAnswer(false);
    setTimeLeft(0);
    setTimerRunning(false);
  }

  function resetGame() {
    setStage("select");
    setTeams([{ id: 1, name: "Team Tykes", score: 0 }]);
    setTeamCount(1);
    setUsedTiles([]);
    setQuestionPool([]);
    setActiveQuestion(null);
    setSelectedTeamId(1);
    setShowAnswer(false);
    setTimeLeft(0);
    setTimerRunning(false);
    setResetConfirmationOpen(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // TODO: Reset the active Supabase game-session record here when persistent game sessions are added.
    setToast("Game has been reset.");
  }

  if (stage === "select") {
    return (
      <>
        <audio ref={audioRef} src={assetPath("gamebackgroundaudio.mp3")} loop preload="auto" />
        <GamesLibrary
          onSelectGame={gameId => {
            if (gameId === "money-moves") openLoading();
          }}
        />
      </>
    );
  }

  if (stage === "loading") {
    return (
      <section className="game-page-main game-step active">
        <audio ref={audioRef} src={assetPath("gamebackgroundaudio.mp3")} loop preload="auto" />
        <div className="game-panel">
          <div className="game-panel-center">
            <img src={assetPath("Logo.png")} alt="MoneyTykes" />
            <p className="eyebrow">Money Moves Live</p>
            <h2>Build Your Team Score. Win Your Future.</h2>
            <p className="game-panel-lead">Get ready to pick categories, race the timer, and award points to your teams.</p>
            <button className="game-start-button" type="button" onClick={startSetup}>
              <Play /> Start Game
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (stage === "teams") {
    return (
      <section className="game-page-main game-step active">
        <audio ref={audioRef} src={assetPath("gamebackgroundaudio.mp3")} loop preload="auto" />
        <div className="game-panel">
          <div className="game-panel-center">
            <div className="team-setup-heading">
              <p className="game-kicker">
                <BarChart3 /> Money Moves Live
              </p>
              <h2>Enter Teams</h2>
              <p className="game-panel-lead">Add between 1 and 5 teams before the board opens.</p>
            </div>
            <form className="team-form" onSubmit={beginGame}>
              <div className="team-count-row">
                <div>
                  <strong>Number of Teams</strong>
                  <span>Choose between 1 and 5 teams.</span>
                </div>
                <Select
                  aria-label="Number of teams"
                  className="team-count-select"
                  value={String(teamCount)}
                  onChange={updateTeamCount}
                  options={[1, 2, 3, 4, 5].map(count => ({ value: String(count), label: String(count) }))}
                  searchPlaceholder="Search"
                  allowClear={false}
                />
              </div>
              <div className="team-input-list">
                {teams.slice(0, teamCount).map((team, index) => (
                  <label className="team-name-row" key={team.id}>
                    <span className="team-number">{index + 1}</span>
                    <Users />
                    <input
                      value={team.name}
                      onChange={event => updateTeamName(index, event.target.value)}
                      placeholder={`Team ${index + 1}`}
                    />
                  </label>
                ))}
              </div>
              <p className="team-note">You can rename teams now and edit them before opening the board.</p>
              <button className="game-start-button team-open-board" type="submit">
                <Play /> Open Board
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="money-moves-live game-page-main"
      style={{ "--game-bg": `url("${assetPath("gamebackground.png")}")` }}
    >
      <audio ref={audioRef} src={assetPath("gamebackgroundaudio.mp3")} loop preload="auto" />
      <header className="money-live-header">
        <div className="money-live-title">
          <div className="money-live-title-row">
            <h2><span>Money Moves</span> <strong>Live!</strong></h2>
          </div>
          <p>Highest Team Score Wins!</p>
        </div>
      </header>

      <div className="game-toolbar">
        <button type="button" onClick={() => setAudioMuted(!audioMuted)}>
          {audioMuted ? <VolumeX /> : <Volume2 />}
          {audioMuted ? "Unmute" : "Mute"}
        </button>
        <button className="reset-game-button" type="button" onClick={() => setResetConfirmationOpen(true)}>
          <RotateCcw /> Reset Game
        </button>
      </div>

      <div className="money-live-layout">
        <div className="money-board-zone">
          <div className="game-board live-board" aria-label="Money Moves Live question board">
            {gameCategories.map(category => {
              const Icon = category.icon;
              return (
                <div className={`game-column ${category.tone}`} key={category.title}>
                  <header>
                    <img className="category-tab-image" src={assetPath(category.image)} alt="" aria-hidden="true" />
                    <span className="category-copy"><strong>{category.title}</strong><span>{category.subtitle}</span></span>
                  </header>
                  {[100, 200, 300, 400, 500].map(value => {
                    const id = tileId(category.title, value);
                    const used = usedTiles.includes(id);
                    return (
                      <button type="button" key={value} className={`money-tile ${used ? "used" : ""} ${value >= 400 ? "is-high-value" : ""}`} disabled={used} onClick={() => chooseTile(category, value)}>
                        <img className="money-tile-coin" src={assetPath("mtcoinpng.png")} alt="" aria-hidden="true" />
                        <strong className="money-value mt-data-num">{formatPoints(value)}</strong>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <footer className="money-live-footer">
            <div className="goal-card"><strong>Your Goal: Build Your Team Score!</strong><span>Smart answers. Smart choices. More team points.</span></div>
            <TeamPointFactors />
            <TeamScoreboard teams={teams} selectedTeamId={selectedTeamId} setSelectedTeamId={setSelectedTeamId} />
          </footer>
        </div>

        <aside className="game-rules-panel">
          <section>
            <h3>Answer Fast!</h3>
            <div className="timer-token"><strong>10</strong><span>sec</span></div>
            <p>Timer is based on question value.</p>
            <ul>
              <li><span>100 - 300 pts</span><strong>10 sec</strong></li>
              <li><span>400 - 500 pts</span><strong>15 sec</strong></li>
            </ul>
          </section>
          <section>
            <h3>How To Play</h3>
            <ol className="how-to-list">
              <li><span>1</span>Choose a category.</li>
              <li><span>2</span>Pick a value.</li>
              <li><span>3</span>Answer within the time.</li>
              <li><span>4</span>Award team points.</li>
              <li><span>5</span>Highest score wins.</li>
            </ol>
          </section>
        </aside>
      </div>

      {activeQuestion && (
        <QuestionModal
          question={activeQuestion}
          timeLeft={timeLeft}
          timerRunning={timerRunning}
          startTimer={() => setTimerRunning(true)}
          showAnswer={showAnswer}
          setShowAnswer={setShowAnswer}
          teams={teams}
          selectedTeamId={selectedTeamId}
          setSelectedTeamId={setSelectedTeamId}
          awardPoints={awardPoints}
          closeQuestion={closeQuestion}
        />
      )}
      {resetConfirmationOpen && (
        <ResetGameModal cancelReset={() => setResetConfirmationOpen(false)} confirmReset={resetGame} />
      )}
    </section>
  );
}

function ResetGameModal({ cancelReset, confirmReset }) {
  return (
    <div className="game-reset-overlay" role="presentation" onMouseDown={cancelReset}>
      <section className="game-reset-modal" role="alertdialog" aria-modal="true" aria-labelledby="reset-game-title" aria-describedby="reset-game-description" onMouseDown={event => event.stopPropagation()}>
        <span className="game-reset-icon"><RotateCcw /></span>
        <h2 id="reset-game-title">Reset Game?</h2>
        <p id="reset-game-description">This will reset the current game progress. This action cannot be undone.</p>
        <div className="game-reset-actions">
          <button className="game-reset-cancel" type="button" onClick={cancelReset}>Cancel</button>
          <button className="game-reset-confirm" type="button" onClick={confirmReset}><RotateCcw /> Yes, Reset Game</button>
        </div>
      </section>
    </div>
  );
}

function TeamPointFactors() {
  return (
    <section className="net-worth-card">
      <strong>What Affects Your Team Score?</strong>
      <div className="factor-row">
        <span className="factor positive"><Trophy /></span>
        <b>+</b>
        <span className="factor bonus"><BarChart3 /></span>
        <b>+</b>
        <span className="factor vault"><Gift /></span>
        <b>-</b>
        <span className="factor risk"><AlertTriangle /></span>
      </div>
      <div className="factor-labels">
        <span>Correct Answers</span>
        <span>Bonus & Investments</span>
        <span>Tyke Vault Rewards</span>
        <span>Penalties & Risk Losses</span>
      </div>
    </section>
  );
}

function TeamScoreboard({ teams, selectedTeamId, setSelectedTeamId }) {
  const rankedTeams = [...teams].sort((a, b) => b.score - a.score);
  const topScore = Math.max(0, ...teams.map(team => team.score));
  return (
    <section className="team-scoreboard">
      <div className="scoreboard-list">
        <div className="scoreboard-heading">
          <strong>Scoreboard</strong>
          <span>Team Score</span>
        </div>
        {rankedTeams.map((team, index) => (
          <button
            className={`team-score-row team-${index + 1} ${selectedTeamId === team.id ? "selected" : ""}`}
            type="button"
            key={team.id}
            onClick={() => setSelectedTeamId(team.id)}
          >
            <span className="leader-star-slot">{team.score > 0 && team.score === topScore && <Star className="leader-star" />}</span>
            <span>{team.name}</span>
            <strong>{formatPoints(team.score)}</strong>
          </button>
        ))}
      </div>
      <div className="scoreboard-win-art">
        <strong>Highest Team Score Wins!</strong>
      </div>
    </section>
  );
}

function QuestionModal({ question, timeLeft, timerRunning, startTimer, showAnswer, setShowAnswer, teams, selectedTeamId, setSelectedTeamId, awardPoints, closeQuestion }) {
  const isTimeUp = timeLeft === 0;
  const timerHasStarted = timerRunning || timeLeft < question.seconds;
  return (
    <div className="question-overlay" role="dialog" aria-modal="true">
      <article className="question-card">
        <header>
          <div>
            <p className="eyebrow">{question.boardTitle} - {formatPoints(question.value)}</p>
            <h3>{showAnswer ? "Answer" : "Question"}</h3>
          </div>
          <div className="question-header-actions">
            <div className={`question-timer ${isTimeUp ? "time-up" : ""}`}>
              <Timer />
              <strong>{timeLeft}</strong>
              <span>sec</span>
            </div>
            <button className="question-close-button" type="button" aria-label="Close question without using tile" onClick={() => closeQuestion(false)}>
              <X />
            </button>
          </div>
        </header>
        <div className={`question-body ${showAnswer ? "answer-mode" : ""}`}>
          <p>{showAnswer ? question.answer : question.question}</p>
          {isTimeUp && !showAnswer && <strong className="time-up-label">Time is up</strong>}
        </div>
        <div className="controller-row">
          <label className="award-team-field">
            Award Team
            <Select
              aria-label="Award team"
              value={String(selectedTeamId)}
              onChange={value => setSelectedTeamId(Number(value))}
              options={teams.map(team => ({ value: String(team.id), label: team.name }))}
              searchPlaceholder="Search teams"
              allowClear={false}
            />
          </label>
          <button className="timer-start-button" type="button" onClick={startTimer} disabled={timerRunning || isTimeUp}>
            <Play /> {timerHasStarted ? "Resume Timer" : "Start Timer"}
          </button>
          <button className="secondary-action" type="button" onClick={() => setShowAnswer(!showAnswer)}>
            {showAnswer ? "Show Question" : "Flip Answer"}
          </button>
          <button className="primary-action" type="button" onClick={awardPoints}>Award {formatPoints(question.value)}</button>
          <button className="wide-button" type="button" onClick={() => closeQuestion(true)}>No Points</button>
        </div>
      </article>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "", icon: Icon, className = "", helpText = "", readOnly = false }) {
  return (
    <label className={`field-label ${className}`.trim()}>
      {label}
      <span className={Icon ? "input-with-icon" : "input-without-icon"}>
        {Icon && <Icon />}
        <input type={type} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} required={required} readOnly={readOnly} />
      </span>
      {helpText ? <span className="field-help">{helpText}</span> : null}
    </label>
  );
}

function PageHeading({ eyebrow, title, hideOnMobile = false }) {
  return (
    <div className={`page-heading ${hideOnMobile ? "page-heading-hide-mobile" : ""}`}>
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
    </div>
  );
}

function StudentListFilters({ schools, schoolFilter, setSchoolFilter, search, setSearch, status, setStatus, showStatus = true, className = "" }) {
  return (
    <div className={`student-tools ${className}`.trim()}>
      <label className="search-box">
        <Search size={16} strokeWidth={2} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search students..."
          value={search}
          onChange={event => setSearch(event.target.value)}
          aria-label="Search students"
        />
      </label>
      <Select
        className="students-filter-select"
        aria-label="Filter by school"
        value={schoolFilter}
        onChange={setSchoolFilter}
        options={[
          { value: "all", label: "All schools" },
          ...(schools || []).map(school => ({ value: String(school.id), label: school.name }))
        ]}
        searchPlaceholder="Search schools"
        allowClear={false}
      />
      {showStatus && (
        <Select
          className="students-filter-select"
          aria-label="Filter by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All statuses" },
            { value: "on_track", label: "On Track" },
            { value: "at_risk", label: "At Risk" },
            { value: "inactive", label: "Inactive" }
          ]}
          searchPlaceholder="Search status"
          allowClear={false}
        />
      )}
    </div>
  );
}

function StudentTable({ students, detailed = false, onView, onEdit, onDelete, linkNamesOnly = false, simple = false, animated = false, variant = "default" }) {
  if (!students.length) return <EmptyState title="No students yet" text="Add students to begin tracking progress." />;
  const Row = animated ? motion.div : "div";
  const isRoster = variant === "roster";
  return (
    <div className={`student-table ${linkNamesOnly ? "name-links" : ""} ${simple ? "student-table-simple" : ""} ${isRoster ? "student-table-roster" : ""}`}>
      {isRoster && (
        <div className="student-table-header" role="row">
          <span>Student</span>
          <span>Class / Form</span>
          <span>Points</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
      )}
      {students.map((student, index) => (
        <Row
          className={`student-row ${simple ? "student-row-simple" : ""}`}
          key={student.id}
          {...(animated ? {
            variants: fadeUp,
            initial: "initial",
            animate: "animate",
            transition: { ...fadeUp.animate.transition, delay: index * 0.05 }
          } : {})}
        >
          <div className="student-person">
            <span className="avatar initials">{student.photo ? <img src={student.photo} alt="" /> : initials(student)}</span>
            <div>
              {linkNamesOnly || simple ? (
                <button type="button" className="student-name-link" onClick={() => onView?.(student)}>
                  {student.first} {student.last}
                </button>
              ) : (
                <strong>{student.first} {student.last}</strong>
              )}
              {!simple && !isRoster && (
                <span>{student.teacherName || student.classLabel || "Student profile"}</span>
              )}
            </div>
          </div>
          {simple ? (
            <span className="student-age">{student.age ? `${student.age} yrs` : "—"}</span>
          ) : (
            <span className="student-class">{student.classLabel || "—"}</span>
          )}
          <strong className="points-value student-balance">{formatPoints(student.balance || 0)}</strong>
          {isRoster && (
            <span className={`student-status-badge ${student.status || "inactive"}`}>{labelStatus(student.status)}</span>
          )}
          {(isRoster || (!simple && !linkNamesOnly)) && (
            <div className="student-actions">
              <button className="student-action-button profile" type="button" onClick={() => onView?.(student)}>View</button>
              <button className="student-action-button edit" type="button" onClick={() => onEdit?.(student)}><Pencil /> Edit</button>
              {detailed && <button className="student-action-button delete" type="button" onClick={() => onDelete?.(student)}>Delete</button>}
            </div>
          )}
        </Row>
      ))}
    </div>
  );
}

function StudentProfile({ student, onClose, onEdit, onDelete }) {
  const history = getReportCardsForStudent(student.id);
  const school = { id: student.schoolId, name: student.schoolName };
  const template = getTemplateForSchool(student.schoolId, school);

  return (
    <article className="section-panel mt-student-profile-card students-profile-panel">
      <div className="mt-student-profile-header">
        <p className="eyebrow">Student Profile</p>
        <button type="button" className="mt-student-profile-close" onClick={onClose} aria-label="Close profile">
          <X size={16} />
        </button>
      </div>
      <div className="mt-student-profile-main">
        <span className="mt-student-profile-photo">{student.photo ? <img src={student.photo} alt="" /> : initials(student)}</span>
        <div>
          <h2>{student.first} {student.last}</h2>
          <div className="mt-student-profile-grid">
            <p><strong>Standard / Form</strong><span>{student.classLabel || "Not set"}</span></p>
            <p><strong>Gender</strong><span>{student.gender === "female" ? "Female" : student.gender === "male" ? "Male" : "Not set"}</span></p>
            <p><strong>School</strong><span>{student.schoolName || "Not set"}</span></p>
            <p><strong>Teacher</strong><span>{student.teacherName || "Not set"}</span></p>
            <p><strong>Age</strong><span>{student.age || "Not set"}</span></p>
            <p><strong>Parent / Guardian</strong><span>{student.guardian || "Not set"}</span></p>
            <p><strong>Contact Number</strong><span>{student.phone || "Not set"}</span></p>
            <p><strong>Points</strong><span>{formatPoints(student.balance || 0)}</span></p>
            <p><strong>Total Points Earned</strong><span>{formatPoints(student.totalEarned || 0)}</span></p>
            <p><strong>Status</strong><span>{labelStatus(student.status)}</span></p>
          </div>

          <div className="rc-history">
            <h4>Report card history</h4>
            {history.length ? (
              <ul className="rc-history-list">
                {history.map(card => (
                  <li key={card.id}>
                    <span>
                      {card.schoolYear} · {card.term_or_terms} · {statusLabel(card.status)}
                      {card.overallAvg != null ? ` · avg ${card.overallAvg}` : ""}
                    </span>
                    <button
                      type="button"
                      className="secondary-action"
                      onClick={() =>
                        downloadReportCardPdf({
                          reportCard: card,
                          student,
                          template,
                          className: student.classLabel
                        })
                      }
                    >
                      Export PDF
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rc-muted" style={{ margin: 0 }}>No report cards yet for this student.</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-student-profile-actions">
        <button className="primary-action" type="button" onClick={onEdit}>Edit Student</button>
        <button className="secondary-action mt-student-danger-action" type="button" onClick={() => onDelete?.(student)}>Delete Student</button>
        <button className="secondary-action" type="button" onClick={onClose}>Close</button>
      </div>
    </article>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="mt-empty-state">
      <strong>{title}</strong>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

function buildDashboard(db) {
  const totalEarned = db.students.reduce((sum, student) => sum + (student.totalEarned || 0), 0);
  const totalBalance = db.students.reduce((sum, student) => sum + (student.balance || 0), 0);
  const categories = db.tasks.reduce((acc, task) => ({ ...acc, [task.category]: (acc[task.category] || 0) + 1 }), {});
  return {
    students: db.students,
    studentCount: db.students.length,
    taskCount: db.tasks.length,
    totalEarned,
    averageBalance: db.students.length ? totalBalance / db.students.length : 0,
    completionRate: db.tasks.length ? Math.round(db.tasks.reduce((sum, task) => sum + (task.completed || 0), 0) / db.tasks.length) : 0,
    activeStreaks: db.students.filter(student => student.streak > 0).length,
    leaderboard: [...db.students].sort((a, b) => (b.totalEarned || 0) - (a.totalEarned || 0)),
    topCategory: Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "Not started"
  };
}

function filterStudents(students, search, status, schoolId = "all") {
  return students.filter(student => {
    const matchesSearch = `${student.first} ${student.last} ${student.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || student.status === status;
    const matchesSchool = schoolId === "all" || String(student.schoolId) === String(schoolId);
    return matchesSearch && matchesStatus && matchesSchool;
  });
}

function randomFinancialTip(currentTip = "") {
  if (financialTips.length < 2) return financialTips[0] || "";
  let nextTip = currentTip;
  while (nextTip === currentTip) {
    nextTip = financialTips[Math.floor(Math.random() * financialTips.length)];
  }
  return nextTip;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function initials(student) {
  return `${student.first?.[0] || ""}${student.last?.[0] || ""}`.toUpperCase();
}

function labelStatus(status) {
  return ({ on_track: "On Track", at_risk: "At Risk", inactive: "Inactive" })[status] || "Inactive";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function secondsForValue(value) {
  if (value >= 400) return 15;
  return 10;
}

function tileId(category, value) {
  return `${category}:${value}`;
}

function shuffleQuestions(questions) {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

// Clear any legacy demo data first, then seed a fresh demo dataset (once) so
// every feature has data to explore. Both are guarded no-ops on return visits.
purgeLegacyMockData();
seedMockData();

const rootEl = document.getElementById("root");
const appRoot = rootEl._mtReactRoot ?? createRoot(rootEl);
rootEl._mtReactRoot = appRoot;
appRoot.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
