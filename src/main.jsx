import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  ChevronRight,
  X,
  ClipboardList,
  Flame,
  Gift,
  GraduationCap,
  Home,
  Lightbulb,
  Menu,
  Volume2,
  VolumeX,
  PiggyBank,
  Play,
  Plus,
  RotateCcw,
  Settings,
  ShieldAlert,
  Timer,
  Trophy,
  Users,
  Wallet
} from "lucide-react";
import { moneyMoveQuestions } from "./moneyMoveQuestions";
import "../styles.css";
import "./react.css";

const STORAGE_KEY = "moneytykes.teacher.dashboard.v3";
const assetPath = path => `${import.meta.env.BASE_URL}${path}`;

const currency = new Intl.NumberFormat("en-BZ", {
  style: "currency",
  currency: "BZD",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const navItems = [
  { label: "Dashboard", view: "dashboard", icon: Home },
  { label: "Students", view: "students", icon: Users },
  { label: "Assign & Tasks", view: "tasks", icon: ClipboardList },
  { label: "Rewards", view: "rewards", icon: Gift },
  { label: "Leaderboard", view: "leaderboard", icon: Trophy },
  { label: "Reports", view: "reports", icon: BarChart3 },
  { label: "Financial Literacy", view: "literacy", icon: GraduationCap },
  { label: "Game", view: "game", icon: Calculator },
  { label: "Class Settings", view: "settings", icon: Settings }
];

const gameCategories = [
  { title: "Money Math", subtitle: "Crunch it. Solve it.", icon: Calculator, tone: "blue" },
  { title: "Save Smart", subtitle: "Spend less. Save more.", icon: PiggyBank, tone: "green" },
  { title: "Hustle Mode", subtitle: "Work. Create. Earn.", icon: Lightbulb, tone: "purple" },
  { title: "Real Life", subtitle: "Smart choices. Real impact.", icon: Home, tone: "orange" },
  { title: "Money Moves", subtitle: "Big risks. Bigger rewards.", icon: ShieldAlert, tone: "teal" }
];

function createDatabase() {
  return {
    teacher: { first: "Teacher", last: "Advisor", email: "teacher@moneytykes.local" },
    school: "MoneyTykes Classroom",
    className: "Financial Literacy Class",
    students: [],
    tasks: [],
    rewards: [],
    redemptions: [],
    transactions: [],
    tips: [
      "Encourage students to set savings goals. Small steps today build financial confidence.",
      "Ask students to separate needs from wants before spending classroom earnings.",
      "A clear budget gives every dollar a job before it gets spent."
    ]
  };
}

function loadDatabase() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || createDatabase();
  } catch {
    return createDatabase();
  }
}

