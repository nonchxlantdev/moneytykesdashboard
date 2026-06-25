import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  BookOpen,
  Calculator,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  X,
  ClipboardList,
  Flame,
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
  Volume2,
  VolumeX,
  PiggyBank,
  Play,
  Plus,
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
import RewardsPage from "./pages/RewardsPage";
import AttendancePage from "./pages/Attendance";
import CreateLessonsPage from "./pages/CreateLessonsPage";
import LessonsLibraryPage from "./pages/LessonsLibraryPage";
import FinancialZonePage from "./pages/FinancialZone";
import CalendarPage from "./pages/Calendar";
import DateCard from "./components/DateCard";
import WelcomeBanner from "./components/WelcomeBanner";
import Topbar from "./components/Topbar";
import AttendanceStatCard from "./components/dashboard/AttendanceStatCard";
import UpcomingEventsCard from "./components/dashboard/UpcomingEventsCard";
import LeaderboardCard from "./components/dashboard/LeaderboardCard";
import LessonActivitiesCard from "./components/dashboard/LessonActivitiesCard";
import { useTheme } from "./hooks/useTheme";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { applyMockSeed, seedLocalStorageMockData, shouldSeedMockData } from "./data/seedMockData";
import { formatPoints } from "./utils/points";
import "../styles.css";
import "./react.css";
import "./responsive.css";
import "./theme-v2.css";
import "./theme-light.css";
import "./dashboard.css";

import { navSections, ICON_SIZE, ICON_STROKE } from "./config/navigation";
import { IconMoon, IconSun } from "@tabler/icons-react";

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

