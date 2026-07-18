import { useMemo, useState } from "react";
import PageChalkBanner from "../shared/PageChalkBanner";
import StepGuardianInfo from "./StepGuardianInfo";
import StepNav from "./StepNav";
import StepReview from "./StepReview";
import StepSchoolInfo from "./StepSchoolInfo";
import StepStudentInfo from "./StepStudentInfo";
import StudentCardPreview from "./StudentCardPreview";
import useAddStudentForm from "./useAddStudentForm";
import WizardProgress, { STEPS } from "./WizardProgress";
import "./add-student-wizard.css";

function calculateAgeFromDob(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birth = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

export default function AddStudentWizard({
  db,
  update,
  navigate,
  editingStudent = null,
  onCancel,
  onSuccess
}) {
  const { step, setStep, data, update: patch, reset } = useAddStudentForm(editingStudent);
  const [error, setError] = useState("");
  const totalSteps = STEPS.length;
  const isEditing = Boolean(editingStudent);

  const school = useMemo(
    () => db.schools.find(item => String(item.id) === String(data.schoolId)),
    [data.schoolId, db.schools]
  );
  const teacher = useMemo(
    () => db.teachers.find(item => String(item.id) === String(data.teacherId)),
    [data.teacherId, db.teachers]
  );

  function validateStep(currentStep) {
    if (currentStep === 1) {
      if (!data.firstName.trim() || !data.lastName.trim()) {
        return "First and last name are required.";
      }
      if (data.gender !== "male" && data.gender !== "female") {
        return "Select Male or Female.";
      }
      if (!isEditing && !data.dob) return "Date of birth is required.";
      if (data.age == null) return "Select an age on the wheel.";
      return "";
    }
    if (currentStep === 2) {
      if (!data.standard && !data.form) return "Choose a Standard or Form.";
      if (!data.schoolId) return "Select a school.";
      if (!data.teacherId) return "Select a teacher.";
      return "";
    }
    return "";
  }

  function handleNext() {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");

    if (step < totalSteps) {
      if (step === 1 && data.dob && data.age == null) {
        const fromDob = calculateAgeFromDob(data.dob);
        if (fromDob != null) patch({ age: fromDob });
      }
      setStep(step + 1);
      return;
    }

    if (!school || !teacher) {
      setError("School and teacher are required.");
      return;
    }

    const classLabel = data.standard || data.form || "";
    const studentPayload = {
      first: data.firstName.trim(),
      last: data.lastName.trim(),
      gender: data.gender,
      dob: data.dob || editingStudent?.dob || "",
      age: Number(data.age),
      classLabel,
      schoolId: school.id,
      schoolName: school.name,
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      guardian: data.guardianName.trim(),
      phone: data.guardianPhone.trim(),
      photo: data.avatar?.src || "",
      avatar: data.avatar?.fileName || "",
      email: ""
    };

    update(dbState => {
      if (editingStudent) {
        const student = dbState.students.find(item => item.id === editingStudent.id);
        if (!student) return;
        Object.assign(student, studentPayload);
        return;
      }
      dbState.students.push({
        id: Date.now(),
        balance: 0,
        totalEarned: 0,
        streak: 0,
        status: "inactive",
        ...studentPayload
      });
    }, isEditing ? "Student updated" : "Student added");

    reset();
    onSuccess?.();
  }

  return (
    <div className="add-student-wizard">
      <PageChalkBanner
        eyebrow={isEditing ? "UPDATE PROFILE" : "NEW ENROLLMENT"}
        title={isEditing ? "Edit Student" : "Add Student"}
        subtitle={
          isEditing
            ? "Update this student’s profile details below."
            : "Create a new student profile for your classroom."
        }
      />

      <div className="add-student-wizard-body">
        <WizardProgress current={step} />

        <div className="wizard-layout">
          <StudentCardPreview
            firstName={data.firstName}
            lastName={data.lastName}
            avatar={data.avatar}
            standard={data.standard}
            form={data.form}
            school={school?.name || ""}
          />

          <div className="wizard-main">
            {step === 1 && (
              <StepStudentInfo
                data={data}
                update={patch}
                error={error}
                isEditing={isEditing}
              />
            )}
            {step === 2 && (
              <StepSchoolInfo
                data={data}
                update={patch}
                schools={db.schools || []}
                teachers={db.teachers || []}
                navigate={navigate}
                error={error}
              />
            )}
            {step === 3 && (
              <StepGuardianInfo data={data} update={patch} error={error} />
            )}
            {step === 4 && (
              <StepReview
                data={data}
                schoolName={school?.name || ""}
                teacherName={teacher ? `${teacher.firstName} ${teacher.lastName}` : ""}
              />
            )}

            <StepNav
              step={step}
              totalSteps={totalSteps}
              onCancel={onCancel}
              onBack={() => {
                setError("");
                setStep(current => Math.max(1, current - 1));
              }}
              onNext={handleNext}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