function App() {
  const [db, setDb] = useState(loadDatabase);
  const [view, setView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("month");
  const [toast, setToast] = useState("");
  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(db)), [db]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const dashboard = useMemo(() => buildDashboard(db, range), [db, range]);

  function update(mutator, message) {
    setDb(current => {
      const next = structuredClone(current);
      mutator(next);
      return next;
    });
    setToast(message);
  }

  function navigate(nextView) {
    setView(nextView);
    setMenuOpen(false);
  }

  const pageProps = {
    db,
    dashboard,
    search,
    setSearch,
    status,
    setStatus,
    range,
    setRange,
    update,
    navigate
  };

  return (
    <div className={`app-shell react-app ${sidebarHidden ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        currentView={view}
        open={menuOpen}
        navigate={navigate}
        collapsed={sidebarHidden}
        toggleCollapsed={() => setSidebarHidden(!sidebarHidden)}
      />
      <main className="dashboard">
        <header className="topbar app-entrance">
          <button className="icon-button mobile-menu" type="button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu />
          </button>
          <div>
            <p className="eyebrow">{db.school} - {db.className}</p>
            <h1>Welcome back, {db.teacher.first}</h1>
          </div>
        </header>

        <div className="view active page-swap" key={view}>
          {view === "dashboard" && <Dashboard {...pageProps} />}
          {view === "students" && <Students {...pageProps} />}
          {view === "tasks" && <Tasks {...pageProps} />}
          {view === "rewards" && <Rewards {...pageProps} />}
          {view === "leaderboard" && <Leaderboard {...pageProps} />}
          {view === "reports" && <Reports dashboard={dashboard} />}
          {view === "literacy" && <Literacy db={db} />}
          {view === "game" && <GameDashboard />}
          {view === "settings" && <SettingsPage db={db} />}
        </div>
      </main>

      <nav className="mobile-tabbar" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map(item => <NavButton key={item.view} item={item} active={view === item.view} navigate={navigate} compact />)}
      </nav>
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

function Sidebar({ currentView, open, navigate, collapsed, toggleCollapsed }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""} ${collapsed ? "collapsed" : ""}`} aria-label="Primary navigation">
      <div className="sidebar-top">
        {!collapsed && (
          <div className="brand">
            <img className="brand-logo" src={assetPath("Logo.png")} alt="MoneyTykes" />
          </div>
        )}
        <button className="sidebar-collapse-button" type="button" aria-label={collapsed ? "Show sidebar" : "Hide sidebar"} onClick={toggleCollapsed}>
          {collapsed ? <ChevronRight /> : <Menu />}
        </button>
      </div>
      {!collapsed && (
        <div className="sidebar-scroll">
          <nav className="nav-list">
            {navItems.map(item => <NavButton key={item.view} item={item} active={currentView === item.view} navigate={navigate} />)}
          </nav>
          <section className="challenge-card">
            <div className="challenge-badge" aria-hidden="true"><Trophy /></div>
            <h2>Run a Challenge</h2>
            <p>Boost engagement with class competitions.</p>
            <button className="secondary-action" type="button" onClick={() => navigate("game")}>Create Game</button>
          </section>
          <button className="teacher-chip" type="button">
            <span className="avatar initials">TA</span>
            <span><strong>Teacher Advisor</strong><span>Class owner</span></span>
            <ChevronRight />
          </button>
        </div>
      )}
    </aside>
  );
}

function NavButton({ item, active, navigate, compact = false }) {
  const Icon = item.icon;
  const className = compact ? "mobile-tab" : "nav-item";
  return (
    <button className={`${className} ${active ? "active" : ""}`} type="button" title={item.label} onClick={() => navigate(item.view)}>
      <Icon /><span>{compact ? item.label.replace(" & Tasks", "") : item.label}</span>
    </button>
  );
}

function Dashboard(props) {
  const { dashboard, db, search, setSearch, status, setStatus, range, setRange, navigate } = props;
  return (
    <>
      <StatsGrid dashboard={dashboard} />
      <section className="quick-actions section-panel">
        <div className="section-heading"><h2>Quick Actions</h2></div>
        <div className="quick-action-grid">
          <ActionCard icon={Plus} title="Add Student" text="Grow your classroom roster." onClick={() => navigate("students")} />
          <ActionCard icon={Wallet} title="Give Earnings" text="Reward participation quickly." onClick={() => navigate("students")} />
          <ActionCard icon={ClipboardList} title="Create Task" text="Assign money lessons." onClick={() => navigate("tasks")} />
          <ActionCard icon={Trophy} title="Launch Game" text="Open Money Moves Live." onClick={() => navigate("game")} />
        </div>
      </section>
      <section className="content-grid">
        <StudentOverview db={db} search={search} setSearch={setSearch} status={status} setStatus={setStatus} />
        <TopEarners earners={dashboard.leaderboard.slice(0, 5)} range={range} setRange={setRange} navigate={navigate} />
        <RecentTasks tasks={db.tasks.slice(-4).reverse()} navigate={navigate} />
        <Insights dashboard={dashboard} />
      </section>
      <TipBanner tip={dailyTip(db)} />
    </>
  );
}

