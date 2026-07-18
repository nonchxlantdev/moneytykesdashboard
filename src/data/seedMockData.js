/**
 * One-time demo seed so every feature (Students, Attendance, Rewards,
 * Leaderboard, Reports, Lessons, Calendar, Dashboard) has data to explore.
 *
 * Guarded by SEED_MARKER and only runs when the dashboard has no students yet,
 * so it never clobbers a teacher's real data. Runs AFTER purgeLegacyMockData().
 */

const STORAGE_KEY = "moneytykes.teacher.dashboard.v3";
const SEED_MARKER = "moneytykes.seed.demo.v1";
const CALENDAR_KEY = "calendar_events";
const REWARDS_BANK_KEY = "rewards_bank";
const CREATED_LESSONS_KEY = "created_lessons";

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
  id: 1,
  firstName: "Amara",
  lastName: "Young",
  email: "amara.young@moneytykes.school",
  temporaryPassword: "",
  schoolId: SCHOOL.id,
  role: "Teacher",
  status: "active"
};

const CLASS_A = "Standard 4A";
const CLASS_B = "Standard 5B";

const STUDENT_SEEDS = [
  { first: "Liam", last: "Banda", classLabel: CLASS_A, age: 10, avatar: "pikachu.png", balance: 320, totalEarned: 540, status: "on_track" },
  { first: "Nia", last: "Phiri", classLabel: CLASS_A, age: 10, avatar: "eevee.png", balance: 275, totalEarned: 460, status: "on_track" },
  { first: "Kofi", last: "Mensah", classLabel: CLASS_A, age: 9, avatar: "charmander.png", balance: 180, totalEarned: 300, status: "on_track" },
  { first: "Zara", last: "Tembo", classLabel: CLASS_A, age: 10, avatar: "jigglypuff.png", balance: 95, totalEarned: 210, status: "at_risk" },
  { first: "Malik", last: "Osei", classLabel: CLASS_A, age: 9, avatar: "snorlax.png", balance: 60, totalEarned: 120, status: "at_risk" },
  { first: "Ava", last: "Sakala", classLabel: CLASS_A, age: 10, avatar: "ditto.png", balance: 40, totalEarned: 80, status: "inactive" },
  { first: "Sami", last: "Zulu", classLabel: CLASS_A, age: 9, avatar: "voltorb.png", balance: 210, totalEarned: 350, status: "on_track" },
  { first: " Imani ".trim(), last: "Chanda", classLabel: CLASS_B, age: 11, avatar: "bullbasaur.png", balance: 300, totalEarned: 500, status: "on_track" },
  { first: "Deka", last: "Njoroge", classLabel: CLASS_B, age: 11, avatar: "gastly.png", balance: 155, totalEarned: 260, status: "on_track" },
  { first: "Tariq", last: "Bello", classLabel: CLASS_B, age: 12, avatar: "pikachu.png", balance: 110, totalEarned: 190, status: "at_risk" },
  { first: "Lulu", last: "Moyo", classLabel: CLASS_B, age: 11, avatar: "eevee.png", balance: 85, totalEarned: 140, status: "at_risk" },
  { first: "Femi", last: "Okafor", classLabel: CLASS_B, age: 12, avatar: "charmander.png", balance: 45, totalEarned: 70, status: "inactive" }
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
    mk(4, "Budgeting assignment due", "assignment", "class", 2, "", { classId: CLASS_B, notes: "Collect worksheets." }),
    mk(5, "Unit test: money basics", "test", "class", 4, "10:00", { classId: CLASS_A, location: "Hall" }),
    mk(6, "School assembly", "event", "school", 1, "08:00", { location: "Main hall" }),
    mk(7, "Parent-teacher evening", "event", "school", 6, "17:00", { location: "Main hall", notes: "Bring progress reports." }),
    mk(8, "Reading week starts", "reminder", "school", 8, ""),
    mk(9, "Field trip: local bank", "event", "class", 9, "09:30", { classId: CLASS_B, location: "First National Bank" }),
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
    {
      id: 8001,
      title: "What is Money?",
      subject: "Money Basics",
      description: "A friendly intro to what money is and why we use it.",
      type: "video",
      status: "Published",
      youtubeUrl: "https://www.youtube.com/watch?v=1Sdb-jvke0g",
      durationSeconds: 320,
      objective: "Understand what money is.",
      materials: "Projector, worksheet",
      activitySteps: "Watch the clip, then discuss where we see money every day.",
      wrapUp: "Students name three uses of money.",
      tags: "money, beginner",
      isFavorite: true,
      assignedCount: 24,
      createdAt: iso(addDays(todayDate, -12))
    },
    {
      id: 8002,
      title: "Saving vs Spending",
      subject: "Saving",
      description: "Comparing choices between saving and spending.",
      type: "video",
      status: "Published",
      youtubeUrl: "https://www.youtube.com/watch?v=DrQBO7Bun9c",
      durationSeconds: 280,
      objective: "Explain the difference between saving and spending.",
      materials: "Piggy bank demo",
      activitySteps: "Sort picture cards into 'save' and 'spend'.",
      wrapUp: "Share one thing you'd save for.",
      tags: "saving, choices",
      isFavorite: false,
      assignedCount: 18,
      createdAt: iso(addDays(todayDate, -8))
    },
    {
      id: 8003,
      title: "Budgeting Basics Worksheet",
      subject: "Budgeting",
      description: "Printable worksheet to build a simple weekly budget.",
      type: "document",
      status: "Published",
      fileFormat: "PDF",
      pageCount: 4,
      fileName: "budgeting-basics.pdf",
      objective: "Create a simple budget.",
      materials: "Printed worksheet",
      activitySteps: "Fill in income, needs, wants, and savings.",
      wrapUp: "Compare budgets with a partner.",
      tags: "budget, worksheet",
      isFavorite: false,
      assignedCount: 12,
      createdAt: iso(addDays(todayDate, -5))
    },
    {
      id: 8004,
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
      activitySteps: "Vote on each slide: need or want?",
      wrapUp: "List two needs and two wants.",
      tags: "needs, wants",
      isFavorite: true,
      assignedCount: 20,
      createdAt: iso(addDays(todayDate, -3))
    },
    {
      id: 8005,
      title: "Earning Money (Draft)",
      subject: "Earning",
      description: "Ways kids can earn and the value of work.",
      type: "video",
      status: "Draft",
      youtubeUrl: "https://www.youtube.com/watch?v=Ff4tXWKbFPk",
      durationSeconds: 300,
      objective: "Describe ways to earn money.",
      materials: "",
      activitySteps: "Brainstorm chores that could earn pocket money.",
      wrapUp: "",
      tags: "earning",
      isFavorite: false,
      assignedCount: 0,
      createdAt: iso(addDays(todayDate, -1))
    }
  ];
}

