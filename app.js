const STORAGE_KEY = "moneytykes.teacher.dashboard.v2";

const currency = new Intl.NumberFormat("en-BZ", {
  style: "currency",
  currency: "BZD",
  currencyDisplay: "narrowSymbol"
});

const icons = {
  dashboard: '<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"></path></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"></path></svg>',
  clipboard: '<svg viewBox="0 0 24 24"><path d="M9 5h6M9 12h6M9 16h4M8 3h8l1 3H7l1-3ZM7 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path></svg>',
  gift: '<svg viewBox="0 0 24 24"><path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5A2.5 2.5 0 1 1 10 4.5C10 7 12 7 12 7ZM12 7h4.5A2.5 2.5 0 1 0 14 4.5C14 7 12 7 12 7Z"></path></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"></path><path d="M5 5H3v2a4 4 0 0 0 4 4M19 5h2v2a4 4 0 0 1-4 4"></path></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 19V5M10 19V9M16 19V3M22 19v-7"></path></svg>',
  cap: '<svg viewBox="0 0 24 24"><path d="m22 10-10-5-10 5 10 5 10-5Z"></path><path d="M6 12v5c3 2 9 2 12 0v-5"></path></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7.1 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"></path></svg>',
  wallet: '<svg viewBox="0 0 24 24"><path d="M20 7H5a3 3 0 0 1 0-6h13v6"></path><path d="M3 6v14a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z"></path><path d="M17 15h.01"></path></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m20 6-11 11-5-5"></path></svg>',
  flame: '<svg viewBox="0 0 24 24"><path d="M8.5 14.5A4 4 0 0 0 12 21a4 4 0 0 0 4-4c0-4-4-5-4-9 0 0-4 3-4 7"></path><path d="M12 21c-5 0-8-4-8-8 0-3 2-6 6-10 0 4 2 5 4 7 2 1 4 3 4 7a6 6 0 0 1-6 4Z"></path></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>',
  light: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-.7.7-1 1.7-1 3H9c0-1.3-.3-2.3-1-3Z"></path></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></svg>',
  dollar: '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"></path></svg>',
  trend: '<svg viewBox="0 0 24 24"><path d="m3 17 6-6 4 4 8-8"></path><path d="M14 7h7v7"></path></svg>'
};

const state = {
  classId: 1,
  currentTeacherId: 1,
  search: "",
  status: "all",
  leaderboardRange: "month",
  db: loadDatabase()
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("pageTaskDueDate").value = addDays(today(), 7);
  bindEvents();
  render();
});

function createEmptyDatabase() {
  const timestamp = now();
  return {
    users: [
      {
        id: 1,
        first_name: "Teacher",
        last_name: "Advisor",
        email: "teacher@moneytykes.local",
        role: "teacher",
        profile_image: "",
        school_id: 1,
        created_at: timestamp,
        updated_at: timestamp
      }
    ],
    schools: [
      {
        id: 1,
        school_name: "MoneyTykes Classroom",
        country: "",
        district: "",
        city: "",
        created_at: timestamp
      }
    ],
    classes: [
      {
        id: 1,
        school_id: 1,
        teacher_id: 1,
        class_name: "Financial Literacy Class",
        grade_level: "",
        subject: "Financial Literacy",
        academic_year: "2026",
        created_at: timestamp
      }
    ],
    class_students: [],
    student_wallets: [],
    wallet_transactions: [],
    tasks: [],
    student_tasks: [],
    streaks: [],
    rewards: [],
    reward_redemptions: [],
    challenges: [],
    challenge_participants: [],
    tips: [
      "Encourage students to set savings goals. Small steps today build financial confidence.",
      "Ask students to separate needs from wants before spending classroom earnings.",
      "A clear budget gives every dollar a job before it gets spent."
    ]
  };
}

function loadDatabase() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createEmptyDatabase();

  try {
    return JSON.parse(saved);
  } catch {
    return createEmptyDatabase();
  }
}

function saveDatabase() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.db));
}

function bindEvents() {
  document.getElementById("studentSearch").addEventListener("input", event => {
    state.search = event.target.value.trim().toLowerCase();
    renderStudentOverview();
  });

  document.getElementById("statusFilter").addEventListener("change", event => {
    state.status = event.target.value;
    renderStudentOverview();
  });

  document.getElementById("leaderboardRange").addEventListener("change", event => {
    state.leaderboardRange = event.target.value;
    renderTopEarners();
  });

  document.getElementById("mobileMenu").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
  });

  document.getElementById("createChallengeBtn").addEventListener("click", () => switchView("rewards"));
  document.getElementById("fullLeaderboardBtn").addEventListener("click", () => switchView("leaderboard"));
  document.getElementById("viewAllStudents").addEventListener("click", () => switchView("students"));
  document.getElementById("viewTasksBtn").addEventListener("click", () => switchView("tasks"));

  document.getElementById("pageStudentForm").addEventListener("submit", event => {
    event.preventDefault();
    addStudentFromPageForm();
  });

  document.getElementById("pageEarningsForm").addEventListener("submit", event => {
    event.preventDefault();
    giveManualEarningsFromPageForm();
  });

  document.getElementById("pageTaskForm").addEventListener("submit", event => {
    event.preventDefault();
    createAndAssignTaskFromPageForm();
  });

  document.getElementById("pageRewardForm").addEventListener("submit", event => {
    event.preventDefault();
    createRewardFromPageForm();
  });

  document.getElementById("pageAssignRewardForm").addEventListener("submit", event => {
    event.preventDefault();
    assignRewardFromPageForm();
  });

  document.getElementById("pageLeaderboardRange").addEventListener("change", event => {
    state.leaderboardRange = event.target.value;
    document.getElementById("leaderboardRange").value = event.target.value;
    renderTopEarners();
    renderLeaderboardPage();
  });
}

