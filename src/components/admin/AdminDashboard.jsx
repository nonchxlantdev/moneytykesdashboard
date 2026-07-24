import { useState } from "react";
import {
  BookOpen,
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
import ReportCardTemplateSettings from "./ReportCardTemplateSettings";
import { isSupabaseEnabled } from "../../lib/featureFlags";
import { inviteUser } from "../../data/inviteUser";
import { deleteClass, upsertClass } from "../../data/classesRepo";
import { updateTeacherProfile } from "../../data/profilesRepo";
import { deleteSchool, upsertSchool } from "../../data/schoolsRepo";
import "./admin-dashboard.css";
import "../ReportCards/report-cards.css";

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

const emptyClassForm = {
  name: "",
  schoolId: "",
  teacherId: "",
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
    <div className="stat-strip" aria-label="Admin statistics" data-tour="admin-stats">
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

export default function AdminDashboard({ db, update, onCoreRefresh }) {
  const schools = db.schools || [];
  const teachers = db.teachers || [];
  const classes = db.classes || [];
  const supabaseMode = isSupabaseEnabled();

  const [tab, setTab] = useState("schools"); // schools | teachers | classes | report-template
  const [schoolFormOpen, setSchoolFormOpen] = useState(false);
  const [teacherFormOpen, setTeacherFormOpen] = useState(false);
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [schoolForm, setSchoolForm] = useState(emptySchoolForm);
  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
  const [classForm, setClassForm] = useState(emptyClassForm);
  const [schoolError, setSchoolError] = useState("");
  const [teacherError, setTeacherError] = useState("");
  const [classError, setClassError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalStudents = db.students.length;
  const activeTeachers = teachers.filter(teacher => teacher.status === "active").length;

  const stats = [
    { label: "Schools", value: schools.length, icon: School },
    { label: "Teachers", value: teachers.length, icon: Users },
    { label: "Classes", value: classes.length, icon: BookOpen },
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

  async function saveSchool(event) {
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

    if (supabaseMode) {
      try {
        await upsertSchool({
          id: editingSchoolId || undefined,
          ...schoolForm,
          name: schoolForm.name.trim()
        });
        await onCoreRefresh?.();
        update(() => {}, editingSchoolId ? "School updated" : "School added");
        closeSchoolForm();
      } catch (error) {
        setSchoolError(error.message || "Could not save school.");
      }
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
        next.classes = (next.classes || []).map(classroom =>
          classroom.schoolId === editingSchoolId
            ? { ...classroom, schoolName: schoolForm.name.trim() }
            : classroom
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

  async function createTeacherAccount(nextTeacher) {
    if (supabaseMode) {
      try {
        if (editingTeacherId) {
          await updateTeacherProfile(editingTeacherId, nextTeacher);
        } else {
          await inviteUser({
            email: nextTeacher.email,
            firstName: nextTeacher.firstName,
            lastName: nextTeacher.lastName,
            role: nextTeacher.role,
            schoolId: nextTeacher.schoolId,
            temporaryPassword: teacherForm.temporaryPassword !== "********"
              ? teacherForm.temporaryPassword
              : undefined
          });
        }
        await onCoreRefresh?.();
        update(() => {}, editingTeacherId ? "Teacher updated" : "Teacher invited");
      } catch (error) {
        setTeacherError(error.message || "Could not save teacher.");
        throw error;
      }
      return;
    }

    // Local demo path (pre-Supabase).
    update(next => {
      if (editingTeacherId) {
        next.teachers = next.teachers.map(teacher =>
          teacher.id === editingTeacherId ? { ...teacher, ...nextTeacher } : teacher
        );
        const teacherName = `${nextTeacher.firstName} ${nextTeacher.lastName}`;
        next.classes = (next.classes || []).map(classroom =>
          classroom.teacherId === editingTeacherId
            ? { ...classroom, teacherName, schoolId: nextTeacher.schoolId, schoolName: nextTeacher.schoolName }
            : classroom
        );
        return;
      }
      next.teachers.push({ id: Date.now(), ...nextTeacher, createdAt: today() });
    }, editingTeacherId ? "Teacher updated" : "Teacher added");
  }

  async function saveTeacher(event) {
    event.preventDefault();
    if (!teacherForm.firstName.trim() || !teacherForm.lastName.trim()) {
      setTeacherError("First and last name are required.");
      return;
    }
    if (!teacherForm.email.trim() || !isValidEmail(teacherForm.email)) {
      setTeacherError("Please enter a valid teacher email.");
      return;
    }
    if (!editingTeacherId && !teacherForm.temporaryPassword.trim()) {
      setTeacherError("Temporary password is required for new teachers.");
      return;
    }
    const school = schools.find(item => String(item.id) === String(teacherForm.schoolId));
    if (!school) {
      setTeacherError("Please assign a school.");
      return;
    }
    try {
      await createTeacherAccount({
        firstName: teacherForm.firstName.trim(),
        lastName: teacherForm.lastName.trim(),
        email: teacherForm.email.trim(),
        schoolId: school.id,
        schoolName: school.name,
        role: teacherForm.role,
        status: teacherForm.status
      });
      closeTeacherForm();
    } catch {
      /* error already surfaced */
    }
  }

  function openClassForm(classroom) {
    setClassError("");
    if (!schools.length) {
      setClassError("Create a school before adding a class.");
      return;
    }
    if (classroom) {
      setEditingClassId(classroom.id);
      setClassForm({
        name: classroom.name,
        schoolId: String(classroom.schoolId || ""),
        teacherId: classroom.teacherId ? String(classroom.teacherId) : "",
        status: classroom.status || "active"
      });
    } else {
      setEditingClassId(null);
      setClassForm(emptyClassForm);
    }
    setClassFormOpen(true);
  }

  function closeClassForm() {
    setClassFormOpen(false);
    setEditingClassId(null);
    setClassForm(emptyClassForm);
    setClassError("");
  }

  async function saveClass(event) {
    event.preventDefault();
    const name = classForm.name.trim();
    if (!name) {
      setClassError("Class name is required (e.g. Standard 4A).");
      return;
    }
    const school = schools.find(item => String(item.id) === String(classForm.schoolId));
    if (!school) {
      setClassError("Please assign a school.");
      return;
    }
    const teacher = teachers.find(item => String(item.id) === String(classForm.teacherId));
    const duplicate = classes.find(
      item =>
        item.id !== editingClassId &&
        String(item.schoolId) === String(school.id) &&
        String(item.name).trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      setClassError("That class name already exists for this school.");
      return;
    }

    const payload = {
      name,
      schoolId: school.id,
      schoolName: school.name,
      teacherId: teacher?.id ?? null,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "",
      status: classForm.status || "active"
    };

    if (supabaseMode) {
      try {
        await upsertClass({ id: editingClassId || undefined, ...payload });
        await onCoreRefresh?.();
        update(() => {}, editingClassId ? "Class updated" : "Class added");
        closeClassForm();
      } catch (error) {
        setClassError(error.message || "Could not save class.");
      }
      return;
    }

    update(next => {
      if (!next.classes) next.classes = [];
      if (editingClassId) {
        next.classes = next.classes.map(item =>
          item.id === editingClassId ? { ...item, ...payload } : item
        );
        return;
      }
      next.classes.push({ id: Date.now(), ...payload, createdAt: today() });
    }, editingClassId ? "Class updated" : "Class added");
    closeClassForm();
  }

  function confirmDeleteSchool(school) {
    setDeleteTarget({
      type: "school",
      id: school.id,
      label: school.name,
      title: "Delete this school?",
      bodyText:
        "This will permanently remove the school and any assigned local teacher and class records."
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

  function confirmDeleteClass(classroom) {
    setDeleteTarget({
      type: "class",
      id: classroom.id,
      label: classroom.name,
      title: "Delete this class?",
      bodyText:
        "This removes the class from Admin. Existing students keep their class label; rename is not applied retroactively."
    });
  }

  async function performDelete() {
    if (!deleteTarget) return;

    if (supabaseMode) {
      try {
        if (deleteTarget.type === "school") {
          await deleteSchool(deleteTarget.id);
          if (editingSchoolId === deleteTarget.id) closeSchoolForm();
        } else if (deleteTarget.type === "class") {
          await deleteClass(deleteTarget.id);
          if (editingClassId === deleteTarget.id) closeClassForm();
        } else if (deleteTarget.type === "teacher") {
          await updateTeacherProfile(deleteTarget.id, {
            firstName: deleteTarget.label.split(" ")[0] || "",
            lastName: deleteTarget.label.split(" ").slice(1).join(" ") || "",
            email: "",
            schoolId: null,
            role: "Teacher",
            status: "inactive"
          });
          if (editingTeacherId === deleteTarget.id) closeTeacherForm();
        }
        await onCoreRefresh?.();
        update(
          () => {},
          deleteTarget.type === "school"
            ? "School deleted"
            : deleteTarget.type === "class"
              ? "Class deleted"
              : "Teacher deactivated"
        );
      } catch (error) {
        update(() => {}, error.message || "Delete failed");
      }
      setDeleteTarget(null);
      return;
    }

    if (deleteTarget.type === "school") {
      update(next => {
        next.schools = next.schools.filter(school => school.id !== deleteTarget.id);
        next.teachers = next.teachers.filter(teacher => teacher.schoolId !== deleteTarget.id);
        next.classes = (next.classes || []).filter(classroom => classroom.schoolId !== deleteTarget.id);
      }, "School deleted");
      if (editingSchoolId === deleteTarget.id) closeSchoolForm();
    } else if (deleteTarget.type === "teacher") {
      update(next => {
        next.teachers = next.teachers.filter(teacher => teacher.id !== deleteTarget.id);
        next.classes = (next.classes || []).map(classroom =>
          classroom.teacherId === deleteTarget.id
            ? { ...classroom, teacherId: null, teacherName: "" }
            : classroom
        );
      }, "Teacher deleted");
      if (editingTeacherId === deleteTarget.id) closeTeacherForm();
    } else if (deleteTarget.type === "class") {
      update(next => {
        next.classes = (next.classes || []).filter(classroom => classroom.id !== deleteTarget.id);
      }, "Class deleted");
      if (editingClassId === deleteTarget.id) closeClassForm();
    }
    setDeleteTarget(null);
  }

  return (
    <div className="admin-dash">
      <PageChalkBanner
        eyebrow="SYSTEM"
        title="Admin Dashboard"
        subtitle="Manage schools, classes, teacher accounts, report card templates, and personalization."
      />

      <div className="admin-body">
        <StatStrip stats={stats} />

        <div className="form-card manage-card">
          <div className="manage-tabs" role="tablist" aria-label="Manage schools, classes, teachers, and report cards" data-tour="admin-tabs">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "schools"}
              className={tab === "schools" ? "manage-tab active" : "manage-tab"}
              data-tour="admin-tab-schools"
              onClick={() => setTab("schools")}
            >
              Schools
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "classes"}
              className={tab === "classes" ? "manage-tab active" : "manage-tab"}
              data-tour="admin-tab-classes"
              onClick={() => setTab("classes")}
            >
              Classes
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "teachers"}
              className={tab === "teachers" ? "manage-tab active" : "manage-tab"}
              data-tour="admin-tab-teachers"
              onClick={() => setTab("teachers")}
            >
              Teachers
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "report-template"}
              className={tab === "report-template" ? "manage-tab active" : "manage-tab"}
              data-tour="admin-tab-template"
              onClick={() => setTab("report-template")}
            >
              Report Card Template
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
            ) : null}
            {tab === "classes" ? (
              <ClassesPanel
                classes={classes}
                schools={schools}
                teachers={teachers}
                formOpen={classFormOpen}
                form={classForm}
                setForm={setClassForm}
                error={classError}
                editingId={editingClassId}
                onOpenForm={openClassForm}
                onCloseForm={closeClassForm}
                onSave={saveClass}
                onEdit={openClassForm}
                onDeleteRequest={confirmDeleteClass}
              />
            ) : null}
            {tab === "teachers" ? (
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
            ) : null}
            {tab === "report-template" ? <ReportCardTemplateSettings schools={schools} teachers={teachers} /> : null}
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
        <button className="btn primary-gold admin-add-btn" type="button" data-tour="admin-add" onClick={() => onOpenForm()}>
          Add School
        </button>
      ) : null}
    </>
  );
}

function ClassesPanel({
  classes,
  schools,
  teachers,
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
  const schoolTeachers = teachers.filter(
    teacher => !form.schoolId || String(teacher.schoolId) === String(form.schoolId)
  );

  return (
    <>
      {!schools.length ? (
        <p className="admin-note">Create a school first so each class can be assigned during setup.</p>
      ) : null}
      {error && !formOpen ? <p className="admin-form-error">{error}</p> : null}

      {formOpen ? (
        <form className="admin-inline-form" onSubmit={onSave}>
          {error ? <p className="admin-form-error">{error}</p> : null}
          <Field
            label="Class name"
            value={form.name}
            onChange={name => setForm({ ...form, name })}
            required
          />
          <div className="form-grid">
            <Select
              label="School"
              value={form.schoolId}
              onChange={schoolId => setForm({ ...form, schoolId, teacherId: "" })}
              options={schools.map(school => ({ value: String(school.id), label: school.name }))}
              placeholder="Select school"
              searchPlaceholder="Search schools"
              required
              allowClear={false}
            />
            <Select
              label="Homeroom teacher"
              value={form.teacherId}
              onChange={teacherId => setForm({ ...form, teacherId })}
              options={schoolTeachers.map(teacher => ({
                value: String(teacher.id),
                label: `${teacher.firstName} ${teacher.lastName}`
              }))}
              placeholder={form.schoolId ? "Select teacher (optional)" : "Select a school first"}
              searchPlaceholder="Search teachers"
              disabled={!form.schoolId}
              allowClear
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
              {editingId ? "Save Class" : "Save Class"}
            </button>
            <button className="btn" type="button" onClick={onCloseForm}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {classes.length ? (
        <div className="compact-list">
          {classes.map(classroom => (
            <CompactRow
              key={classroom.id}
              icon={<BookOpen size={16} strokeWidth={2.2} />}
              title={classroom.name}
              subtitle={[classroom.schoolName, classroom.teacherName || "No teacher"].filter(Boolean).join(" · ")}
              status={classroom.status || "active"}
              menuItems={[
                { label: "Edit", onClick: () => onEdit(classroom) },
                { label: "Remove", danger: true, onClick: () => onDeleteRequest(classroom) }
              ]}
            />
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <strong>No classes yet</strong>
          <p>Add classes like Standard 4A so student forms and Report Cards share one list.</p>
        </div>
      )}

      {!formOpen ? (
        <button
          className="btn primary-gold admin-add-btn"
          data-tour="admin-add"
          type="button"
          onClick={() => onOpenForm()}
          disabled={!schools.length}
          title={!schools.length ? "Create a school before adding a class" : "Add class"}
        >
          Add Class
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
          data-tour="admin-add"
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
