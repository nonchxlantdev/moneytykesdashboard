# Deployment Notes

## Current Repository

This project is already initialized as a Git repository.

- Branch: `main`
- Remote: `https://github.com/nonchxlantdev/moneytykesdashboard.git`
- Vite base path: `/moneytykesdashboard/`
- Production output: `dist`

No push is performed automatically by these setup changes.

## Preflight

```bash
npm install
npm run build
git status
```

Review local changes before committing. Keep `.env` files and generated `dist` output out of Git.

## Commit and Push

```bash
git add .
git commit -m "Optimize dashboard for tablets and deployment"
git push origin main
```

## GitHub Pages

The repository contains `.github/workflows/deploy-pages.yml`. A push to the workflow's configured branch can build and publish the Vite app. Confirm GitHub Pages is configured to use **GitHub Actions** under repository Settings > Pages.

The Vite configuration copies `dist/index.html` to `dist/404.html`, allowing client-side routes to fall back correctly on GitHub Pages.

## Vercel or Netlify

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

For a root-domain deployment, change the Vite `base` setting from `/moneytykesdashboard/` to `/` or make it environment-specific before deploying.

## Environment Variables

When Supabase is implemented, configure these values in the hosting provider rather than committing them:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The current React prototype stores classroom data in browser localStorage; the environment values are placeholders for the planned Supabase integration.

## New Repository Commands

Only use these commands if the project is moved into a directory without Git history:

```bash
git init
git add .
git commit -m "Initial MoneyTykes Teacher Dashboard build"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```