function render() {
  renderNavigation();
  renderHeader();
  renderStats();
  renderQuickActions();
  renderStudentOverview();
  renderTopEarners();
  renderRecentTasks();
  renderInsights();
  renderTip();
  renderTeacherChip();
  renderStudentSelect();
  renderStudentsPage();
  renderTasksPage();
  renderLeaderboardPage();
  renderRewardsPage();
  renderReportsPage();
  renderLiteracyPage();
  renderSettingsPage();
}

function renderNavigation() {
  const items = [
    ["Dashboard", icons.dashboard, "dashboard"],
    ["Students", icons.users, "students"],
    ["Assign & Tasks", icons.clipboard, "tasks"],
    ["Rewards", icons.gift, "rewards"],
    ["Leaderboard", icons.trophy, "leaderboard"],
    ["Reports", icons.chart, "reports"],
    ["Financial Literacy", icons.cap, "literacy"],
    ["Class Settings", icons.settings, "settings"]
  ];

  document.getElementById("navList").innerHTML = items.map(([label, svg, target], index) => `
    <button class="nav-item ${index === 0 ? "active" : ""}" type="button" title="${label}" data-nav="${target}">
      ${svg}<span>${label}</span>
    </button>
  `).join("");

  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => handleNavClick(button.dataset.nav));
  });
}

function handleNavClick(target) {
  switchView(target);
}

function switchView(target) {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.nav === target);
  });
  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("active", view.dataset.view === target);
  });
  document.querySelector(".sidebar").classList.remove("open");

  const topbar = document.querySelector(".topbar");
  if (topbar) topbar.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderHeader() {
  const { teacher, school, class: classroom } = dashboardService.getDashboard(state.classId);
  document.getElementById("schoolLine").textContent = `${school.school_name} - ${classroom.subject}`;
  document.getElementById("greeting").textContent = `Good morning, ${teacher.first_name} ${teacher.last_name}`;
}

function renderStats() {
  const dashboard = dashboardService.getDashboard(state.classId);
  const stats = [
    ["Class Balance", money(dashboard.class_balance), "Total student balances", icons.wallet, "var(--purple)"],
    ["Tasks Completed", `${Math.round(dashboard.tasks_completed_percentage)}%`, `${dashboard.completed_tasks} of ${dashboard.total_assigned_tasks} tasks`, icons.check, "var(--green)"],
    ["Active Streaks", dashboard.active_streaks, "Students on streak", icons.flame, "var(--orange)"],
    ["Class Average", money(dashboard.class_average), "Per student", icons.users, "var(--blue)"]
  ];

  document.getElementById("statsGrid").innerHTML = stats.map(([label, value, meta, svg, color]) => `
    <article class="stat-card">
      <div class="stat-icon" style="background:${color}">${svg}</div>
      <div>
        <h2>${label}</h2>
        <p class="stat-value">${value}</p>
        <p class="stat-meta"><span>${meta}</span>${icons.arrow}</p>
      </div>
    </article>
  `).join("");
}

function renderQuickActions() {
  const actions = [
    ["Add Student", "Build roster", icons.users, "var(--purple)", () => switchView("students")],
    ["Give Earnings", "Reward students", icons.plus, "var(--green)", () => switchView("students")],
    ["Assign Task", "Create or assign", icons.clipboard, "var(--yellow)", () => switchView("tasks")],
    ["Class Report", "View insights", icons.chart, "var(--blue)", () => switchView("reports")]
  ];

  document.getElementById("quickActions").innerHTML = actions.map(([title, subtitle, svg, color], index) => `
    <button class="quick-action" type="button" data-action="${index}">
      <div class="action-icon" style="background:${color}">${svg}</div>
      <strong>${title}</strong>
      <span>${subtitle}</span>
    </button>
  `).join("");

  document.querySelectorAll(".quick-action").forEach((button, index) => {
    button.addEventListener("click", actions[index][4]);
  });
}

