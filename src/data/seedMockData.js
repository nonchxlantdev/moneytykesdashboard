/**
 * One-time demo seed so every feature (Students, Attendance, Rewards,
 * Leaderboard, Reports, Lessons, Calendar, Dashboard) has data to explore.
 *
 * Guarded by SEED_MARKER and only runs when the dashboard has no students yet,
 * so it never clobbers a teacher's real data. Runs AFTER purgeLegacyMockData().
 */

const STORAGE_KEY = "moneytykes.teacher.dashboard.v3";
const SEED_MARKER = "moneytykes.seed.demo.v5";
const LESSONS_SEED_MARKER = "moneytykes.seed.lessons.curriculum.v5";
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
    {
      id: 8001,
      title: "Fraction Friends",
      subject: "Math",
      description: "Curriculum cards for introducing fractions with pizza slices.",
      type: "plan",
      status: "Published",
      objective:
        "Students will name unit fractions (1/2, 1/3, 1/4) and show each with a drawing.",
      materials: "Paper “pizza” circles, scissors, fraction labels, markers",
      activitySteps:
        "<p><strong>Key idea:</strong> A fraction names <em>equal parts</em> of a whole.</p><ol><li>Show a whole pizza circle. Ask: “What does whole mean?”</li><li>Fold into <u>2 equal parts</u>. Label each part <strong>1/2</strong>.</li><li>Fold another into <strong>3</strong> equal parts → <strong>1/3</strong>.</li><li>Fold into <strong>4</strong> equal parts → <strong>1/4</strong>.</li></ol><p><strong>Talking point:</strong> 1/2 is larger than 1/4 because the pieces are bigger when there are fewer equal parts.</p>",
      wrapUp:
        "Exit ticket: Draw 1/2 and 1/4. Which piece is larger? Why?",
      tags: "fractions, math",
      isFavorite: true,
      assignedCount: 24,
      createdAt: iso(addDays(todayDate, -16))
    },
    {
      id: 8002,
      title: "Sentence Builders",
      subject: "English",
      description: "Curriculum cards for subject–verb–object sentences.",
      type: "plan",
      status: "Published",
      objective:
        "Students will write a complete sentence with a clear subject, verb, and object.",
      materials: "Word cards (subjects, verbs, objects), mini whiteboards, markers",
      activitySteps:
        "<p><strong>Sentence pattern:</strong> <em>Who</em> + <em>did what</em> + <em>to what/whom</em>.</p><p>Example: <u>The dog</u> <strong>chased</strong> <u>the ball</u>.</p><ul><li><strong>Subject</strong> — who or what the sentence is about</li><li><strong>Verb</strong> — the action</li><li><strong>Object</strong> — who/what receives the action</li></ul><p>Build 3 sentences with word cards, then fix one run-on together on the board.</p>",
      wrapUp:
        "Share aloud. Class spots subject, verb, and object with three claps.",
      tags: "grammar, sentences, english",
      isFavorite: true,
      assignedCount: 20,
      createdAt: iso(addDays(todayDate, -14))
    },
    {
      id: 8003,
      title: "Battle of St. George's Caye",
      subject: "Belizean History",
      description: "Curriculum cards for the 1798 battle and why it is remembered.",
      type: "plan",
      status: "Published",
      objective:
        "Students will retell what happened at the Battle of St. George's Caye (1798) and why Belizeans remember it.",
      materials: "Belize map, timeline strip, short reading excerpt, flag image",
      activitySteps:
        "<p><strong>When:</strong> <u>10 September 1798</u></p><p><strong>Where:</strong> St. George's Caye, off the coast of Belize</p><ol><li><strong>Baymen</strong> and their allies defended the settlement.</li><li>A <strong>Spanish fleet</strong> tried to take control of the area.</li><li>The defenders held their ground — the attack did not succeed.</li></ol><p><em>Why it matters:</em> Belizeans remember this as a story of courage, unity, and defending home. It is marked each year on <strong>St. George's Caye Day</strong>.</p>",
      wrapUp:
        "Two-sentence summary: What happened? Why does it matter to Belize?",
      tags: "belize, history, st george's caye",
      isFavorite: true,
      assignedCount: 18,
      createdAt: iso(addDays(todayDate, -12))
    },
    {
      id: 8004,
      title: "Anancy Story Circle",
      subject: "Literature",
      description: "Caribbean folktale curriculum for plot and moral.",
      type: "plan",
      status: "Published",
      objective:
        "Students will identify the trickster character, the problem, and the moral in an Anancy story.",
      materials: "Printed Anancy tale (or oral telling), character name cards, moral stems",
      activitySteps:
        "<p><strong>Who is Anancy?</strong> A clever <em>spider trickster</em> in Caribbean folktales — smart, funny, and sometimes too crafty.</p><ul><li><strong>Character</strong> — Who is trying to get something?</li><li><strong>Problem</strong> — What goes wrong or what do they want?</li><li><strong>Trick</strong> — What clever (or sneaky) move happens?</li><li><strong>Moral</strong> — What lesson should listeners take away?</li></ul><p>After the story, act out the “clever moment” in pairs, then finish: <u>“The moral of this Anancy story is…”</u></p>",
      wrapUp:
        "Finish the stem: “The moral of this Anancy story is…”",
      tags: "literature, anancy, folktale",
      isFavorite: false,
      assignedCount: 15,
      createdAt: iso(addDays(todayDate, -11))
    },
    {
      id: 8005,
      title: "Needs vs Wants Discussion",
      subject: "Financial Literacy",
      description: "Guide students to sort everyday choices into needs and wants.",
      type: "plan",
      status: "Published",
      objective:
        "Students will explain the difference between a need and a want using real-life examples.",
      materials: "Whiteboard, sticky notes, picture cards of everyday items",
      activitySteps:
        "1. Ask: What is something you need every day?\n2. Sort picture cards into Needs and Wants together.\n3. Debate 2 tricky items as a class (phone data, sneakers, lunch).\n4. Students write one need and one want they have this week.",
      wrapUp: "Exit ticket: Name one need, one want, and why each matters.",
      tags: "needs, wants, discussion",
      isFavorite: false,
      assignedCount: 22,
      createdAt: iso(addDays(todayDate, -10))
    },
    {
      id: 8006,
      title: "Piggy Bank Goals",
      subject: "Saving",
      description: "Help students set a short savings goal and track progress.",
      type: "plan",
      status: "Published",
      objective: "Students will set a simple savings goal and list steps to reach it.",
      materials: "Goal worksheets, crayons, sample piggy bank or jar",
      activitySteps:
        "1. Share a teacher savings story (small goal).\n2. Students choose a goal under $20.\n3. Break the goal into weekly save amounts.\n4. Decorate a goal tracker to take home.",
      wrapUp: "Pair share: What will you skip buying to save faster?",
      tags: "saving, goals",
      isFavorite: false,
      assignedCount: 18,
      createdAt: iso(addDays(todayDate, -9))
    },
    {
      id: 8007,
      title: "Classroom Store Role Play",
      subject: "Money Basics",
      description: "Run a mini classroom store using cash and change.",
      type: "plan",
      status: "Published",
      objective: "Students will practice making change and comparing prices.",
      materials: "Play money, price tags, classroom store items",
      activitySteps:
        "1. Set up a classroom store with 6–8 items.\n2. Give each student play money.\n3. Take turns shopping and making change.\n4. Discuss which purchases were needs vs wants.",
      wrapUp: "Exit ticket: What is one tip for making change carefully?",
      tags: "role play, change, needs",
      isFavorite: false,
      assignedCount: 16,
      createdAt: iso(addDays(todayDate, -7))
    },
    {
      id: 8008,
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
      isFavorite: false,
      assignedCount: 8,
      createdAt: iso(addDays(todayDate, -12))
    },
    {
      id: 8009,
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
      createdAt: iso(addDays(todayDate, -4))
    },
    {
      id: 8010,
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
      isFavorite: false,
      assignedCount: 20,
      createdAt: iso(addDays(todayDate, -3)),
      completedAt: iso(addDays(todayDate, -2))
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
 * Replace seeded demo lessons (ids 8000–8999) with the latest curriculum pack.
 * Keeps any teacher-created lessons outside that id range.
 */
function refreshDemoCurriculumLessons() {
  if (localStorage.getItem(LESSONS_SEED_MARKER)) return;

  try {
    const existing = JSON.parse(localStorage.getItem(CREATED_LESSONS_KEY) || "[]");
    const teacherLessons = Array.isArray(existing)
      ? existing.filter(lesson => !isDemoLessonId(lesson?.id))
      : [];
    const demoLessons = buildCreatedLessons(new Date());
    localStorage.setItem(CREATED_LESSONS_KEY, JSON.stringify([...demoLessons, ...teacherLessons]));
  } catch {
    // Ignore parse errors — leave teacher data alone.
  }

  ["v1", "v2", "v3", "v4"].forEach(version => {
    localStorage.removeItem(`moneytykes.seed.lessons.curriculum.${version}`);
  });
  localStorage.setItem(LESSONS_SEED_MARKER, "1");
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
    teacher: { id: TEACHER.id, first: TEACHER.firstName, last: TEACHER.lastName, email: TEACHER.email },
    school: SCHOOL.name,
    className: CLASS_A,
    students,
    schools: existing.schools?.length ? existing.schools : [SCHOOL],
    teachers: [TEACHER],
    tasks: existing.tasks?.length ? existing.tasks : buildTasks(todayDate),
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
  if (!localStorage.getItem(CREATED_LESSONS_KEY)) {
    localStorage.setItem(CREATED_LESSONS_KEY, JSON.stringify(buildCreatedLessons(todayDate)));
  }
  if (!localStorage.getItem(CALENDAR_KEY)) {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(buildCalendarEvents(todayDate)));
  }

  students.forEach(student => {
    localStorage.setItem(`student_points_${student.id}`, JSON.stringify(student.totalEarned));
    localStorage.setItem(`points_log_${student.id}`, JSON.stringify(buildPointsLog(student, todayDate)));
  });
  seedAttendance(students, todayDate);
}

/**
 * Seed demo data once. Safe no-op for real teacher data.
 * v4 resets the demo roster to exactly 8 students so counts match.
 * Curriculum lessons refresh once for demo libraries (ids 8000–8999).
 */
export function seedMockData() {
  try {
    refreshDemoCurriculumLessons();

    if (localStorage.getItem(SEED_MARKER)) return;

    let existing = null;
    try {
      existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      existing = null;
    }

    const hasStudents = existing && Array.isArray(existing.students) && existing.students.length > 0;

    if (hasStudents) {
      if (looksLikeDemoRoster(existing)) {
        syncDemoRoster(existing);
      }
      ["v1", "v2", "v3", "v4"].forEach(v => localStorage.removeItem(`moneytykes.seed.demo.${v}`));
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

    ["v1", "v2", "v3", "v4"].forEach(v => localStorage.removeItem(`moneytykes.seed.demo.${v}`));
    localStorage.setItem(SEED_MARKER, "1");
  } catch {
    /* best-effort: never block app startup on seeding */
  }
}
