/** Map Postgres snake_case rows ↔ dashboard camelCase shapes. */

export function mapSchool(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person || "",
    email: row.email || "",
    phone: row.phone || "",
    address: row.address || "",
    status: row.status || "active",
    createdAt: row.created_at
  };
}

export function mapProfileAsTeacher(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    email: row.email || "",
    schoolId: row.school_id,
    schoolName: row.school_name || "",
    role: row.role === "school_admin" ? "School Admin" : "Teacher",
    status: row.status || "active",
    createdAt: row.created_at
  };
}

export function mapClass(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    schoolId: row.school_id,
    schoolName: row.school_name || "",
    teacherId: row.teacher_id,
    teacherName: row.teacher_name || "",
    status: row.status || "active",
    createdAt: row.created_at
  };
}

export function mapStudent(row) {
  if (!row) return null;
  return {
    id: row.id,
    first: row.first_name || "",
    last: row.last_name || "",
    email: row.email || "",
    gender: row.gender || "",
    age: row.age,
    dob: row.dob || "",
    classLabel: row.class_label || "",
    schoolId: row.school_id,
    schoolName: row.school_name || "",
    teacherId: row.teacher_id,
    teacherName: row.teacher_name || "",
    guardian: row.guardian || "",
    phone: row.phone || "",
    photo: row.photo || "",
    avatar: row.avatar || "",
    balance: Number(row.balance || 0),
    totalEarned: Number(row.total_earned || 0),
    streak: Number(row.streak || 0),
    status: row.status || "inactive"
  };
}

export function studentToRow(student, schoolId) {
  return {
    school_id: schoolId || student.schoolId,
    teacher_id: student.teacherId || null,
    first_name: student.first || "",
    last_name: student.last || "",
    email: student.email || "",
    gender: student.gender || "",
    age: student.age == null || student.age === "" ? null : Number(student.age),
    dob: student.dob || null,
    class_label: student.classLabel || "",
    guardian: student.guardian || "",
    phone: student.phone || "",
    photo: student.photo || "",
    avatar: student.avatar || "",
    balance: Number(student.balance || 0),
    total_earned: Number(student.totalEarned || 0),
    streak: Number(student.streak || 0),
    status: student.status || "inactive"
  };
}