function renderStudentOverview() {
  const rows = dashboardService.getStudents(state.classId)
    .filter(student => `${student.first_name} ${student.last_name}`.toLowerCase().includes(state.search))
    .filter(student => state.status === "all" || student.status === state.status)
    .slice(0, 8);

  if (!rows.length) {
    document.getElementById("studentTable").innerHTML = emptyState(
      "No students yet",
      "Add students to create wallets, track balances, assign tasks, and build leaderboards."
    );
    return;
  }

  document.getElementById("studentTable").innerHTML = `
    <div class="student-head"><span>Student</span><span>Balance</span><span>Streak</span><span>Status</span></div>
    ${rows.map(student => `
      <div class="student-row">
        <div class="student-person">
          ${avatar(student)}
          <div>
            <strong>${student.first_name} ${student.last_name}</strong>
            <span class="student-detail">${student.student_profile?.class_label || "Class not set"}${student.student_profile?.age ? ` - Age ${student.student_profile.age}` : ""}</span>
          </div>
        </div>
        <span class="money">${money(student.wallet.balance)}</span>
        <span class="streak">🔥 ${student.streak.current_streak}</span>
        <span><span class="status-pill ${student.status}">${labelStatus(student.status)}</span></span>
      </div>
    `).join("")}
  `;
}

function renderTopEarners() {
  const earners = dashboardService.getLeaderboard(state.classId, state.leaderboardRange).slice(0, 5);

  if (!earners.length) {
    document.getElementById("earnersList").innerHTML = emptyState("No rankings yet", "Add earnings or approve task rewards to rank students.");
    return;
  }

  document.getElementById("earnersList").innerHTML = earners.map((student, index) => `
    <li class="earner-row">
      <span class="rank ${index === 0 ? "top" : index === 1 ? "second" : index === 2 ? "third" : ""}">${index + 1}</span>
      <div class="earner-person">
        ${avatar(student)}
        <strong>${student.first_name} ${student.last_name}</strong>
      </div>
      <span class="money">${money(student.rank_value)}</span>
    </li>
  `).join("");
}

function renderRecentTasks() {
  const tasks = dashboardService.getRecentTasks(state.classId);
  const colors = ["var(--blue)", "var(--green)", "var(--orange)", "var(--purple)"];

  if (!tasks.length) {
    document.getElementById("taskList").innerHTML = emptyState("No tasks yet", "Create a task to assign it to the class and track progress.");
    return;
  }

  document.getElementById("taskList").innerHTML = tasks.map((task, index) => `
    <div class="task-row">
      <div class="task-icon" style="background:${colors[index % colors.length]}">${icons.clipboard}</div>
      <div>
        <p class="task-title">${task.title}</p>
        <p class="task-due">Due: ${formatShortDate(task.due_date)}</p>
        <div class="progress-track"><div class="progress-bar" style="width:${task.progress_percentage}%"></div></div>
      </div>
      <span class="completion-count">${task.completed_count}/${task.assigned_count}</span>
    </div>
  `).join("");
}

function renderInsights() {
  const insights = dashboardService.getClassInsights(state.classId);
  const cards = [
    ["Total Earnings", money(insights.total_earnings.current), `${insights.total_earnings.change}% vs last month`, icons.dollar, "var(--purple)"],
    ["Tasks Completed", `${Math.round(insights.task_completion.current)}%`, `${insights.task_completion.change}% vs last month`, icons.check, "var(--green)"],
    ["Top Category", insights.top_category || "None", `${insights.top_category_share}% of tasks`, icons.cap, "var(--purple)"],
    ["Class Average", money(insights.class_average.current), `${insights.class_average.change}% improvement`, icons.trend, "var(--orange)"]
  ];

  document.getElementById("insightGrid").innerHTML = cards.map(([label, value, delta, svg, color]) => `
    <div class="insight-card">
      <div>
        <p>${label}</p>
        <strong>${value}</strong>
        <div class="delta">↑ ${delta}</div>
      </div>
      <div class="insight-icon" style="background:${color}22;color:${color}">${svg}</div>
    </div>
  `).join("");
}

function renderTip() {
  const tip = state.db.tips[new Date().getDate() % state.db.tips.length];
  document.getElementById("tipBar").innerHTML = `
    <div class="tip-icon">${icons.light}</div>
    <div>
      <strong>Tip of the Day</strong>
      <p>${tip}</p>
    </div>
    ${icons.arrow}
  `;
}

function renderTeacherChip() {
  const teacher = repository.findById("users", state.currentTeacherId);
  document.getElementById("teacherChip").innerHTML = `
    ${avatar(teacher)}
    <div><strong>${teacher.first_name} ${teacher.last_name}</strong><span>Class Advisor</span></div>
    ${icons.arrow}
  `;
}

function renderStudentSelect() {
  const students = dashboardService.getStudents(state.classId);
  const options = students.length
    ? students.map(student => `<option value="${student.id}">${student.first_name} ${student.last_name}</option>`).join("")
    : '<option value="">Add a student first</option>';
  document.getElementById("pageEarningStudent").innerHTML = options;
}

