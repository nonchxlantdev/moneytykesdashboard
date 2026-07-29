import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

export default defineConfig({
  // Vercel serves this app from the domain root. Keep the repository subpath
  // for the existing GitHub Pages workflow.
  base: process.env.VERCEL ? "/" : "/teacher-dashboard/",
  resolve: {
    dedupe: ["react", "react-dom"]
  },
  plugins: [
    react(),
    {
      name: "github-pages-spa-fallback",
      closeBundle() {
        const distRoot = resolve("dist");
        copyFileSync(resolve(distRoot, "index.html"), resolve(distRoot, "404.html"));
      }
    }
  ]
});
