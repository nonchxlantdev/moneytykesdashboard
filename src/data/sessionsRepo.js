import { requireSupabase } from "../lib/supabaseClient";

const CLIENT_ID_KEY = "mt.session.client_id";
const ONLINE_WITHIN_MS = 2 * 60 * 1000;

export function getOrCreateClientSessionId() {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return `ephemeral-${Date.now()}`;
  }
}

/**
 * Register this browser as the sole active session for the signed-in user.
 * Prefer table writes (RLS) so PostgREST schema-cache RPC issues cannot block presence.
 */
export async function claimSession() {
  const client = requireSupabase();
  const {
    data: { user },
    error: userError
  } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user?.id) throw new Error("Not signed in.");

  const clientId = getOrCreateClientSessionId();
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 240) : "";
  const now = new Date().toISOString();

  // Soft-revoke every other active session for this user.
  await client
    .from("user_sessions")
    .update({ revoked_at: now })
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .neq("client_id", clientId);

  const { data: existing, error: existingError } = await client
    .from("user_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("client_id", clientId)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing?.id) {
    const { data, error } = await client
      .from("user_sessions")
      .update({
        user_agent: userAgent,
        last_seen_at: now,
        revoked_at: null
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await client
    .from("user_sessions")
    .insert({
      user_id: user.id,
      client_id: clientId,
      user_agent: userAgent,
      last_seen_at: now,
      revoked_at: null
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function heartbeatSession() {
  const client = requireSupabase();
  const {
    data: { user }
  } = await client.auth.getUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" };

  const clientId = getOrCreateClientSessionId();
  const { data: row, error } = await client
    .from("user_sessions")
    .select("id, revoked_at, last_seen_at")
    .eq("user_id", user.id)
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw error;
  if (!row) return { ok: false, reason: "missing" };
  if (row.revoked_at) return { ok: false, reason: "revoked" };

  // Another client is the active one.
  const { data: newer } = await client
    .from("user_sessions")
    .select("id")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .neq("client_id", clientId)
    .gt("last_seen_at", row.last_seen_at)
    .limit(1);

  if (newer?.length) {
    await client.from("user_sessions").update({ revoked_at: new Date().toISOString() }).eq("id", row.id);
    return { ok: false, reason: "replaced" };
  }

  const { error: touchError } = await client
    .from("user_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", row.id);
  if (touchError) throw touchError;

  return { ok: true };
}

export async function listOnlineSessions(withinSeconds = 120) {
  const client = requireSupabase();
  const since = new Date(Date.now() - Math.max(withinSeconds, 30) * 1000).toISOString();

  // Primary: join profiles via FK. Fallback: sessions only, then hydrate profiles.
  let rows = [];
  const joined = await client
    .from("user_sessions")
    .select(
      "id, user_id, client_id, user_agent, last_seen_at, created_at, profiles(email, first_name, last_name, role, school_id, schools(name))"
    )
    .is("revoked_at", null)
    .gte("last_seen_at", since)
    .order("last_seen_at", { ascending: false });

  if (!joined.error && Array.isArray(joined.data)) {
    rows = joined.data.map(row => {
      const profile = row.profiles || {};
      return {
        sessionId: row.id,
        userId: row.user_id,
        email: profile.email || "",
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        role: profile.role || "",
        schoolId: profile.school_id,
        schoolName: profile.schools?.name || "",
        clientId: row.client_id,
        userAgent: row.user_agent || "",
        lastSeenAt: row.last_seen_at,
        createdAt: row.created_at
      };
    });
    return rows;
  }

  const plain = await client
    .from("user_sessions")
    .select("id, user_id, client_id, user_agent, last_seen_at, created_at")
    .is("revoked_at", null)
    .gte("last_seen_at", since)
    .order("last_seen_at", { ascending: false });
  if (plain.error) throw plain.error;

  const userIds = [...new Set((plain.data || []).map(row => row.user_id).filter(Boolean))];
  let profilesById = {};
  if (userIds.length) {
    const { data: profiles, error: profileError } = await client
      .from("profiles")
      .select("id, email, first_name, last_name, role, school_id, schools(name)")
      .in("id", userIds);
    if (profileError) throw profileError;
    profilesById = Object.fromEntries((profiles || []).map(profile => [profile.id, profile]));
  }

  return (plain.data || []).map(row => {
    const profile = profilesById[row.user_id] || {};
    return {
      sessionId: row.id,
      userId: row.user_id,
      email: profile.email || "",
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      role: profile.role || "",
      schoolId: profile.school_id,
      schoolName: profile.schools?.name || "",
      clientId: row.client_id,
      userAgent: row.user_agent || "",
      lastSeenAt: row.last_seen_at,
      createdAt: row.created_at
    };
  });
}

/**
 * Revoke app sessions + globally invalidate Supabase Auth refresh tokens.
 */
export async function forceLogoutUser(userId) {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("admin-force-logout", {
    body: { userId }
  });
  if (error) throw new Error(error.message || "Force logout failed.");
  if (data?.error) throw new Error(data.error);
  return data;
}

export { ONLINE_WITHIN_MS };
