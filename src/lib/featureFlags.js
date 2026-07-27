/**
 * Feature flags for the Supabase cutover and deployment safety.
 *
 * Fail closed: a misconfigured production build must NOT silently grant demo access.
 * Demo mode requires an explicit VITE_ALLOW_DEMO_MODE=true (local prototyping only).
 */

export function isSupabaseConfigured() {
  const url = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
  const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
  if (!url || !key) return false;
  if (url.includes("your_supabase") || key.includes("your_supabase")) return false;
  return true;
}

export function isSupabaseEnabled() {
  return String(import.meta.env.VITE_USE_SUPABASE || "").toLowerCase() === "true" && isSupabaseConfigured();
}

/** Explicit opt-in for local/demo prototyping — never set in GitHub Pages build env. */
export function isDemoModeAllowed() {
  return String(import.meta.env.VITE_ALLOW_DEMO_MODE || "").toLowerCase() === "true";
}

/** Running without Supabase but with demo explicitly allowed. */
export function isDemoMode() {
  return !isSupabaseEnabled() && isDemoModeAllowed();
}

/**
 * App may boot only when Supabase is fully configured OR demo mode is explicitly allowed.
 * Otherwise show a "not configured" screen (fail closed).
 */
export function isDeploymentConfigured() {
  return isSupabaseEnabled() || isDemoModeAllowed();
}
