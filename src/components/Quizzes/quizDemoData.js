export const DEMO_STUDENT = {
  name: "Jasmine Martinez",
  classLabel: "Form 2 · Money Basics"
};

export const DEMO_STEPS = ["Build", "Launch", "Student Takes It", "Grade"];

export function createInitialDemoQuestions() {
  return [
    {
      id: "q1",
      type: "multiple_choice",
      prompt: "What is a need?",
      points: 10,
      options: [
        { id: "a", text: "Something you want for fun", correct: false },
        { id: "b", text: "Something you must have to live", correct: true },
        { id: "c", text: "Something that is always expensive", correct: false },
        { id: "d", text: "Something you buy only on sale", correct: false }
      ]
    },
    {
      id: "q2",
      type: "multiple_choice",
      prompt: "Which action best helps you save money?",
      points: 10,
      options: [
        { id: "a", text: "Spending every reward right away", correct: false },
        { id: "b", text: "Setting a savings goal before you spend", correct: true },
        { id: "c", text: "Ignoring your balance", correct: false },
        { id: "d", text: "Buying the first thing you see", correct: false }
      ]
    },
    {
      id: "q3",
      type: "short_answer",
      prompt: "Explain one way you can earn money this month.",
      points: 10,
      placeholder: "Write your answer here…"
    }
  ];
}

export function optionLabel(index) {
  return String.fromCharCode(65 + index); // A, B, C, D...
}

export function createMultipleChoiceOptions(count = 4) {
  return Array.from({ length: count }, (_, index) => ({
    id: `opt-${optionLabel(index).toLowerCase()}-${index}`,
    text: "",
    correct: index === 0
  }));
}

export function createBlankQuestion(index) {
  return {
    id: `q-new-${Date.now()}-${index}`,
    type: "multiple_choice",
    prompt: "",
    points: 5,
    editable: true,
    options: createMultipleChoiceOptions(4)
  };
}

export function summarizeQuestions(questions) {
  const mc = questions.filter(q => q.type === "multiple_choice").length;
  const sa = questions.filter(q => q.type === "short_answer").length;
  const points = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  return { mc, sa, points, count: questions.length };
}

export function gradeMultipleChoice(questions, answers) {
  let score = 0;
  const breakdown = [];

  questions
    .filter(q => q.type === "multiple_choice")
    .forEach(question => {
      const selected = answers[question.id];
      const correct = question.options.find(opt => opt.correct);
      const isCorrect = selected && correct && selected === correct.id;
      if (isCorrect) score += Number(question.points) || 0;
      breakdown.push({
        id: question.id,
        prompt: question.prompt,
        points: Number(question.points) || 0,
        correct: Boolean(isCorrect),
        selectedLabel: question.options.find(opt => opt.id === selected)?.text || "No answer",
        correctLabel: correct?.text || ""
      });
    });

  return { score, breakdown };
}

export const QUIZ_TIP_CARDS = [
  {
    color: "var(--surface, #fff)",
    title: "1. Build your test",
    description:
      "Mix multiple choice and short answer questions in one quiz. Mark correct answers as you go, and point totals add up automatically.",
    label: "✏️"
  },
  {
    color: "var(--surface, #fff)",
    title: "2. Launch to your class",
    description:
      "Set a due date, time limit, and whether retakes are allowed. Students see it appear the moment you publish.",
    label: "🚀"
  },
  {
    color: "var(--surface, #fff)",
    title: "3. Multiple choice auto-grades",
    description:
      "The moment a student submits, multiple choice questions grade themselves instantly, with no manual counting.",
    label: "⚡"
  },
  {
    color: "var(--surface, #fff)",
    title: "4. Grade short answers yourself",
    description:
      "Read each response, award points (partial credit is fine), and leave a note. Then save the final grade to their record.",
    label: "📝"
  }
];