function renderStudentsPage() {
  const students = dashboardService.getStudents(state.classId);
  const table = document.getElementById("studentsPageTable");

  if (!students.length) {
    table.innerHTML = emptyState("No students yet", "Use the Add Student form on this page to build your class roster.");
    return;
  }

  table.innerHTML = `
    <div class="student-head"><span>Student</span><span>Balance</span><span>Streak</span><span>Status</span></div>
    ${students.map(student => `
      <div class="student-row">
        <div class="student-person">
          ${avatar(student)}
          <div>
            <strong>${student.first_name} ${student.last_name}</strong>
            <span class="student-detail">${student.student_profile?.class_label || "Class not set"}${student.student_profile?.age ? ` - Age ${student.student_profile.age}` : ""}</span>
          </div>
        </div>
        <span class="money">${money(student.wallet.balance)}</span>
        <span class="streak">🔥 ${student.streak.current_streak}</span>
        <span><span class="status-pill ${student.status}">${labelStatus(student.status)}</span></span>
      </div>
    `).join("")}
  `;
}

function renderRewardsPage() {
  const rewards = state.db.rewards.filter(reward => reward.class_id === state.classId);
  const redemptions = state.db.reward_redemptions.filter(redemption => redemption.class_id === state.classId);
  const students = dashboardService.getStudents(state.classId);

  document.getElementById("pageRewardStudent").innerHTML = students.length
    ? students.map(student => `<option value="${student.id}">${student.first_name} ${student.last_name}</option>`).join("")
    : '<option value="">Add a student first</option>';

  document.getElementById("pageRewardSelect").innerHTML = rewards.length
    ? rewards.map(reward => `<option value="${reward.id}">${reward.title} - ${money(reward.cost)}</option>`).join("")
    : '<option value="">Create a reward first</option>';

  const catalog = document.getElementById("rewardCatalog");
  if (!rewards.length) {
    catalog.innerHTML = emptyState("No rewards yet", "Create rewards like snacks, no homework passes, recognition, or financial privileges.");
  } else {
    catalog.innerHTML = rewards.map(reward => `
      <article class="reward-card">
        <div>
          <h3>${reward.title}</h3>
          <p>${reward.description || "No description added."}</p>
        </div>
        <div class="reward-meta">
          <span class="meta-pill">${reward.category}</span>
          <span class="meta-pill">${labelStatus(reward.reward_type)}</span>
          <span class="meta-pill">${money(reward.cost)}</span>
          <span class="meta-pill">${reward.quantity_available} available</span>
        </div>
      </article>
    `).join("");
  }

  const history = document.getElementById("rewardHistory");
  if (!redemptions.length) {
    history.innerHTML = emptyState("No assigned rewards yet", "Assign a reward to a student with the reason they earned it.");
  } else {
    history.innerHTML = redemptions.slice().reverse().map(redemption => {
      const reward = repository.findById("rewards", redemption.reward_id);
      const student = repository.findById("users", redemption.student_id);
      return `
        <article class="history-row">
          <h3>${student.first_name} ${student.last_name} - ${reward.title}</h3>
          <p>${redemption.reason}</p>
          <div class="reward-meta">
            <span class="meta-pill">${money(redemption.cost_paid)}</span>
            <span class="meta-pill">${labelStatus(redemption.redemption_status)}</span>
            <span class="meta-pill">${formatShortDate(redemption.redeemed_at.slice(0, 10))}</span>
          </div>
        </article>
      `;
    }).join("");
  }
}

function renderTasksPage() {
  const tasks = dashboardService.getRecentTasks(state.classId);
  const allTasks = state.db.tasks.filter(task => task.class_id === state.classId);
  const assigned = state.db.student_tasks.filter(task => task.class_id === state.classId);
  const completed = assigned.filter(task => task.completion_status === "completed").length;

  document.getElementById("tasksPageSummary").innerHTML = [
    ["Active Tasks", allTasks.filter(task => task.status === "active").length, "Ready for students", icons.clipboard, "var(--blue)"],
    ["Assigned Items", assigned.length, "Student task records", icons.users, "var(--purple)"],
    ["Completed", completed, "Approved work", icons.check, "var(--green)"],
    ["Completion", `${assigned.length ? Math.round(completed / assigned.length * 100) : 0}%`, "Class progress", icons.trend, "var(--orange)"]
  ].map(([label, value, detail, svg, color]) => `
    <div class="insight-card">
      <div>
        <p>${label}</p>
        <strong>${value}</strong>
        <div class="delta">${detail}</div>
      </div>
      <div class="insight-icon" style="background:${color}22;color:${color}">${svg}</div>
    </div>
  `).join("");

  if (!tasks.length) {
    document.getElementById("tasksPageList").innerHTML = emptyState("No tasks yet", "Create a task above to assign it to every student in the class.");
    return;
  }

  document.getElementById("tasksPageList").innerHTML = tasks.map(task => `
    <div class="task-row">
      <div class="task-icon" style="background:var(--blue)">${icons.clipboard}</div>
      <div>
        <p class="task-title">${task.title}</p>
        <p class="task-due">${task.category} - Due: ${formatShortDate(task.due_date)} - Reward: ${money(task.reward_amount)}</p>
        <div class="progress-track"><div class="progress-bar" style="width:${task.progress_percentage}%"></div></div>
      </div>
      <span class="completion-count">${task.completed_count}/${task.assigned_count}</span>
    </div>
  `).join("");
}

