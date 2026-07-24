import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { isSupabaseEnabled } from "../lib/featureFlags";
import { canAccessAdmin, demoProfile, normalizeRole, ROLES } from "./roles";

const AuthContext = createContext(null);

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role, school_id, status")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function AuthProvider({ children }) {
  const supabaseMode = isSupabaseEnabled();
  const [bootstrapping, setBootstrapping] = useState(supabaseMode);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(() => (supabaseMode ? null : demoProfile()));
  const [authError, setAuthError] = useState("");

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
      // Auth user exists but profile row missing — treat as teacher with no school until admin links them.
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

  useEffect(() => {
    if (!supabaseMode || !supabase) {
      setBootstrapping(false);
      return undefined;
    }

    let cancelled = false;

    async function boot() {
      setBootstrapping(true);
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const nextSession = data.session || null;
      setSession(nextSession);
      if (nextSession?.user) await loadProfile(nextSession.user);
      else setProfile(null);
      if (!cancelled) setBootstrapping(false);
    }

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) await loadProfile(nextSession.user);
      else setProfile(null);
    });

    return () => {
      cancelled = true;
      authListener?.subscription?.unsubscribe?.();
    };
  }, [loadProfile, supabaseMode]);

  const signIn = useCallback(async ({ email, password, rememberMe = true }) => {
    if (!supabaseMode || !supabase) {
      // Demo mode: accept any non-empty credentials and continue.
      setProfile(demoProfile());
      setSession({ user: { id: "demo-admin", email } });
      return { ok: true };
    }

    setAuthError("");
    // Persist session in localStorage by default; "remember me" off uses sessionStorage via temporary sign-in.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) {
      setAuthError(error.message || "Sign in failed.");
      return { ok: false, error: error.message };
    }
    if (!rememberMe && typeof window !== "undefined") {
      // Best-effort: mark session as non-persistent for this browser tab.
      try {
        sessionStorage.setItem("mt.auth.ephemeral", "1");
      } catch {
        /* ignore */
      }
    }
    setSession(data.session);
    await loadProfile(data.user);
    return { ok: true };
  }, [loadProfile, supabaseMode]);

  const signOut = useCallback(async () => {
    setAuthError("");
    if (supabaseMode && supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setProfile(supabaseMode ? null : demoProfile());
    try {
      sessionStorage.removeItem("mt.auth.ephemeral");
    } catch {
      /* ignore */
    }
  }, [supabaseMode]);

  const resetPassword = useCallback(async email => {
    if (!supabaseMode || !supabase) {
      return { ok: false, error: "Password reset requires Supabase to be enabled." };
    }
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}login`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, [supabaseMode]);

  const value = useMemo(() => {
    const role = normalizeRole(profile?.role);
    return {
      supabaseMode,
      bootstrapping,
      session,
      user: session?.user || null,
      profile,
      role,
      schoolId: profile?.school_id ?? null,
      isAuthenticated: supabaseMode ? Boolean(session?.user) : true,
      isAdmin: canAccessAdmin(role),
      authError,
      signIn,
      signOut,
      resetPassword,
      refreshProfile: () => (session?.user ? loadProfile(session.user) : Promise.resolve(null))
    };
  }, [
    authError,
    bootstrapping,
    loadProfile,
    profile,
    resetPassword,
    session,
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
