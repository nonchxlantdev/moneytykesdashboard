import { requireSupabase } from "../lib/supabaseClient";

/**
 * Call the invite-user Edge Function (service role + rate limit server-side).
 */
export async function inviteUser({
  email,
  firstName,
  lastName,
  role,
  schoolId,
  temporaryPassword,
  gender,
  dateOfBirth
}) {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("invite-user", {
    body: {
      email: String(email || "").trim().toLowerCase(),
      firstName: String(firstName || "").trim(),
      lastName: String(lastName || "").trim(),
      role: String(role || "teacher"),
      schoolId,
      temporaryPassword: temporaryPassword || undefined,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined
    }
  });

  if (error) {
    const message = error.message || "Invite failed.";
    const status = error.context?.status;
    if (status === 429) {
      const err = new Error("Too many invites. Please wait a minute and try again.");
      err.code = "rate_limited";
      throw err;
    }
    throw new Error(message);
  }

  if (data?.error) {
    const err = new Error(data.error);
    err.code = data.code;
    throw err;
  }

  return data;
}
