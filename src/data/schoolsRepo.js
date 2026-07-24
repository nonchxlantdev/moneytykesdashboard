import { requireSupabase } from "../lib/supabaseClient";
import { mapSchool } from "./mappers";

export async function listSchools() {
  const client = requireSupabase();
  const { data, error } = await client.from("schools").select("*").order("name");
  if (error) throw error;
  return (data || []).map(mapSchool);
}

export async function upsertSchool(school) {
  const client = requireSupabase();
  const payload = {
    id: school.id || undefined,
    name: school.name,
    contact_person: school.contactPerson || "",
    email: school.email || "",
    phone: school.phone || "",
    address: school.address || "",
    status: school.status || "active"
  };
  const { data, error } = await client.from("schools").upsert(payload).select("*").single();
  if (error) throw error;
  return mapSchool(data);
}

export async function deleteSchool(id) {
  const client = requireSupabase();
  const { error } = await client.from("schools").delete().eq("id", id);
  if (error) throw error;
}
