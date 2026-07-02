import { saveAttendanceRecord } from "../utils/attendanceStorage";
import { saveRewardsBank, setStudentPoints, pointsLogKey } from "../utils/rewardsStorage";

export const SEED_MARKER_KEY = "moneytykes.seed.smdp.v1";

const SCHOOL_NAME = "St. Martin de Porres Roman Catholic Primary School";
const CLASS_NAME = "Standard 5 - Financial Literacy";
const CLASS_SLUG = "standard-5-financial-literacy";

const SCHOOL_ID = 1001;
const TEACHER_ID = 2001;

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function daysAhead(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function avatar(baseUrl, fileName) {
  return `${baseUrl}avatars/${fileName}`;
}

/**
 * @returns {boolean}
 */
export function shouldSeedMockData(saved) {
  if (localStorage.getItem(SEED_MARKER_KEY)) return false;
  return !saved?.students?.length;
}

/**
 * @param {object} db
 * @param {string} [baseUrl]
 * @returns {object}
 */
export function applyMockSeed(db, baseUrl = "/") {
  const teacher = {
    first: "Rachel",
    last: "Young",
    email: "rachel.young@smdprcps.edu.bz"
  };

  const school = {
    id: SCHOOL_ID,
    name: SCHOOL_NAME,
    contactPerson: "Sister Maria Lopez",
    email: "office@smdprcps.edu.bz",
    phone: "+501-223-4012",
    address: "Fabers Road, Belize City, Belize",
    status: "active",
    createdAt: daysAgo(120)
  };

  const teacherAccount = {
    id: TEACHER_ID,
    firstName: "Rachel",
    lastName: "Young",
    email: "rachel.young@smdprcps.edu.bz",
    schoolId: SCHOOL_ID,
    schoolName: SCHOOL_NAME,
    role: "Teacher",
    status: "active",
    createdAt: daysAgo(90)
  };

  const studentRows = [
    { first: "Norman", last: "Young", age: 11, guardian: "Mr. & Mrs. Young", phone: "+501-622-1044", balance: 68, totalEarned: 142, streak: 4, status: "on_track", avatar: "pikachu.png" },
    { first: "Logan", last: "Young", age: 10, guardian: "Mr. & Mrs. Young", phone: "+501-622-1044", balance: 52, totalEarned: 118, streak: 3, status: "on_track", avatar: "charmander.png" },
    { first: "Moses", last: "Spain", age: 11, guardian: "Mrs. Carmen Spain", phone: "+501-610-8831", balance: 41, totalEarned: 96, streak: 2, status: "on_track", avatar: "eevee.png" },
    { first: "Aysia", last: "Guild", age: 10, guardian: "Ms. Denise Guild", phone: "+501-615-2290", balance: 74, totalEarned: 156, streak: 5, status: "on_track", avatar: "jigglypuff.png" },
    { first: "Kylie", last: "Bennett", age: 11, guardian: "Mr. James Bennett", phone: "+501-623-7710", balance: 36, totalEarned: 88, streak: 1, status: "at_risk", avatar: "snorlax.png" },
    { first: "Andre", last: "Flowers", age: 10, guardian: "Mrs. Lorna Flowers", phone: "+501-618-4402", balance: 29, totalEarned: 64, streak: 0, status: "inactive", avatar: "gastly.png" },
    { first: "Jada", last: "Perez", age: 11, guardian: "Mr. Carlos Perez", phone: "+501-620-5598", balance: 61, totalEarned: 131, streak: 3, status: "on_track", avatar: "ditto.png" },
    { first: "Ethan", last: "Murillo", age: 10, guardian: "Mrs. Ana Murillo", phone: "+501-617-3384", balance: 47, totalEarned: 102, streak: 2, status: "on_track", avatar: "voltorb.png" }
  ];

  const students = studentRows.map((row, index) => ({
    id: 3001 + index,
    first: row.first,
    last: row.last,
    email: `${row.first.toLowerCase()}.${row.last.toLowerCase()}@student.smdprcps.edu.bz`,
    age: row.age,
    classLabel: "Standard 5 - Financial Literacy",
    schoolId: SCHOOL_ID,
    schoolName: SCHOOL_NAME,
    teacherId: TEACHER_ID,
    teacherName: "Rachel Young",
    guardian: row.guardian,
    phone: row.phone,
    photo: avatar(baseUrl, row.avatar),
    balance: row.balance,
    totalEarned: row.totalEarned,
    streak: row.streak,
    status: row.status
  }));

  const tasks = [
    { id: 4001, title: "Track Weekly Activity", category: "Budgeting", reward: 12, due: daysAhead(4), completed: 6, assigned: students.length, createdAt: daysAgo(6) },
    { id: 4002, title: "Needs vs Wants Sorting Activity", category: "Financial Literacy", reward: 10, due: daysAhead(2), completed: 5, assigned: students.length, createdAt: daysAgo(4) },
    { id: 4003, title: "Set a Savings Goal", category: "Saving", reward: 15, due: daysAhead(9), completed: 3, assigned: students.length, createdAt: daysAgo(2) },
    { id: 4004, title: "MoneyTykes Reflection Journal", category: "Custom", reward: 8, due: daysAgo(1), completed: 7, assigned: students.length, createdAt: daysAgo(10) }
  ];

  const transactions = [
    { id: 5001, studentId: 3001, amount: 12, description: "Excellent class participation", date: daysAgo(1) },
    { id: 5002, studentId: 3004, amount: 15, description: "Top scorer on budgeting quiz", date: daysAgo(1) },
    { id: 5003, studentId: 3003, amount: 10, description: "Completed needs vs wants worksheet", date: daysAgo(2) },
    { id: 5004, studentId: 3007, amount: 8, description: "Helped classmate with savings chart", date: daysAgo(2) },
    { id: 5005, studentId: 3002, amount: 10, description: "On-time homework submission", date: daysAgo(3) },
    { id: 5006, studentId: 3005, amount: 6, description: "Improved weekly activity log", date: daysAgo(4) }
  ];

  return {
    ...db,
    teacher,
    school: SCHOOL_NAME,
    className: CLASS_NAME,
    schools: [school],
    teachers: [teacherAccount],
    students,
    tasks,
    transactions,
    rewards: [
      { id: 6001, title: "Classroom Helper Badge", category: "Classroom", type: "experience", cost: 25, quantity: 10, description: "Serve as class point captain for a week." }
    ],
    redemptions: [],
    tips: [
      "Norman and Aysia are strong savers — encourage them to mentor classmates.",
      "Review Andre's recent inactivity and offer a small catch-up task.",
      "Standard 5 responds well to short budgeting challenges before lunch."
    ]
  };
}

/**
 * @param {object} db
 * @param {string} baseUrl
 */
export function seedLocalStorageMockData(db) {
  const students = db.students || [];
  const teacherName = `${db.teacher?.first || "Rachel"} ${db.teacher?.last || "Young"}`;

  const rewardsBank = [
    { id: 7001, name: "Star Student", pointValue: 25, icon: "⭐", description: "Outstanding behaviour and leadership.", category: "Behaviour", createdAt: daysAgo(30) },
    { id: 7002, name: "Money Master", pointValue: 50, icon: "💰", description: "Excellent financial literacy work.", category: "Academic", createdAt: daysAgo(28) },
    { id: 7003, name: "Participation Pro", pointValue: 15, icon: "🎯", description: "Active and respectful class participation.", category: "Participation", createdAt: daysAgo(25) },
    { id: 7004, name: "Effort Champion", pointValue: 20, icon: "🏆", description: "Consistent effort on class tasks.", category: "Effort", createdAt: daysAgo(20) },
    { id: 7005, name: "Team Tyke", pointValue: 30, icon: "🤝", description: "Helped classmates learn money skills.", category: "Behaviour", createdAt: daysAgo(14) }
  ];
  saveRewardsBank(rewardsBank);

  const pointAwards = [
    { studentId: 3004, rewardId: 7002, rewardName: "Money Master", rewardIcon: "💰", points: 50, note: "Top score on budgeting quiz.", date: daysAgo(1) },
    { studentId: 3004, rewardId: 7003, rewardName: "Participation Pro", rewardIcon: "🎯", points: 15, note: "Led morning discussion.", date: daysAgo(2) },
    { studentId: 3001, rewardId: 7001, rewardName: "Star Student", rewardIcon: "⭐", points: 25, note: "Great teamwork during group activity.", date: daysAgo(1) },
    { studentId: 3001, rewardId: 7004, rewardName: "Effort Champion", rewardIcon: "🏆", points: 20, note: "Completed extra savings worksheet.", date: daysAgo(4) },
    { studentId: 3002, rewardId: 7003, rewardName: "Participation Pro", rewardIcon: "🎯", points: 15, note: "Shared smart spending example.", date: daysAgo(3) },
    { studentId: 3003, rewardId: 7004, rewardName: "Effort Champion", rewardIcon: "🏆", points: 20, note: "Improved weekly log.", date: daysAgo(2) },
    { studentId: 3007, rewardId: 7005, rewardName: "Team Tyke", rewardIcon: "🤝", points: 30, note: "Helped Moses finish his chart.", date: daysAgo(5) },
    { studentId: 3008, rewardId: 7003, rewardName: "Participation Pro", rewardIcon: "🎯", points: 15, note: "Asked thoughtful money questions.", date: daysAgo(6) },
    { studentId: 3005, rewardId: 7004, rewardName: "Effort Champion", rewardIcon: "🏆", points: 20, note: "Back on track with spending log.", date: daysAgo(7) }
  ];

  const totals = {};
  const logsByStudent = {};
  pointAwards.forEach((award, index) => {
    totals[award.studentId] = (totals[award.studentId] || 0) + award.points;
    if (!logsByStudent[award.studentId]) logsByStudent[award.studentId] = [];
    logsByStudent[award.studentId].push({
      id: 8000 + index,
      date: award.date,
      rewardId: award.rewardId,
      rewardName: award.rewardName,
      rewardIcon: award.rewardIcon,
      points: award.points,
      awardedBy: teacherName,
      note: award.note
    });
  });

  students.forEach(student => {
    setStudentPoints(student.id, totals[student.id] || 0);
    localStorage.setItem(pointsLogKey(student.id), JSON.stringify(logsByStudent[student.id] || []));
  });

  const attendanceDays = [
    {
      date: daysAgo(4),
      records: [
        { studentId: 3001, status: "present", note: "" },
        { studentId: 3002, status: "present", note: "" },
        { studentId: 3003, status: "late", note: "" },
        { studentId: 3004, status: "present", note: "" },
        { studentId: 3005, status: "present", note: "" },
        { studentId: 3006, status: "absent", note: "" },
        { studentId: 3007, status: "present", note: "" },
        { studentId: 3008, status: "present", note: "" }
      ]
    },
    {
      date: daysAgo(3),
      records: [
        { studentId: 3001, status: "present", note: "" },
        { studentId: 3002, status: "present", note: "" },
        { studentId: 3003, status: "present", note: "" },
        { studentId: 3004, status: "present", note: "" },
        { studentId: 3005, status: "late", note: "" },
        { studentId: 3006, status: "sick", note: "" },
        { studentId: 3007, status: "present", note: "" },
        { studentId: 3008, status: "present", note: "" }
      ]
    },
    {
      date: daysAgo(2),
      records: [
        { studentId: 3001, status: "present", note: "" },
        { studentId: 3002, status: "late", note: "" },
        { studentId: 3003, status: "present", note: "" },
        { studentId: 3004, status: "present", note: "" },
        { studentId: 3005, status: "present", note: "" },
        { studentId: 3006, status: "present", note: "" },
        { studentId: 3007, status: "other", note: "Doctor appointment — returned after break." },
        { studentId: 3008, status: "present", note: "" }
      ]
    },
    {
      date: daysAgo(1),
      records: [
        { studentId: 3001, status: "present", note: "" },
        { studentId: 3002, status: "present", note: "" },
        { studentId: 3003, status: "present", note: "" },
        { studentId: 3004, status: "present", note: "" },
        { studentId: 3005, status: "present", note: "" },
        { studentId: 3006, status: "absent", note: "" },
        { studentId: 3007, status: "present", note: "" },
        { studentId: 3008, status: "late", note: "" }
      ]
    },
    {
      date: new Date().toISOString().slice(0, 10),
      records: [
        { studentId: 3001, status: "present", note: "" },
        { studentId: 3002, status: "present", note: "" },
        { studentId: 3003, status: "present", note: "" },
        { studentId: 3004, status: "present", note: "" },
        { studentId: 3005, status: "late", note: "" },
        { studentId: 3006, status: "present", note: "" },
        { studentId: 3007, status: "present", note: "" },
        { studentId: 3008, status: "present", note: "" }
      ]
    }
  ];

  attendanceDays.forEach(day => {
    const records = day.records.map(record => {
      const student = students.find(item => item.id === record.studentId);
      return {
        studentId: record.studentId,
        studentName: student ? `${student.first} ${student.last}` : "Student",
        status: record.status,
        note: record.note,
        timestamp: `${day.date}T08:30:00.000Z`
      };
    });
    saveAttendanceRecord(CLASS_SLUG, day.date, records);
  });

  const createdLessons = [
    {
      id: 9001,
      title: "Needs vs Wants in Daily Life",
      subject: "Financial Literacy",
      youtubeUrl: "https://www.youtube.com/watch?v=ZBVL6Cla3JY",
      description: "**Objective:** Students sort everyday items into needs and wants.\n\n- Start with a class discussion\n- Use real Belize shopping examples\n- *Exit ticket:* name one need and one want from home",
      tags: ["needs", "wants", "budgeting"],
      status: "Published",
      thumbnail: "https://img.youtube.com/vi/ZBVL6Cla3JY/hqdefault.jpg",
      createdAt: daysAgo(12),
      completedAt: null
    },
    {
      id: 9002,
      title: "Saving for a School Goal",
      subject: "Saving",
      youtubeUrl: "https://www.youtube.com/watch?v=q_MXzC8Pq-g",
      description: "**Lesson plan:**\n\nStudents create a short-term savings goal for a class reward.\n\n- Introduce goal amount and timeline\n- Practice weekly savings math\n- Discuss trade-offs",
      tags: ["saving", "goals"],
      status: "Completed",
      thumbnail: "https://img.youtube.com/vi/q_MXzC8Pq-g/hqdefault.jpg",
      createdAt: daysAgo(20),
      completedAt: daysAgo(8)
    },
    {
      id: 9003,
      title: "Introduction to Classroom Points",
      subject: "Economics",
      youtubeUrl: "https://www.youtube.com/watch?v=FcoHlbgjz5A",
      description: "Explain how students earn classroom points through tasks and positive choices.",
      tags: ["points", "classroom rewards"],
      status: "Published",
      thumbnail: "https://img.youtube.com/vi/FcoHlbgjz5A/hqdefault.jpg",
      createdAt: daysAgo(6),
      completedAt: null
    },
    {
      id: 9004,
      title: "Belize Budget Challenge (Draft)",
      subject: "Budgeting",
      youtubeUrl: "",
      description: "Draft lesson: students build a one-week budget using local prices from Belize City.",
      tags: ["budget", "belize"],
      status: "Draft",
      thumbnail: null,
      createdAt: daysAgo(1),
      completedAt: null
    }
  ];
  localStorage.setItem("created_lessons", JSON.stringify(createdLessons));

  const calendarEvents = [
    { id: 10001, title: "Needs vs Wants Quiz", type: "quiz", classId: CLASS_NAME, date: daysAhead(1), time: "10:00", notes: "Review worksheet pages 2-3.", createdAt: daysAgo(5) },
    { id: 10002, title: "Money Math Review", type: "assignment", classId: CLASS_NAME, date: daysAhead(3), time: "09:30", notes: "Prepare coin counting examples.", createdAt: daysAgo(3) },
    { id: 10003, title: "Term Savings Check-In", type: "test", classId: CLASS_NAME, date: daysAhead(6), time: "11:00", notes: "Students present savings progress.", createdAt: daysAgo(2) },
    { id: 10004, title: "Parent Money Talk Reminder", type: "reminder", classId: CLASS_NAME, date: daysAhead(2), time: "14:00", notes: "Send home family budgeting handout.", createdAt: daysAgo(1) },
    { id: 10005, title: "Class Reward Friday", type: "reminder", classId: CLASS_NAME, date: daysAhead(5), time: "13:30", notes: "Students redeem classroom reward points.", createdAt: daysAgo(4) }
  ];
  localStorage.setItem("calendar_events", JSON.stringify(calendarEvents));

  localStorage.setItem(SEED_MARKER_KEY, "true");
}