function renderLeaderboardPage() {
  const earners = dashboardService.getLeaderboard(state.classId, state.leaderboardRange);
  const list = document.getElementById("pageEarnersList");
  document.getElementById("pageLeaderboardRange").value = state.leaderboardRange;

  if (!earners.length) {
    list.innerHTML = emptyState("No leaderboard yet", "Add students and give earnings to start class rankings.");
    return;
  }

  list.innerHTML = earners.map((student, index) => `
    <li class="earner-row">
      <span class="rank ${index === 0 ? "top" : index === 1 ? "second" : index === 2 ? "third" : ""}">${index + 1}</span>
      <div class="earner-person">
        ${avatar(student)}
        <strong>${student.first_name} ${student.last_name}</strong>
      </div>
      <span class="money">${money(student.rank_value)}</span>
    </li>
  `).join("");
}

function renderReportsPage() {
  document.getElementById("reportsInsightGrid").innerHTML = document.getElementById("insightGrid").innerHTML;
}

function renderLiteracyPage() {
  document.getElementById("literacyTipBar").innerHTML = document.getElementById("tipBar").innerHTML;
}

function renderSettingsPage() {
  const dashboard = dashboardService.getDashboard(state.classId);
  document.getElementById("settingsList").innerHTML = [
    ["Teacher", `${dashboard.teacher.first_name} ${dashboard.teacher.last_name}`],
    ["School", dashboard.school.school_name],
    ["Class", dashboard.class.class_name],
    ["Subject", dashboard.class.subject],
    ["Academic Year", dashboard.class.academic_year],
    ["Currency", "BZ$"]
  ].map(([label, value]) => `
    <div class="settings-row">
      <span>${label}</span>
      <span>${value}</span>
    </div>
  `).join("");
}

function addStudentFromPageForm() {
  const firstName = document.getElementById("pageStudentFirstName").value.trim();
  const lastName = document.getElementById("pageStudentLastName").value.trim();
  const email = document.getElementById("pageStudentEmail").value.trim();
  const age = Number(document.getElementById("pageStudentAge").value);
  const classLabel = document.getElementById("pageStudentClass").value.trim();
  const guardianName = document.getElementById("pageStudentGuardian").value.trim();
  const guardianPhone = document.getElementById("pageStudentPhone").value.trim();

  if (!firstName || !lastName || !email || !age || !classLabel) return;

  const student = classroomActions.addStudent({
    first_name: firstName,
    last_name: lastName,
    email,
    age,
    class_label: classLabel,
    guardian_name: guardianName,
    guardian_phone: guardianPhone
  });

  document.getElementById("pageStudentForm").reset();
  showToast(`${student.first_name} ${student.last_name} added to the class.`);
  render();
}

function giveManualEarningsFromPageForm() {
  const studentId = Number(document.getElementById("pageEarningStudent").value);
  const amount = Number(document.getElementById("pageEarningAmount").value);
  const description = document.getElementById("pageEarningDescription").value.trim();

  if (!studentId) {
    showToast("Add a student before giving earnings.");
    return;
  }

  classroomActions.giveEarnings({
    student_id: studentId,
    amount,
    description,
    source_type: "manual_reward",
    source_id: null
  });

  showToast(`${studentName(studentId)} earned ${money(amount)}.`);
  render();
}

function createAndAssignTaskFromPageForm() {
  const title = document.getElementById("pageTaskTitle").value.trim();
  const category = document.getElementById("pageTaskCategory").value;
  const rewardAmount = Number(document.getElementById("pageTaskReward").value);
  const dueDate = document.getElementById("pageTaskDueDate").value;

  if (!title || !dueDate) return;

  const task = classroomActions.createTask({
    title,
    description: "",
    category,
    reward_amount: rewardAmount,
    due_date: dueDate,
    status: "active"
  });

  classroomActions.assignTask(task.id);
  document.getElementById("pageTaskForm").reset();
  document.getElementById("pageTaskReward").value = "8";
  document.getElementById("pageTaskDueDate").value = addDays(today(), 7);
  showToast(`${task.title} created and assigned.`);
  render();
}

function createRewardFromPageForm() {
  const reward = classroomActions.createReward({
    title: document.getElementById("pageRewardTitle").value.trim(),
    description: document.getElementById("pageRewardDescription").value.trim(),
    category: document.getElementById("pageRewardCategory").value,
    cost: Number(document.getElementById("pageRewardCost").value),
    quantity_available: Number(document.getElementById("pageRewardQuantity").value),
    reward_type: document.getElementById("pageRewardType").value,
    status: "active"
  });

  document.getElementById("pageRewardForm").reset();
  document.getElementById("pageRewardCost").value = "0";
  document.getElementById("pageRewardQuantity").value = "1";
  showToast(`${reward.title} added to the reward catalog.`);
  render();
}

function assignRewardFromPageForm() {
  const studentId = Number(document.getElementById("pageRewardStudent").value);
  const rewardId = Number(document.getElementById("pageRewardSelect").value);
  const reason = document.getElementById("pageRewardReason").value.trim();

  if (!studentId || !rewardId || !reason) {
    showToast("Add a student, create a reward, and include a reason first.");
    return;
  }

  const result = classroomActions.assignReward({
    student_id: studentId,
    reward_id: rewardId,
    reason
  });

  if (!result.ok) {
    showToast(result.message);
    return;
  }

  document.getElementById("pageAssignRewardForm").reset();
  showToast(`${result.reward.title} assigned to ${studentName(studentId)}.`);
  render();
}

