/** App roles — keep in sync with public.profiles.role check constraint. */
export const ROLES = {
  TEACHER: "teacher",
  SCHOOL_ADMIN: "school_admin"
};

export function isSchoolAdmin(role) {
  return role === ROLES.SCHOOL_ADMIN || role === "School Admin";
}

export function normalizeRole(role) {
  if (!role) return ROLES.TEACHER;
  const value = String(role).trim().toLowerCase().replace(/\s+/g, "_");
  if (value === "school_admin" || value === "admin") return ROLES.SCHOOL_ADMIN;
  if (value === "teacher") return ROLES.TEACHER;
  // Legacy Admin form labels
  if (String(role).toLowerCase().includes("admin")) return ROLES.SCHOOL_ADMIN;
  return ROLES.TEACHER;
}

export function canAccessAdmin(role) {
  return isSchoolAdmin(normalizeRole(role));
}

/** Demo profile used when Supabase auth is disabled (local prototype). */
export function demoProfile() {
  return {
    id: "demo-admin",
    email: "shamira.young@moneytykes.school",
    first_name: "Shamira",
    last_name: "Young",
    role: ROLES.SCHOOL_ADMIN,
    school_id: null,
    status: "active"
  };
}