function seedAttendance(students, todayDate) {
  const classes = [CLASS_A, CLASS_B];
  const statuses = ["present", "present", "present", "late", "present", "absent", "present", "sick"];

  classes.forEach(classLabel => {
    const classId = slugClass(classLabel);
    const roster = students.filter(s => s.classLabel === classLabel);

    for (let dayOffset = 0; dayOffset < 6; dayOffset += 1) {
      const day = addDays(todayDate, -dayOffset);
      const weekday = day.getDay();
      if (weekday === 0 || weekday === 6) continue; // skip weekends

      const records = roster.map((student, index) => ({
        studentId: student.id,
        studentName: `${student.first} ${student.last}`.trim(),
        status: statuses[(index + dayOffset) % statuses.length],
        note: "",
        timestamp: new Date(`${iso(day)}T08:15:00`).toISOString()
      }));

      localStorage.setItem(`attendance_${classId}_${iso(day)}`, JSON.stringify(records));
    }
  });
}

/**
 * Seed demo data once. Safe no-op if a teacher already has students.
 */
export function seedMockData() {
  try {
    if (localStorage.getItem(SEED_MARKER)) return;

    let existing = null;
    try {
      existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      existing = null;
    }

    const hasRealStudents = existing && Array.isArray(existing.students) && existing.students.length > 0;
    if (hasRealStudents) {
      localStorage.setItem(SEED_MARKER, "1");
      return;
    }

    const todayDate = new Date();
    const students = buildStudents();

    const db = {
      teacher: { id: TEACHER.id, first: TEACHER.firstName, last: TEACHER.lastName, email: TEACHER.email },
      school: SCHOOL.name,
      className: CLASS_A,
      students,
      schools: [SCHOOL],
      teachers: [TEACHER],
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
    localStorage.setItem(CREATED_LESSONS_KEY, JSON.stringify(buildCreatedLessons(todayDate)));
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(buildCalendarEvents(todayDate)));

    students.forEach(student => {
      localStorage.setItem(`student_points_${student.id}`, JSON.stringify(student.totalEarned));
      localStorage.setItem(`points_log_${student.id}`, JSON.stringify(buildPointsLog(student, todayDate)));
    });

    seedAttendance(students, todayDate);

    localStorage.setItem(SEED_MARKER, "1");
  } catch {
    /* best-effort: never block app startup on seeding */
  }
}
