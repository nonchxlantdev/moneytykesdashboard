/**
 * Spotlight walkthrough steps.
 * Each step targets a real UI node via [data-tour="..."].
 */

export const HOW_TO_SEEN_KEY = "moneytykes.howto.seen";

export const HOW_TO_STEPS = [
  {
    id: "welcome",
    selector: '[data-tour="sidebar"]',
    placement: "right",
    title: "Welcome to MoneyTykes",
    body: "Use the sidebar to move around the teacher dashboard. We will highlight the main areas next."
  },
  {
    id: "chalkboard",
    selector: '[data-tour="chalkboard"]',
    placement: "bottom",
    title: "Your chalkboard",
    body: "This welcome board greets you each day. It is your classroom home signal at the top of the Dashboard."
  },
  {
    id: "status",
    selector: '[data-tour="class-status"]',
    placement: "bottom",
    title: "Class status",
    body: "Track lesson completion, attendance, rewards, and task progress for the month in one glance."
  },
  {
    id: "dash-mid",
    selector: '[data-tour="dash-mid"]',
    placement: "top",
    title: "Tasks and top students",
    body: "Recent tasks and your rewards leaderboard live here so you can follow up quickly."
  },
  {
    id: "events-rail",
    selector: '[data-tour="events-rail"]',
    placement: "left",
    title: "Events and shortcuts",
    body: "Upcoming calendar events, quick actions, and the 501 Academy link sit in this rail."
  },
  {
    id: "students",
    selector: '[data-tour="nav-students"]',
    placement: "right",
    title: "Students",
    body: "Open Students to manage your roster, profiles, and attendance."
  },
  {
    id: "lessons",
    selector: '[data-tour="nav-lessons"]',
    placement: "right",
    title: "Lessons",
    body: "Build class lessons, videos, or presentations, then start them when you teach."
  },
  {
    id: "rewards",
    selector: '[data-tour="nav-rewards"]',
    placement: "right",
    title: "Rewards",
    body: "Create reward templates, award points, and check the class leaderboard."
  },
  {
    id: "games",
    selector: '[data-tour="nav-games"]',
    placement: "right",
    title: "Games",
    body: "Run classroom games like Money Moves Live with teams on the board."
  },
  {
    id: "calendar",
    selector: '[data-tour="nav-calendar"]',
    placement: "right",
    title: "Calendar",
    body: "Plan quizzes, tests, lessons, and reminders for your week."
  }
];

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
