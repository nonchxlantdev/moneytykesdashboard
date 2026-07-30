/**
 * One-time demo seed so every feature (Students, Attendance, Rewards,
 * Leaderboard, Reports, Lessons, Calendar, Dashboard) has data to explore.
 *
 * Guarded by SEED_MARKER and only runs when the dashboard has no students yet,
 * so it never clobbers a teacher's real data. Runs AFTER purgeLegacyMockData().
 * In explicit demo mode (VITE_ALLOW_DEMO_MODE), a new marker version re-applies
 * the mock roster so switching off Supabase brings sample data back.
 */

import { isDemoMode } from "../lib/featureFlags";

const STORAGE_KEY = "moneytykes.teacher.dashboard.v3";
const SEED_MARKER = "moneytykes.seed.demo.v11";
const REWARDS_BANK_KEY = "rewards_bank";
const CREATED_LESSONS_KEY = "created_lessons";
const CALENDAR_EVENTS_KEY = "calendar_events";
const MY_DAY_TASKS_KEY = "mt.my_day.tasks.v1";
const MY_DAY_NOTES_KEY = "mt.my_day.notes.v1";
const MY_DAY_REFLECTIONS_KEY = "mt.my_day.reflections.v1";
const REPORT_TEMPLATE_KEY = "mt.report_card.templates.v1";
const REPORT_CARDS_KEY = "mt.report_card.cards.v1";
const REPORT_SECTIONS_KEY = "mt.report_card.class_sections.v1";
const GRADES_CATEGORIES_KEY = "mt.grades.categories.v1";
const GRADES_ITEMS_KEY = "mt.grades.items.v1";
const GRADES_ENTRIES_KEY = "mt.grades.entries.v1";
const GRADES_LETTER_SCALE_KEY = "mt.grades.letter_scale.v1";
const GRADES_SEED_MARKER = "moneytykes.seed.grades.v3";

const asset = path => `${import.meta.env.BASE_URL}${path}`;

