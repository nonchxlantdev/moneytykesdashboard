import { requireSupabase } from "../lib/supabaseClient";
import { mapStudent, studentToRow } from "./mappers";

export async function listStudents() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("students")
    .select("*, schools(name), profiles:teacher_id(first_name, last_name)")
    .is("deleted_at", null)
    .order("last_name");
  if (error) throw error;
  return (data || []).map(row =>
    mapStudent({
      ...row,
      school_name: row.schools?.name || "",
      teacher_name: row.profiles
        ? `${row.profiles.first_name || ""} ${row.profiles.last_name || ""}`.trim()
        : ""
    })
  );
}

export async function createStudent(student) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("students")
    .insert(studentToRow(student, student.schoolId))
    .select("*")
    .single();
  if (error) throw error;
  return mapStudent(data);
}

export async function updateStudent(id, student) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("students")
    .update(studentToRow(student, student.schoolId))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapStudent(data);
}

export async function softDeleteStudent(id) {
  const client = requireSupabase();
  const { error } = await client
    .from("students")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
