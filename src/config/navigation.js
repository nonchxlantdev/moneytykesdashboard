import {
  IconBook,
  IconCalculator,
  IconCalendar,
  IconChartLine,
  IconChartPie,
  IconClipboardCheck,
  IconLayoutDashboard,
  IconMedal,
  IconPlayerPlay,
  IconSettings,
  IconShield,
  IconTrophy,
  IconUsers
} from "@tabler/icons-react";

/** Tabler icon defaults from update design.json */
export const ICON_SIZE = 18;
export const ICON_STROKE = 1.5;

/**
 * Sidebar navigation — all existing views preserved, styled per design reference.
 * `view` maps to the view-state router in main.jsx (unchanged routes).
 */
export const navSections = [
  {
    label: "MAIN",
    items: [
      { id: "dashboard", label: "Dashboard", view: "dashboard", icon: IconLayoutDashboard },
      { id: "students", label: "Students", view: "students", icon: IconUsers },
      { id: "create-lessons", label: "Create Lessons", view: "create-lessons", icon: IconPlayerPlay },
      { id: "lessons", label: "Lessons", view: "lessons", icon: IconBook },
      { id: "attendance", label: "Attendance", view: "attendance", icon: IconClipboardCheck },
      { id: "calendar", label: "Calendar", view: "calendar", icon: IconCalendar },
      { id: "rewards", label: "Rewards", view: "rewards", icon: IconTrophy }
    ]
  },
  {
    label: "CLASSROOM",
    items: [
      { id: "leaderboard", label: "Leaderboard", view: "leaderboard", icon: IconMedal },
      { id: "reports", label: "Reports", view: "reports", icon: IconChartLine },
      { id: "game", label: "Game", view: "game", icon: IconCalculator }
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { id: "admin", label: "Admin", view: "admin", icon: IconShield },
      {
        id: "financial-zone",
        label: "Financial Zone",
        view: "financial-zone",
        icon: IconChartPie,
        badge: { text: "Soon", variant: "amber" }
      },
      { id: "settings", label: "Class Settings", view: "settings", icon: IconSettings }
    ]
  }
];

/** Flat list for mobile tab bar and other consumers */
export const allNavItems = navSections.flatMap(section => section.items);