function createChallenge() {
  const challenge = classroomActions.createChallenge({
    title: "New Class Challenge",
    description: "Track participation and reward progress.",
    challenge_type: "participation",
    start_date: today(),
    end_date: addDays(today(), 7),
    reward_amount: 10,
    status: "scheduled"
  });

  showToast(`${challenge.title} created.`);
}

const repository = {
  nextId(table) {
    return state.db[table].reduce((max, record) => Math.max(max, record.id || 0), 0) + 1;
  },

  insert(table, payload) {
    const record = { id: this.nextId(table), ...payload };
    state.db[table].push(record);
    saveDatabase();
    return record;
  },

  findById(table, id) {
    return state.db[table].find(record => record.id === id);
  },

  where(table, predicate) {
    return state.db[table].filter(predicate);
  },

  update(table, id, updater) {
    const record = this.findById(table, id);
    if (!record) return null;
    updater(record);
    saveDatabase();
    return record;
  }
};

const classroomActions = {
  addStudent(payload) {
    const timestamp = now();
    const student = repository.insert("users", {
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      role: "student",
      profile_image: "",
      student_profile: {
        age: payload.age,
        class_label: payload.class_label,
        guardian_name: payload.guardian_name,
        guardian_phone: payload.guardian_phone
      },
      school_id: 1,
      created_at: timestamp,
      updated_at: timestamp
    });

    repository.insert("class_students", {
      class_id: state.classId,
      student_id: student.id,
      status: "on_track",
      joined_at: timestamp
    });

    const wallet = repository.insert("student_wallets", {
      student_id: student.id,
      class_id: state.classId,
      balance: 0,
      total_earned: 0,
      total_spent: 0,
      updated_at: timestamp
    });

    repository.insert("streaks", {
      student_id: student.id,
      class_id: state.classId,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      updated_at: timestamp
    });

    return student;
  },

  createReward(payload) {
    return repository.insert("rewards", {
      class_id: state.classId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      cost: payload.cost,
      quantity_available: payload.quantity_available,
      reward_type: payload.reward_type,
      status: payload.status,
      created_at: now()
    });
  },

  assignReward(payload) {
    const reward = repository.findById("rewards", payload.reward_id);
    const wallet = state.db.student_wallets.find(record => record.student_id === payload.student_id && record.class_id === state.classId);

    if (!reward || reward.status !== "active") {
      return { ok: false, message: "Choose an active reward first." };
    }

    if (reward.quantity_available <= 0) {
      return { ok: false, message: "That reward is out of stock." };
    }

    if (reward.cost > 0 && wallet.balance < reward.cost) {
      return { ok: false, message: `${studentName(payload.student_id)} needs ${money(reward.cost - wallet.balance)} more for this reward.` };
    }

    if (reward.cost > 0) {
      this.recordWalletTransaction({
        wallet_id: wallet.id,
        student_id: payload.student_id,
        class_id: state.classId,
        transaction_type: "reward_purchase",
        amount: reward.cost,
        description: payload.reason,
        source_type: "system",
        source_id: reward.id,
        created_by: state.currentTeacherId
      });
    }

    reward.quantity_available -= 1;
    repository.insert("reward_redemptions", {
      reward_id: reward.id,
      student_id: payload.student_id,
      class_id: state.classId,
      cost_paid: reward.cost,
      reason: payload.reason,
      redemption_status: "fulfilled",
      approved_by: state.currentTeacherId,
      redeemed_at: now()
    });
    saveDatabase();

    return { ok: true, reward };
  },

  createTask(payload) {
    return repository.insert("tasks", {
      class_id: state.classId,
      teacher_id: state.currentTeacherId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      reward_amount: payload.reward_amount,
      due_date: payload.due_date,
      status: payload.status,
      created_at: now()
    });
  },

  assignTask(taskId, studentIds = []) {
    const selectedIds = studentIds.length
      ? studentIds
      : dashboardService.getStudents(state.classId).map(student => student.id);

    selectedIds.forEach(studentId => {
      const alreadyAssigned = state.db.student_tasks.some(record => record.task_id === taskId && record.student_id === studentId);
      if (alreadyAssigned) return;

      repository.insert("student_tasks", {
        task_id: taskId,
        student_id: studentId,
        class_id: state.classId,
        completion_status: "assigned",
        submitted_at: null,
        completed_at: null,
        approved_by: null,
        reward_given: false,
        reward_amount_given: 0,
        notes: ""
      });
    });
  },

  giveEarnings(payload) {
    const wallet = state.db.student_wallets.find(record => record.student_id === payload.student_id && record.class_id === state.classId);
    this.recordWalletTransaction({
      wallet_id: wallet.id,
      student_id: payload.student_id,
      class_id: state.classId,
      transaction_type: "earning",
      amount: payload.amount,
      description: payload.description,
      source_type: payload.source_type,
      source_id: payload.source_id,
      created_by: state.currentTeacherId
    });
    this.updateStreak(payload.student_id);
  },

  recordWalletTransaction(payload) {
    const timestamp = now();
    const wallet = repository.findById("student_wallets", payload.wallet_id);

    repository.insert("wallet_transactions", {
      wallet_id: payload.wallet_id,
      student_id: payload.student_id,
      class_id: payload.class_id,
      transaction_type: payload.transaction_type,
      amount: payload.amount,
      description: payload.description,
      source_type: payload.source_type,
      source_id: payload.source_id,
      created_by: payload.created_by,
      created_at: timestamp
    });

    if (payload.transaction_type === "earning") {
      wallet.balance += payload.amount;
      wallet.total_earned += payload.amount;
    }

    if (payload.transaction_type === "deduction" || payload.transaction_type === "reward_purchase") {
      wallet.balance = Math.max(0, wallet.balance - payload.amount);
      wallet.total_spent += payload.amount;
    }

    wallet.updated_at = timestamp;
    saveDatabase();
  },

  updateStreak(studentId) {
    const streak = state.db.streaks.find(record => record.student_id === studentId && record.class_id === state.classId);
    const activityDate = today();

    if (!streak.last_activity_date) {
      streak.current_streak = 1;
    } else {
      const gap = daysBetween(streak.last_activity_date, activityDate);
      if (gap === 1) streak.current_streak += 1;
      if (gap > 1) streak.current_streak = 1;
    }

    streak.longest_streak = Math.max(streak.longest_streak, streak.current_streak);
    streak.last_activity_date = activityDate;
    streak.updated_at = now();
    saveDatabase();
  },

  createChallenge(payload) {
    const challenge = repository.insert("challenges", {
      class_id: state.classId,
      teacher_id: state.currentTeacherId,
      title: payload.title,
      description: payload.description,
      challenge_type: payload.challenge_type,
      start_date: payload.start_date,
      end_date: payload.end_date,
      reward_amount: payload.reward_amount,
      status: payload.status,
      created_at: now()
    });

    dashboardService.getStudents(state.classId).forEach(student => {
      repository.insert("challenge_participants", {
        challenge_id: challenge.id,
        student_id: student.id,
        progress_value: 0,
        completed: false,
        rank: null,
        reward_given: false
      });
    });

    return challenge;
  }
};

