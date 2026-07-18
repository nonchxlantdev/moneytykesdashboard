import { useEffect, useState } from "react";

const EMPTY = {
  firstName: "",
  lastName: "",
  dob: "",
  age: null,
  avatar: null,
  standard: "",
  form: "",
  schoolId: "",
  teacherId: "",
  guardianName: "",
  guardianPhone: ""
};

function splitClassLabel(classLabel = "") {
  const value = String(classLabel || "");
  if (value.toLowerCase().startsWith("standard")) {
    return { standard: value, form: "" };
  }
  if (value.toLowerCase().startsWith("form")) {
    return { standard: "", form: value };
  }
  return { standard: "", form: value };
}

export default function useAddStudentForm(editingStudent = null) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(EMPTY);

  useEffect(() => {
    if (!editingStudent) {
      setData(EMPTY);
      setStep(1);
      return;
    }

    const { standard, form } = splitClassLabel(editingStudent.classLabel);
    const fileName = editingStudent.avatar || "";
    const photo = editingStudent.photo || (fileName ? `${import.meta.env.BASE_URL}avatars/${fileName}` : "");
    setData({
      firstName: editingStudent.first || "",
      lastName: editingStudent.last || "",
      dob: "",
      age: editingStudent.age ? Number(editingStudent.age) : null,
      avatar: photo ? { src: photo, fileName: fileName || photo.split("/").pop() } : null,
      standard,
      form,
      schoolId: editingStudent.schoolId ? String(editingStudent.schoolId) : "",
      teacherId: editingStudent.teacherId ? String(editingStudent.teacherId) : "",
      guardianName: editingStudent.guardian || "",
      guardianPhone: editingStudent.phone || ""
    });
    setStep(1);
  }, [editingStudent]);

  function update(patch) {
    setData(current => ({ ...current, ...patch }));
  }

  function reset() {
    setData(EMPTY);
    setStep(1);
  }

  return { step, setStep, data, update, reset };
}
