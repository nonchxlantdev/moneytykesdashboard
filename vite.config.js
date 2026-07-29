import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Vercel serves from the domain root → base "/".
 * GitHub Pages project sites need a repo path via VITE_BASE_PATH
 * (e.g. /teacher-dashboard/ or /moneytykesdashboard/).
 */
function resolveBase() {
  if (process.env.VERCEL) return "/";
  const raw = String(process.env.VITE_BASE_PATH || "/").trim() || "/";
  if (raw === "/") return "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

export default defineConfig({
  base: resolveBase(),
  resolve: {
    dedupe: ["react", "react-dom"]
  },
  plugins: [
    react(),
    {
      name: "github-pages-spa-fallback",
      closeBundle() {
        const distRoot = resolve("dist");
        const indexHtml = resolve(distRoot, "index.html");
        if (!existsSync(indexHtml)) {
          throw new Error("github-pages-spa-fallback: dist/index.html was not generated.");
        }
        copyFileSync(indexHtml, resolve(distRoot, "404.html"));
      }
    }
  ]
});
