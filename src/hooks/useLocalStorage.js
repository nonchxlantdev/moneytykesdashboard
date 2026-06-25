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
        localStorage.setItem(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key]
  );

  return [value, setStoredValue];
}
