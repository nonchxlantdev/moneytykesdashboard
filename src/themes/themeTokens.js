/**
 * Theme preview tokens for Admin thumbnail mockups.
 *
 * Hex values MUST stay in sync with [data-theme] rules in
 * src/themes/dashboard-themes.css (sidebar-bg, sidebar-active-bg,
 * header-bg, gold-accent / icon-accent, header-text). CSS custom
 * properties can't paint all four themes at once in one picker grid,
 * so this map is the shared JS mirror of those definitions — not a
 * second ad-hoc palette.
 */

import { THEME_IDS } from "./ThemeContext";

export const THEME_OPTIONS = [
  { id: "teal-gold", label: "Teal + Gold", recommended: true },
  { id: "chalkboard-green", label: "Chalkboard Green" },
  { id: "navy-gold", label: "Navy + Gold" },
  { id: "soft-teal-mint", label: "Soft Teal + Mint" }
].filter(opt => THEME_IDS.includes(opt.id));

/** @type {Record<string, {
 *   sidebarBg: string,
 *   activePillBg: string,
 *   headerBg: string,
 *   headerIsLight: boolean,
 *   accentColor: string,
 *   iconAccent: string,
 *   darkTextColor: string
 * }>} */
export const THEME_TOKENS = {
  "teal-gold": {
    sidebarBg: "#0b4b4e",
    activePillBg: "#1d8180",
    headerBg: "#123e35",
    headerIsLight: false,
    accentColor: "#f6cc69",
    iconAccent: "#359392",
    darkTextColor: "#10162f"
  },
  "chalkboard-green": {
    sidebarBg: "#193220",
    activePillBg: "#2c5a38",
    headerBg: "#29422f",
    headerIsLight: false,
    accentColor: "#f6cc69",
    iconAccent: "#4d724f",
    darkTextColor: "#10162f"
  },
  "navy-gold": {
    sidebarBg: "#0c2d4f",
    activePillBg: "#f6cc69",
    headerBg: "#0a2443",
    headerIsLight: false,
    accentColor: "#f6cc69",
    iconAccent: "#f6cc69",
    darkTextColor: "#0c2d4f"
  },
  "soft-teal-mint": {
    sidebarBg: "#389191",
    activePillBg: "#4fa9a8",
    headerBg: "#b8dedc",
    headerIsLight: true,
    accentColor: "#73b1ac",
    iconAccent: "#73b1ac",
    darkTextColor: "#1a4a49"
  }
};
