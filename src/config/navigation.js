import {
  IconBook,
  IconCalculator,
  IconCalendar,
  IconClipboardList,
  IconLayoutDashboard,
  IconShield,
  IconSun,
  IconTrophy,
  IconUsers
} from "@tabler/icons-react";

/** Tabler icon defaults from update design.json */
export const ICON_SIZE = 18;
export const ICON_STROKE = 1.5;

/**
 * Sidebar navigation — Create Lessons lives on the Lessons page;
 * Attendance lives on the Students page.
 */
export const navSections = [
  {
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", view: "dashboard", icon: IconLayoutDashboard },
      { id: "my-day", label: "My Day", view: "my-day", icon: IconSun },
      { id: "calendar", label: "Calendar", view: "calendar", icon: IconCalendar }
    ]
  },
  {
    label: "Classroom",
    items: [
      { id: "students", label: "Students", view: "students", icon: IconUsers },
      { id: "lessons", label: "Lessons", view: "lessons", icon: IconBook },
      {
        id: "quizzes",
        label: "Quizzes & Tests",
        view: "quizzes",
        icon: IconClipboardList,
        badge: { text: "Soon", variant: "soon" }
      },
      { id: "rewards", label: "Rewards", view: "rewards", icon: IconTrophy },
      { id: "game", label: "Games", view: "game", icon: IconCalculator }
    ]
  },
  {
    label: "System",
    items: [
      { id: "admin", label: "Admin", view: "admin", icon: IconShield }
    ]
  }
];

/** Flat list for mobile tab bar and other consumers */
export const allNavItems = navSections.flatMap(section => section.items);
