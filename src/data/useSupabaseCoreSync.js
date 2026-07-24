import { useCallback, useEffect, useState } from "react";
import { isSupabaseEnabled } from "../lib/featureFlags";
import { listClasses } from "./classesRepo";
import { listTeachersForSchool } from "./profilesRepo";
import { listSchools } from "./schoolsRepo";
import { listStudents } from "./studentsRepo";

/**
 * When Supabase is enabled, hydrate core admin/roster collections from Postgres.
 * Local demo mode leaves localStorage db untouched.
 */
export function useSupabaseCoreSync({ enabled, setDb, setToast }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!enabled || !isSupabaseEnabled()) return;
    setLoading(true);
    setError("");
    try {
      const [schools, teachers, classes, students] = await Promise.all([
        listSchools(),
        listTeachersForSchool(),
        listClasses(),
        listStudents()
      ]);
      setDb(current => ({
        ...current,
        schools,
        teachers,
        classes,
        students
      }));
    } catch (err) {
      const message = err.message || "Could not load school data from Supabase.";
      setError(message);
      setToast?.(message);
    } finally {
      setLoading(false);
    }
  }, [enabled, setDb, setToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, error, refresh };
}
