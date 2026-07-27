// Deno Edge Function: admin-force-logout
// Revokes app presence sessions and globally signs the user out of Auth.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  // Production: set ALLOWED_ORIGIN as a Supabase Edge Function secret
  // (e.g. https://nonchxlantdev.github.io) — do not leave "*" in live deploys.
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function isElevated(role) {
  return role === "dev" || role === "class_admin" || role === "school_admin";
}

async function assertRateLimit(admin, key) {
  const windowStart = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS).toISOString();
  const { data: existing } = await admin
    .from("rate_limits")
    .select("count")
    .eq("key", key)
    .eq("window_start", windowStart)
    .maybeSingle();

  const count = existing?.count || 0;
  if (count >= MAX_PER_WINDOW) return false;

  if (existing) {
    await admin
      .from("rate_limits")
      .update({ count: count + 1 })
      .eq("key", key)
      .eq("window_start", windowStart);
  } else {
    await admin.from("rate_limits").insert({ key, window_start: windowStart, count: 1 });
  }
  return true;
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json(500, { error: "Server misconfigured." });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return json(401, { error: "Unauthorized." });
    }

    const actorId = userData.user.id;
    const { data: actor, error: actorError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", actorId)
      .maybeSingle();

    if (actorError || !actor || !isElevated(actor.role) || actor.status !== "active") {
      return json(403, { error: "Only Dev or Class Admin can force logout." });
    }

    const allowed = await assertRateLimit(admin, `force-logout:${actorId}`);
    if (!allowed) {
      return json(429, { error: "Rate limit exceeded.", code: "rate_limited" });
    }

    const body = await req.json();
    const targetUserId = String(body.userId || "").trim();
    if (!targetUserId) return json(400, { error: "userId is required." });

    const { data: target, error: targetError } = await admin
      .from("profiles")
      .select("id, email, school_id, role")
      .eq("id", targetUserId)
      .maybeSingle();

    if (targetError || !target) {
      return json(404, { error: "User not found." });
    }

    if (actor.role !== "dev" && String(target.school_id || "") !== String(actor.school_id || "")) {
      return json(403, { error: "Cannot force logout a user outside your school." });
    }

    await admin
      .from("user_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", targetUserId)
      .is("revoked_at", null);

    // Invalidate all refresh tokens for this user.
    const { error: signOutError } = await admin.auth.admin.signOut(targetUserId, "global");
    if (signOutError) {
      // Older API shape fallback
      try {
        await admin.auth.admin.signOut(targetUserId);
      } catch {
        return json(400, { error: signOutError.message || "Could not sign out user." });
      }
    }

    await admin.from("audit_log").insert({
      actor_id: actorId,
      school_id: target.school_id || actor.school_id,
      action: "force_logout",
      target_type: "profile",
      target_id: targetUserId,
      meta: { email: target.email }
    });

    return json(200, { ok: true, userId: targetUserId });
  } catch (error) {
    return json(500, { error: error.message || "Unexpected error." });
  }
});
