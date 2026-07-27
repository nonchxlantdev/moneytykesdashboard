import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./featureFlags";

const url = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const EPHEMERAL_AUTH_KEY = "mt.auth.ephemeral";

function readEphemeralFlag() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(EPHEMERAL_AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Build a Supabase browser client.
 * When "Remember me" is unchecked we persist the session in sessionStorage
 * (tab-scoped) instead of localStorage so closing the tab ends the session.
 */
function buildClient(ephemeral) {
  if (!isSupabaseConfigured()) return null;
  const storage = ephemeral && typeof window !== "undefined" ? window.sessionStorage : window.localStorage;
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storage,
      storageKey: ephemeral ? "mt-auth-ephemeral" : "mt-auth"
    }
  });
}

/**
 * Browser Supabase client — anon key only. Never put the service role key here.
 * Recreated at sign-in when Remember-me preference changes (see recreateSupabaseClient).
 */
export let supabase = buildClient(readEphemeralFlag());

export function getSupabase() {
  return supabase;
}

/**
 * Recreate the client with the correct storage before sign-in.
 * Must run before signInWithPassword so the new session is written to the right store.
 */
export function recreateSupabaseClient({ ephemeral = false } = {}) {
  if (!isSupabaseConfigured()) {
    supabase = null;
    return null;
  }
  if (typeof window !== "undefined") {
    try {
      if (ephemeral) sessionStorage.setItem(EPHEMERAL_AUTH_KEY, "1");
      else sessionStorage.removeItem(EPHEMERAL_AUTH_KEY);
    } catch {
      /* ignore */
    }
  }
  supabase = buildClient(Boolean(ephemeral));
  return supabase;
}

export function requireSupabase() {
  const client = getSupabase();
  if (!client) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return client;
}
