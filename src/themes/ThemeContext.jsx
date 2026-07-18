import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const THEME_IDS = ["teal-gold", "chalkboard-green", "navy-gold", "soft-teal-mint"];
export const DEFAULT_THEME = "teal-gold";
const STORAGE_KEY = "dashboardTheme";

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  setTheme: () => {}
});

function isValidTheme(value) {
  return THEME_IDS.includes(value);
}

export function ThemeProvider({ children, className = "", ...props }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isValidTheme(saved)) return saved;
    } catch {
      /* ignore */
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isValidTheme(saved) && saved !== theme) setThemeState(saved);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from storage
  }, []);

  const setTheme = useCallback(next => {
    if (!isValidTheme(next)) return;
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={`dashboard-theme-root ${className}`.trim()}
        data-theme={theme}
        {...props}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