function iso(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(base, days) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function slugClass(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const SCHOOL = {
  id: 1,
  name: "MoneyTykes Primary",
  contactPerson: "Grace Mwansa",
  email: "office@moneytykes.school",
  phone: "+260 97 123 4567",
  address: "12 Savings Road, Lusaka",
  status: "active"
};

const TEACHER = {
  id: "demo-admin",
  firstName: "Shamira",
  lastName: "Young",
  email: "shamira.young@moneytykes.school",
  temporaryPassword: "",
  schoolId: SCHOOL.id,
  role: "Class Admin",
  status: "active"
};

const CLASS_A = "Standard 4A";

const CLASSROOM = {
  id: 1,
  name: CLASS_A,
  schoolId: SCHOOL.id,
  schoolName: SCHOOL.name,
  teacherId: TEACHER.id,
  teacherName: `${TEACHER.firstName} ${TEACHER.lastName}`,
  status: "active"
};

/** Keep mock roster at 8 so dashboard / students counts match. */
const STUDENT_SEEDS = [
  { first: "Aysia", last: "Spain", gender: "female", classLabel: CLASS_A, age: 10, avatar: "pikachu.png", balance: 410, totalEarned: 620, status: "on_track" },
  { first: "Michael", last: "Young", gender: "male", classLabel: CLASS_A, age: 10, avatar: "eevee.png", balance: 385, totalEarned: 580, status: "on_track" },
  { first: "Moses", last: "Guild", gender: "male", classLabel: CLASS_A, age: 9, avatar: "charmander.png", balance: 360, totalEarned: 540, status: "on_track" },
  { first: "Norman", last: "Logan", gender: "male", classLabel: CLASS_A, age: 10, avatar: "snorlax.png", balance: 335, totalEarned: 510, status: "on_track" },
  { first: "Serena", last: "Jackson", gender: "female", classLabel: CLASS_A, age: 10, avatar: "jigglypuff.png", balance: 310, totalEarned: 490, status: "on_track" },
  { first: "Nia", last: "Phiri", gender: "female", classLabel: CLASS_A, age: 10, avatar: "ditto.png", balance: 275, totalEarned: 460, status: "on_track" },
  { first: "Kofi", last: "Mensah", gender: "male", classLabel: CLASS_A, age: 9, avatar: "voltorb.png", balance: 180, totalEarned: 300, status: "on_track" },
  { first: "Zara", last: "Tembo", gender: "female", classLabel: CLASS_A, age: 10, avatar: "gastly.png", balance: 95, totalEarned: 210, status: "at_risk" }
];

const REWARD_BANK = [
  { id: 5001, name: "Super Saver", pointValue: 50, icon: "💰", description: "Reached a weekly savings goal.", category: "Behaviour" },
  { id: 5002, name: "Bright Spark", pointValue: 30, icon: "💡", description: "Great idea in class discussion.", category: "Academic" },
  { id: 5003, name: "Team Player", pointValue: 20, icon: "🤝", description: "Helped a classmate.", category: "Participation" },
  { id: 5004, name: "Homework Hero", pointValue: 25, icon: "📚", description: "Completed all homework.", category: "Effort" },
  { id: 5005, name: "Budget Boss", pointValue: 40, icon: "📈", description: "Built a smart budget.", category: "Academic" },
  { id: 5006, name: "On-Time Star", pointValue: 15, icon: "⏰", description: "Arrived ready to learn.", category: "Behaviour" }
];

function buildStudents() {
  return STUDENT_SEEDS.map((seed, index) => ({
    id: 1001 + index,
    first: seed.first,
    last: seed.last,
    gender: seed.gender,
    age: seed.age,
    classLabel: seed.classLabel,
    schoolId: SCHOOL.id,
    schoolName: SCHOOL.name,
    teacherId: TEACHER.id,
    teacherName: `${TEACHER.firstName} ${TEACHER.lastName}`,
    guardian: `${seed.first}'s Parent`,
    phone: "+260 96 000 0000",
    photo: asset(`avatars/${seed.avatar}`),
    avatar: seed.avatar,
    email: "",
    balance: seed.balance,
    totalEarned: seed.totalEarned,
    streak: Math.max(1, Math.round(seed.totalEarned / 120)),
    status: seed.status
  }));
}

function buildPointsLog(student, todayDate) {
  const reward = REWARD_BANK[student.id % REWARD_BANK.length];
  const reward2 = REWARD_BANK[(student.id + 2) % REWARD_BANK.length];
  return [
    {
      id: student.id * 10 + 1,
      date: iso(addDays(todayDate, -2)),
      rewardId: reward.id,
      rewardName: reward.name,
      rewardIcon: reward.icon,
      points: reward.pointValue,
      awardedBy: `${TEACHER.firstName} ${TEACHER.lastName}`,
      note: ""
    },
    {
      id: student.id * 10 + 2,
      date: iso(addDays(todayDate, -9)),
      rewardId: reward2.id,
      rewardName: reward2.name,
      rewardIcon: reward2.icon,
      points: reward2.pointValue,
      awardedBy: `${TEACHER.firstName} ${TEACHER.lastName}`,
      note: "Great effort this week."
    }
  ];
}

function buildTasks(todayDate) {
  return [
    { id: 6001, title: "Grade savings worksheets", category: "Grading", completed: 100, createdAt: iso(addDays(todayDate, -3)), due: iso(addDays(todayDate, -1)) },
    { id: 6002, title: "Prep budgeting lesson", category: "Planning", completed: 60, createdAt: iso(addDays(todayDate, -1)), due: iso(addDays(todayDate, 2)) },
    { id: 6003, title: "Call Zara's guardian", category: "Follow-up", completed: 0, createdAt: iso(todayDate), due: iso(addDays(todayDate, 1)) },
    { id: 6004, title: "Set up rewards for term 2", category: "Rewards", completed: 30, createdAt: iso(addDays(todayDate, -2)), due: iso(addDays(todayDate, 5)) }
  ];
}

function buildTransactions(students, todayDate) {
  return students.slice(0, 6).map((student, index) => {
    const reward = REWARD_BANK[index % REWARD_BANK.length];
    return {
      id: 7000 + student.id,
      studentId: student.id,
      amount: reward.pointValue,
      description: `${reward.icon} ${reward.name}`,
      date: iso(addDays(todayDate, -(index + 1)))
    };
  });
}

function buildCalendarEvents(todayDate) {
  const firstOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  const mk = (id, title, type, scope, dayOffsetFromToday, time, extra = {}) => ({
    id: `demo-${id}`,
    title,
    type,
    scope,
    classId: extra.classId || "",
    date: iso(addDays(todayDate, dayOffsetFromToday)),
    time: time || "",
    location: extra.location || "",
    notes: extra.notes || "",
    createdAt: new Date().toISOString()
  });

  return [
    mk(1, "Morning savings lesson", "lesson", "class", 0, "09:00", { classId: CLASS_A, location: "Room 4", notes: "Intro to saving goals." }),
    mk(2, "Times-tables quiz", "quiz", "class", 0, "11:30", { classId: CLASS_A, location: "Room 4" }),
    mk(3, "Staff briefing", "reminder", "personal", 0, "15:30", { location: "Staff room" }),
    mk(4, "Budgeting assignment due", "assignment", "class", 2, "", { classId: CLASS_A, notes: "Collect worksheets." }),
    mk(5, "Unit test: money basics", "test", "class", 4, "10:00", { classId: CLASS_A, location: "Hall" }),
    mk(6, "School assembly", "event", "school", 1, "08:00", { location: "Main hall" }),
    mk(7, "Parent-teacher evening", "event", "school", 6, "17:00", { location: "Main hall", notes: "Bring progress reports." }),
    mk(8, "Reading week starts", "reminder", "school", 8, ""),
    mk(9, "Field trip: local bank", "event", "class", 9, "09:30", { classId: CLASS_A, location: "First National Bank" }),
    mk(10, "Pop quiz: coins & notes", "quiz", "class", -3, "13:00", { classId: CLASS_A }),
    mk(11, "Report cards due", "assignment", "personal", -1, "", { notes: "Finalize term grades." }),
    mk(12, "Savings challenge kickoff", "event", "school", 3, "12:00", { location: "Playground" }),
    mk(13, "Guest speaker: entrepreneur", "lesson", "school", 12, "10:30", { location: "Hall" }),
    mk(14, "Term planning day", "reminder", "personal", 14, ""),
    {
      id: "demo-15",
      title: "Month kickoff meeting",
      type: "reminder",
      scope: "personal",
      classId: "",
      date: iso(firstOfMonth),
      time: "08:30",
      location: "Staff room",
      notes: "",
      createdAt: new Date().toISOString()
    }
  ];
}

function buildCreatedLessons(todayDate) {
  return [
    // Class lessons (Build a Class Lesson)
    {
      id: 8001,
      title: "Fraction Friends",
      subject: "Math",
      description: "Introduce unit fractions with pizza-slice drawings.",
      type: "plan",
      status: "Published",
      objective:
        "Students will name unit fractions (1/2, 1/3, 1/4) and show each with a drawing.",
      materials: "Paper pizza circles, scissors, fraction labels, markers",
      activitySteps:
        "<p><strong>Key idea:</strong> A fraction names <em>equal parts</em> of a whole.</p><ol><li>Show a whole pizza circle. Ask: “What does whole mean?”</li><li>Fold into <u>2 equal parts</u>. Label each part <strong>1/2</strong>.</li><li>Fold another into <strong>3</strong> equal parts → <strong>1/3</strong>.</li><li>Fold into <strong>4</strong> equal parts → <strong>1/4</strong>.</li></ol>",
      wrapUp: "Exit ticket: Draw 1/2 and 1/4. Which piece is larger? Why?",
      tags: "fractions, math",
      isFavorite: true,
      assignedCount: 24,
      createdAt: iso(addDays(todayDate, -16))
    },
    {
      id: 8002,
      title: "Needs vs Wants Discussion",
      subject: "Financial Literacy",
      description: "Sort everyday choices into needs and wants.",
      type: "plan",
      status: "Published",
      objective:
        "Students will explain the difference between a need and a want using real-life examples.",
      materials: "Whiteboard, sticky notes, picture cards of everyday items",
      activitySteps:
        "<p>1. Ask: What is something you need every day?</p><p>2. Sort picture cards into Needs and Wants together.</p><p>3. Debate 2 tricky items as a class (phone data, sneakers, lunch).</p><p>4. Students write one need and one want they have this week.</p>",
      wrapUp: "Exit ticket: Name one need, one want, and why each matters.",
      tags: "needs, wants, discussion",
      isFavorite: false,
      assignedCount: 22,
      createdAt: iso(addDays(todayDate, -10))
    },
    // Video lessons
    {
      id: 8003,
      title: "What is Money?",
      subject: "Money Basics",
      description: "A friendly intro to what money is and why we use it.",
      type: "video",
      status: "Published",
      youtubeUrl: "https://www.youtube.com/watch?v=1Sdb-jvke0g",
      durationSeconds: 320,
      objective: "Understand what money is and name everyday uses.",
      materials: "Projector, discussion worksheet",
      activitySteps:
        "<p>Watch the clip, pause once for a prediction, then discuss where we see money every day.</p>",
      wrapUp: "Students name three uses of money.",
      tags: "money, beginner, video",
      isFavorite: true,
      assignedCount: 8,
      createdAt: iso(addDays(todayDate, -12))
    },
    {
      id: 8004,
      title: "Piggy Bank Goals",
      subject: "Saving",
      description: "Video-led lesson on setting a short savings goal.",
      type: "video",
      status: "Published",
      youtubeUrl: "https://www.youtube.com/watch?v=1Sdb-jvke0g",
      durationSeconds: 280,
      objective: "Students will set a simple savings goal and list steps to reach it.",
      materials: "Goal worksheets, crayons, sample piggy bank or jar",
      activitySteps:
        "<p>1. Watch the savings clip.</p><p>2. Students choose a goal under $20.</p><p>3. Break the goal into weekly save amounts.</p><p>4. Decorate a goal tracker to take home.</p>",
      wrapUp: "Pair share: What will you skip buying to save faster?",
      tags: "saving, goals, video",
      isFavorite: false,
      assignedCount: 18,
      createdAt: iso(addDays(todayDate, -9))
    },
    // Presentations
    {
      id: 8005,
      title: "Needs vs Wants (Slides)",
      subject: "Money Basics",
      description: "Slide deck sorting everyday items into needs and wants.",
      type: "presentation",
      status: "Completed",
      fileFormat: "PPTX",
      slideCount: 14,
      fileName: "needs-vs-wants.pptx",
      objective: "Tell needs and wants apart.",
      materials: "Projector",
      activitySteps: "<p>Vote on each slide: need or want?</p>",
      wrapUp: "List two needs and two wants.",
      tags: "needs, wants, slides",
      isFavorite: false,
      assignedCount: 20,
      createdAt: iso(addDays(todayDate, -5)),
      completedAt: iso(addDays(todayDate, -2))
    },
    {
      id: 8006,
      title: "Classroom Store Role Play",
      subject: "Money Basics",
      description: "Slides to run a mini classroom store with cash and change.",
      type: "presentation",
      status: "Published",
      fileFormat: "PPTX",
      slideCount: 10,
      fileName: "classroom-store.pptx",
      objective: "Students will practice making change and comparing prices.",
      materials: "Play money, price tags, classroom store items, projector",
      activitySteps:
        "<p>1. Review price slides together.</p><p>2. Set up a classroom store with 6–8 items.</p><p>3. Take turns shopping and making change.</p><p>4. Discuss which purchases were needs vs wants.</p>",
      wrapUp: "Exit ticket: What is one tip for making change carefully?",
      tags: "role play, change, slides",
      isFavorite: false,
      assignedCount: 16,
      createdAt: iso(addDays(todayDate, -3))
    }
  ];
}

function seedAttendance(students, todayDate) {
  const classId = slugClass(CLASS_A);
  const statuses = ["present", "present", "present", "late", "present", "absent", "present", "sick"];

  for (let dayOffset = 0; dayOffset < 6; dayOffset += 1) {
    const day = addDays(todayDate, -dayOffset);
    const weekday = day.getDay();
    if (weekday === 0 || weekday === 6) continue; // skip weekends

    const records = students.map((student, index) => ({
      studentId: student.id,
      studentName: `${student.first} ${student.last}`.trim(),
      status: statuses[(index + dayOffset) % statuses.length],
      note: "",
      timestamp: new Date(`${iso(day)}T08:15:00`).toISOString()
    }));

    localStorage.setItem(`attendance_${classId}_${iso(day)}`, JSON.stringify(records));
  }
}

function looksLikeDemoRoster(existing) {
  return (
    localStorage.getItem("moneytykes.seed.demo.v1")
    || localStorage.getItem("moneytykes.seed.demo.v2")
    || localStorage.getItem("moneytykes.seed.demo.v3")
    || existing?.school === SCHOOL.name
    || (existing?.students || []).some(
      student =>
        (student.first === "Nia" && student.last === "Phiri")
        || (student.first === "Aysia" && student.last === "Spain")
        || (student.first === "Liam" && student.last === "Banda")
        || (student.first === "Imani" && student.last === "Chanda")
    )
  );
}

function isDemoLessonId(id) {
  const numericId = Number(id);
  return Number.isFinite(numericId) && numericId >= 8000 && numericId < 9000;
}

/**
 * In demo mode, keep (or restore) the curriculum pack. Outside demo, strip leftover demo ids.
 */
function refreshDemoCurriculumLessons() {
  if (isDemoMode()) return;
  try {
    const existing = JSON.parse(localStorage.getItem(CREATED_LESSONS_KEY) || "[]");
    if (!Array.isArray(existing) || !existing.some(lesson => isDemoLessonId(lesson?.id))) {
      return;
    }
    const teacherLessons = existing.filter(lesson => !isDemoLessonId(lesson?.id));
    localStorage.setItem(CREATED_LESSONS_KEY, JSON.stringify(teacherLessons));
  } catch {
    // Ignore parse errors — leave teacher data alone.
  }
}

function schoolYearLabel(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Match reportCardsStorage.currentSchoolYear (Aug–Jul academic year).
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

function seedMyDay(todayDate) {
  const teacherId = TEACHER.id;
  const tasks = [
    {
      id: 6101,
      teacherId,
      text: "Take attendance for Standard 4A",
      done: true,
      createdAt: iso(addDays(todayDate, -1)) + "T08:05:00.000Z"
    },
    {
      id: 6102,
      teacherId,
      text: "Review savings worksheets before lunch",
      done: false,
      createdAt: iso(todayDate) + "T07:40:00.000Z"
    },
    {
      id: 6103,
      teacherId,
      text: "Call Zara's guardian about attendance",
      done: false,
      createdAt: iso(todayDate) + "T07:45:00.000Z"
    },
    {
      id: 6104,
      teacherId,
      text: "Prep Needs vs Wants slides for tomorrow",
      done: false,
      createdAt: iso(todayDate) + "T08:00:00.000Z"
    },
    {
      id: 6105,
      teacherId,
      text: "Enter report card scores for Term 1",
      done: false,
      createdAt: iso(todayDate) + "T08:20:00.000Z"
    },
    {
      id: 6106,
      teacherId,
      text: "Award Super Saver badges after assembly",
      done: true,
      createdAt: iso(addDays(todayDate, -2)) + "T14:00:00.000Z"
    },
    {
      id: 6107,
      teacherId,
      text: "Confirm bank field-trip chaperones",
      done: false,
      createdAt: iso(todayDate) + "T09:05:00.000Z"
    }
  ];
  const notes = [
    {
      id: 6201,
      teacherId,
      text: "Class loved the piggy-bank goal trackers — print more for next week.",
      createdAt: iso(addDays(todayDate, -1)) + "T15:10:00.000Z"
    },
    {
      id: 6202,
      teacherId,
      text: "Ask office about the bank field-trip permission slips.",
      createdAt: iso(todayDate) + "T09:20:00.000Z"
    },
    {
      id: 6203,
      teacherId,
      text: "Nia asked great questions about needs vs wants — use her example tomorrow.",
      createdAt: iso(todayDate) + "T11:05:00.000Z"
    },
    {
      id: 6204,
      teacherId,
      text: "Reminder: parent-teacher evening next week — bring progress notes.",
      createdAt: iso(addDays(todayDate, -2)) + "T16:30:00.000Z"
    },
    {
      id: 6205,
      teacherId,
      text: "Kofi finished early on the budgeting worksheet — give him an extension challenge.",
      createdAt: iso(todayDate) + "T12:15:00.000Z"
    }
  ];
  const reflections = [
    {
      teacherId,
      date: iso(addDays(todayDate, -2)),
      mood: "okay",
      notes: "A bit rushed before assembly, but the quiz still went fine."
    },
    {
      teacherId,
      date: iso(addDays(todayDate, -1)),
      mood: "good",
      notes: "Solid lesson day. Quiz scores were stronger than last week."
    },
    {
      teacherId,
      date: iso(todayDate),
      mood: "great",
      notes: "Students stayed engaged during the savings discussion."
    }
  ];
  localStorage.setItem(MY_DAY_TASKS_KEY, JSON.stringify(tasks));
  localStorage.setItem(MY_DAY_NOTES_KEY, JSON.stringify(notes));
  localStorage.setItem(MY_DAY_REFLECTIONS_KEY, JSON.stringify(reflections));
}

function buildSubjectScores(student, subjectIndex, termLabelIndex) {
  // Distinct, realistic percents so the editor shows filled Term 1/2/3 cells + avg.
  const base = 68 + ((Number(student.id) + subjectIndex * 11 + termLabelIndex * 5) % 28);
  const t1 = Math.min(100, base);
  const t2 = Math.min(100, base + 3 + (subjectIndex % 4));
  const t3 = Math.min(100, base + 6 + ((student.id + subjectIndex) % 5));
  const termScores = [t1, t2, t3];
  const avg = Math.round((termScores.reduce((sum, n) => sum + n, 0) / termScores.length) * 10) / 10;
  return { termScores, avg };
}

function seedReportCards(students) {
  const schoolYear = schoolYearLabel();
  const termLabels = ["1st Term", "2nd Term", "3rd Term"];
  const classSection = {
    id: slugClass(CLASS_A),
    name: CLASS_A,
    schoolId: SCHOOL.id
  };
  const template = {
    schoolId: SCHOOL.id,
    schoolName: SCHOOL.name,
    logoUrl: "",
    motto: "Learning money skills for life",
    accentColor: "",
    terms: termLabels,
    subjects: [
      { name: "Math", instructor: `${TEACHER.firstName} ${TEACHER.lastName}`, hours: 40 },
      { name: "English", instructor: "Grace Mwansa", hours: 40 },
      { name: "Literature", instructor: "Grace Mwansa", hours: 40 },
      { name: "History", instructor: `${TEACHER.firstName} ${TEACHER.lastName}`, hours: 40 },
      { name: "Social Studies", instructor: `${TEACHER.firstName} ${TEACHER.lastName}`, hours: 40 },
      { name: "Science", instructor: `${TEACHER.firstName} ${TEACHER.lastName}`, hours: 40 },
      { name: "Financial Literacy", instructor: `${TEACHER.firstName} ${TEACHER.lastName}`, hours: 40 }
    ],
    columns: {
      showHours: true,
      showRank: true,
      showAbsent: true,
      showTardy: true,
      showDemerits: true,
      showMerits: true,
      showProbation: true
    },
    signatureLabels: ["Homeroom Teacher", "Principal"]
  };

  const cards = [];
  termLabels.forEach((term, termLabelIndex) => {
    const termCards = students.map((student, index) => {
      const subjects = template.subjects.map((subject, subjectIndex) => {
        const { termScores, avg } = buildSubjectScores(student, subjectIndex, termLabelIndex);
        return {
          name: subject.name,
          instructor: subject.instructor,
          hours: subject.hours,
          termScores,
          termScoreSources: ["auto", "auto", "auto"],
          avg
        };
      });
      const overallAvg =
        Math.round((subjects.reduce((sum, subject) => sum + subject.avg, 0) / subjects.length) * 10) / 10;
      return {
        id: `rc-${student.id}-${classSection.id}-${schoolYear}-${term}`.replace(/\s+/g, "-"),
        studentId: student.id,
        classId: classSection.id,
        schoolYear,
        term_or_terms: term,
        subjects,
        overallAvg,
        rank: null,
        attendance: {
          absent: (index + termLabelIndex) % 3,
          tardy: (index + 1) % 2,
          demerits: index === students.length - 1 ? 1 : 0,
          merits: 4 + ((index + termLabelIndex) % 6),
          probation: ""
        },
        comments:
          index === students.length - 1
            ? "Needs consistent attendance and extra practice with savings goals."
            : "Shows strong money habits and participates well in class discussions.",
        status: index < 3 ? "generated" : index < 6 ? "ready" : "draft",
        generatedAt: index < 3 ? new Date().toISOString() : null,
        sentAt: null
      };
    });

    // Rank within this term roster by overallAvg (desc).
    const ranked = [...termCards].sort((a, b) => (b.overallAvg ?? -1) - (a.overallAvg ?? -1));
    let place = 1;
    ranked.forEach((card, index) => {
      if (index > 0 && ranked[index - 1].overallAvg === card.overallAvg) {
        card.rank = ranked[index - 1].rank;
      } else {
        card.rank = place;
      }
      place += 1;
    });
    cards.push(...termCards);
  });

  localStorage.setItem(REPORT_TEMPLATE_KEY, JSON.stringify({ [String(SCHOOL.id)]: template, default: template }));
  localStorage.setItem(REPORT_CARDS_KEY, JSON.stringify(cards));
  localStorage.setItem(REPORT_SECTIONS_KEY, JSON.stringify([classSection]));
}

function seedGrades(students, todayDate) {
  const classId = slugClass(CLASS_A);
  const schoolKey = String(SCHOOL.id);
  const teacherId = TEACHER.id;
  const term = "1st Term";
  const roster = Array.isArray(students) ? students : [];

  const categories = [
    { id: "gcat-quizzes", schoolId: SCHOOL.id, name: "Quizzes", weight: 15, dropLowest: 1, allowExtraCredit: false, order: 0 },
    { id: "gcat-assignments", schoolId: SCHOOL.id, name: "Assignments", weight: 20, dropLowest: 0, allowExtraCredit: false, order: 1 },
    { id: "gcat-tests", schoolId: SCHOOL.id, name: "Tests", weight: 30, dropLowest: 0, allowExtraCredit: false, order: 2 },
    { id: "gcat-exams", schoolId: SCHOOL.id, name: "Exams", weight: 35, dropLowest: 0, allowExtraCredit: false, order: 3 },
    { id: "gcat-projects", schoolId: SCHOOL.id, name: "Projects", weight: 0, dropLowest: 0, allowExtraCredit: false, order: 4 }
  ];

  const letterScale = [
    { minPercent: 90, letter: "A" },
    { minPercent: 80, letter: "B" },
    { minPercent: 70, letter: "C" },
    { minPercent: 60, letter: "D" },
    { minPercent: 0, letter: "F" }
  ];

  /** Deterministic 8-student score rows with light per-subject variation. */
  function row(base, subjectIndex = 0) {
    return base.map((value, index) => {
      if (value == null) return null;
      const nudge = ((subjectIndex + index) % 3) - 1;
      return Math.max(0, value + nudge);
    });
  }

  const itemDefs = [
    // Math (default subject in the toolbar)
    { id: "gitem-math-quiz-fractions", subject: "Math", categoryId: "gcat-quizzes", title: "Fractions quiz", daysAgo: 18, entryMode: "points", maxPoints: 20, values: row([18, 16, 19, 14, 17, 15, 12, 9], 0) },
    { id: "gitem-math-quiz-decimals", subject: "Math", categoryId: "gcat-quizzes", title: "Decimals pop quiz", daysAgo: 11, entryMode: "percent", maxPoints: null, values: row([90, 85, 78, 92, 70, 88, 65, 55], 0) },
    { id: "gitem-math-assign-hw", subject: "Math", categoryId: "gcat-assignments", title: "Problem set 4", daysAgo: 14, entryMode: "points", maxPoints: 25, values: row([23, 22, 20, 18, 21, 19, 14, 11], 0) },
    { id: "gitem-math-test-unit", subject: "Math", categoryId: "gcat-tests", title: "Unit test", daysAgo: 9, entryMode: "points", maxPoints: 50, values: row([44, 41, 46, 38, 40, 35, 28, 22], 0) },
    { id: "gitem-math-exam-mid", subject: "Math", categoryId: "gcat-exams", title: "Midterm exam", daysAgo: 2, entryMode: "percent", maxPoints: null, values: row([86, 82, 90, 74, 79, 71, 63, 52], 0) },
    {
      id: "gitem-math-quiz-warmup",
      subject: "Math",
      categoryId: "gcat-quizzes",
      title: "Warm-up quiz",
      daysAgo: 4,
      entryMode: "points",
      maxPoints: 10,
      values: [6, 9, 8, 7, 10, 5, 4, null],
      statuses: ["graded", "graded", "graded", "graded", "graded", "graded", "missing", "excused"]
    },

    // English
    { id: "gitem-eng-quiz-grammar", subject: "English", categoryId: "gcat-quizzes", title: "Grammar quiz", daysAgo: 16, entryMode: "points", maxPoints: 20, values: row([17, 19, 15, 16, 18, 14, 11, 10], 1) },
    { id: "gitem-eng-assign-essay", subject: "English", categoryId: "gcat-assignments", title: "Persuasive paragraph", daysAgo: 8, entryMode: "percent", maxPoints: null, values: row([88, 84, 91, 76, 80, 72, 60, 58], 1) },
    { id: "gitem-eng-test-reading", subject: "English", categoryId: "gcat-tests", title: "Reading test", daysAgo: 6, entryMode: "points", maxPoints: 40, values: row([36, 34, 38, 30, 33, 29, 24, 20], 1) },

    // Literature
    { id: "gitem-lit-quiz-plot", subject: "Literature", categoryId: "gcat-quizzes", title: "Plot elements quiz", daysAgo: 15, entryMode: "points", maxPoints: 15, values: row([14, 13, 15, 11, 12, 10, 8, 7], 2) },
    { id: "gitem-lit-assign-journal", subject: "Literature", categoryId: "gcat-assignments", title: "Reading journal", daysAgo: 7, entryMode: "percent", maxPoints: null, values: row([86, 80, 89, 74, 78, 70, 62, 55], 2) },
    { id: "gitem-lit-test-novel", subject: "Literature", categoryId: "gcat-tests", title: "Novel unit test", daysAgo: 3, entryMode: "points", maxPoints: 50, values: row([42, 40, 45, 36, 39, 34, 27, 21], 2) },

    // History
    { id: "gitem-hist-quiz-dates", subject: "History", categoryId: "gcat-quizzes", title: "Key dates quiz", daysAgo: 17, entryMode: "percent", maxPoints: null, values: row([84, 78, 90, 72, 80, 68, 60, 52], 3) },
    { id: "gitem-hist-assign-map", subject: "History", categoryId: "gcat-assignments", title: "Map worksheet", daysAgo: 10, entryMode: "points", maxPoints: 20, values: row([18, 17, 19, 15, 16, 14, 11, 9], 3) },
    { id: "gitem-hist-test-unit", subject: "History", categoryId: "gcat-tests", title: "Civilizations test", daysAgo: 5, entryMode: "points", maxPoints: 50, values: row([43, 40, 46, 37, 41, 33, 26, 22], 3) },

    // Social Studies
    { id: "gitem-ss-quiz-civics", subject: "Social Studies", categoryId: "gcat-quizzes", title: "Civics quiz", daysAgo: 13, entryMode: "points", maxPoints: 20, values: row([16, 18, 15, 17, 19, 13, 10, 8], 4) },
    { id: "gitem-ss-assign-community", subject: "Social Studies", categoryId: "gcat-assignments", title: "Community report", daysAgo: 9, entryMode: "percent", maxPoints: null, values: row([82, 86, 79, 74, 88, 70, 64, 58], 4) },
    {
      id: "gitem-ss-project-group",
      subject: "Social Studies",
      categoryId: "gcat-projects",
      title: "Group poster project",
      daysAgo: 5,
      entryMode: "points",
      maxPoints: 40,
      isGroup: true,
      groupStudentIds: roster.slice(0, 4).map(student => student.id),
      values: [36, 36, 36, 36, null, null, null, null],
      groupOnly: true
    },

    // Science
    { id: "gitem-sci-quiz-lab", subject: "Science", categoryId: "gcat-quizzes", title: "Lab safety quiz", daysAgo: 12, entryMode: "points", maxPoints: 10, values: row([9, 10, 8, 9, 10, 7, 6, 5], 5) },
    { id: "gitem-sci-assign-observe", subject: "Science", categoryId: "gcat-assignments", title: "Observation log", daysAgo: 8, entryMode: "percent", maxPoints: null, values: row([87, 83, 90, 75, 81, 73, 61, 54], 5) },
    { id: "gitem-sci-test-matter", subject: "Science", categoryId: "gcat-tests", title: "Matter unit test", daysAgo: 4, entryMode: "points", maxPoints: 50, values: row([45, 42, 47, 39, 41, 36, 29, 23], 5) },

    // Financial Literacy (MoneyTykes subject)
    { id: "gitem-fl-quiz-coins", subject: "Financial Literacy", categoryId: "gcat-quizzes", title: "Coins & notes quiz", daysAgo: 18, entryMode: "points", maxPoints: 20, values: row([18, 16, 19, 14, 17, 15, 12, 9], 6) },
    { id: "gitem-fl-assign-budget", subject: "Financial Literacy", categoryId: "gcat-assignments", title: "Budget worksheet", daysAgo: 7, entryMode: "points", maxPoints: 25, values: row([22, 21, 24, 18, 20, 17, 13, 10], 6) },
    { id: "gitem-fl-test-money", subject: "Financial Literacy", categoryId: "gcat-tests", title: "Money basics test", daysAgo: 3, entryMode: "percent", maxPoints: null, values: row([85, 81, 89, 73, 78, 70, 62, 50], 6) }
  ];

  const items = itemDefs.map(def => ({
    id: def.id,
    schoolId: SCHOOL.id,
    classId,
    subjectName: def.subject,
    categoryId: def.categoryId,
    term,
    title: def.title,
    date: iso(addDays(todayDate, -def.daysAgo)),
    entryMode: def.entryMode,
    maxPoints: def.maxPoints,
    isGroup: Boolean(def.isGroup),
    groupStudentIds: def.groupStudentIds || [],
    createdBy: teacherId,
    createdAt: iso(addDays(todayDate, -def.daysAgo)) + "T09:00:00.000Z"
  }));

  const scorePlan = Object.fromEntries(
    itemDefs.map(def => [
      def.id,
      {
        values: def.values,
        statuses: def.statuses,
        groupOnly: Boolean(def.groupOnly)
      }
    ])
  );

  const entries = [];
  items.forEach(item => {
    const plan = scorePlan[item.id];
    if (!plan) return;
    roster.forEach((student, index) => {
      if (plan.groupOnly && !(item.groupStudentIds || []).map(String).includes(String(student.id))) {
        return;
      }
      const rawValue = plan.values[index];
      const status = plan.statuses?.[index] || (rawValue == null ? "missing" : "graded");
      if (status === "excused") {
        entries.push({
          id: `gentry-${item.id}-${student.id}`,
          itemId: item.id,
          studentId: student.id,
          rawValue: null,
          status: "excused",
          comment: "",
          enteredAt: iso(todayDate) + "T12:00:00.000Z"
        });
        return;
      }
      if (rawValue == null && status === "missing") {
        entries.push({
          id: `gentry-${item.id}-${student.id}`,
          itemId: item.id,
          studentId: student.id,
          rawValue: 0,
          status: "missing",
          comment: "",
          enteredAt: iso(todayDate) + "T12:00:00.000Z"
        });
        return;
      }
      if (rawValue == null) return;
      entries.push({
        id: `gentry-${item.id}-${student.id}`,
        itemId: item.id,
        studentId: student.id,
        rawValue,
        status: status === "late" ? "late" : "graded",
        comment: "",
        enteredAt: iso(todayDate) + "T12:00:00.000Z"
      });
    });
  });

  localStorage.setItem(
    GRADES_CATEGORIES_KEY,
    JSON.stringify({ [schoolKey]: categories, default: categories })
  );
  localStorage.setItem(
    GRADES_LETTER_SCALE_KEY,
    JSON.stringify({ [schoolKey]: letterScale, default: letterScale })
  );
  localStorage.setItem(GRADES_ITEMS_KEY, JSON.stringify(items));
  localStorage.setItem(GRADES_ENTRIES_KEY, JSON.stringify(entries));
  localStorage.setItem(GRADES_SEED_MARKER, "1");
}

/** Backfill grades mock if the main demo seed already ran before grades existed. */
function ensureGradesMockSeed() {
  try {
    let existing = null;
    try {
      existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      existing = null;
    }

    const demoContext = isDemoMode() || looksLikeDemoRoster(existing || {});
    if (!demoContext) return;

    const existingItems = JSON.parse(localStorage.getItem(GRADES_ITEMS_KEY) || "[]");
    const hasSubjectSeed =
      Array.isArray(existingItems) &&
      existingItems.some(
        item =>
          String(item?.subjectName || "") === "Math" || String(item?.id || "").startsWith("gitem-math-")
      );
    if (hasSubjectSeed) {
      localStorage.setItem(GRADES_SEED_MARKER, "1");
      return;
    }

    let students = Array.isArray(existing?.students) ? existing.students : [];
    if (!students.length) students = buildStudents();
    seedGrades(students, new Date());
    // Keep report-card subject list in sync when grades subjects expand.
    if (demoContext) seedReportCards(students);
  } catch {
    /* ignore */
  }
}

/** Calendar, lessons, My Day, report cards, and grades — used by local demo mode. */
function seedFeatureMocks(students, todayDate) {
  localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(buildCalendarEvents(todayDate)));
  localStorage.setItem(CREATED_LESSONS_KEY, JSON.stringify(buildCreatedLessons(todayDate)));
  seedMyDay(todayDate);
  seedReportCards(students);
  seedGrades(students, todayDate);
}

function syncDemoRoster(existing) {
  const todayDate = new Date();
  const students = buildStudents();

  // Drop stale demo point keys before writing the 8-student roster.
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("student_points_") || key.startsWith("points_log_") || key.startsWith("attendance_")) {
      localStorage.removeItem(key);
    }
  });

  const next = {
    ...existing,
    teacher: {
      id: TEACHER.id,
      first: TEACHER.firstName,
      last: TEACHER.lastName,
      email: TEACHER.email,
      gender: "female"
    },
    school: SCHOOL.name,
    className: CLASS_A,
    students,
    schools: existing.schools?.length ? existing.schools : [SCHOOL],
    teachers: [TEACHER],
    classes: existing.classes?.length ? existing.classes : [CLASSROOM],
    tasks: buildTasks(todayDate),
    rewards: existing.rewards?.length ? existing.rewards : REWARD_BANK,
    redemptions: existing.redemptions || [],
    transactions: buildTransactions(students, todayDate),
    tips: existing.tips?.length
      ? existing.tips
      : [
          "Encourage students to set savings goals. Small steps today build financial confidence.",
          "Ask students to separate needs from wants before spending reward points.",
          "A clear point goal gives every reward a purpose before it gets spent."
        ]
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  localStorage.setItem(REWARDS_BANK_KEY, JSON.stringify(REWARD_BANK));

  students.forEach(student => {
    localStorage.setItem(`student_points_${student.id}`, JSON.stringify(student.totalEarned));
    localStorage.setItem(`points_log_${student.id}`, JSON.stringify(buildPointsLog(student, todayDate)));
  });
  seedAttendance(students, todayDate);
  if (isDemoMode()) seedFeatureMocks(students, todayDate);
  else if (looksLikeDemoRoster(next)) seedGrades(students, todayDate);
}

