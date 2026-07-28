import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { EPHEMERAL_AUTH_KEY, getSupabase, recreateSupabaseClient } from "../lib/supabaseClient";
import { isDemoMode, isDeploymentConfigured, isSupabaseEnabled } from "../lib/featureFlags";
import { claimSession, heartbeatSession } from "../data/sessionsRepo";
import { canAccessAdmin, demoProfile, normalizeRole, ROLES } from "./roles";

const AuthContext = createContext(null);
const HEARTBEAT_MS = 30_000;
const DEMO_SIGNED_IN_KEY = "mt.demo.signedIn";

function readDemoSignedIn() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(DEMO_SIGNED_IN_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDemoSignedIn(value) {
  if (typeof window === "undefined") return;
  try {
    if (value) sessionStorage.setItem(DEMO_SIGNED_IN_KEY, "1");
    else sessionStorage.removeItem(DEMO_SIGNED_IN_KEY);
  } catch {
    /* ignore */
  }
}

async function fetchProfile(userId) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable");
  const { data, error } = await client
    .from("profiles")
    .select("id, email, first_name, last_name, role, school_id, status, gender, date_of_birth")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function AuthProvider({ children }) {
  const supabaseMode = isSupabaseEnabled();
  const demoMode = isDemoMode();
  const configured = isDeploymentConfigured();
  const [bootstrapping, setBootstrapping] = useState(supabaseMode);
  const [session, setSession] = useState(() => {
    if (demoMode && readDemoSignedIn()) {
      return { user: { id: "demo-admin", email: demoProfile().email } };
    }
    return null;
  });
  // Demo starts logged out unless this tab already entered demo (sessionStorage).
  const [profile, setProfile] = useState(() => (demoMode && readDemoSignedIn() ? demoProfile() : null));
  const [authError, setAuthError] = useState("");
  const [sessionNotice, setSessionNotice] = useState("");
  const heartbeatRef = useRef(null);
  // Bumped when the Supabase client is rebuilt (Remember-me storage switch)
  // so onAuthStateChange rebinds to the live client.
  const [clientEpoch, setClientEpoch] = useState(0);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const loadProfile = useCallback(async user => {
    if (!user) {
      setProfile(null);
      return null;
    }
    try {
      const row = await fetchProfile(user.id);
      if (row) {
        const next = {
          ...row,
          role: normalizeRole(row.role)
        };
        setProfile(next);
        return next;
      }
      const fallback = {
        id: user.id,
        email: user.email || "",
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        role: normalizeRole(user.user_metadata?.role) || ROLES.TEACHER,
        school_id: user.user_metadata?.school_id || null,
        status: "active"
      };
      setProfile(fallback);
      return fallback;
    } catch (error) {
      setAuthError(error.message || "Could not load profile.");
      setProfile(null);
      return null;
    }
  }, []);

  const endLocalSession = useCallback(
    async notice => {
      clearHeartbeat();
      const client = getSupabase();
      if (supabaseMode && client) {
        try {
          await client.auth.signOut();
        } catch {
          /* ignore */
        }
      }
      writeDemoSignedIn(false);
      setSession(null);
      setProfile(null);
      if (notice) setSessionNotice(notice);
    },
    [clearHeartbeat, supabaseMode]
  );

  const startPresence = useCallback(async () => {
    if (!supabaseMode || !getSupabase()) return;
    try {
      await claimSession();
      clearHeartbeat();
      heartbeatRef.current = window.setInterval(async () => {
        try {
          const result = await heartbeatSession();
          if (!result?.ok) {
            const reason = result?.reason;
            const message =
              reason === "revoked"
                ? "An administrator signed you out. Please sign in again."
                : reason === "replaced"
                  ? "You signed in on another device or browser. This session was closed."
                  : "Your session is no longer active. Please sign in again.";
            await endLocalSession(message);
          }
        } catch {
          /* transient network — keep session, retry next beat */
        }
      }, HEARTBEAT_MS);
    } catch (error) {
      console.warn("Session presence claim failed:", error?.message || error);
    }
  }, [clearHeartbeat, endLocalSession, supabaseMode]);

  useEffect(() => {
    if (!configured || !supabaseMode) {
      setBootstrapping(false);
      return undefined;
    }

    const client = getSupabase();
    if (!client) {
      setBootstrapping(false);
      return undefined;
    }

    let cancelled = false;

    async function boot() {
      setBootstrapping(true);
      const { data } = await client.auth.getSession();
      if (cancelled) return;
      const nextSession = data.session || null;
      setSession(nextSession);
      if (nextSession?.user) {
        await loadProfile(nextSession.user);
        await startPresence();
      } else {
        setProfile(null);
      }
      if (!cancelled) setBootstrapping(false);
    }

    boot();

    const { data: authListener } = client.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        await loadProfile(nextSession.user);
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
          await startPresence();
        }
      } else {
        clearHeartbeat();
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      clearHeartbeat();
      authListener?.subscription?.unsubscribe?.();
    };
  }, [clearHeartbeat, configured, loadProfile, startPresence, supabaseMode, clientEpoch]);

  const enterDemo = useCallback(async () => {
    if (!demoMode) return { ok: false, error: "Demo mode is not enabled." };
    setAuthError("");
    setSessionNotice("");
    const profileRow = demoProfile();
    writeDemoSignedIn(true);
    setProfile(profileRow);
    setSession({ user: { id: profileRow.id, email: profileRow.email } });
    return { ok: true };
  }, [demoMode]);

  const signIn = useCallback(
    async ({ email, password, rememberMe = true } = {}) => {
      if (!configured) {
        return { ok: false, error: "This deployment is not configured." };
      }

      if (demoMode) {
        return enterDemo();
      }

      if (!supabaseMode) {
        return { ok: false, error: "Sign in requires Supabase to be enabled." };
      }

      setAuthError("");
      setSessionNotice("");

      // Rebuild client with sessionStorage vs localStorage before auth write.
      // Unchecked "Remember me" → ephemeral session (tab-scoped).
      const client = recreateSupabaseClient({ ephemeral: !rememberMe });
      if (!client) {
        setAuthError("Supabase is not configured.");
        return { ok: false, error: "Supabase is not configured." };
      }
      setClientEpoch(value => value + 1);

      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) {
        setAuthError(error.message || "Sign in failed.");
        return { ok: false, error: error.message };
      }
      setSession(data.session);
      await loadProfile(data.user);
      await startPresence();
      return { ok: true };
    },
    [configured, demoMode, enterDemo, loadProfile, startPresence, supabaseMode]
  );

  const signOut = useCallback(async () => {
    setAuthError("");
    setSessionNotice("");
    clearHeartbeat();
    const client = getSupabase();
    if (supabaseMode && client) {
      await client.auth.signOut();
    }
    writeDemoSignedIn(false);
    setSession(null);
    setProfile(null);
    try {
      sessionStorage.removeItem(EPHEMERAL_AUTH_KEY);
    } catch {
      /* ignore */
    }
    // Restore persistent-storage client as the default after sign-out.
    if (supabaseMode) {
      recreateSupabaseClient({ ephemeral: false });
      setClientEpoch(value => value + 1);
    }
  }, [clearHeartbeat, supabaseMode]);

  const resetPassword = useCallback(
    async email => {
      if (!supabaseMode) {
        return { ok: false, error: "Password reset requires Supabase to be enabled." };
      }
      const client = getSupabase();
      if (!client) {
        return { ok: false, error: "Supabase is not configured." };
      }
      const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}login`;
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    [supabaseMode]
  );

  const value = useMemo(() => {
    const role = normalizeRole(profile?.role);
    const isAuthenticated = !configured
      ? false
      : supabaseMode
        ? Boolean(session?.user)
        : demoMode
          ? Boolean(session?.user)
          : false;
    return {
      supabaseMode,
      demoMode,
      configured,
      bootstrapping,
      session,
      user: session?.user || null,
      profile,
      role,
      schoolId: profile?.school_id ?? null,
      isAuthenticated,
      isAdmin: canAccessAdmin(role),
      authError,
      sessionNotice,
      clearSessionNotice: () => setSessionNotice(""),
      signIn,
      enterDemo,
      signOut,
      resetPassword,
      refreshProfile: () => (session?.user ? loadProfile(session.user) : Promise.resolve(null))
    };
  }, [
    authError,
    bootstrapping,
    configured,
    demoMode,
    enterDemo,
    loadProfile,
    profile,
    resetPassword,
    session,
    sessionNotice,
    signIn,
    signOut,
    supabaseMode
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
