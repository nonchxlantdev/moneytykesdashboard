import { requireSupabase } from "../lib/supabaseClient";
import { mapProfileAsTeacher } from "./mappers";
import { normalizeRole, ROLES } from "../auth/roles";

export async function listTeachersForSchool(schoolId) {
  const client = requireSupabase();
  let query = client
    .from("profiles")
    .select("*, schools(name)")
    .order("last_name");
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(row =>
    mapProfileAsTeacher({
      ...row,
      school_name: row.schools?.name || ""
    })
  );
}

export async function updateTeacherProfile(id, patch) {
  const client = requireSupabase();
  const role = normalizeRole(patch.role);
  const payload = {
    first_name: patch.firstName,
    last_name: patch.lastName,
    email: patch.email,
    school_id: patch.schoolId || null,
    role,
    status: patch.status || "active",
    gender: patch.gender === "male" || patch.gender === "female" ? patch.gender : "",
    date_of_birth: patch.dateOfBirth || null
  };
  const { data, error } = await client.from("profiles").update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return mapProfileAsTeacher(data);
}

export { ROLES };
