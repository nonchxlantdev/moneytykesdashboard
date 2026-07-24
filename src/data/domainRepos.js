import { requireSupabase } from "../lib/supabaseClient";

/** Thin domain repos — used when VITE_USE_SUPABASE=true. */

export async function listAttendance({ schoolId, fromDate, toDate } = {}) {
  const client = requireSupabase();
  let query = client.from("attendance_records").select("*").order("attendance_date", { ascending: false });
  if (schoolId) query = query.eq("school_id", schoolId);
  if (fromDate) query = query.gte("attendance_date", fromDate);
  if (toDate) query = query.lte("attendance_date", toDate);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function upsertAttendanceRows(rows) {
  const client = requireSupabase();
  const { data, error } = await client.from("attendance_records").upsert(rows).select("*");
  if (error) throw error;
  return data || [];
}

export async function listRewardsBank(schoolId) {
  const client = requireSupabase();
  let query = client.from("rewards_bank").select("*").order("name");
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function listRecentPoints(schoolId, limit = 20) {
  const client = requireSupabase();
  let query = client.from("points_ledger").select("*").order("awarded_at", { ascending: false }).limit(limit);
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function listCalendarEvents(schoolId) {
  const client = requireSupabase();
  let query = client.from("calendar_events").select("*").order("event_date");
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function listLessons(schoolId) {
  const client = requireSupabase();
  let query = client.from("lessons").select("*").order("updated_at", { ascending: false });
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function listReportCards(schoolId) {
  const client = requireSupabase();
  let query = client.from("report_cards").select("*").order("updated_at", { ascending: false });
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function listMyDayTasks(teacherId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("my_day_tasks")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function listMyDayNotes(teacherId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("my_day_notes")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertMyDayReflection({ teacherId, date, mood, notes }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("my_day_reflections")
    .upsert(
      {
        teacher_id: teacherId,
        reflection_date: date,
        mood,
        notes
      },
      { onConflict: "teacher_id,reflection_date" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
