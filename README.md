# MoneyTykes Teacher Dashboard

Clean classroom dashboard for a financial literacy reward system.

## What It Does

- Add students to a class roster
- Create tasks and assign them to the class
- Give student earnings through wallet transactions
- Track balances, total earned, task progress, streaks, leaderboard ranking, and class insights
- Persist classroom data locally in the browser with `localStorage`

## Files

- `index.html` - Dashboard structure and modals
- `styles.css` - Responsive MoneyTykes interface styling
- `app.js` - Data store, classroom actions, dashboard calculations, and API-ready service layer
- `Logo.png` - MoneyTykes logo asset

## Backend Transition Notes

The JavaScript is organized so a backend can replace the local repository later:

- `repository` handles data reads/writes
- `classroomActions` handles mutations such as adding students, creating tasks, and giving earnings
- `dashboardService` handles dashboard calculations
- `window.moneyTykesApi` exposes endpoint-like methods for future integration

When moving to an API, replace `repository` methods with `fetch` calls and keep the dashboard rendering layer mostly unchanged.
