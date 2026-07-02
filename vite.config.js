import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

export default defineConfig({
  base: "/moneytykesdashboard/",
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