const emptySchoolForm = { name: "", contactPerson: "", email: "", phone: "", address: "", status: "active" };
const emptyTeacherForm = { firstName: "", lastName: "", email: "", temporaryPassword: "", schoolId: "", role: "Teacher", status: "active" };
const emptyStudentForm = { first: "", last: "", email: "", age: "", classLabel: "", schoolId: "", teacherId: "", guardian: "", phone: "", photo: "" };
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
    teacher: { first: "Teacher", last: "Advisor", email: "teacher@moneytykes.local" },
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
  const baseUrl = import.meta.env.BASE_URL;
  try {
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || createDatabase();
    saved = normalizeDatabase(saved);
    if (shouldSeedMockData(saved)) {
      saved = applyMockSeed(saved, baseUrl);
      seedLocalStorageMockData(saved);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
    return saved;
  } catch {
    const saved = applyMockSeed(createDatabase(), baseUrl);
    seedLocalStorageMockData(saved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return saved;
  }
}

function normalizeDatabase(saved) {
  const defaults = createDatabase();
  return {
    ...defaults,
    ...saved,
    teacher: { ...defaults.teacher, ...(saved.teacher || {}) },
    students: saved.students || [],
    schools: saved.schools || [],
    teachers: saved.teachers || [],
    tasks: saved.tasks || [],
    rewards: saved.rewards || [],
    redemptions: saved.redemptions || [],
    transactions: saved.transactions || [],
    tips: saved.tips || defaults.tips
  };
}

function App() {
  const isLoginRoute = window.location.pathname.replace(/\/$/, "").endsWith("/login");
  const [db, setDb] = useState(loadDatabase);
  const [view, setView] = useState("dashboard");
  const [currentTip, setCurrentTip] = useState(() => randomFinancialTip());
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState(() => resolveDefaultSchoolFilter(loadDatabase()));
  const [range, setRange] = useState("month");
  const [toast, setToast] = useState("");
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [studentFocus, setStudentFocus] = useState(null);
  const [calendarFocusDate, setCalendarFocusDate] = useState(null);
  const [calendarEvents] = useLocalStorage("calendar_events", []);
  const { theme, toggleTheme, isLight } = useTheme();
  const mainContentRef = useRef(null);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(db)), [db]);
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
    setView(nextView);
    if (options.focusDate) setCalendarFocusDate(options.focusDate);
    setCurrentTip(current => randomFinancialTip(current));
    closeSidebarMenu();
    requestAnimationFrame(() => {
      mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function logout() {
    window.location.href = `${import.meta.env.BASE_URL}login`;
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
    update,
    navigate,
    setToast,
    calendarEvents
  };

  if (isLoginRoute) return <LoginPage />;

  return (
    <div className={`app-shell react-app ${isLight ? "theme-light" : "theme-v2"} ${sidebarHidden ? "sidebar-collapsed" : ""} ${view === "game" ? "game-active" : ""}`}>
      <Sidebar
        currentView={view}
        open={menuOpen}
        navigate={navigate}
        collapsed={sidebarHidden}
        toggleCollapsed={() => setSidebarHidden(!sidebarHidden)}
        closeMenu={closeSidebarMenu}
        isLight={isLight}
        onToggleTheme={toggleTheme}
      />
      {menuOpen && <button className="sidebar-backdrop" type="button" aria-label="Close navigation menu" onClick={closeSidebarMenu} />}
      <main className={`dashboard ${view === "game" ? "game-view" : ""}`} ref={mainContentRef}>
        <Topbar
          view={view}
          db={db}
          search={search}
          setSearch={setSearch}
          onOpenMenu={toggleSidebarMenu}
          menuOpen={menuOpen}
          onLogout={logout}
          setToast={setToast}
        />

        {view === "dashboard" && (
          <div className="mobile-school-context" aria-label="School context">
            <p className="eyebrow">{db.school} · {db.className}</p>
          </div>
        )}

          <div className="view active page-swap" key={view}>
          {view === "admin" && <AdminDashboard db={db} update={update} />}
          {view === "dashboard" && <Dashboard {...pageProps} />}
          {view === "students" && <Students {...pageProps} />}
          {view === "lessons" && <LessonsLibraryPage setToast={setToast} navigate={navigate} />}
          {view === "create-lessons" && <CreateLessonsPage db={db} setToast={setToast} navigate={navigate} />}
          {view === "attendance" && <AttendancePage db={db} setToast={setToast} />}
          {view === "calendar" && (
            <CalendarPage
              db={db}
              setToast={setToast}
              focusDate={calendarFocusDate}
              onFocusHandled={() => setCalendarFocusDate(null)}
            />
          )}
          {view === "rewards" && <RewardsPage db={db} setToast={setToast} update={update} />}
          {view === "leaderboard" && <Leaderboard {...pageProps} />}
          {view === "reports" && <Reports dashboard={dashboard} />}
          {view === "financial-zone" && <FinancialZonePage setToast={setToast} />}
          {view === "game" && <GameDashboard setToast={setToast} />}
          {view === "settings" && <SettingsPage db={db} />}
        </div>
      </main>

      <MobileTabBar
        view={view}
        menuOpen={menuOpen}
        navigate={navigate}
        onOpenMenu={toggleSidebarMenu}
      />
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

function Sidebar({ currentView, open, navigate, collapsed, toggleCollapsed, closeMenu, isLight, onToggleTheme }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""} ${collapsed ? "collapsed" : ""}`} aria-label="Primary navigation">
      <div className="sidebar-top">
        {!collapsed && (
          <div className="brand">
            <img className="brand-logo" src={assetPath("Logo.png")} alt="MoneyTykes" />
          </div>
        )}
        <button className="sidebar-collapse-button" type="button" aria-label={open ? "Close menu" : collapsed ? "Show sidebar" : "Hide sidebar"} onClick={() => {
          if (open) closeMenu();
          else toggleCollapsed();
        }}>
          {open ? <X /> : collapsed ? <ChevronRight /> : <Menu />}
        </button>
      </div>
      <div className="sidebar-scroll mt-sidebar-scroll">
        {navSections.map(section => (
          <nav className="nav-section" key={section.label} aria-label={section.label}>
            {!collapsed && <p className="nav-section-label">{section.label}</p>}
            <div className="nav-list">
              {section.items.map(item => (
                <NavButton
                  key={item.view}
                  item={item}
                  active={currentView === item.view}
                  navigate={navigate}
                  showLabel={!collapsed}
                />
              ))}
            </div>
          </nav>
        ))}
        {!collapsed && (
          <>
            <section className="challenge-card mt-sidebar-action-card">
              <div className="challenge-badge mt-sidebar-action-icon" aria-hidden="true"><Trophy /></div>
              <h2 className="mt-sidebar-action-title">Run a Challenge</h2>
              <p className="mt-sidebar-action-text">Motivate students with fun class goals.</p>
              <button className="secondary-action mt-sidebar-action-button" type="button" onClick={() => navigate("game")}>Start Challenge</button>
            </section>
            <button className="teacher-chip mt-sidebar-profile-card" type="button">
              <span className="avatar initials mt-sidebar-profile-avatar">T</span>
              <span className="mt-sidebar-profile-info">
                <strong className="mt-sidebar-profile-name">Teacher</strong>
                <span className="mt-sidebar-profile-role">Class owner</span>
              </span>
              <ChevronRight className="mt-sidebar-profile-arrow" />
            </button>
            <div className="sidebar-footer-tools">
              <button
                type="button"
                className="sidebar-theme-toggle"
                onClick={onToggleTheme}
                aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
              >
                {isLight ? <IconMoon size={18} stroke={ICON_STROKE} /> : <IconSun size={18} stroke={ICON_STROKE} />}
                <span>{isLight ? "Dark mode" : "Light mode"}</span>
              </button>
            </div>
          </>
        )}
      </div>
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

function NavButton({ item, active, navigate, compact = false, showLabel = true }) {
  const Icon = item.icon;
  const className = compact ? "mobile-tab" : "nav-item";
  const badgeText = item.badge?.text ?? (item.badge?.count != null ? String(item.badge.count) : null);

  return (
    <button
      className={`${className} ${active ? "active" : ""}`}
      type="button"
      title={item.label}
      onClick={() => navigate(item.view)}
    >
      {compact ? (
        <Icon />
      ) : (
        <Icon size={ICON_SIZE} stroke={ICON_STROKE} />
      )}
      {showLabel && <span className="nav-item-label">{item.label}</span>}
      {showLabel && badgeText && (
        <span className={`nav-item-badge ${item.badge?.variant || "gray"}`}>{badgeText}</span>
      )}
    </button>
  );
}

function AdminDashboard({ db, update }) {
  const schools = db.schools || [];
  const teachers = db.teachers || [];
  const [schoolFormOpen, setSchoolFormOpen] = useState(false);
  const [teacherFormOpen, setTeacherFormOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [schoolForm, setSchoolForm] = useState(emptySchoolForm);
  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
  const [schoolError, setSchoolError] = useState("");
  const [teacherError, setTeacherError] = useState("");

  // TODO: connect total students count from Supabase or student records later if records move outside local dashboard state.
  const totalStudents = db.students.length;
  const activeTeachers = teachers.filter(teacher => teacher.status === "active").length;

  const stats = [
    { title: "Schools", value: schools.length, subtext: "Registered schools", icon: School },
    { title: "Teachers", value: teachers.length, subtext: "Teacher accounts", icon: Users },
    { title: "Students", value: totalStudents, subtext: "Across all schools", icon: GraduationCap },
    { title: "Active Accounts", value: activeTeachers, subtext: "Able to log in", icon: Check }
  ];

  function openSchoolForm(school) {
    setSchoolError("");
    if (school) {
      setEditingSchoolId(school.id);
      setSchoolForm({ name: school.name, contactPerson: school.contactPerson, email: school.email, phone: school.phone, address: school.address, status: school.status });
    } else {
      setEditingSchoolId(null);
      setSchoolForm(emptySchoolForm);
    }
    setSchoolFormOpen(true);
  }

  function saveSchool(event) {
    event.preventDefault();
    if (!schoolForm.name.trim() || !schoolForm.contactPerson.trim() || !schoolForm.email.trim() || !schoolForm.phone.trim() || !schoolForm.address.trim()) {
      setSchoolError("All school fields are required.");
      return;
    }
    if (!isValidEmail(schoolForm.email)) {
      setSchoolError("Please enter a valid school email.");
      return;
    }
    update(next => {
      if (editingSchoolId) {
        next.schools = next.schools.map(school => school.id === editingSchoolId ? { ...school, ...schoolForm, name: schoolForm.name.trim() } : school);
        next.teachers = next.teachers.map(teacher => teacher.schoolId === editingSchoolId ? { ...teacher, schoolName: schoolForm.name.trim() } : teacher);
        return;
      }
      next.schools.push({ id: Date.now(), ...schoolForm, name: schoolForm.name.trim(), createdAt: today() });
    }, editingSchoolId ? "School updated" : "School added");
    setSchoolFormOpen(false);
    setEditingSchoolId(null);
    setSchoolForm(emptySchoolForm);
  }

  function openTeacherForm(teacher) {
    setTeacherError("");
    if (!schools.length) {
      setTeacherError("Create a school before adding a teacher.");
      return;
    }
    if (teacher) {
      setEditingTeacherId(teacher.id);
      setTeacherForm({ firstName: teacher.firstName, lastName: teacher.lastName, email: teacher.email, temporaryPassword: "********", schoolId: String(teacher.schoolId), role: teacher.role, status: teacher.status });
    } else {
      setEditingTeacherId(null);
      setTeacherForm(emptyTeacherForm);
    }
    setTeacherFormOpen(true);
  }

  function createTeacherAccount(nextTeacher) {
    // TODO: create teacher auth user in Supabase.
    // TODO: save teacher profile to Supabase.
    // TODO: link teacher auth user to assigned school.
    update(next => {
      if (editingTeacherId) {
        next.teachers = next.teachers.map(teacher => teacher.id === editingTeacherId ? { ...teacher, ...nextTeacher } : teacher);
        return;
      }
      next.teachers.push({ id: Date.now(), ...nextTeacher, createdAt: today() });
    }, editingTeacherId ? "Teacher updated" : "Teacher added");
  }

  function saveTeacher(event) {
    event.preventDefault();
    if (!teacherForm.firstName.trim() || !teacherForm.lastName.trim()) {
      setTeacherError("First and last name are required.");
      return;
    }
    if (!teacherForm.email.trim() || !isValidEmail(teacherForm.email)) {
      setTeacherError("Please enter a valid teacher email.");
      return;
    }
    if (!teacherForm.temporaryPassword.trim()) {
      setTeacherError("Temporary password is required for new teachers.");
      return;
    }
    const school = schools.find(item => item.id === Number(teacherForm.schoolId));
    if (!school) {
      setTeacherError("Please assign a school.");
      return;
    }
    createTeacherAccount({
      firstName: teacherForm.firstName.trim(),
      lastName: teacherForm.lastName.trim(),
      email: teacherForm.email.trim(),
      schoolId: school.id,
      schoolName: school.name,
      role: teacherForm.role,
      status: teacherForm.status
    });
    setTeacherFormOpen(false);
    setEditingTeacherId(null);
    setTeacherForm(emptyTeacherForm);
  }

  function toggleSchoolStatus(id) {
    update(next => {
      next.schools = next.schools.map(school => school.id === id ? { ...school, status: school.status === "active" ? "inactive" : "active" } : school);
    }, "School status updated");
  }

  function toggleTeacherStatus(id) {
    update(next => {
      next.teachers = next.teachers.map(teacher => teacher.id === id ? { ...teacher, status: teacher.status === "active" ? "inactive" : "active" } : teacher);
    }, "Teacher status updated");
  }

  function deleteSchool(id) {
    if (!window.confirm("Delete this school? Assigned local teacher records will also be removed.")) return;
    update(next => {
      next.schools = next.schools.filter(school => school.id !== id);
      next.teachers = next.teachers.filter(teacher => teacher.schoolId !== id);
    }, "School deleted");
    if (editingSchoolId === id) {
      setSchoolFormOpen(false);
      setEditingSchoolId(null);
      setSchoolForm(emptySchoolForm);
    }
  }

  function deleteTeacher(id) {
    if (!window.confirm("Delete this teacher account from local admin records?")) return;
    update(next => {
      next.teachers = next.teachers.filter(teacher => teacher.id !== id);
    }, "Teacher deleted");
    if (editingTeacherId === id) {
      setTeacherFormOpen(false);
      setEditingTeacherId(null);
      setTeacherForm(emptyTeacherForm);
    }
  }

  return (
    <div className="mt-admin-page">
      <PageHeading eyebrow="Admin" title="Admin Dashboard" />
      <p className="mt-admin-subtitle">Manage schools and teacher accounts.</p>

      <section className="mt-admin-stats" aria-label="Admin statistics">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <article className="mt-admin-stat-card" key={stat.title}>
              <span><Icon /></span>
              <div>
                <strong>{stat.value}</strong>
                <p>{stat.title}</p>
                <small>{stat.subtext}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-admin-grid">
        <article className="mt-admin-card">
          <div className="mt-admin-card-header">
            <div><h2>Schools</h2><p>Add and manage participating schools.</p></div>
            <button className="primary-action mt-admin-primary" type="button" onClick={() => openSchoolForm()}>Add School</button>
          </div>
          {schoolFormOpen && (
            <form className="mt-admin-form" onSubmit={saveSchool}>
              {schoolError && <p className="mt-admin-error">{schoolError}</p>}
              <div className="form-grid">
                <Field label="School Name" value={schoolForm.name} onChange={name => setSchoolForm({ ...schoolForm, name })} required />
                <Field label="Contact Person" value={schoolForm.contactPerson} onChange={contactPerson => setSchoolForm({ ...schoolForm, contactPerson })} required />
              </div>
              <div className="form-grid">
                <Field label="Email" type="email" value={schoolForm.email} onChange={email => setSchoolForm({ ...schoolForm, email })} required />
                <Field label="Phone Number" type="tel" value={schoolForm.phone} onChange={phone => setSchoolForm({ ...schoolForm, phone })} required />
              </div>
              <Field label="Address" value={schoolForm.address} onChange={address => setSchoolForm({ ...schoolForm, address })} required />
              <label className="field-label">Status<span className="input-without-icon"><select value={schoolForm.status} onChange={event => setSchoolForm({ ...schoolForm, status: event.target.value })} required><option value="active">Active</option><option value="inactive">Inactive</option></select></span></label>
              <div className="mt-admin-form-actions">
                <button className="primary-action" type="submit">Save School</button>
                <button className="secondary-action" type="button" onClick={() => setSchoolFormOpen(false)}>Cancel</button>
                {editingSchoolId && <button className="secondary-action mt-admin-danger" type="button" onClick={() => deleteSchool(editingSchoolId)}>Delete School</button>}
              </div>
            </form>
          )}
          <AdminSchoolTable schools={schools} editSchool={openSchoolForm} deleteSchool={deleteSchool} />
        </article>

        <article className="mt-admin-card">
          <div className="mt-admin-card-header">
            <div><h2>Teachers</h2><p>Create teacher accounts and assign them to a school.</p></div>
            <button className="primary-action mt-admin-primary" type="button" onClick={() => openTeacherForm()} disabled={!schools.length} title={!schools.length ? "Create a school before adding a teacher" : "Add Teacher"}>Add Teacher</button>
          </div>
          {!schools.length && <p className="mt-admin-note">Create a school first so each teacher can be assigned during setup.</p>}
          {teacherError && !teacherFormOpen && <p className="mt-admin-error">{teacherError}</p>}
          {teacherFormOpen && (
            <form className="mt-admin-form" onSubmit={saveTeacher}>
              {teacherError && <p className="mt-admin-error">{teacherError}</p>}
              <div className="form-grid">
                <Field label="First Name" value={teacherForm.firstName} onChange={firstName => setTeacherForm({ ...teacherForm, firstName })} required />
                <Field label="Last Name" value={teacherForm.lastName} onChange={lastName => setTeacherForm({ ...teacherForm, lastName })} required />
              </div>
              <Field label="Email Address" type="email" value={teacherForm.email} onChange={email => setTeacherForm({ ...teacherForm, email })} required />
              <Field label="Temporary Password" type="password" value={teacherForm.temporaryPassword} onChange={temporaryPassword => setTeacherForm({ ...teacherForm, temporaryPassword })} required />
              <div className="form-grid">
                <label className="field-label">Assign School<span className="input-without-icon"><select value={teacherForm.schoolId} onChange={event => setTeacherForm({ ...teacherForm, schoolId: event.target.value })} required><option value="">Select school</option>{schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}</select></span></label>
                <label className="field-label">Role<span className="input-without-icon"><select value={teacherForm.role} onChange={event => setTeacherForm({ ...teacherForm, role: event.target.value })} required><option>Teacher</option><option>School Admin</option></select></span></label>
              </div>
              <label className="field-label">Status<span className="input-without-icon"><select value={teacherForm.status} onChange={event => setTeacherForm({ ...teacherForm, status: event.target.value })} required><option value="active">Active</option><option value="inactive">Inactive</option></select></span></label>
              <div className="mt-admin-form-actions">
                <button className="primary-action" type="submit">Save Teacher</button>
                <button className="secondary-action" type="button" onClick={() => setTeacherFormOpen(false)}>Cancel</button>
                {editingTeacherId && <button className="secondary-action mt-admin-danger" type="button" onClick={() => deleteTeacher(editingTeacherId)}>Delete Teacher</button>}
              </div>
            </form>
          )}
          <AdminTeacherTable teachers={teachers} editTeacher={openTeacherForm} deleteTeacher={deleteTeacher} />
        </article>
      </section>
    </div>
  );
}

function AdminSchoolTable({ schools, editSchool, deleteSchool }) {
  if (!schools.length) return <EmptyState title="No schools yet" text="Add a school when you are ready to start onboarding." />;
  return (
    <div className="mt-admin-table-wrap">
      <div className="mt-admin-table mt-admin-schools-table">
        <div className="mt-admin-table-head"><span>School Name</span><span>Contact Person</span><span>Phone</span><span>Status</span><span>Actions</span></div>
        {schools.map(school => (
          <div className="mt-admin-table-row" key={school.id}>
            <strong>{school.name}</strong><span>{school.contactPerson || "Not set"}</span><span>{school.phone || "Optional"}</span><StatusBadge status={school.status} />
            <div className="mt-admin-actions"><button type="button" onClick={() => editSchool(school)}>Edit</button><button className="mt-admin-danger" type="button" onClick={() => deleteSchool(school.id)}>Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTeacherTable({ teachers, editTeacher, deleteTeacher }) {
  if (!teachers.length) return <EmptyState title="No teachers yet" text="Create teacher accounts after schools are added." />;
  return (
    <div className="mt-admin-table-wrap">
      <div className="mt-admin-table mt-admin-teachers-table">
        <div className="mt-admin-table-head"><span>Teacher Name</span><span>School</span><span>Role</span><span>Status</span><span>Actions</span></div>
        {teachers.map(teacher => (
          <div className="mt-admin-table-row" key={teacher.id}>
            <strong>{teacher.firstName} {teacher.lastName}</strong><span>{teacher.schoolName}</span><span>{teacher.role}</span><StatusBadge status={teacher.status} />
            <div className="mt-admin-actions"><button type="button" onClick={() => editTeacher(teacher)}>Edit</button><button className="mt-admin-danger" type="button" onClick={() => deleteTeacher(teacher.id)}>Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`mt-status-badge mt-status-${status}`}>{status === "active" ? "Active" : "Inactive"}</span>;
}

function Dashboard(props) {
  const { dashboard, db, search, setSearch, status, setStatus, schoolFilter, setSchoolFilter, currentTip, navigate, setStudentFocus, calendarEvents } = props;
  return (
    <div className="dashboard-main">
      <section className="dashboard-hero-row">
        <WelcomeBanner
          teacherName={db.teacher.first}
          className={db.className}
          studentCount={dashboard.studentCount}
          onViewAnalytics={() => navigate("reports")}
          assetPath={assetPath}
        />
        <DateCard panel />
      </section>

      <section className="dashboard-stats-row dashboard-stats-row-two" aria-label="Class statistics">
        <AttendanceStatCard
          className={db.className}
          studentCount={dashboard.studentCount}
          onNavigate={() => navigate("attendance")}
        />
        <UpcomingEventsCard
          events={calendarEvents}
          onNavigate={date => navigate("calendar", date ? { focusDate: date } : {})}
        />
      </section>

      <section className="dashboard-split-row">
        <LeaderboardCard
          earners={dashboard.leaderboard}
          onNavigate={() => navigate("leaderboard")}
        />
        <LessonActivitiesCard onNavigate={() => navigate("lessons")} />
      </section>

      <section className="quick-actions section-panel">
        <div className="section-heading"><h2>Quick Actions</h2></div>
        <div className="quick-action-grid">
          <ActionCard icon={Plus} title="Add Student" text="Grow your classroom roster." onClick={() => navigate("students")} />
          <ActionCard icon={Trophy} title="Award Points" text="Recognize student achievements." onClick={() => navigate("rewards")} />
          <ActionCard icon={BookOpen} title="Create Lesson" text="Build and publish lessons." onClick={() => navigate("create-lessons")} />
          <ActionCard icon={Trophy} title="Launch Game" text="Open Money Moves Live." onClick={() => navigate("game")} />
        </div>
      </section>

      <section className="content-grid">
        <StudentOverview
          db={db}
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          schoolFilter={schoolFilter}
          setSchoolFilter={setSchoolFilter}
          navigate={navigate}
          setStudentFocus={setStudentFocus}
        />
        <RecentTasks tasks={db.tasks.slice(-4).reverse()} navigate={navigate} />
        <Insights dashboard={dashboard} />
      </section>

      <MoneyTykesTipBanner tip={currentTip} />
    </div>
  );
}

function ActionCard({ icon: Icon, title, text, onClick }) {
  return (
    <button className="quick-action lift-card" type="button" onClick={onClick}>
      <span><Icon /></span>
      <strong>{title}</strong>
      <small>{text}</small>
    </button>
  );
}

function StudentOverview({ db, search, setSearch, status, setStatus, schoolFilter, setSchoolFilter, navigate, setStudentFocus }) {
  const students = filterStudents(db.students, search, status, schoolFilter).slice(0, 5);
  function openStudent(student, mode) {
    setStudentFocus({ id: student.id, mode });
    navigate("students");
  }
  return (
    <article className="section-panel student-overview">
      <div className="section-heading"><h2>Student Overview</h2></div>
      <StudentListFilters
        schools={db.schools}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />
      <StudentTable students={students} simple onView={student => openStudent(student, "view")} linkNamesOnly />
    </article>
  );
}

function TopEarners({ earners, range, setRange, navigate }) {
  return (
    <article className="section-panel">
      <div className="section-heading inline-control">
        <h2>Top Point Earners</h2>
        <select value={range} onChange={event => setRange(event.target.value)}>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>
      <EarnersList earners={earners} />
      <button className="wide-button" type="button" onClick={() => navigate("leaderboard")}>View Full Leaderboard</button>
    </article>
  );
}

function RecentTasks({ tasks, navigate }) {
  return (
    <article className="section-panel">
      <div className="section-heading inline-control">
        <h2>Recent Tasks</h2>
        <button className="link-button" type="button" onClick={() => navigate("create-lessons")}>Create Lesson</button>
      </div>
      <div className="task-list">
        {tasks.length ? tasks.map(task => <TaskRow key={task.id} task={task} />) : <EmptyState title="No tasks yet" text="Create a task to start tracking progress." />}
      </div>
    </article>
  );
}

function Insights({ dashboard }) {
  return (
    <article className="section-panel">
      <div className="section-heading"><h2>Class Insights</h2></div>
      <div className="insight-grid">
        <Insight title="Average Points" value={formatPoints(Math.round(dashboard.averageBalance))} />
        <Insight title="Task Library" value={dashboard.taskCount} />
        <Insight title="Top Category" value={dashboard.topCategory} />
        <Insight title="Momentum" value={`${dashboard.completionRate}%`} />
      </div>
    </article>
  );
}

function Students({ db, dashboard, update, studentFocus, setStudentFocus, search, setSearch, status, setStatus, schoolFilter, setSchoolFilter }) {
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const rosterStudents = filterStudents(dashboard.students, search, status, schoolFilter);

  useEffect(() => {
    if (!studentFocus) return;
    const student = db.students.find(item => item.id === studentFocus.id);
    if (!student) {
      setStudentFocus(null);
      return;
    }
    if (studentFocus.mode === "edit") {
      setEditingStudent(student);
      setViewingStudent(null);
    } else {
      setViewingStudent(student);
      setEditingStudent(null);
    }
    setStudentFocus(null);
  }, [db.students, setStudentFocus, studentFocus]);

  function closeEdit() {
    setEditingStudent(null);
  }

  function deleteStudent(student) {
    if (!window.confirm(`Delete ${student.first} ${student.last}? This cannot be undone.`)) return;
    update(db => {
      db.students = db.students.filter(item => item.id !== student.id);
      db.transactions = db.transactions.filter(item => item.studentId !== student.id);
    }, "Student deleted");
    if (editingStudent?.id === student.id) setEditingStudent(null);
    if (viewingStudent?.id === student.id) setViewingStudent(null);
  }

  return (
    <div className="students-dashboard-screen">
      <PageHeading eyebrow="Class Roster" title="Students Dashboard" hideOnMobile />
      <div className="management-grid">
        <StudentForm db={db} update={update} editingStudent={editingStudent} onCancelEdit={closeEdit} />
        <PointsForm students={db.students} update={update} />
      </div>
      {viewingStudent && <StudentProfile student={viewingStudent} onClose={() => setViewingStudent(null)} onEdit={() => { setEditingStudent(viewingStudent); setViewingStudent(null); }} onDelete={deleteStudent} />}
      <article className="section-panel full-width-panel students-roster-card">
        <div className="section-heading students-card-heading">
          <span className="card-heading-icon"><Users /></span>
          <h2>Students</h2>
        </div>
        <StudentListFilters
          schools={db.schools}
          schoolFilter={schoolFilter}
          setSchoolFilter={setSchoolFilter}
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />
        <StudentTable
          students={rosterStudents}
          simple
          onView={setViewingStudent}
        />
      </article>
    </div>
  );
}

function StudentForm({ db, update, editingStudent, onCancelEdit }) {
  const [form, setForm] = useState(emptyStudentForm);
  const assignedTeachers = db.teachers.filter(teacher => teacher.schoolId === Number(form.schoolId));

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
    const studentPayload = {
      ...form,
      age: Number(form.age),
      schoolId: school.id,
      schoolName: school.name,
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`
    };
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
    if (editingStudent) onCancelEdit();
  }

  function updatePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(current => ({ ...current, photo: String(reader.result || "") }));
    reader.readAsDataURL(file);
  }

  function chooseAvatar(fileName) {
    setForm(current => ({ ...current, photo: assetPath(`avatars/${fileName}`) }));
  }

  function updateSchool(schoolId) {
    setForm(current => ({ ...current, schoolId, teacherId: "" }));
  }

  return (
    <article className="section-panel students-form-card">
      <div className="section-heading students-card-heading">
        <span className="card-heading-icon"><UserPlus /></span>
        <h2>{editingStudent ? "Update Student" : "Add Student"}</h2>
      </div>
      <form className="stacked-form" onSubmit={submit}>
        <label className="field-label">
          Student Photo
          <span className="mt-student-photo-field">
            <span className="mt-student-photo-preview">{form.photo ? <img src={form.photo} alt="" /> : initials(form)}</span>
            <span className="mt-student-photo-controls">
              <span className="mt-student-photo-help">Upload a photo or choose an avatar.</span>
              <input type="file" accept="image/*" onChange={updatePhoto} />
            </span>
          </span>
        </label>
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
        <div className="form-grid">
          <Field label="First Name" placeholder="First name" icon={User} value={form.first} onChange={first => setForm({ ...form, first })} required />
          <Field label="Last Name" placeholder="Last name" icon={User} value={form.last} onChange={last => setForm({ ...form, last })} required />
        </div>
        <Field label="Email" placeholder="Email address" icon={Mail} type="email" value={form.email} onChange={email => setForm({ ...form, email })} required />
        <div className="form-grid">
          <Field label="Age" placeholder="Age" icon={Users} type="number" value={form.age} onChange={age => setForm({ ...form, age })} required />
          <Field label="Standard / Form" placeholder="Standard / Form" icon={School} value={form.classLabel} onChange={classLabel => setForm({ ...form, classLabel })} required />
        </div>
        <div className="form-grid">
          <label className="field-label">School<span className="input-with-icon"><School /><select value={form.schoolId} onChange={event => updateSchool(event.target.value)} required><option value="">Select school</option>{db.schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}</select></span></label>
          <label className="field-label">Teacher<span className="input-with-icon"><Users /><select value={form.teacherId} onChange={event => setForm({ ...form, teacherId: event.target.value })} required disabled={!form.schoolId}><option value="">Select teacher</option>{assignedTeachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>)}</select></span></label>
        </div>
        {(!db.schools.length || !db.teachers.length) && <p className="mt-student-form-note">Create a school and teacher in Admin before assigning students.</p>}
        <div className="form-grid">
          <Field label="Parent / Guardian" placeholder="Parent / Guardian" icon={User} value={form.guardian} onChange={guardian => setForm({ ...form, guardian })} />
          <Field label="Contact Number" placeholder="Contact number" icon={Phone} type="tel" value={form.phone} onChange={phone => setForm({ ...form, phone })} />
        </div>
        <div className="mt-student-form-actions">
          <button className="primary-action teal-action" type="submit"><UserPlus /> {editingStudent ? "Update Student" : "Add Student"}</button>
          {editingStudent && <button className="secondary-action" type="button" onClick={onCancelEdit}>Cancel Edit</button>}
        </div>
      </form>
    </article>
  );
}

