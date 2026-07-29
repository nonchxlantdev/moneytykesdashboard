import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Subdomain / Vercel deploys serve from the host root → base "/".
 * GitHub Pages project sites need a repo path, e.g. VITE_BASE_PATH=/moneytykesdashboard/
 */
function resolveBase() {
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
