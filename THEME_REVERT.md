# Theme Revert Guide

The dashboard now uses **Theme V2** (dark teal, based on `DEPLOYMENT_NOTES.md`).

Legacy light-teal theme files are preserved:

| File | Purpose |
|------|---------|
| `styles.legacy.css` | Full backup of `styles.css` before Theme V2 |
| `src/react.legacy.css` | Full backup of `src/react.css` before Theme V2 |

## Revert to legacy theme

In `src/main.jsx`, change the CSS imports from:

```js
import "../styles.css";
import "./react.css";
import "./responsive.css";
import "./theme-v2.css";
```

To:

```js
import "../styles.legacy.css";
import "./react.legacy.css";
import "./responsive.css";
// remove theme-v2.css
```

In `src/main.jsx`, remove `theme-v2` from the app shell className:

```js
// Change this:
className={`app-shell react-app theme-v2 ...`}
// Back to:
className={`app-shell react-app ...`}
```

Rebuild and deploy.

## Current theme tokens (V2)

- Primary accent: `#0EA5E9` (teal/sky)
- Deep teal: `#0F766E`
- Purple accent: `#8B5CF6`
- Background: `#0F172A` / `#1E293B`
- Text: `#F8FAFC` / `#94A3B8`
