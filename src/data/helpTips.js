/**
 * How To walkthrough — full tour + per-sidebar topic tours.
 * Steps target real UI via [data-tour="..."]. Optional `view` switches the app page first.
 */

export const HOW_TO_SEEN_KEY = "moneytykes.howto.seen";

/** Full Dashboard + key Classroom highlights (first-time / complete tour). */
export const HOW_TO_OVERVIEW_STEPS = [
  {
    id: "welcome",
    selector: '[data-tour="sidebar"]',
    placement: "right",
    view: "dashboard",
    title: "Welcome to MoneyTykes",
    body: "Use the left sidebar to move around the teacher dashboard. Pick Full walkthrough or any sidebar topic anytime from System → How To."
  },
  {
    id: "chalkboard",
    selector: '[data-tour="chalkboard"]',
    placement: "bottom",
    view: "dashboard",
    title: "Your chalkboard",
    body: "This welcome board greets you each day. It is your classroom home signal at the top of the Dashboard."
  },
  {
    id: "status",
    selector: '[data-tour="class-status"]',
    placement: "bottom",
    view: "dashboard",
    title: "Class status",
    body: "Track lesson completion, attendance, rewards, and task progress for the month in one glance."
  },
  {
    id: "dash-mid",
    selector: '[data-tour="dash-mid"]',
    placement: "top",
    view: "dashboard",
    title: "Tasks and top students",
    body: "Recent tasks and your rewards leaderboard live here so you can follow up quickly."
  },
  {
    id: "events-rail",
    selector: '[data-tour="events-rail"]',
    placement: "left",
    view: "dashboard",
    title: "Events and shortcuts",
    body: "Upcoming calendar events, quick actions, and the 501 Academy link sit in this rail."
  },
  {
    id: "students",
    selector: '[data-tour="nav-students"]',
    placement: "right",
    view: "dashboard",
    title: "Students",
    body: "Open Students to manage your roster, profiles, and attendance. Choose Students in How To for a deeper walkthrough."
  },
  {
    id: "lessons",
    selector: '[data-tour="nav-lessons"]',
    placement: "right",
    view: "dashboard",
    title: "Lessons",
    body: "Build class lessons, videos, or presentations, then start them when you teach."
  },
  {
    id: "rewards",
    selector: '[data-tour="nav-rewards"]',
    placement: "right",
    view: "dashboard",
    title: "Rewards",
    body: "Create reward templates, award points, and check the class leaderboard."
  },
  {
    id: "games",
    selector: '[data-tour="nav-games"]',
    placement: "right",
    view: "dashboard",
    title: "Games",
    body: "Run classroom games like Money Moves Live with teams on the board."
  },
  {
    id: "calendar",
    selector: '[data-tour="nav-calendar"]',
    placement: "right",
    view: "dashboard",
    title: "Calendar",
    body: "Plan quizzes, tests, lessons, and reminders for your week."
  },
  {
    id: "report-cards",
    selector: '[data-tour="nav-report-cards"]',
    placement: "right",
    view: "dashboard",
    title: "Report Cards",
    body: "Enter grades, import from Excel, export PDFs, and simulate sending report cards to parents."
  },
  {
    id: "howto-again",
    selector: '[data-tour="nav-howto"]',
    placement: "right",
    view: "dashboard",
    title: "Replay anytime",
    body: "Come back to How To whenever you need a refresher — pick the full tour or one sidebar area to explain."
  }
];

/** @deprecated use HOW_TO_OVERVIEW_STEPS */
export const HOW_TO_STEPS = HOW_TO_OVERVIEW_STEPS;

/**
 * Sidebar topic tours — opened from the How To picker.
 * Each topic maps to a nav item teachers can select to explain.
 * Optional `clickSelector` clicks a tab/button after navigating so the target is visible.
 */
