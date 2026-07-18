import { useCallback, useState } from "react";

/**
 * Persist state in localStorage with JSON serialization.
 * @param {string} key
 * @param {*} defaultValue
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback(
    nextValue => {
      setValue(current => {
        const resolved = typeof nextValue === "function" ? nextValue(current) : nextValue;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* quota / private mode — still update in-memory state */
        }
        return resolved;
      });

      // Also write immediately for non-function values so unmount/navigation
      // can't drop the persistence before React flushes the updater.
      if (typeof nextValue !== "function") {
        try {
          localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          /* ignore */
        }
      }
    },
    [key]
  );

  return [value, setStoredValue];
}
