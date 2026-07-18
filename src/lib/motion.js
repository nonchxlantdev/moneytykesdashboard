import { useReducedMotion } from "framer-motion";

/** @type {import("framer-motion").Variants} */
export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { opacity: 0, y: -8 }
};

/** @type {import("framer-motion").Transition} */
export const buttonTap = {
  whileTap: { scale: 0.96 },
  transition: { duration: 0.12, ease: "easeOut" }
};

/** @type {import("framer-motion").Variants} */
export const navItem = {
  whileHover: { x: 3 },
  transition: { duration: 0.15, ease: "easeOut" }
};

/** Kept for optional use — route changes open instantly (no enter/exit flash). */
export const pageTransition = {
  initial: false,
  animate: { opacity: 1, y: 0 },
  exit: false,
  transition: { duration: 0 }
};

/**
 * Respect reduced-motion preferences.
 * @param {Record<string, unknown>} preset
 */
export function useSafeMotion(preset) {
  const reduce = useReducedMotion();
  return reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.01 }
      }
    : preset;
}
