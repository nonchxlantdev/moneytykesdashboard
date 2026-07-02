import { useLocalStorage } from "./useLocalStorage";

const THEME_KEY = "moneytykes.theme.preference";

/**
 * Light / dark theme preference for the dashboard shell.
 * @returns {{ theme: "light"|"dark", setTheme: (value: "light"|"dark") => void, toggleTheme: () => void, isLight: boolean }}
 */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage(THEME_KEY, "light");

  function toggleTheme() {
    setTheme(current => (current === "light" ? "dark" : "light"));
  }

  return {
    theme: theme === "dark" ? "dark" : "light",
    setTheme,
    toggleTheme,
    isLight: theme !== "dark"
  };
}