function StatsGrid({ dashboard }) {
  const stats = [
    ["Students", dashboard.studentCount, Users],
    ["Total Earned", money(dashboard.totalEarned), Wallet],
    ["Completion", `${dashboard.completionRate}%`, Check],
    ["Active Streaks", dashboard.activeStreaks, Flame]
  ];
  return (
    <section className="stats-grid" aria-label="Class statistics">
      {stats.map(([label, value, Icon], index) => (
        <article className="stat-card stagger-in" style={{ "--delay": `${index * 55}ms` }} key={label}>
          <span className="stat-icon"><Icon /></span>
          <p>{label}</p>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
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

function StudentOverview({ db, search, setSearch, status, setStatus }) {
  const students = filterStudents(db.students, search, status).slice(0, 5);
  return (
    <article className="section-panel student-overview">
      <div className="section-heading"><h2>Student Overview</h2></div>
      <div className="student-tools">
        <label className="search-box">
          <input type="search" placeholder="Search students..." value={search} onChange={event => setSearch(event.target.value)} />
        </label>
        <select value={status} onChange={event => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <StudentTable students={students} />
    </article>
  );
}

function TopEarners({ earners, range, setRange, navigate }) {
  return (
    <article className="section-panel">
      <div className="section-heading inline-control">
        <h2>Top Earners</h2>
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
        <button className="link-button" type="button" onClick={() => navigate("tasks")}>Create Task</button>
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
        <Insight title="Average Wallet" value={money(dashboard.averageBalance)} />
        <Insight title="Task Library" value={dashboard.taskCount} />
        <Insight title="Top Category" value={dashboard.topCategory} />
        <Insight title="Momentum" value={`${dashboard.completionRate}%`} />
      </div>
    </article>
  );
}

function Students({ db, dashboard, update }) {
  return (
    <>
      <PageHeading eyebrow="Class Roster" title="Students Dashboard" />
      <div className="management-grid">
        <StudentForm update={update} />
        <EarningsForm students={db.students} update={update} />
      </div>
      <article className="section-panel full-width-panel">
        <div className="section-heading"><h2>Roster</h2></div>
        <StudentTable students={dashboard.students} detailed />
      </article>
    </>
  );
}

function StudentForm({ update }) {
  const [form, setForm] = useState({ first: "", last: "", email: "", age: "", classLabel: "", guardian: "", phone: "" });
  function submit(event) {
    event.preventDefault();
    update(db => {
      db.students.push({ id: Date.now(), balance: 0, totalEarned: 0, streak: 0, status: "inactive", ...form, age: Number(form.age) });
    }, "Student added");
    setForm({ first: "", last: "", email: "", age: "", classLabel: "", guardian: "", phone: "" });
  }
  return (
    <article className="section-panel">
      <div className="section-heading"><h2>Add Student</h2></div>
      <form className="stacked-form" onSubmit={submit}>
        <div className="form-grid">
          <Field label="First Name" value={form.first} onChange={first => setForm({ ...form, first })} required />
          <Field label="Last Name" value={form.last} onChange={last => setForm({ ...form, last })} required />
        </div>
        <Field label="Email" type="email" value={form.email} onChange={email => setForm({ ...form, email })} required />
        <div className="form-grid">
          <Field label="Age" type="number" value={form.age} onChange={age => setForm({ ...form, age })} required />
          <Field label="Class / Grade" value={form.classLabel} onChange={classLabel => setForm({ ...form, classLabel })} required />
        </div>
        <div className="form-grid">
          <Field label="Parent / Guardian" value={form.guardian} onChange={guardian => setForm({ ...form, guardian })} />
          <Field label="Contact Number" type="tel" value={form.phone} onChange={phone => setForm({ ...form, phone })} />
        </div>
        <button className="primary-action" type="submit">Add Student</button>
      </form>
    </article>
  );
}

function EarningsForm({ students, update }) {
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState(10);
  const [description, setDescription] = useState("Class participation reward");
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
    }, "Earnings added");
  }
  return (
    <article className="section-panel">
      <div className="section-heading"><h2>Give Earnings</h2></div>
      <form className="stacked-form" onSubmit={submit}>
        <label>Student<select value={studentId} onChange={event => setStudentId(event.target.value)} required><option value="">Select student</option>{students.map(student => <option key={student.id} value={student.id}>{student.first} {student.last}</option>)}</select></label>
        <Field label="Amount" type="number" value={amount} onChange={setAmount} required />
        <Field label="Description" value={description} onChange={setDescription} required />
        <button className="primary-action" type="submit">Add BZ$ Earnings</button>
      </form>
    </article>
  );
}

function Tasks({ db, update }) {
  const [form, setForm] = useState({ title: "", category: "Financial Literacy", reward: 8, due: addDays(today(), 7) });
  function submit(event) {
    event.preventDefault();
    update(db => {
      db.tasks.push({ id: Date.now(), ...form, reward: Number(form.reward), completed: 0, assigned: db.students.length, createdAt: today() });
    }, "Task created");
    setForm({ title: "", category: "Financial Literacy", reward: 8, due: addDays(today(), 7) });
  }
  return (
    <>
      <PageHeading eyebrow="Assignments" title="Tasks Dashboard" />
      <div className="management-grid">
        <article className="section-panel">
          <div className="section-heading"><h2>Create Task</h2></div>
          <form className="stacked-form" onSubmit={submit}>
            <Field label="Title" value={form.title} onChange={title => setForm({ ...form, title })} required />
            <label>Category<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}><option>Financial Literacy</option><option>Economics</option><option>Budgeting</option><option>Saving</option><option>Investing</option><option>Chores</option><option>Custom</option></select></label>
            <div className="form-grid">
              <Field label="Reward Amount" type="number" value={form.reward} onChange={reward => setForm({ ...form, reward })} required />
              <Field label="Due Date" type="date" value={form.due} onChange={due => setForm({ ...form, due })} required />
            </div>
            <button className="primary-action" type="submit">Create & Assign</button>
          </form>
        </article>
        <article className="section-panel">
          <div className="section-heading"><h2>Task Summary</h2></div>
          <div className="insight-grid"><Insight title="Created" value={db.tasks.length} /><Insight title="Students" value={db.students.length} /></div>
        </article>
      </div>
      <article className="section-panel full-width-panel"><div className="section-heading"><h2>Task Library</h2></div><div className="task-list">{db.tasks.length ? db.tasks.map(task => <TaskRow key={task.id} task={task} />) : <EmptyState title="No tasks created" text="Create your first classroom task." />}</div></article>
    </>
  );
}

function Rewards({ db, update }) {
  const [reward, setReward] = useState({ title: "", category: "Classroom", type: "experience", cost: 0, quantity: 1, description: "" });
  function submit(event) {
    event.preventDefault();
    update(db => db.rewards.push({ id: Date.now(), ...reward, cost: Number(reward.cost), quantity: Number(reward.quantity) }), "Reward created");
    setReward({ title: "", category: "Classroom", type: "experience", cost: 0, quantity: 1, description: "" });
  }
  return (
    <>
      <PageHeading eyebrow="Motivation" title="Rewards Dashboard" />
      <div className="management-grid">
        <article className="section-panel">
          <div className="section-heading"><h2>Create Reward</h2></div>
          <form className="stacked-form" onSubmit={submit}>
            <Field label="Reward Title" value={reward.title} onChange={title => setReward({ ...reward, title })} required />
            <div className="form-grid">
              <Field label="Category" value={reward.category} onChange={category => setReward({ ...reward, category })} />
              <Field label="Type" value={reward.type} onChange={type => setReward({ ...reward, type })} />
            </div>
            <div className="form-grid">
              <Field label="Cost" type="number" value={reward.cost} onChange={cost => setReward({ ...reward, cost })} required />
              <Field label="Quantity" type="number" value={reward.quantity} onChange={quantity => setReward({ ...reward, quantity })} required />
            </div>
            <Field label="Description" value={reward.description} onChange={description => setReward({ ...reward, description })} />
            <button className="primary-action" type="submit">Create Reward</button>
          </form>
        </article>
        <article className="section-panel"><div className="section-heading"><h2>Reward Activity</h2></div><EmptyState title="No redemptions yet" text="Reward activity appears after students redeem items." /></article>
      </div>
      <article className="section-panel full-width-panel"><div className="section-heading"><h2>Reward Catalog</h2></div><div className="reward-grid">{db.rewards.length ? db.rewards.map(item => <RewardCard key={item.id} reward={item} />) : <EmptyState title="No rewards yet" text="Create a classroom reward to fill the catalog." />}</div></article>
    </>
  );
}

function Leaderboard({ dashboard, range, setRange }) {
  return (
    <>
      <PageHeading eyebrow="Competition" title="Leaderboard" />
      <article className="section-panel full-width-panel">
        <div className="section-heading inline-control"><h2>Top Earners</h2><select value={range} onChange={event => setRange(event.target.value)}><option value="week">This Week</option><option value="month">This Month</option><option value="all">All Time</option></select></div>
        <EarnersList earners={dashboard.leaderboard} />
      </article>
    </>
  );
}

function Reports({ dashboard }) {
  return <><PageHeading eyebrow="Class Analytics" title="Reports" /><article className="section-panel full-width-panel"><div className="insight-grid"><Insight title="Total Earned" value={money(dashboard.totalEarned)} /><Insight title="Average Balance" value={money(dashboard.averageBalance)} /><Insight title="Completion" value={`${dashboard.completionRate}%`} /><Insight title="Top Category" value={dashboard.topCategory} /></div></article></>;
}

function Literacy({ db }) {
  return <><PageHeading eyebrow="Learning Content" title="Financial Literacy" /><TipBanner tip={dailyTip(db)} inline /><article className="section-panel full-width-panel"><div className="section-heading"><h2>Lesson Ideas</h2></div><div className="insight-grid"><Insight title="Needs vs Wants" value="Budgeting" /><Insight title="Savings Goals" value="Saving" /><Insight title="Income Choices" value="Earning" /></div></article></>;
}

function TipBanner({ tip, inline = false }) {
  return (
    <section className={`tip-bar tip-banner ${inline ? "inline-tip" : ""}`} aria-label="Financial literacy tip">
      <span className="tip-icon"><Lightbulb /></span>
      <div>
        <strong>MoneyTykes Tip</strong>
        <p>{tip}</p>
      </div>
      <span className="tip-spark" aria-hidden="true">MT</span>
    </section>
  );
}

function GameDashboard() {
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
    setTeams(current => current.map(team => ({ ...team, score: 0 })));
    setUsedTiles([]);
    setQuestionPool(shuffleQuestions(moneyMoveQuestions));
    setActiveQuestion(null);
    setShowAnswer(false);
    setTimeLeft(0);
    setTimerRunning(false);
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
          <small>Fast questions, timed answers, and team net worth scoring.</small>
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
        <h2>Build Your Net Worth. Win Your Future.</h2>
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
    <section className="money-moves-live page-swap">
      <audio ref={audioRef} src={assetPath("gamebackgroundaudio.mp3")} loop preload="auto" />
      <header className="money-live-header">
        <div className="money-brand-lockup">
          <img src={assetPath("Logo.png")} alt="MoneyTykes" />
        </div>
        <div className="money-live-title">
          <h2><span>Money Moves</span> <strong>Live</strong></h2>
          <p>Build your net worth. Win your future.</p>
        </div>
        <aside className="winner-callout">
          <Trophy />
          <strong>Highest Net Worth Wins!</strong>
          <span>Every smart move builds your future.</span>
        </aside>
      </header>

      <div className="game-toolbar">
        <button type="button" onClick={() => setAudioMuted(!audioMuted)}>
          {audioMuted ? <VolumeX /> : <Volume2 />}
          {audioMuted ? "Unmute" : "Mute"}
        </button>
      </div>

      <div className="money-live-layout">
        <div className="game-board live-board" aria-label="Money Moves Live question board">
          {gameCategories.map(category => {
            const Icon = category.icon;
            return (
              <div className={`game-column ${category.tone}`} key={category.title}>
                <header><Icon /><strong>{category.title}</strong><span>{category.subtitle}</span></header>
                {[100, 200, 300, 400, 500].map(value => {
                  const id = tileId(category.title, value);
                  const used = usedTiles.includes(id);
                  return (
                    <button type="button" key={value} className={`money-tile ${used ? "used" : ""}`} disabled={used} onClick={() => chooseTile(category, value)}>
                      <span>MT</span><strong className="money-value">{money(value)}</strong>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <aside className="game-rules-panel">
          <section>
            <h3>Answer Fast!</h3>
            <div className="timer-token"><strong>10</strong><span>sec</span></div>
            <p>Timer is based on question value.</p>
            <ul>
              <li><span>$100 - $200</span><strong>10 sec</strong></li>
              <li><span>$300</span><strong>10 sec</strong></li>
              <li><span>$400 - $500</span><strong>15 sec</strong></li>
            </ul>
          </section>
          <section>
            <h3>How To Play</h3>
            <ol>
              <li>Choose a category.</li>
              <li>Pick a value.</li>
              <li>Answer within the time.</li>
              <li>Award net worth.</li>
              <li>Highest score wins.</li>
            </ol>
          </section>
        </aside>
      </div>

      <footer className="money-live-footer">
        <div className="goal-card"><strong>Your Goal: Build Your Net Worth!</strong><span>Smart answers. Smart choices. Bigger net worth.</span></div>
        <TeamScoreboard teams={teams} selectedTeamId={selectedTeamId} setSelectedTeamId={setSelectedTeamId} />
        <button className="reset-game-button" type="button" onClick={resetGame}><RotateCcw /> Reset</button>
      </footer>

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
    </section>
  );
}

function TeamScoreboard({ teams, selectedTeamId, setSelectedTeamId }) {
  const rankedTeams = [...teams].sort((a, b) => b.score - a.score);
  return (
    <section className="team-scoreboard">
      <div className="scoreboard-heading">
        <strong>Scoreboard</strong>
        <span>Net Worth</span>
      </div>
      {rankedTeams.map((team, index) => (
        <button
          className={`team-score-row team-${index + 1} ${selectedTeamId === team.id ? "selected" : ""}`}
          type="button"
          key={team.id}
          onClick={() => setSelectedTeamId(team.id)}
        >
          <span>{team.name}</span>
          <strong>{money(team.score)}</strong>
        </button>
      ))}
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
            <p className="eyebrow">{question.boardTitle} - {money(question.value)}</p>
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
          <button className="primary-action" type="button" onClick={awardPoints}>Add {money(question.value)}</button>
          <button className="wide-button" type="button" onClick={() => closeQuestion(true)}>No Points</button>
        </div>
      </article>
    </div>
  );
}

function SettingsPage({ db }) {
  return <><PageHeading eyebrow="Configuration" title="Class Settings" /><article className="section-panel full-width-panel"><div className="settings-list"><p><strong>School</strong><span>{db.school}</span></p><p><strong>Class</strong><span>{db.className}</span></p><p><strong>Storage</strong><span>Browser localStorage</span></p></div></article></>;
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return <label>{label}<input type={type} value={value} onChange={event => onChange(event.target.value)} required={required} /></label>;
}

function PageHeading({ eyebrow, title }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div>;
}

function StudentTable({ students, detailed = false }) {
  if (!students.length) return <EmptyState title="No students yet" text="Add students to begin tracking progress." />;
  return (
    <div className="student-table">
      {students.map(student => (
        <div className="student-row" key={student.id}>
          <span className="avatar initials">{initials(student)}</span>
          <div><strong>{student.first} {student.last}</strong><span>{detailed ? student.email : student.classLabel || "Class member"}</span></div>
          <span className={`status ${student.status}`}>{labelStatus(student.status)}</span>
          <strong>{money(student.balance || 0)}</strong>
        </div>
      ))}
    </div>
  );
}

function EarnersList({ earners }) {
  if (!earners.length) return <EmptyState title="No earnings yet" text="Add earnings to build the leaderboard." />;
  return <ol className="earners-list">{earners.map((student, index) => <li key={student.id}><span>{index + 1}</span><strong>{student.first} {student.last}</strong><em>{money(student.totalEarned || 0)}</em></li>)}</ol>;
}

function TaskRow({ task }) {
  return <div className="task-row"><span className="task-dot" /><div><strong>{task.title}</strong><span>{task.category} - Due {formatDate(task.due)}</span></div><em>{money(task.reward)}</em></div>;
}

function RewardCard({ reward }) {
  return <article className="reward-card"><strong>{reward.title}</strong><span>{reward.category}</span><p>{reward.description || "Classroom reward"}</p><em>{money(reward.cost)}</em></article>;
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

function filterStudents(students, search, status) {
  return students.filter(student => {
    const matchesSearch = `${student.first} ${student.last} ${student.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || student.status === status;
    return matchesSearch && matchesStatus;
  });
}

function dailyTip(db) {
  return db.tips[new Date().getDate() % db.tips.length];
}

function initials(student) {
  return `${student.first?.[0] || ""}${student.last?.[0] || ""}`.toUpperCase();
}

function money(value) {
  return currency.format(Number(value || 0));
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