const dashboardService = {
  getDashboard(classId) {
    this.updateClassStatuses(classId);
    const teacher = repository.findById("users", state.currentTeacherId);
    const classroom = state.db.classes.find(record => record.id === classId && record.teacher_id === teacher.id);
    const school = repository.findById("schools", classroom.school_id);
    const wallets = state.db.student_wallets.filter(record => record.class_id === classId);
    const studentTasks = state.db.student_tasks.filter(record => record.class_id === classId);
    const completedTasks = studentTasks.filter(record => record.completion_status === "completed").length;
    const balance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

    return {
      teacher,
      school,
      class: classroom,
      date: today(),
      class_balance: balance,
      tasks_completed_percentage: studentTasks.length ? completedTasks / studentTasks.length * 100 : 0,
      completed_tasks: completedTasks,
      total_assigned_tasks: studentTasks.length,
      active_streaks: state.db.streaks.filter(record => record.class_id === classId && record.current_streak > 0).length,
      class_average: wallets.length ? balance / wallets.length : 0,
      student_overview: this.getStudents(classId),
      top_earners: this.getLeaderboard(classId, "all"),
      recent_tasks: this.getRecentTasks(classId),
      class_insights: this.getClassInsights(classId),
      tip_of_the_day: state.db.tips[0]
    };
  },

  getStudents(classId) {
    return state.db.class_students
      .filter(record => record.class_id === classId)
      .map(link => {
        const student = repository.findById("users", link.student_id);
        return {
          ...student,
          status: link.status,
          wallet: state.db.student_wallets.find(wallet => wallet.student_id === link.student_id && wallet.class_id === classId),
          streak: state.db.streaks.find(streak => streak.student_id === link.student_id && streak.class_id === classId),
          completion_rate: this.getStudentCompletionRate(link.student_id, classId)
        };
      });
  },

  getLeaderboard(classId, range = "all") {
    const startDate = getRangeStart(range);
    return this.getStudents(classId)
      .map(student => {
        const rangeEarnings = state.db.wallet_transactions
          .filter(transaction => transaction.student_id === student.id)
          .filter(transaction => transaction.class_id === classId)
          .filter(transaction => transaction.transaction_type === "earning")
          .filter(transaction => !startDate || transaction.created_at.slice(0, 10) >= startDate)
          .reduce((sum, transaction) => sum + transaction.amount, 0);

        return {
          ...student,
          rank_value: range === "all" ? student.wallet.total_earned : rangeEarnings
        };
      })
      .sort((a, b) => b.rank_value - a.rank_value || b.wallet.balance - a.wallet.balance);
  },

  getRecentTasks(classId) {
    return state.db.tasks
      .filter(task => task.class_id === classId && task.status === "active")
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 4)
      .map(task => {
        const assignments = state.db.student_tasks.filter(record => record.task_id === task.id);
        const completed = assignments.filter(record => record.completion_status === "completed").length;
        return {
          ...task,
          completed_count: completed,
          assigned_count: assignments.length,
          progress_percentage: assignments.length ? Math.round(completed / assignments.length * 100) : 0
        };
      });
  },

  getClassInsights(classId) {
    const currentMonth = monthKey(today());
    const lastMonth = monthKey(addMonths(today(), -1));
    const currentEarnings = monthEarnings(classId, currentMonth);
    const lastEarnings = monthEarnings(classId, lastMonth);
    const categoryCounts = state.db.tasks.reduce((counts, task) => {
      counts[task.category] = (counts[task.category] || 0) + 1;
      return counts;
    }, {});
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    const dashboard = this.getCompletionOnly(classId);
    const classAverage = this.getDashboardAverageOnly(classId);

    return {
      total_earnings: {
        current: currentEarnings,
        change: percentChange(lastEarnings, currentEarnings)
      },
      task_completion: dashboard,
      top_category: topCategory ? topCategory[0] : "",
      top_category_share: topCategory ? Math.round(topCategory[1] / Math.max(state.db.tasks.length, 1) * 100) : 0,
      class_average: {
        current: classAverage,
        change: classAverage > 0 ? 100 : 0
      }
    };
  },

  getCompletionOnly(classId) {
    const tasks = state.db.student_tasks.filter(record => record.class_id === classId);
    const current = tasks.length ? tasks.filter(record => record.completion_status === "completed").length / tasks.length * 100 : 0;
    return { current, change: current > 0 ? 100 : 0 };
  },

  getDashboardAverageOnly(classId) {
    const wallets = state.db.student_wallets.filter(record => record.class_id === classId);
    const balance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    return wallets.length ? balance / wallets.length : 0;
  },

  getStudentCompletionRate(studentId, classId) {
    const tasks = state.db.student_tasks.filter(record => record.student_id === studentId && record.class_id === classId);
    if (!tasks.length) return 100;
    return tasks.filter(record => record.completion_status === "completed").length / tasks.length * 100;
  },

  updateClassStatuses(classId) {
    state.db.class_students
      .filter(link => link.class_id === classId)
      .forEach(link => {
        const assignedTasks = state.db.student_tasks.filter(record => record.student_id === link.student_id && record.class_id === classId);
        const completionRate = this.getStudentCompletionRate(link.student_id, classId);
        const missedTasks = assignedTasks.filter(record => record.completion_status === "missed").length;
        const streak = state.db.streaks.find(record => record.student_id === link.student_id && record.class_id === classId);
        const hasWorkHistory = assignedTasks.length > 0 || streak.current_streak > 0;
        link.status = hasWorkHistory && (completionRate < 60 || missedTasks > 2 || streak.current_streak < 1) ? "at_risk" : "on_track";
      });
    saveDatabase();
  }
};