function PointsForm({ students, update }) {
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState(10);
  const [description, setDescription] = useState("Great class participation");
  function submit(event) {
    event.preventDefault();
    update(db => {
      const student = db.students.find(item => item.id === Number(studentId));
      if (!student) return;
      student.balance += Number(amount);
      student.totalEarned += Number(amount);
      student.streak += 1;
      student.status = "on_track";
      db.transactions.push({ id: Date.now(), studentId: student.id, amount: Number(amount), description, date: today() });
    }, "Points awarded");
  }
  return (
    <article className="section-panel students-form-card earnings-form-card">
      <div className="section-heading students-card-heading">
        <span className="card-heading-icon"><Trophy /></span>
        <h2>Award Points</h2>
      </div>
      <form className="stacked-form" onSubmit={submit}>
        <label className="field-label">Student<span className="input-with-icon"><Users /><select value={studentId} onChange={event => setStudentId(event.target.value)} required><option value="">Select student</option>{students.map(student => <option key={student.id} value={student.id}>{student.first} {student.last}</option>)}</select></span></label>
        <Field label="Points" icon={Trophy} type="number" value={amount} onChange={setAmount} required />
        <Field label="Description" icon={ClipboardList} value={description} onChange={setDescription} required />
        <button className="primary-action teal-action" type="submit"><Trophy /> Award Points</button>
      </form>
    </article>
  );
}

