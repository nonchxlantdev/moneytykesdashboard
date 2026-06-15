# MoneyTykes Teacher Dashboard

A responsive React dashboard for teachers and schools to manage students, classroom tasks, rewards, financial literacy lessons, reporting, and MoneyTykes classroom games.

## Tech Stack

- React
- Vite
- Lucide React icons
- CSS with responsive desktop, tablet, and mobile layouts
- Browser `localStorage` for the current prototype data layer
- Supabase-ready environment variable placeholders for the planned backend integration

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Vite prints the local development URL in the terminal. The configured application base path is `/moneytykesdashboard/`.

## Build

```bash
npm run build
```

The production build is generated in `dist/`. Vite also creates `dist/404.html` for GitHub Pages single-page application fallback handling.

## Preview the Build

```bash
npm run preview
```

## Environment Variables

Copy `.env.example` to a local `.env` when Supabase is connected:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit `.env`, `.env.local`, or `.env.production`. The current frontend remains localStorage-based and does not yet initialize a Supabase client.

## Deployment

The repository includes a GitHub Pages workflow and a Vite base path for the `moneytykesdashboard` repository.

- Build command: `npm run build`
- Output directory: `dist`
- Node install command: `npm install`

Vercel and Netlify can use the same build command and output directory. See `DEPLOYMENT_NOTES.md` for GitHub and hosting details.

## Main Files

- `src/main.jsx`: application shell, dashboard pages, lessons, and game state
- `src/react.css`: React page, game, lessons, and responsive styling
- `styles.css`: shared dashboard styling
- `src/pages/LoginPage.jsx`: teacher login frontend
- `vite.config.js`: Vite and GitHub Pages configuration