export const HOW_TO_TOPICS = [
  {
    id: "dashboard",
    label: "Dashboard",
    section: "Main",
    view: "dashboard",
    summary: "Start-of-day overview: chalkboard, class status, tasks, and Events rail.",
    steps: [
      {
        id: "nav",
        selector: '[data-tour="nav-dashboard"]',
        placement: "right",
        view: "dashboard",
        title: "Dashboard",
        body: "Your home base. Open this first each day to see what needs attention before the first lesson."
      },
      {
        id: "chalkboard",
        selector: '[data-tour="chalkboard"]',
        placement: "bottom",
        view: "dashboard",
        title: "Chalkboard welcome",
        body: "The chalkboard greets you by name and sets the classroom tone. It is the visual home signal at the top of the page."
      },
      {
        id: "status",
        selector: '[data-tour="class-status"]',
        placement: "bottom",
        view: "dashboard",
        title: "Class status",
        body: "See lessons, attendance, rewards, and tasks progress for the month in one strip — a quick health check for your class."
      },
      {
        id: "mid",
        selector: '[data-tour="dash-mid"]',
        placement: "top",
        view: "dashboard",
        title: "Tasks & leaders",
        body: "Follow up on recent tasks and celebrate top students on the rewards board without leaving the home page."
      },
      {
        id: "rail",
        selector: '[data-tour="events-rail"]',
        placement: "left",
        view: "dashboard",
        title: "Events rail",
        body: "Calendar preview, quick actions, 501 Academy resources, and a daily tip sit here on desktop so shortcuts stay one click away."
      }
    ]
  },
  {
    id: "my-day",
    label: "My Day",
    section: "Main",
    view: "my-day",
    summary: "Personal planning for your teaching day (coming soon).",
    steps: [
      {
        id: "nav",
        selector: '[data-tour="nav-my-day"]',
        placement: "right",
        view: "my-day",
        title: "My Day in the sidebar",
        body: "My Day will be your personal teaching plan — priorities, reminders, and what to tackle before class."
      },
      {
        id: "banner",
        selector: '[data-tour="page-banner"]',
        placement: "bottom",
        view: "my-day",
        title: "Still coming soon",
        body: "This page is a placeholder while we build the day planner. The rest of the dashboard is ready to use today."
      },
      {
        id: "body",
        selector: '[data-tour="coming-soon-body"]',
        placement: "top",
        view: "my-day",
        title: "What to use instead",
        body: "Until My Day launches, start on Dashboard for class health, and use Calendar to schedule lessons, quizzes, and reminders."
      },
      {
        id: "calendar-alt",
        selector: '[data-tour="nav-calendar"]',
        placement: "right",
        view: "my-day",
        title: "Plan on Calendar",
        body: "Open Calendar from Main to block time for lessons and events. Those items also appear on the Dashboard Events rail."
      }
    ]
  },
  {
    id: "calendar",
    label: "Calendar",
    section: "Main",
    view: "calendar",
    summary: "Schedule lessons, quizzes, and reminders for the week.",
    steps: [
      {
        id: "nav",
        selector: '[data-tour="nav-calendar"]',
        placement: "right",
        view: "calendar",
        title: "Calendar",
        body: "Open Calendar from Main whenever you need a shared picture of what is coming up for your class."
      },
      {
        id: "banner",
        selector: '[data-tour="page-banner"]',
        placement: "bottom",
        view: "calendar",
        title: "School planner",
        body: "This is your planner for lessons, quizzes, tests, and school events — not just a personal calendar."
      },
      {
        id: "views",
        selector: '[data-tour="calendar-view-toggle"]',
        placement: "bottom",
        view: "calendar",
        title: "Month, Week, or List",
        body: "Switch views to match how you plan. Month for the big picture, Week for detail, List for a simple agenda."
      },
      {
        id: "new",
        selector: '[data-tour="calendar-new-event"]',
        placement: "left",
        view: "calendar",
        title: "Create an event",
        body: "Click New event to add a lesson, quiz, or reminder. You can also click a day on the grid to start from that date."
      },
      {
        id: "grid",
        selector: '[data-tour="calendar-grid"]',
        placement: "top",
        view: "calendar",
        title: "The calendar grid",
        body: "Browse and edit events here. Drag or open an item when plans change so the class schedule stays accurate."
      },
      {
        id: "upcoming",
        selector: '[data-tour="calendar-upcoming"]',
        placement: "left",
        view: "calendar",
        title: "Upcoming panel",
        body: "Scan what is next without flipping months. The same events feed the Dashboard Events rail for morning check-ins."
      }
    ]
  },
  {
    id: "report-cards",
    label: "Report Cards",
    section: "Main",
    view: "report-cards",
    summary: "Grades, Excel import, PDF export, and simulated parent send.",
    steps: [
      {
        id: "nav",
        selector: '[data-tour="nav-report-cards"]',
        placement: "right",
        view: "report-cards",
        title: "Report Cards",
        body: "Enter grades by class and term, import from Excel, export PDFs, and simulate sending cards to parents."
      },
      {
        id: "banner",
        selector: '[data-tour="page-banner"]',
        placement: "bottom",
        view: "report-cards",
        title: "How report cards work",
        body: "Each student gets a report card record for a school year and term. Status moves Draft → Ready → Generated → Sent as you complete and lock grades."
      },
      {
        id: "filters",
        selector: '[data-tour="rc-toolbar"]',
        placement: "bottom",
        view: "report-cards",
        title: "Class, term & year",
        body: "Always pick the class, term, and school year first. The roster and tools below only apply to that selection."
      },
      {
        id: "excel",
        selector: '[data-tour="rc-actions"]',
        placement: "bottom",
        view: "report-cards",
        title: "Bulk tools",
        body: "Download an Excel template pre-filled with your roster and subjects, fill Term scores offline, then Import Excel. Review matched rows before committing."
      },
      {
        id: "generate",
        selector: '[data-tour="rc-generate"]',
        placement: "bottom",
        view: "report-cards",
        title: "Generate All",
        body: "When scores are complete (Ready), Generate All locks those cards as Generated so they can be exported or sent. It does not change any numbers."
      },
      {
        id: "send",
        selector: '[data-tour="rc-send"]',
        placement: "left",
        view: "report-cards",
        title: "Send to parents",
        body: "Send Report Cards opens a modal for the whole class or selected students. Only Generated or Sent cards can go out. Delivery is simulated until email is connected."
      },
      {
        id: "roster",
        selector: '[data-tour="rc-roster"]',
        placement: "top",
        view: "report-cards",
        title: "Student roster",
        body: "Each row shows average, rank, and status. Use Edit to enter percent scores (0–100), Preview the layout, Export one PDF, or Send a single card. History also appears on the student profile."
      }
    ]
  },
  {
    id: "students",
    label: "Students",
    section: "Classroom",
    view: "students",
    summary: "Roster, profiles, add students, and attendance.",
    steps: [
      {
        id: "nav",
        selector: '[data-tour="nav-students"]',
        placement: "right",
        view: "students",
        title: "Students",
        body: "Your roster is the source of truth for who is in class — rewards, games, attendance, and report cards all use it."
      },
      {
        id: "banner",
        selector: '[data-tour="page-banner"]',
        placement: "bottom",
        view: "students",
        title: "Class roster home",
        body: "Track attendance links, progress, and class points from one place. Start by confirming the right class is selected."
      },
      {
        id: "class",
        selector: '[data-tour="students-class-filter"]',
        placement: "bottom",
        view: "students",
        title: "Pick a class",
        body: "Teachers can have more than one class or section. Stats and the table always follow this class filter."
      },
      {
        id: "stats",
        selector: '[data-tour="students-stats"]',
        placement: "bottom",
        view: "students",
        title: "Roster stats",
        body: "See total students, average attendance, and class points at a glance before you dig into the list."
      },
      {
        id: "attendance-cta",
        selector: '[data-tour="students-take-attendance"]',
        placement: "left",
        view: "students",
        title: "Take Attendance",
        body: "Jump to today’s roll call. Mark present, late, or absent — attendance feeds class status on the Dashboard."
      },
      {
        id: "add-cta",
        selector: '[data-tour="students-add"]',
        placement: "left",
        view: "students",
        title: "Add Student",
        body: "Opens the enrollment wizard: student details, guardian info, school and teacher assignment, then review and save."
      },
      {
        id: "toolbar",
        selector: '[data-tour="students-roster-toolbar"]',
        placement: "bottom",
        view: "students",
        title: "Search & sort",
        body: "Find anyone by name and sort by name or points. Useful when the roster grows."
      },
      {
        id: "roster",
        selector: '[data-tour="students-roster"]',
        placement: "top",
        view: "students",
        title: "The roster table",
        body: "Open a profile to see details, points, and report card history. Edit to update info. Empty classes can import a CSV."
      },
      {
        id: "attendance-page",
        selector: '[data-tour="attendance-banner"]',
        placement: "bottom",
        view: "attendance",
        title: "Attendance page",
        body: "You are now on Attendance. Use Take for today’s roll call, or Report to review history and export a CSV."
      },
      {
        id: "attendance-tabs",
        selector: '[data-tour="attendance-tabs"]',
        placement: "bottom",
        view: "attendance",
        title: "Take vs Report",
        body: "Take mode is for marking the day. Report mode filters by date range and student when you need records."
      },
      {
        id: "roll-call",
        selector: '[data-tour="attendance-roll-call"]',
        placement: "top",
        view: "attendance",
        title: "Roll call list",
        body: "Mark each student, use Mark all present when helpful, then Save. Edit later if you already saved for that date."
      },
      {
        id: "add-wizard",
        selector: '[data-tour="add-student-form"]',
        placement: "top",
        view: "add-student",
        title: "Add Student wizard",
        body: "Step through the form, check the live preview card, and save. Guardian contact details matter later for report card send."
      }
    ]
  },
  {
    id: "lessons",
    label: "Lessons",
    section: "Classroom",
    view: "lessons",
    summary: "Lesson library and Lesson Studio for plans, video, and presentations.",
    steps: [
      {
        id: "nav",
        selector: '[data-tour="nav-lessons"]',
        placement: "right",
        view: "lessons",
        title: "Lessons",
        body: "Your lesson library holds curriculum you reuse — browse, favorite, create, and teach from here."
      },
      {
        id: "banner",
        selector: '[data-tour="page-banner"]',
        placement: "bottom",
        view: "lessons",
        title: "Lessons Library",
        body: "This is home for class lesson plans, YouTube video lessons, and slide presentations."
      },
      {
        id: "stats",
        selector: '[data-tour="lessons-stats"]',
        placement: "bottom",
        view: "lessons",
        title: "Library stats",
        body: "See how many lessons you have total, published, completed, and still inactive."
      },
      {
        id: "toolbar",
        selector: '[data-tour="lessons-toolbar"]',
        placement: "bottom",
        view: "lessons",
        title: "Find content fast",
        body: "Filter by subject or content type, and search by title. Browse Templates is a future shortcut."
      },
      {
        id: "create",
        selector: '[data-tour="lessons-create"]',
        placement: "left",
        view: "lessons",
        title: "Create Lesson",
        body: "Choose Build a Class Lesson, a video lesson, or a presentation. That opens Lesson Studio with the right template."
      },
      {
        id: "tabs",
        selector: '[data-tour="lessons-tabs"]',
        placement: "bottom",
        view: "lessons",
        title: "Status tabs & layout",
        body: "Switch Published, Favorites, and other filters. Toggle grid or list view to match how you like to browse."
      },
      {
        id: "grid",
        selector: '[data-tour="lessons-grid"]',
        placement: "top",
        view: "lessons",
        title: "Start and Preview",
        body: "On each lesson: Start Lesson for live class, Preview to rehearse, Edit in Studio, favorite, duplicate, or delete. Teaching stays in the dashboard so materials and classroom flow stay together."
      }
    ]
  },
  {
    id: "quizzes",
    label: "Quizzes & Tests",
    section: "Classroom",
    view: "quizzes",
    summary: "Assessments (coming soon) — preview the future grading flow.",
    steps: [
      {
        id: "nav",
        selector: '[data-tour="nav-quizzes"]',
        placement: "right",
        view: "quizzes",
        title: "Quizzes & Tests",
        body: "This section is marked Soon. Full create → launch → grade is not live yet, but you can explore the preview."
      },
      {
        id: "banner",
        selector: '[data-tour="page-banner"]',
        placement: "bottom",
        view: "quizzes",
        title: "What is coming",
        body: "Teachers will build mixed multiple choice and short answer tests, launch them to the class, and grade them here."
      },
      {
        id: "hero",
        selector: '[data-tour="quizzes-hero"]',
        placement: "bottom",
        view: "quizzes",
        title: "Coming soon hero",
        body: "Read the overview of the assessment tool. Until launch, schedule quiz reminders on Calendar so nothing is forgotten."
      },
      {
        id: "demo",
        selector: '[data-tour="quizzes-demo-cta"]',
        placement: "top",
        view: "quizzes",
        title: "Try the interactive demo",
        body: "Open the demo to walk through the planned create → launch → grade experience before it ships."
      },
      {
        id: "how",
        selector: '[data-tour="quizzes-how"]',
        placement: "top",
        view: "quizzes",
        title: "How it will work",
        body: "Four tip cards outline the future flow from a blank quiz to a graded student record."
      }
    ]
  },
  {
    id: "rewards",
    label: "Rewards",
    section: "Classroom",
    view: "rewards",
    summary: "Reward templates, award points, and the leaderboard.",
    steps: [
      {
        id: "nav",
        selector: '[data-tour="nav-rewards"]',
        placement: "right",
        view: "rewards",
        title: "Rewards",
        body: "Build a clear points economy so students connect good habits with recognition."
      },
      {
        id: "banner",
        selector: '[data-tour="page-banner"]',
        placement: "bottom",
        view: "rewards",
        title: "Rewards Dashboard",
        body: "Create reward templates, award points during class, and track who is leading."
      },
      {
        id: "stats",
        selector: '[data-tour="rewards-stats"]',
        placement: "bottom",
        view: "rewards",
        title: "At-a-glance stats",
        body: "See how many templates are in the bank, points awarded this week, the top student, and recent awards."
      },
      {
        id: "tabs",
        selector: '[data-tour="rewards-tabs"]',
        placement: "bottom",
        view: "rewards",
        title: "Two modes",
        body: "Manage Rewards is for building templates. Award & Track is for giving points and watching the leaderboard."
      },
      {
        id: "create",
        selector: '[data-tour="rewards-create"]',
        placement: "right",
        view: "rewards",
        clickSelector: '[data-tour="rewards-tab-manage"]',
        title: "Create a reward",
        body: "Name the reward, pick an icon and category, set point value, and save. Templates make awarding fast and consistent every day."
      },
      {
        id: "bank",
        selector: '[data-tour="rewards-bank"]',
        placement: "left",
        view: "rewards",
        clickSelector: '[data-tour="rewards-tab-manage"]',
        title: "Rewards Bank",
        body: "All saved templates live here. Filter by category, edit anytime, or delete a template (past awards keep their history)."
      },
      {
        id: "award",
        selector: '[data-tour="rewards-award"]',
        placement: "right",
        view: "rewards",
        clickSelector: '[data-tour="rewards-tab-award"]',
        title: "Award points",
        body: "Search for a student, pick a reward, add an optional note, and confirm. Immediate feedback helps students connect effort with recognition."
      },
      {
        id: "board",
        selector: '[data-tour="rewards-leaderboard"]',
        placement: "left",
        view: "rewards",
        clickSelector: '[data-tour="rewards-tab-award"]',
        title: "Leaderboard",
        body: "Toggle week or month to celebrate leaders. Top students also surface on the Dashboard home board."
      }
    ]
  },
  {
    id: "games",
    label: "Games",
    section: "Classroom",
    view: "game",
    summary: "Classroom games such as Money Moves Live.",
    steps: [
      {
        id: "nav",
        selector: '[data-tour="nav-games"]',
        placement: "right",
        view: "game",
        title: "Games",
        body: "Run an active money lesson when worksheets alone are not enough — games turn concepts into lively practice."
      },
      {
        id: "banner",
        selector: '[data-tour="page-banner"]',
        placement: "bottom",
        view: "game",
        title: "Choose a game",
        body: "Pick a classroom game to start a session. More titles can appear here as Coming soon while Money Moves Live is ready."
      },
      {
        id: "grid",
        selector: '[data-tour="games-grid"]',
        placement: "top",
        view: "game",
        title: "Game library",
        body: "Each card is a game you can run with the class. Click one to begin setup."
      },
      {
        id: "money-moves",
        selector: '[data-tour="games-money-moves"]',
        placement: "top",
        view: "game",
        title: "Money Moves Live",
        body: "Our flagship board game for financial literacy. After you select it you will start the game, add teams, then open the live board."
      },
      {
        id: "flow",
        selector: '[data-tour="page-banner"]',
        placement: "bottom",
        view: "game",
        title: "How a session runs",
        body: "Flow: choose game → Start Game → enter 1–5 team names → play on the live board (categories, timer, scores). Use Reset if you need a clean slate for the next class."
      }
    ]
  },
  {
    id: "admin",
    label: "Admin",
    section: "System",
    view: "admin",
    summary: "Schools, teachers, report card template, and theme personalization.",
    steps: [
      {
        id: "nav",
        selector: '[data-tour="nav-admin"]',
        placement: "right",
        view: "admin",
        title: "Admin",
        body: "School admins manage schools and teacher accounts here, plus report card branding and dashboard theme."
      },
      {
        id: "banner",
        selector: '[data-tour="page-banner"]',
        placement: "bottom",
        view: "admin",
        title: "Admin Dashboard",
        body: "Counts and management tools for the whole school setup live on this page."
      },
      {
        id: "stats",
        selector: '[data-tour="admin-stats"]',
        placement: "bottom",
        view: "admin",
        title: "School counts",
        body: "Quick totals for schools, teachers, and students so you know the size of your setup."
      },
      {
        id: "tabs",
        selector: '[data-tour="admin-tabs"]',
        placement: "bottom",
        view: "admin",
        title: "Schools · Teachers · Template",
        body: "Three tabs: Schools for campus records, Teachers for accounts, Report Card Template for branding and grade structure."
      },
      {
        id: "schools",
        selector: '[data-tour="admin-tab-schools"]',
        placement: "bottom",
        view: "admin",
        clickSelector: '[data-tour="admin-tab-schools"]',
        title: "Schools tab",
        body: "Add or edit schools first. Students and teachers need a school before you assign them."
      },
      {
        id: "add",
        selector: '[data-tour="admin-add"]',
        placement: "left",
        view: "admin",
        clickSelector: '[data-tour="admin-tab-schools"]',
        title: "Add school or teacher",
        body: "Use the gold Add button on each tab to create a new school or teacher. Create the school before adding teachers."
      },
      {
        id: "teachers",
        selector: '[data-tour="admin-tab-teachers"]',
        placement: "bottom",
        view: "admin",
        clickSelector: '[data-tour="admin-tab-teachers"]',
        title: "Teachers tab",
        body: "Create teacher accounts, assign them to a school, and reassign later if staffing changes."
      },
      {
        id: "template-tab",
        selector: '[data-tour="admin-tab-template"]',
        placement: "bottom",
        view: "admin",
        clickSelector: '[data-tour="admin-tab-template"]',
        title: "Report Card Template",
        body: "Open this tab to control what appears on every report card for the selected school."
      },
      {
        id: "template",
        selector: '[data-tour="admin-template"]',
        placement: "top",
        view: "admin",
        clickSelector: '[data-tour="admin-tab-template"]',
        title: "Template settings",
        body: "Set school name, motto, logo, accent color, terms, default subjects with instructors, optional columns (Hours, Rank, Absent…), and signature labels. Teachers use this when entering grades."
      },
      {
        id: "theme",
        selector: '[data-tour="admin-theme"]',
        placement: "top",
        view: "admin",
        title: "Personalization / theme",
        body: "Pick Teal+Gold, Chalkboard Green, Navy+Gold, or Soft Teal+Mint. The choice applies across the whole teacher dashboard."
      }
    ]
  }
];

export const HOW_TO_SECTIONS = ["Main", "Classroom", "System"];

export function getHowToTopic(topicId) {
  return HOW_TO_TOPICS.find(topic => topic.id === topicId) || null;
}

export function hasSeenHowTo() {
  try {
    return localStorage.getItem(HOW_TO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markHowToSeen() {
  try {
    localStorage.setItem(HOW_TO_SEEN_KEY, "1");
  } catch {
    // best-effort
  }
}