function Leaderboard({ dashboard, range, setRange }) {
  return (
    <>
      <PageHeading eyebrow="Competition" title="Leaderboard" />
      <article className="section-panel full-width-panel">
        <div className="section-heading inline-control"><h2>Top Point Earners</h2><select value={range} onChange={event => setRange(event.target.value)}><option value="week">This Week</option><option value="month">This Month</option><option value="all">All Time</option></select></div>
        <EarnersList earners={dashboard.leaderboard} />
      </article>
    </>
  );
}

function Reports({ dashboard }) {
  return <><PageHeading eyebrow="Class Analytics" title="Reports" /><article className="section-panel full-width-panel"><div className="insight-grid"><Insight title="Total Points" value={formatPoints(dashboard.totalEarned)} /><Insight title="Average Points" value={formatPoints(Math.round(dashboard.averageBalance))} /><Insight title="Completion" value={`${dashboard.completionRate}%`} /><Insight title="Top Category" value={dashboard.topCategory} /></div></article></>;
}

function MoneyTykesTipBanner({ tip, inline = false }) {
  return (
    <section className={`tip-bar tip-banner mt-tip-banner ${inline ? "inline-tip" : ""}`} aria-label="Financial literacy tip">
      <div className="mt-tip-banner-logo-wrap">
        <img className="mt-tip-banner-logo" src={assetPath("assets/boss-tyker.png")} alt="MoneyTykes Boss and Tyker" />
      </div>
      <span className="tip-icon mt-tip-banner-icon"><Lightbulb /></span>
      <div className="mt-tip-banner-content">
        <strong className="mt-tip-banner-label">MoneyTykes Tip</strong>
        <p className="mt-tip-banner-text">{tip}</p>
      </div>
    </section>
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
      <section className="game-select-screen page-swap">
        <audio ref={audioRef} src={assetPath("gamebackgroundaudio.mp3")} loop preload="auto" />
        <div className="game-hero compact">
          <img src={assetPath("gamefrontend.jpeg")} alt="Money Moves Live dashboard concept" />
          <div>
            <p className="eyebrow">Select Game</p>
            <h2>Game</h2>
            <p>Choose a classroom game to start.</p>
          </div>
        </div>
        <button className="game-choice-card" type="button" onClick={openLoading}>
          <span><Calculator /></span>
          <strong>Money Moves</strong>
          <small>Fast questions, timed answers, and team point scoring.</small>
          <ChevronRight />
        </button>
      </section>
    );
  }

  if (stage === "loading") {
    return (
      <section className="money-loading-screen page-swap">
        <audio ref={audioRef} src={assetPath("gamebackgroundaudio.mp3")} loop preload="auto" />
        <img src={assetPath("Logo.png")} alt="MoneyTykes" />
        <p className="eyebrow">Money Moves Live</p>
        <h2>Build Your Team Score. Win Your Future.</h2>
        <button className="game-start-button" type="button" onClick={startSetup}><Play /> Start Game</button>
      </section>
    );
  }

  if (stage === "teams") {
    return (
      <section className="team-setup-screen page-swap">
        <audio ref={audioRef} src={assetPath("gamebackgroundaudio.mp3")} loop preload="auto" />
        <div className="team-setup-heading">
          <p className="game-kicker"><BarChart3 /> Money Moves Live</p>
          <h2>Enter Teams</h2>
          <p>Add between 1 and 5 teams before the board opens.</p>
        </div>
        <form className="team-form" onSubmit={beginGame}>
          <div className="team-count-row">
            <span className="team-count-icon"><Users /></span>
            <div>
              <strong>Number of Teams</strong>
              <span>Choose between 1 and 5 teams.</span>
            </div>
            <select value={teamCount} onChange={event => updateTeamCount(event.target.value)}>
              {[1, 2, 3, 4, 5].map(count => <option key={count} value={count}>{count}</option>)}
            </select>
          </div>
          <div className="team-input-list">
            {teams.slice(0, teamCount).map((team, index) => (
              <label className="team-name-row" key={team.id}>
                <span className="team-number">{index + 1}</span>
                <Users />
                <input value={team.name} onChange={event => updateTeamName(index, event.target.value)} placeholder={`Team ${index + 1}`} />
              </label>
            ))}
          </div>
          <p className="team-note">You can rename teams now and edit them before opening the board.</p>
          <button className="game-start-button team-open-board" type="submit"><Play /> Open Board</button>
        </form>
      </section>
    );
  }

  return (
    <section className="money-moves-live page-swap" style={{ "--game-bg": `url("${assetPath("gamebackground.png")}")` }}>
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
                      <button type="button" key={value} className={`money-tile ${used ? "used" : ""}`} disabled={used} onClick={() => chooseTile(category, value)}>
                        <img className="money-tile-coin" src={assetPath("mtcoinpng.png")} alt="" aria-hidden="true" />
                        <strong className="money-value">{formatPoints(value)}</strong>
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
          <label>
            Award Team
            <select value={selectedTeamId} onChange={event => setSelectedTeamId(Number(event.target.value))}>
              {teams.map(team => <option value={team.id} key={team.id}>{team.name}</option>)}
            </select>
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

function SettingsPage({ db }) {
  return <><PageHeading eyebrow="Configuration" title="Class Settings" /><article className="section-panel full-width-panel"><div className="settings-list"><p><strong>School</strong><span>{db.school}</span></p><p><strong>Class</strong><span>{db.className}</span></p><p><strong>Storage</strong><span>Browser localStorage</span></p></div></article></>;
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "", icon: Icon }) {
  return (
    <label className="field-label">
      {label}
      <span className={Icon ? "input-with-icon" : "input-without-icon"}>
        {Icon && <Icon />}
        <input type={type} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} required={required} />
      </span>
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

function StudentListFilters({ schools, schoolFilter, setSchoolFilter, search, setSearch, status, setStatus, showStatus = true }) {
  return (
    <div className="student-tools">
      <label className="search-box">
        <input
          type="search"
          placeholder="Search students..."
          value={search}
          onChange={event => setSearch(event.target.value)}
          aria-label="Search students"
        />
      </label>
      <select value={schoolFilter} onChange={event => setSchoolFilter(event.target.value)} aria-label="Filter by school">
        <option value="all">All schools</option>
        {(schools || []).map(school => (
          <option key={school.id} value={String(school.id)}>{school.name}</option>
        ))}
      </select>
      {showStatus && (
        <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
          <option value="inactive">Inactive</option>
        </select>
      )}
    </div>
  );
}

function StudentTable({ students, detailed = false, onView, onEdit, onDelete, linkNamesOnly = false, simple = false }) {
  if (!students.length) return <EmptyState title="No students yet" text="Add students to begin tracking progress." />;
  return (
    <div className={`student-table ${linkNamesOnly ? "name-links" : ""} ${simple ? "student-table-simple" : ""}`}>
      {students.map(student => (
        <div className={`student-row ${simple ? "student-row-simple" : ""}`} key={student.id}>
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
              {!simple && (
                <span>{student.schoolName || student.teacherName || student.classLabel || "Student profile"}</span>
              )}
            </div>
          </div>
          {simple ? (
            <span className="student-age">{student.age ? `${student.age} yrs` : "—"}</span>
          ) : (
            <span className="student-class">{student.classLabel || "Standard / Form"}</span>
          )}
          <strong className="points-value student-balance">{formatPoints(student.balance || 0)}</strong>
          {!simple && !linkNamesOnly && (
            <div className="student-actions">
              <button className="student-action-button profile" type="button" onClick={() => onView?.(student)}>View Profile</button>
              <button className="student-action-button edit" type="button" onClick={() => onEdit?.(student)}><Pencil /> Edit</button>
              {detailed && <button className="student-action-button delete" type="button" onClick={() => onDelete?.(student)}>Delete</button>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StudentProfile({ student, onClose, onEdit, onDelete }) {
  return (
    <article className="section-panel mt-student-profile-card">
      <div className="mt-student-profile-main">
        <span className="mt-student-profile-photo">{student.photo ? <img src={student.photo} alt="" /> : initials(student)}</span>
        <div>
          <p className="eyebrow">Student Profile</p>
          <h2>{student.first} {student.last}</h2>
          <div className="mt-student-profile-grid">
            <p><strong>Standard / Form</strong><span>{student.classLabel || "Not set"}</span></p>
            <p><strong>School</strong><span>{student.schoolName || "Not set"}</span></p>
            <p><strong>Teacher</strong><span>{student.teacherName || "Not set"}</span></p>
            <p><strong>Age</strong><span>{student.age || "Not set"}</span></p>
            <p><strong>Parent / Guardian</strong><span>{student.guardian || "Not set"}</span></p>
            <p><strong>Contact Number</strong><span>{student.phone || "Not set"}</span></p>
            <p><strong>Points</strong><span>{formatPoints(student.balance || 0)}</span></p>
            <p><strong>Total Points Earned</strong><span>{formatPoints(student.totalEarned || 0)}</span></p>
            <p><strong>Status</strong><span>{labelStatus(student.status)}</span></p>
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

function EarnersList({ earners }) {
  if (!earners.length) return <EmptyState title="No points yet" text="Award points to build the leaderboard." />;
  return <ol className="earners-list">{earners.map((student, index) => <li key={student.id}><span>{index + 1}</span><strong>{student.first} {student.last}</strong><em>{formatPoints(student.totalEarned || 0)}</em></li>)}</ol>;
}

function TaskRow({ task }) {
  return (
    <div className="task-row">
      <span className="task-dot" />
      <div className="task-row-body">
        <strong className="task-title">{task.title}</strong>
        <span className="task-meta">{task.category} · Due {formatDate(task.due)}</span>
      </div>
      <em className="task-reward">{formatPoints(task.reward)}</em>
    </div>
  );
}

function Insight({ title, value }) {
  return <div className="insight-card"><span>{title}</span><strong>{value}</strong></div>;
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><strong>{title}</strong><span>{text}</span></div>;
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

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "TBD";
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

createRoot(document.getElementById("root")).render(<App />);
