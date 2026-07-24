import { requireSupabase } from "../lib/supabaseClient";
import { mapClass } from "./mappers";

export async function listClasses() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("classes")
    .select("*, schools(name), profiles:teacher_id(first_name, last_name)")
    .order("name");
  if (error) throw error;
  return (data || []).map(row =>
    mapClass({
      ...row,
      school_name: row.schools?.name || "",
      teacher_name: row.profiles
        ? `${row.profiles.first_name || ""} ${row.profiles.last_name || ""}`.trim()
        : ""
    })
  );
}

export async function upsertClass(classroom) {
  const client = requireSupabase();
  const payload = {
    id: classroom.id || undefined,
    name: classroom.name,
    school_id: classroom.schoolId,
    teacher_id: classroom.teacherId || null,
    status: classroom.status || "active"
  };
  const { data, error } = await client.from("classes").upsert(payload).select("*").single();
  if (error) throw error;
  return mapClass(data);
}

export async function deleteClass(id) {
  const client = requireSupabase();
  const { error } = await client.from("classes").delete().eq("id", id);
  if (error) throw error;
}
