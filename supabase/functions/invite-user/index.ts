// Deno Edge Function: invite-user
// Deploy: supabase functions deploy invite-user --no-verify-jwt=false
// Secrets: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  // Production: set ALLOWED_ORIGIN as a Supabase Edge Function secret
  // (e.g. https://nonchxlantdev.github.io) — do not leave "*" in live deploys.
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function normalizeRole(role, actorRole) {
  const value = String(role || "").toLowerCase().replace(/\s+/g, "_");
  if (value === "dev" || value.includes("developer")) {
    if (actorRole !== "dev") return null; // only Dev may invite Dev
    return "dev";
  }
  if (
    value === "class_admin" ||
    value === "school_admin" ||
    value.includes("class_admin") ||
    value.includes("admin")
  ) {
    return "class_admin";
  }
  return "teacher";
}

function isElevated(role) {
  return role === "dev" || role === "class_admin" || role === "school_admin";
}

function normalizeGender(gender) {
  const value = String(gender || "").toLowerCase().trim();
  if (value === "male" || value === "female") return value;
  return "";
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
  if (count >= MAX_PER_WINDOW) {
    return false;
  }

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
      return json(403, { error: "Only Dev or Class Admin can invite users." });
    }

    const allowed = await assertRateLimit(admin, `invite:${actorId}`);
    if (!allowed) {
      return json(429, { error: "Rate limit exceeded.", code: "rate_limited" });
    }

    const schoolAllowed = await assertRateLimit(admin, `invite-school:${actor.school_id || "none"}`);
    if (!schoolAllowed) {
      return json(429, { error: "School invite rate limit exceeded.", code: "rate_limited" });
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const role = normalizeRole(body.role, actor.role);
    const rawSchoolId = body.schoolId == null || body.schoolId === "" ? null : String(body.schoolId).trim();
    const schoolId = rawSchoolId || null;
    const temporaryPassword = String(body.temporaryPassword || "").trim();
    const gender = normalizeGender(body.gender);
    const dateOfBirth = body.dateOfBirth ? String(body.dateOfBirth).trim() : null;

    if (role === null) {
      return json(403, { error: "Only Dev can invite another Dev." });
    }
    if (!email || !email.includes("@")) return json(400, { error: "Valid email is required." });
    if (!firstName || !lastName) return json(400, { error: "First and last name are required." });
    if (!gender) return json(400, { error: "Gender is required." });
    if (temporaryPassword && temporaryPassword.length < 8) {
      return json(400, { error: "Temporary password must be at least 8 characters." });
    }

    // Class Admin may only invite into their own school (or leave school unassigned).
    // Dev may invite with any school or none.
    if (actor.role !== "dev" && schoolId && String(schoolId) !== String(actor.school_id)) {
      return json(403, { error: "Cannot invite users to another school." });
    }

    const createPayload = {
      email,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role,
        school_id: schoolId,
        gender,
        date_of_birth: dateOfBirth
      }
    };
    if (temporaryPassword) createPayload.password = temporaryPassword;

    const { data: created, error: createError } = await admin.auth.admin.createUser(createPayload);
    if (createError) {
      return json(400, { error: createError.message });
    }

    const userId = created.user.id;
    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      school_id: schoolId,
      status: "active",
      gender,
      date_of_birth: dateOfBirth || null
    });
    if (profileError) {
      return json(500, { error: profileError.message });
    }

    await admin.from("audit_log").insert({
      actor_id: actorId,
      school_id: schoolId,
      action: "invite_user",
      target_type: "profile",
      target_id: userId,
      meta: { email, role }
    });

    if (!temporaryPassword) {
      await admin.auth.admin.inviteUserByEmail(email);
    }

    return json(200, {
      ok: true,
      userId,
      email,
      role
    });
  } catch (error) {
    return json(500, { error: error.message || "Unexpected error." });
  }
});
