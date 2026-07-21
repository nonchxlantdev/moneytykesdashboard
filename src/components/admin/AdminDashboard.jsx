import { useState } from "react";
import {
  Check,
  GraduationCap,
  School,
  User,
  Users
} from "lucide-react";
import PageChalkBanner from "../shared/PageChalkBanner";
import ConfirmDeleteModal from "../shared/ConfirmDeleteModal";
import Select from "../ui/Select";
import RowOverflowMenu from "../Rewards/RowOverflowMenu";
import PersonalizationSettings from "./PersonalizationSettings";
import "./admin-dashboard.css";

const emptySchoolForm = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  status: "active"
};

const emptyTeacherForm = {
  firstName: "",
  lastName: "",
  email: "",
  temporaryPassword: "",
  schoolId: "",
  role: "Teacher",
  status: "active"
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="field-label">
      {label}
      <span className="input-without-icon">
        <input
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          required={required}
        />
      </span>
    </label>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`admin-status-badge admin-status-${status}`}>
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

function StatStrip({ stats }) {
  return (
    <div className="stat-strip" aria-label="Admin statistics">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div className="strip-item" key={stat.label}>
            <span className="strip-icon" aria-hidden="true">
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CompactRow({ icon, title, subtitle, status, menuItems }) {
  return (
    <div className="compact-row">
      <div className="cr-main">
        <div className="admin-avatar" aria-hidden="true">
          {icon}
        </div>
        <div className="cr-text">
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
      </div>
      <StatusBadge status={status} />
      <RowOverflowMenu items={menuItems} />
    </div>
  );
}

export default function AdminDashboard({ db, update }) {
  const schools = db.schools || [];
  const teachers = db.teachers || [];

  const [tab, setTab] = useState("schools");
  const [schoolFormOpen, setSchoolFormOpen] = useState(false);
  const [teacherFormOpen, setTeacherFormOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [schoolForm, setSchoolForm] = useState(emptySchoolForm);
  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
  const [schoolError, setSchoolError] = useState("");
  const [teacherError, setTeacherError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalStudents = db.students.length;
  const activeTeachers = teachers.filter(teacher => teacher.status === "active").length;

  const stats = [
    { label: "Schools", value: schools.length, icon: School },
    { label: "Teachers", value: teachers.length, icon: Users },
    { label: "Students", value: totalStudents, icon: GraduationCap },
    { label: "Active Accounts", value: activeTeachers, icon: Check }
  ];

  function openSchoolForm(school) {
    setSchoolError("");
    if (school) {
      setEditingSchoolId(school.id);
      setSchoolForm({
        name: school.name,
        contactPerson: school.contactPerson,
        email: school.email,
        phone: school.phone,
        address: school.address,
        status: school.status
      });
    } else {
      setEditingSchoolId(null);
      setSchoolForm(emptySchoolForm);
    }
    setSchoolFormOpen(true);
  }

  function closeSchoolForm() {
    setSchoolFormOpen(false);
    setEditingSchoolId(null);
    setSchoolForm(emptySchoolForm);
    setSchoolError("");
  }

  function saveSchool(event) {
    event.preventDefault();
    if (
      !schoolForm.name.trim() ||
      !schoolForm.contactPerson.trim() ||
      !schoolForm.email.trim() ||
      !schoolForm.phone.trim() ||
      !schoolForm.address.trim()
    ) {
      setSchoolError("All school fields are required.");
      return;
    }
    if (!isValidEmail(schoolForm.email)) {
      setSchoolError("Please enter a valid school email.");
      return;
    }
    update(next => {
      if (editingSchoolId) {
        next.schools = next.schools.map(school =>
          school.id === editingSchoolId
            ? { ...school, ...schoolForm, name: schoolForm.name.trim() }
            : school
        );
        next.teachers = next.teachers.map(teacher =>
          teacher.schoolId === editingSchoolId
            ? { ...teacher, schoolName: schoolForm.name.trim() }
            : teacher
        );
        return;
      }
      next.schools.push({
        id: Date.now(),
        ...schoolForm,
        name: schoolForm.name.trim(),
        createdAt: today()
      });
    }, editingSchoolId ? "School updated" : "School added");
    closeSchoolForm();
  }

  function openTeacherForm(teacher) {
    setTeacherError("");
    if (!schools.length) {
      setTeacherError("Create a school before adding a teacher.");
      return;
    }
    if (teacher) {
      setEditingTeacherId(teacher.id);
      setTeacherForm({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        temporaryPassword: "********",
        schoolId: String(teacher.schoolId),
        role: teacher.role,
        status: teacher.status
      });
    } else {
      setEditingTeacherId(null);
      setTeacherForm(emptyTeacherForm);
    }
    setTeacherFormOpen(true);
  }

  function closeTeacherForm() {
    setTeacherFormOpen(false);
    setEditingTeacherId(null);
    setTeacherForm(emptyTeacherForm);
    setTeacherError("");
  }

  function createTeacherAccount(nextTeacher) {
    // TODO: create teacher auth user in Supabase.
    // TODO: save teacher profile to Supabase.
    // TODO: link teacher auth user to assigned school.
    update(next => {
      if (editingTeacherId) {
        next.teachers = next.teachers.map(teacher =>
          teacher.id === editingTeacherId ? { ...teacher, ...nextTeacher } : teacher
        );
        return;
      }
      next.teachers.push({ id: Date.now(), ...nextTeacher, createdAt: today() });
    }, editingTeacherId ? "Teacher updated" : "Teacher added");
  }

  function saveTeacher(event) {
    event.preventDefault();
    if (!teacherForm.firstName.trim() || !teacherForm.lastName.trim()) {
      setTeacherError("First and last name are required.");
      return;
    }
    if (!teacherForm.email.trim() || !isValidEmail(teacherForm.email)) {
      setTeacherError("Please enter a valid teacher email.");
      return;
    }
    if (!teacherForm.temporaryPassword.trim()) {
      setTeacherError("Temporary password is required for new teachers.");
      return;
    }
    const school = schools.find(item => item.id === Number(teacherForm.schoolId));
    if (!school) {
      setTeacherError("Please assign a school.");
      return;
    }
    createTeacherAccount({
      firstName: teacherForm.firstName.trim(),
      lastName: teacherForm.lastName.trim(),
      email: teacherForm.email.trim(),
      schoolId: school.id,
      schoolName: school.name,
      role: teacherForm.role,
      status: teacherForm.status
    });
    closeTeacherForm();
  }

  function confirmDeleteSchool(school) {
    setDeleteTarget({
      type: "school",
      id: school.id,
      label: school.name,
      title: "Delete this school?",
      bodyText:
        "This will permanently remove the school and any assigned local teacher records."
    });
  }

  function confirmDeleteTeacher(teacher) {
    setDeleteTarget({
      type: "teacher",
      id: teacher.id,
      label: `${teacher.firstName} ${teacher.lastName}`,
      title: "Delete this teacher?",
      bodyText: "This will permanently remove the teacher account from local admin records."
    });
  }

  function performDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "school") {
      update(next => {
        next.schools = next.schools.filter(school => school.id !== deleteTarget.id);
        next.teachers = next.teachers.filter(teacher => teacher.schoolId !== deleteTarget.id);
      }, "School deleted");
      if (editingSchoolId === deleteTarget.id) closeSchoolForm();
    } else {
      update(next => {
        next.teachers = next.teachers.filter(teacher => teacher.id !== deleteTarget.id);
      }, "Teacher deleted");
      if (editingTeacherId === deleteTarget.id) closeTeacherForm();
    }
    setDeleteTarget(null);
  }

  return (
    <div className="admin-dash">
      <PageChalkBanner
        eyebrow="SYSTEM"
        title="Admin Dashboard"
        subtitle="Manage schools, teacher accounts, and dashboard personalization."
      />

      <div className="admin-body">
        <StatStrip stats={stats} />

        <div className="form-card manage-card">
          <div className="manage-tabs" role="tablist" aria-label="Manage schools and teachers">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "schools"}
              className={tab === "schools" ? "manage-tab active" : "manage-tab"}
              onClick={() => setTab("schools")}
            >
              Schools
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "teachers"}
              className={tab === "teachers" ? "manage-tab active" : "manage-tab"}
              onClick={() => setTab("teachers")}
            >
              Teachers
            </button>
          </div>

          <div className="manage-panel" role="tabpanel">
            {tab === "schools" ? (
              <SchoolsPanel
                schools={schools}
                formOpen={schoolFormOpen}
                form={schoolForm}
                setForm={setSchoolForm}
                error={schoolError}
                editingId={editingSchoolId}
                onOpenForm={openSchoolForm}
                onCloseForm={closeSchoolForm}
                onSave={saveSchool}
                onEdit={openSchoolForm}
                onDeleteRequest={confirmDeleteSchool}
              />
            ) : (
              <TeachersPanel
                teachers={teachers}
                schools={schools}
                formOpen={teacherFormOpen}
                form={teacherForm}
                setForm={setTeacherForm}
                error={teacherError}
                editingId={editingTeacherId}
                onOpenForm={openTeacherForm}
                onCloseForm={closeTeacherForm}
                onSave={saveTeacher}
                onEdit={openTeacherForm}
                onReassign={openTeacherForm}
                onDeleteRequest={confirmDeleteTeacher}
              />
            )}
          </div>
        </div>

        <PersonalizationSettings />
      </div>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title={deleteTarget?.title}
        itemLabel={deleteTarget?.label}
        bodyText={deleteTarget?.bodyText}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={performDelete}
      />
    </div>
  );
}

