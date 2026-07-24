import { requireSupabase } from "../lib/supabaseClient";

/**
 * School admin / Dev resets another user's Auth password via Edge Function.
 */
export async function resetUserPassword({ userId, newPassword }) {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke("admin-reset-password", {
    body: {
      userId,
      newPassword: String(newPassword || "")
    }
  });

  if (error) {
    const message = error.message || "Password reset failed.";
    const status = error.context?.status;
    if (status === 429) {
      const err = new Error("Too many password resets. Please wait a minute and try again.");
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
