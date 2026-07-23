import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ClipboardCheck, Clock3, UserPlus, Users } from "lucide-react";
import ClassSelector from "../shared/ClassSelector";
import CoinSpinner from "../shared/CoinSpinner";
import PageChalkBanner from "../shared/PageChalkBanner";
import RosterEmptyState from "./RosterEmptyState";
import RosterTable from "./RosterTable";
import RosterToolbar from "./RosterToolbar";
import StatCard from "../shared/StatCard";
import useStudents from "./useStudents";
import "./students-dashboard.css";

const STUDENTS_CLASS_PREFILL_KEY = "mt.students.classFilter";

function parseRosterCsv(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(part => part.trim().toLowerCase());
  const firstIdx = headers.findIndex(h => h.includes("first"));
  const lastIdx = headers.findIndex(h => h.includes("last"));
  const classIdx = headers.findIndex(h => h.includes("class") || h.includes("form") || h.includes("grade"));
  const emailIdx = headers.findIndex(h => h.includes("email"));

  return lines.slice(1).flatMap(line => {
    const cols = line.split(",").map(part => part.trim());
    const first = firstIdx >= 0 ? cols[firstIdx] : cols[0];
    const last = lastIdx >= 0 ? cols[lastIdx] : cols[1];
    if (!first && !last) return [];
    return [
      {
        first: first || "",
        last: last || "",
        email: emailIdx >= 0 ? cols[emailIdx] || "" : "",
        classLabel: classIdx >= 0 ? cols[classIdx] || "" : "",
        balance: 0,
        totalEarned: 0,
        streak: 0,
        status: "inactive"
      }
    ];
  });
}

export default function StudentsDashboard({
  db,
  update,
  navigate,
  setToast,
  studentFocus,
  setStudentFocus,
  onViewStudent,
  onEditStudent
}) {
  const [classFilter, setClassFilter] = useState(() => {
    try {
      return sessionStorage.getItem(STUDENTS_CLASS_PREFILL_KEY) || "";
    } catch {
      return "";
    }
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const importRef = useRef(null);

  const { students, loading, stats, classOptions } = useStudents(db.students || [], classFilter);

  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem(STUDENTS_CLASS_PREFILL_KEY);
      if (prefill) {
        setClassFilter(prefill);
        sessionStorage.removeItem(STUDENTS_CLASS_PREFILL_KEY);
        return;
      }
    } catch {
      /* ignore */
    }

    // Default to the teacher's class (or first roster class) so the page
    // isn't empty when the dashboard already shows students.
    if (classFilter) return;
    if (db.className && classOptions.includes(db.className)) {
      setClassFilter(db.className);
      return;
    }
    if (classOptions[0]) setClassFilter(classOptions[0]);
  }, [classFilter, classOptions, db.className]);

  useEffect(() => {
    if (!studentFocus) return;
    const student = db.students.find(item => item.id === studentFocus.id);
    if (!student) {
      setStudentFocus?.(null);
      return;
    }
    if (studentFocus.mode === "edit") {
      onEditStudent?.(student);
    } else {
      onViewStudent?.(student);
    }
    setStudentFocus?.(null);
  }, [db.students, onEditStudent, onViewStudent, setStudentFocus, studentFocus]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = students.filter(student => {
      if (!query) return true;
      return `${student.name} ${student.email || ""} ${student.classLabel || ""}`
        .toLowerCase()
        .includes(query);
    });

    return [...list].sort((a, b) => {
      if (sortBy === "points") return (b.points || 0) - (a.points || 0);
      return String(a.name).localeCompare(String(b.name));
    });
  }, [search, sortBy, students]);

  function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseRosterCsv(String(reader.result || ""));
      if (!rows.length) {
        setToast?.("Could not read any students from that CSV.");
        return;
      }

      const defaultSchool = db.schools?.[0];
      const defaultTeacher =
        db.teachers?.find(teacher => teacher.schoolId === defaultSchool?.id) || db.teachers?.[0];

      update?.(dbState => {
        rows.forEach((row, index) => {
          dbState.students.push({
            id: Date.now() + index,
            schoolId: defaultSchool?.id || null,
            schoolName: defaultSchool?.name || "",
            teacherId: defaultTeacher?.id || null,
            teacherName: defaultTeacher
              ? `${defaultTeacher.firstName || ""} ${defaultTeacher.lastName || ""}`.trim()
              : "",
            guardian: "",
            phone: "",
            photo: "",
            age: "",
            ...row
          });
        });
      }, `Imported ${rows.length} student${rows.length === 1 ? "" : "s"}`);
    };
    reader.readAsText(file);
  }

  return (
    <div className="students-dash">
      <PageChalkBanner
        eyebrow="Class roster"
        title="Students"
        lead="Track attendance, progress, and class points in one place."
        controls={
          <ClassSelector classes={classOptions} value={classFilter} onChange={setClassFilter} />
        }
        actions={
          <>
            <button
              type="button"
              className="btn ghost"
              data-tour="students-take-attendance"
              onClick={() => navigate("attendance")}
            >
              <ClipboardCheck size={16} />
              <span>Take Attendance</span>
            </button>
            <button
              type="button"
              className="btn primary"
              data-tour="students-add"
              onClick={() => navigate("add-student")}
            >
              <UserPlus size={16} />
              <span>Add Student</span>
            </button>
          </>
        }
      />

      <div className="students-dash-body">
        <section className="stats-row" aria-label="Class roster summary" data-tour="students-stats">
          <StatCard label="TOTAL STUDENTS" value={stats.total} icon={Users} tone="total" />
          <StatCard
            label="AVG. ATTENDANCE"
            value={`${stats.avgAttendance}%`}
            icon={CalendarDays}
            tone="attendance"
          />
          <StatCard
            label="CLASS POINTS"
            value={`${stats.totalPoints} pts`}
            icon={Clock3}
            tone="points"
          />
        </section>

        <section className="roster-card" data-tour="students-roster">
          <div className="roster-card-head">
            <div className="roster-title">
              <span className="roster-icon" aria-hidden="true">
                <Users size={16} />
              </span>
              <h2>Student Roster</h2>
            </div>
          </div>

          <RosterToolbar
            search={search}
            onSearch={setSearch}
            sortBy={sortBy}
            onSort={setSortBy}
            showingCount={filtered.length}
          />

          {loading ? (
            <div className="empty-box roster-loading">
              <CoinSpinner size={48} label="Loading roster" />
              <div className="t">Loading roster…</div>
            </div>
          ) : !classFilter ? (
            <div className="empty-box">
              <div className="t">Select a class</div>
              <div className="d">Choose a class above to view the student roster.</div>
            </div>
          ) : filtered.length ? (
            <RosterTable
              students={filtered}
              onView={onViewStudent}
              onEdit={onEditStudent}
            />
          ) : students.length ? (
            <div className="empty-box">
              <div className="t">No matching students</div>
              <div className="d">Try a different search or sort option.</div>
            </div>
          ) : (
            <RosterEmptyState
              onAdd={() => navigate("add-student")}
              onImport={() => importRef.current?.click()}
            />
          )}
        </section>
      </div>

      <input
        ref={importRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={handleImportFile}
      />
    </div>
  );
}
