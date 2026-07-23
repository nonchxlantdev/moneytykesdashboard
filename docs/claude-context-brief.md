# MoneyTykes Teacher Dashboard — Context brief

Use this as project context for analysis. This is the **teacher dashboard** (React app), not the public MoneyTykes WordPress marketing site.

## What it is
A school-friendly SaaS-style dashboard for teachers/schools using MoneyTykes. Teachers manage students, attendance, lessons, rewards, classroom games, and calendar planning. Local prototype data uses browser `localStorage`; Supabase is planned but not wired yet.

**Live base path:** `/moneytykesdashboard/` (GitHub Pages)

## Who it’s for
- **Teachers** — day-to-day classroom tools  
- **School admins** — schools, teacher accounts, theme personalization  

## Brand / UI
- Deep navy `#10162F`, purple `#5B35D5`, orange `#FF6B1A`, gold `#FFC928`, soft gray `#F5F7FB`
- Left sidebar (collapse/expand) + main content cards
- Optional themes: Teal+Gold (default), Chalkboard Green, Navy+Gold, Soft Teal+Mint
- Flush “chalkboard” header on Dashboard; shared chalk banners on other pages

## Main areas (sidebar)
| Area | Purpose |
|------|---------|
| **Dashboard** | Home: chalkboard welcome, class status, tasks, top students, Events rail (calendar preview, quick actions, 501 Academy, daily tip) |
| **My Day** | Coming soon — personal planning |
| **Calendar** | Plan lessons, quizzes, reminders |
| **Students** | Roster, profiles, add-student wizard, attendance |
| **Lessons** | Library + Lesson Studio (plan / video / presentation); present/start lessons |
| **Quizzes & Tests** | Coming soon (demo UI exists) |
| **Rewards** | Reward templates, award points, leaderboard |
| **Games** | Classroom games (e.g. Money Moves Live with teams) |
| **Admin** | Schools + teachers (tabbed), theme picker, Report Card Template |
| **Report Cards** | Class/term roster, scores, Excel import, PDF zip, simulated parent send |
| **How To** | Topic picker (full walkthrough or any sidebar area) + spotlight on the real UI |

## Typical teacher workflows
1. Sign in → Dashboard overview + Events rail  
2. Maintain roster → take attendance  
3. Build/start lessons; optionally run games  
4. Award reward points; check leaders  
5. Schedule week on Calendar  
6. Admin sets up schools/teachers + personalization  

## Tech stack (compact)
- React + Vite, Lucide/Tabler icons, Framer Motion, FullCalendar, Recharts, GSAP (some UI)
- CSS modules/global styles; theme via `data-theme` + CSS variables
- Entry: `src/main.jsx` (shell, routing/views, local DB state)
- Deploy: GitHub Actions → Pages (`dist/`)

## Important constraints
- Preserve existing behavior unless asked to change it  
- Not WordPress / not the marketing site  
- Kid-friendly fintech feel without looking childish  
- Responsive: desktop sidebar + events rail; tablet/phone stack rail below  

## Key files
- `src/main.jsx` — app shell & views  
- `src/pages/DashboardPage.jsx` — home  
- `src/config/navigation.js` — sidebar  
- `src/themes/` — theme system  
- `AGENTS.md` — product/design rules for agents  
- `docs/teacher-dashboard-quick-start.html` — non-technical teacher handout  

## Current product note
Prototype / demo-ready teacher UI with seed/local data. Auth and multi-school backend are still TODO (Supabase placeholders in env).
