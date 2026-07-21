import { useCallback, useMemo, useState } from "react";
import {
  createBlankQuestion,
  createInitialDemoQuestions,
  gradeMultipleChoice,
  summarizeQuestions
} from "./quizDemoData";

const INITIAL_LAUNCH = {
  classId: "form-2",
  dueDate: "",
  timeLimitMinutes: 15,
  allowRetakes: false
};

function todayPlusDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function useQuizDemoState() {
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState(() => createInitialDemoQuestions());
  const [launch, setLaunch] = useState(() => ({
    ...INITIAL_LAUNCH,
    dueDate: todayPlusDays(3)
  }));
  const [studentAnswers, setStudentAnswers] = useState({});
  const [mcScore, setMcScore] = useState(0);
  const [mcBreakdown, setMcBreakdown] = useState([]);
  const [saPoints, setSaPoints] = useState(5);
  const [saFeedback, setSaFeedback] = useState("");
  const [saSaved, setSaSaved] = useState(false);

  const summary = useMemo(() => summarizeQuestions(questions), [questions]);
  const shortAnswerQuestion = useMemo(
    () => questions.find(q => q.type === "short_answer") || null,
    [questions]
  );
  const maxSaPoints = Number(shortAnswerQuestion?.points) || 10;
  const finalGrade = mcScore + (saSaved ? saPoints : saPoints);

  const reset = useCallback(() => {
    setStep(1);
    setQuestions(createInitialDemoQuestions());
    setLaunch({ ...INITIAL_LAUNCH, dueDate: todayPlusDays(3) });
    setStudentAnswers({});
    setMcScore(0);
    setMcBreakdown([]);
    setSaPoints(5);
    setSaFeedback("");
    setSaSaved(false);
  }, []);

  const addQuestion = useCallback(() => {
    setQuestions(current => [...current, createBlankQuestion(current.length + 1)]);
  }, []);

  const updateQuestion = useCallback((questionId, patch) => {
    setQuestions(current =>
      current.map(question => (question.id === questionId ? { ...question, ...patch } : question))
    );
  }, []);

  const updateOption = useCallback((questionId, optionId, patch) => {
    setQuestions(current =>
      current.map(question => {
        if (question.id !== questionId || !question.options) return question;
        return {
          ...question,
          options: question.options.map(option => {
            if (patch.correct === true) {
              return {
                ...option,
                correct: option.id === optionId,
                ...(option.id === optionId ? patch : {})
              };
            }
            if (option.id !== optionId) return option;
            return { ...option, ...patch };
          })
        };
      })
    );
  }, []);

  const removeQuestion = useCallback(questionId => {
    setQuestions(current => current.filter(question => question.id !== questionId));
  }, []);

  const addOption = useCallback(questionId => {
    setQuestions(current =>
      current.map(question => {
        if (question.id !== questionId || question.type !== "multiple_choice") return question;
        const options = question.options || [];
        const nextIndex = options.length;
        if (nextIndex >= 8) return question;
        return {
          ...question,
          options: [
            ...options,
            {
              id: `opt-${Date.now()}-${nextIndex}`,
              text: "",
              correct: options.length === 0
            }
          ]
        };
      })
    );
  }, []);

  const removeOption = useCallback((questionId, optionId) => {
    setQuestions(current =>
      current.map(question => {
        if (question.id !== questionId || !question.options) return question;
        if (question.options.length <= 2) return question;
        const nextOptions = question.options.filter(option => option.id !== optionId);
        if (!nextOptions.some(option => option.correct) && nextOptions[0]) {
          nextOptions[0] = { ...nextOptions[0], correct: true };
        }
        return { ...question, options: nextOptions };
      })
    );
  }, []);

  const setQuestionType = useCallback((questionId, type) => {
    setQuestions(current =>
      current.map(question => {
        if (question.id !== questionId) return question;
        if (type === "short_answer") {
          return {
            ...question,
            type,
            options: undefined,
            placeholder: "Write your answer here…"
          };
        }
        return {
          ...question,
          type: "multiple_choice",
          options:
            question.options?.length >= 2
              ? question.options
              : [
                  { id: "opt-a-0", text: "", correct: true },
                  { id: "opt-b-1", text: "", correct: false },
                  { id: "opt-c-2", text: "", correct: false },
                  { id: "opt-d-3", text: "", correct: false }
                ]
        };
      })
    );
  }, []);

  const updateLaunch = useCallback(patch => {
    setLaunch(current => ({ ...current, ...patch }));
  }, []);

  const setAnswer = useCallback((questionId, value) => {
    setStudentAnswers(current => ({ ...current, [questionId]: value }));
  }, []);

  const goLaunching = useCallback(() => setStep("launching"), []);
  const goStudentTake = useCallback(() => setStep(3), []);
  const goGrading = useCallback(() => {
    const result = gradeMultipleChoice(questions, studentAnswers);
    setMcScore(result.score);
    setMcBreakdown(result.breakdown);
    setStep("grading");
  }, [questions, studentAnswers]);
  const goGrade = useCallback(() => setStep(4), []);
  const goSuccess = useCallback(() => setStep("success"), []);

  return {
    step,
    setStep,
    questions,
    summary,
    addQuestion,
    updateQuestion,
    updateOption,
    addOption,
    removeOption,
    setQuestionType,
    removeQuestion,
    launch,
    updateLaunch,
    studentAnswers,
    setAnswer,
    mcScore,
    setMcScore,
    mcBreakdown,
    saPoints,
    setSaPoints,
    saFeedback,
    setSaFeedback,
    saSaved,
    setSaSaved,
    shortAnswerQuestion,
    maxSaPoints,
    finalGrade,
    reset,
    goLaunching,
    goStudentTake,
    goGrading,
    goGrade,
    goSuccess
  };
}
