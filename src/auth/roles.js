/** App roles — keep in sync with public.profiles.role check constraint. */
export const ROLES = {
  DEV: "dev",
  CLASS_ADMIN: "class_admin",
  TEACHER: "teacher"
};

export const ROLE_LABELS = {
  [ROLES.DEV]: "Dev",
  [ROLES.CLASS_ADMIN]: "Class Admin",
  [ROLES.TEACHER]: "Teacher"
};

export function normalizeRole(role) {
  if (!role) return ROLES.TEACHER;
  const value = String(role).trim().toLowerCase().replace(/\s+/g, "_");
  if (value === "dev" || value === "developer") return ROLES.DEV;
  if (
    value === "class_admin" ||
    value === "school_admin" ||
    value === "admin"
  ) {
    return ROLES.CLASS_ADMIN;
  }
  if (value === "teacher") return ROLES.TEACHER;
  // Legacy Admin form labels
  const label = String(role).trim().toLowerCase();
  if (label === "dev") return ROLES.DEV;
  if (label.includes("class admin") || label.includes("school admin") || label === "admin") {
    return ROLES.CLASS_ADMIN;
  }
  if (label.includes("dev")) return ROLES.DEV;
  return ROLES.TEACHER;
}

export function roleLabel(role) {
  const normalized = normalizeRole(role);
  return ROLE_LABELS[normalized] || ROLE_LABELS[ROLES.TEACHER];
}

export function isDev(role) {
  return normalizeRole(role) === ROLES.DEV;
}

export function isClassAdmin(role) {
  return normalizeRole(role) === ROLES.CLASS_ADMIN;
}

/** Admin section + elevated manage permissions (Dev or Class Admin). */
export function canAccessAdmin(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.DEV || normalized === ROLES.CLASS_ADMIN;
}

/** Only Dev may assign the Dev role. */
export function canAssignDevRole(actorRole) {
  return isDev(actorRole);
}

/** Demo profile used when Supabase auth is disabled (local prototype). */
export function demoProfile() {
  return {
    id: "demo-admin",
    email: "shamira.young@moneytykes.school",
    first_name: "Shamira",
    last_name: "Young",
    role: ROLES.CLASS_ADMIN,
    school_id: null,
    status: "active",
    gender: "female",
    date_of_birth: null
  };
}