window.moneyTykesApi = {
  getDashboard: classId => dashboardService.getDashboard(Number(classId)),
  getStudents: classId => dashboardService.getStudents(Number(classId)),
  createTask: payload => classroomActions.createTask(payload),
  assignTask: (taskId, studentIds) => classroomActions.assignTask(Number(taskId), studentIds),
  giveEarnings: payload => classroomActions.giveEarnings(payload),
  createReward: payload => classroomActions.createReward(payload),
  assignReward: payload => classroomActions.assignReward(payload),
  createChallenge: payload => classroomActions.createChallenge(payload),
  getLeaderboard: (classId, range) => dashboardService.getLeaderboard(Number(classId), range),
  exportData: () => structuredClone(state.db)
};

function emptyState(title, text) {
  return `<div class="empty-state"><div><strong>${title}</strong><span>${text}</span></div></div>`;
}

function avatar(user) {
  if (user.profile_image) return `<img class="avatar" src="${user.profile_image}" alt="">`;
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
  return `<span class="avatar initials" aria-hidden="true">${initials}</span>`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function studentName(studentId) {
  const student = repository.findById("users", studentId);
  return `${student.first_name} ${student.last_name}`;
}

function labelStatus(status) {
  return status.replace("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function money(value) {
  return currency.format(value || 0).replace("$", "BZ$ ");
}

function formatShortDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  return new Date().toISOString();
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonths(dateString, months) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function daysBetween(start, end) {
  return Math.round((new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000);
}

function monthKey(dateString) {
  return dateString.slice(0, 7);
}

function monthEarnings(classId, month) {
  return state.db.wallet_transactions
    .filter(transaction => transaction.class_id === classId)
    .filter(transaction => transaction.transaction_type === "earning")
    .filter(transaction => transaction.created_at.startsWith(month))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function percentChange(previous, current) {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Math.round((current - previous) / previous * 100);
}

function getRangeStart(range) {
  if (range === "week") return addDays(today(), -7);
  if (range === "month") return `${today().slice(0, 8)}01`;
  return null;
}
