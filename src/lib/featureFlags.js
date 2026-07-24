/**
 * Feature flags for the Supabase cutover.
 * Keep localStorage demo mode until VITE_USE_SUPABASE=true and env is configured.
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
