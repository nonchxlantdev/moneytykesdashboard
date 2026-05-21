# MoneyTykes Teacher Dashboard

React classroom dashboard for a financial literacy reward system and game-based learning concept.

## Run Locally

Install dependencies, then start the Vite dev server:

```bash
npm install
npm run dev
```

## What It Does

- Add students to a class roster
- Create tasks and assign them to the class
- Give student earnings through wallet transactions
- Track balances, total earned, task progress, streaks, leaderboard ranking, and class insights
- Persist classroom data locally in the browser with `localStorage`
- Preview a Money Moves Live game dashboard inspired by `gameidea/gamefrontend.jpeg`

## Files

- `index.html` - Vite mount point for the React app
- `src/main.jsx` - React app, dashboard views, local data actions, and game view
- `src/react.css` - React-specific animation and game board styling
- `styles.css` - Existing responsive MoneyTykes interface styling shared by the React app
- `public/Logo.png` - MoneyTykes logo asset
- `public/gamefrontend.jpeg` - Money Moves Live reference image used in the game view
- `app.js` - Legacy vanilla JavaScript prototype retained for reference

## Backend Transition Notes

The React app is still local-first. A backend can replace the local `update` actions and dashboard calculations later:

When moving to an API, replace the localStorage reads/writes with `fetch` calls or a client data library, then keep the React components focused on rendering and interaction.