function SchoolsPanel({
  schools,
  formOpen,
  form,
  setForm,
  error,
  editingId,
  onOpenForm,
  onCloseForm,
  onSave,
  onEdit,
  onDeleteRequest
}) {
  return (
    <>
      {formOpen ? (
        <form className="admin-inline-form" onSubmit={onSave}>
          {error ? <p className="admin-form-error">{error}</p> : null}
          <div className="form-grid">
            <Field
              label="School Name"
              value={form.name}
              onChange={name => setForm({ ...form, name })}
              required
            />
            <Field
              label="Contact Person"
              value={form.contactPerson}
              onChange={contactPerson => setForm({ ...form, contactPerson })}
              required
            />
          </div>
          <div className="form-grid">
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={email => setForm({ ...form, email })}
              required
            />
            <Field
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={phone => setForm({ ...form, phone })}
              required
            />
          </div>
          <Field
            label="Address"
            value={form.address}
            onChange={address => setForm({ ...form, address })}
            required
          />
          <Select
            label="Status"
            value={form.status}
            onChange={status => setForm({ ...form, status })}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" }
            ]}
            required
            allowClear={false}
            searchPlaceholder="Search status"
          />
          <div className="admin-form-actions">
            <button className="btn primary-gold" type="submit">
              {editingId ? "Save school" : "Save school"}
            </button>
            <button className="btn" type="button" onClick={onCloseForm}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {schools.length ? (
        <div className="compact-list">
          {schools.map(school => (
            <CompactRow
              key={school.id}
              icon={<School size={16} strokeWidth={2.2} />}
              title={school.name}
              subtitle={[school.contactPerson, school.phone].filter(Boolean).join(" · ") || "No contact set"}
              status={school.status}
              menuItems={[
                { label: "Edit", onClick: () => onEdit(school) },
                { label: "Remove", danger: true, onClick: () => onDeleteRequest(school) }
              ]}
            />
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <strong>No schools yet</strong>
          <p>Add a school when you are ready to start onboarding.</p>
        </div>
      )}

      {!formOpen ? (
        <button className="btn primary-gold admin-add-btn" type="button" onClick={() => onOpenForm()}>
          Add School
        </button>
      ) : null}
    </>
  );
}

function TeachersPanel({
  teachers,
  schools,
  formOpen,
  form,
  setForm,
  error,
  editingId,
  onOpenForm,
  onCloseForm,
  onSave,
  onEdit,
  onReassign,
  onDeleteRequest
}) {
  return (
    <>
      {!schools.length ? (
        <p className="admin-note">Create a school first so each teacher can be assigned during setup.</p>
      ) : null}
      {error && !formOpen ? <p className="admin-form-error">{error}</p> : null}

      {formOpen ? (
        <form className="admin-inline-form" onSubmit={onSave}>
          {error ? <p className="admin-form-error">{error}</p> : null}
          <div className="form-grid">
            <Field
              label="First Name"
              value={form.firstName}
              onChange={firstName => setForm({ ...form, firstName })}
              required
            />
            <Field
              label="Last Name"
              value={form.lastName}
              onChange={lastName => setForm({ ...form, lastName })}
              required
            />
          </div>
          <Field
            label="Email Address"
            type="email"
            value={form.email}
            onChange={email => setForm({ ...form, email })}
            required
          />
          <Field
            label="Temporary Password"
            type="password"
            value={form.temporaryPassword}
            onChange={temporaryPassword => setForm({ ...form, temporaryPassword })}
            required
          />
          <div className="form-grid">
            <Select
              label="Assign School"
              value={form.schoolId}
              onChange={schoolId => setForm({ ...form, schoolId })}
              options={schools.map(school => ({ value: String(school.id), label: school.name }))}
              placeholder="Select school"
              searchPlaceholder="Search schools"
              required
              allowClear={false}
            />
            <Select
              label="Role"
              value={form.role}
              onChange={role => setForm({ ...form, role })}
              options={[
                { value: "Teacher", label: "Teacher" },
                { value: "School Admin", label: "School Admin" }
              ]}
              required
              allowClear={false}
              searchPlaceholder="Search roles"
            />
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={status => setForm({ ...form, status })}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" }
            ]}
            required
            allowClear={false}
            searchPlaceholder="Search status"
          />
          <div className="admin-form-actions">
            <button className="btn primary-gold" type="submit">
              {editingId ? "Save Teacher" : "Save Teacher"}
            </button>
            <button className="btn" type="button" onClick={onCloseForm}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {teachers.length ? (
        <div className="compact-list">
          {teachers.map(teacher => (
            <CompactRow
              key={teacher.id}
              icon={<User size={16} strokeWidth={2.2} />}
              title={`${teacher.firstName} ${teacher.lastName}`}
              subtitle={[teacher.schoolName, teacher.role].filter(Boolean).join(" · ")}
              status={teacher.status}
              menuItems={[
                { label: "Edit", onClick: () => onEdit(teacher) },
                { label: "Reassign School", onClick: () => onReassign(teacher) },
                { label: "Remove", danger: true, onClick: () => onDeleteRequest(teacher) }
              ]}
            />
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <strong>No teachers yet</strong>
          <p>Create teacher accounts after schools are added.</p>
        </div>
      )}

      {!formOpen ? (
        <button
          className="btn primary-gold admin-add-btn"
          type="button"
          onClick={() => onOpenForm()}
          disabled={!schools.length}
          title={!schools.length ? "Create a school before adding a teacher" : "Add teacher"}
        >
          Add Teacher
        </button>
      ) : null}
    </>
  );
}
