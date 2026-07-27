import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "moneytykes.teacher.dashboard.v3";
const PERSIST_DEBOUNCE_MS = 400;

function createDatabase() {
  return {
    teacher: { id: 1, first: "Shamira", last: "Young", email: "shamira.young@moneytykes.school" },
    school: "MoneyTykes Classroom",
    className: "Financial Literacy Class",
    students: [],
    schools: [],
    teachers: [],
    tasks: [],
    rewards: [],
    redemptions: [],
    transactions: [],
    tips: [
      "Encourage students to set savings goals. Small steps today build financial confidence.",
      "Ask students to separate needs from wants before spending reward points.",
      "A clear point goal gives every reward a purpose before it gets spent."
    ]
  };
}

function normalizeDatabase(saved) {
  const defaults = createDatabase();
  const teacher = { ...defaults.teacher, ...(saved.teacher || {}) };
  // Migrate the pre-existing placeholder surname so already-saved browsers
  // pick up the current default teacher identity instead of the old one.
  if (teacher.last === "Advisor") teacher.last = defaults.teacher.last;
  if (teacher.first === "Amara") {
    teacher.first = defaults.teacher.first;
    if (!teacher.email || teacher.email.startsWith("amara.")) {
      teacher.email = defaults.teacher.email;
    }
  }
  const teachers = (saved.teachers || []).map(item => {
    if (item.firstName !== "Amara") return item;
    return {
      ...item,
      firstName: defaults.teacher.first,
      email:
        !item.email || String(item.email).startsWith("amara.")
          ? defaults.teacher.email
          : item.email
    };
  });
  return {
    ...defaults,
    ...saved,
    teacher,
    students: saved.students || [],
    schools: saved.schools || [],
    teachers,
    tasks: [],
    rewards: saved.rewards || [],
    redemptions: saved.redemptions || [],
    transactions: saved.transactions || [],
    tips: saved.tips || defaults.tips
  };
}

function loadDatabase() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || createDatabase();
    return normalizeDatabase(saved);
  } catch {
    return createDatabase();
  }
}

function splitDb(full) {
  return {
    teacher: full.teacher,
    students: full.students || [],
    rewards: full.rewards || [],
    attendanceMeta: {
      school: full.school,
      className: full.className
    },
    catalog: {
      schools: full.schools || [],
      teachers: full.teachers || [],
      tasks: full.tasks || [],
      redemptions: full.redemptions || [],
      transactions: full.transactions || [],
      tips: full.tips || []
    }
  };
}

function combineDb(parts) {
  return {
    teacher: parts.teacher,
    students: parts.students,
    rewards: parts.rewards,
    school: parts.attendanceMeta.school,
    className: parts.attendanceMeta.className,
    schools: parts.catalog.schools,
    teachers: parts.catalog.teachers,
    tasks: parts.catalog.tasks,
    redemptions: parts.catalog.redemptions,
    transactions: parts.catalog.transactions,
    tips: parts.catalog.tips
  };
}

/**
 * Split teacher dashboard state so mutations to one slice don't rewrite every field's
 * React state identity. Still exposes a combined `db` + `setDb`/`update` shim for
 * existing call sites. localStorage writes are debounced.
 */
export function useTeacherDatabase() {
  const initial = useMemo(() => splitDb(loadDatabase()), []);
  const [teacher, setTeacher] = useState(initial.teacher);
  const [students, setStudents] = useState(initial.students);
  const [rewards, setRewards] = useState(initial.rewards);
  const [attendanceMeta, setAttendanceMeta] = useState(initial.attendanceMeta);
  const [catalog, setCatalog] = useState(initial.catalog);

  const partsRef = useRef({ teacher, students, rewards, attendanceMeta, catalog });
  partsRef.current = { teacher, students, rewards, attendanceMeta, catalog };

  const db = useMemo(
    () => combineDb({ teacher, students, rewards, attendanceMeta, catalog }),
    [teacher, students, rewards, attendanceMeta, catalog]
  );

  const applyFull = useCallback(nextFull => {
    const next = splitDb(normalizeDatabase(nextFull));
    const prev = partsRef.current;
    // Only touch slices that actually changed so unrelated React state stays stable.
    if (JSON.stringify(prev.teacher) !== JSON.stringify(next.teacher)) setTeacher(next.teacher);
    if (JSON.stringify(prev.students) !== JSON.stringify(next.students)) setStudents(next.students);
    if (JSON.stringify(prev.rewards) !== JSON.stringify(next.rewards)) setRewards(next.rewards);
    if (JSON.stringify(prev.attendanceMeta) !== JSON.stringify(next.attendanceMeta)) {
      setAttendanceMeta(next.attendanceMeta);
    }
    if (JSON.stringify(prev.catalog) !== JSON.stringify(next.catalog)) setCatalog(next.catalog);
  }, []);

  const setDb = useCallback(
    updater => {
      const current = combineDb(partsRef.current);
      const next = typeof updater === "function" ? updater(current) : updater;
      applyFull(next);
    },
    [applyFull]
  );

  const update = useCallback(
    (mutator, onMessage) => {
      setDb(current => {
        const next = structuredClone(current);
        mutator(next);
        return next;
      });
      if (onMessage) onMessage();
    },
    [setDb]
  );

  // Debounce persistence — avoid sync JSON.stringify on every keystroke/click.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combineDb(partsRef.current)));
      } catch {
        /* quota / private mode */
      }
    }, PERSIST_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [teacher, students, rewards, attendanceMeta, catalog]);

  return {
    db,
    setDb,
    update,
    students,
    rewards,
    teacher,
    STORAGE_KEY
  };
}

export { STORAGE_KEY, createDatabase, loadDatabase, normalizeDatabase };