/**
 * Seed demo data once. Safe no-op for real teacher data.
 * v4 resets the demo roster to exactly 8 students so counts match.
 * Curriculum lessons refresh once for demo libraries (ids 8000–8999).
 * Demo mode (VITE_ALLOW_DEMO_MODE): v10 marker re-seeds mock data across all features
 * including the Grades gradebook.
 */
export function seedMockData() {
  try {
    refreshDemoCurriculumLessons();
    ensureGradesMockSeed();

    if (localStorage.getItem(SEED_MARKER)) return;

    let existing = null;
    try {
      existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      existing = null;
    }

    const hasStudents = existing && Array.isArray(existing.students) && existing.students.length > 0;
    const demo = isDemoMode();

    // Demo mode: replace leftover Supabase/local state with the full mock classroom once.
    if (demo) {
      const todayDate = new Date();
      const students = buildStudents();
      const db = {
        teacher: {
          id: TEACHER.id,
          first: TEACHER.firstName,
          last: TEACHER.lastName,
          email: TEACHER.email,
          gender: "female"
        },
        school: SCHOOL.name,
        className: CLASS_A,
        students,
        schools: [SCHOOL],
        teachers: [{ ...TEACHER, role: "Class Admin" }],
        classes: [CLASSROOM],
        tasks: buildTasks(todayDate),
        rewards: REWARD_BANK,
        redemptions: [],
        transactions: buildTransactions(students, todayDate),
        tips: [
          "Encourage students to set savings goals. Small steps today build financial confidence.",
          "Ask students to separate needs from wants before spending reward points.",
          "A clear point goal gives every reward a purpose before it gets spent."
        ]
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      localStorage.setItem(REWARDS_BANK_KEY, JSON.stringify(REWARD_BANK));
      students.forEach(student => {
        localStorage.setItem(`student_points_${student.id}`, JSON.stringify(student.totalEarned));
        localStorage.setItem(`points_log_${student.id}`, JSON.stringify(buildPointsLog(student, todayDate)));
      });
      seedAttendance(students, todayDate);
      seedFeatureMocks(students, todayDate);
      ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"].forEach(v => localStorage.removeItem(`moneytykes.seed.demo.${v}`));
      localStorage.setItem(SEED_MARKER, "1");
      return;
    }

    if (hasStudents) {
      if (looksLikeDemoRoster(existing)) {
        syncDemoRoster(existing);
      }
      ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"].forEach(v => localStorage.removeItem(`moneytykes.seed.demo.${v}`));
      localStorage.setItem(SEED_MARKER, "1");
      return;
    }

    const todayDate = new Date();
    const students = buildStudents();

    const db = {
      teacher: {
        id: TEACHER.id,
        first: TEACHER.firstName,
        last: TEACHER.lastName,
        email: TEACHER.email,
        gender: "female"
      },
      school: SCHOOL.name,
      className: CLASS_A,
      students,
      schools: [SCHOOL],
      teachers: [TEACHER],
      classes: [CLASSROOM],
      tasks: buildTasks(todayDate),
      rewards: REWARD_BANK,
      redemptions: [],
      transactions: buildTransactions(students, todayDate),
      tips: [
        "Encourage students to set savings goals. Small steps today build financial confidence.",
        "Ask students to separate needs from wants before spending reward points.",
        "A clear point goal gives every reward a purpose before it gets spent."
      ]
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    localStorage.setItem(REWARDS_BANK_KEY, JSON.stringify(REWARD_BANK));

    students.forEach(student => {
      localStorage.setItem(`student_points_${student.id}`, JSON.stringify(student.totalEarned));
      localStorage.setItem(`points_log_${student.id}`, JSON.stringify(buildPointsLog(student, todayDate)));
    });

    seedAttendance(students, todayDate);

    ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8"].forEach(v => localStorage.removeItem(`moneytykes.seed.demo.${v}`));
    localStorage.setItem(SEED_MARKER, "1");
  } catch {
    /* best-effort: never block app startup on seeding */
  }
}
