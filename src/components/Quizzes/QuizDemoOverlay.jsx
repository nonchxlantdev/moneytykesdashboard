import { useEffect } from "react";
import { X } from "lucide-react";
import DemoProgressBar from "./DemoProgressBar";
import DemoSuccess from "./DemoSuccess";
import GradingTransition from "./GradingTransition";
import LaunchingTransition from "./LaunchingTransition";
import StepBuild from "./StepBuild";
import StepGrade from "./StepGrade";
import StepLaunch from "./StepLaunch";
import StepStudentTake from "./StepStudentTake";
import useQuizDemoState from "./useQuizDemoState";

export default function QuizDemoOverlay({ open, onClose }) {
  const demo = useQuizDemoState();

  useEffect(() => {
    if (!open) return undefined;
    demo.reset();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when opening
  }, [open]);

  if (!open) return null;

  const showProgress = typeof demo.step === "number" || demo.step === "launching" || demo.step === "grading";

  return (
    <div className="quiz-demo-overlay" role="dialog" aria-modal="true" aria-labelledby="quiz-demo-title">
      <div className="quiz-demo-panel">
        <header className="quiz-demo-panel-head">
          <div>
            <p className="quiz-demo-kicker">Interactive demo</p>
            <h2 id="quiz-demo-title">Quizzes & Tests walkthrough</h2>
          </div>
          <button type="button" className="quiz-demo-close" aria-label="Close demo" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {showProgress && demo.step !== "success" ? <DemoProgressBar current={demo.step} /> : null}

        <div className="quiz-demo-panel-body">
          {demo.step === 1 ? (
            <StepBuild
              questions={demo.questions}
              summary={demo.summary}
              onAddQuestion={demo.addQuestion}
              onUpdateQuestion={demo.updateQuestion}
              onUpdateOption={demo.updateOption}
              onAddOption={demo.addOption}
              onRemoveOption={demo.removeOption}
              onSetQuestionType={demo.setQuestionType}
              onRemoveQuestion={demo.removeQuestion}
              onContinue={() => demo.setStep(2)}
            />
          ) : null}

          {demo.step === 2 ? (
            <StepLaunch
              launch={demo.launch}
              summary={demo.summary}
              onChange={demo.updateLaunch}
              onBack={() => demo.setStep(1)}
              onLaunch={demo.goLaunching}
            />
          ) : null}

          {demo.step === "launching" ? <LaunchingTransition onDone={demo.goStudentTake} /> : null}

          {demo.step === 3 ? (
            <StepStudentTake
              questions={demo.questions}
              answers={demo.studentAnswers}
              onAnswer={demo.setAnswer}
              timeLimitMinutes={demo.launch.timeLimitMinutes}
              onSubmit={demo.goGrading}
            />
          ) : null}

          {demo.step === "grading" ? <GradingTransition onDone={demo.goGrade} /> : null}

          {demo.step === 4 ? (
            <StepGrade
              mcScore={demo.mcScore}
              mcBreakdown={demo.mcBreakdown}
              saQuestion={demo.shortAnswerQuestion}
              saAnswer={demo.studentAnswers[demo.shortAnswerQuestion?.id]}
              saPoints={demo.saPoints}
              maxSaPoints={demo.maxSaPoints}
              saFeedback={demo.saFeedback}
              saSaved={demo.saSaved}
              finalGrade={demo.finalGrade}
              totalPoints={demo.summary.points}
              onSaPointsChange={demo.setSaPoints}
              onSaFeedbackChange={demo.setSaFeedback}
              onSaveSa={() => demo.setSaSaved(true)}
              onSaveFinal={demo.goSuccess}
            />
          ) : null}

          {demo.step === "success" ? (
            <DemoSuccess
              finalGrade={demo.finalGrade}
              totalPoints={demo.summary.points}
              onRestart={demo.reset}
              onClose={onClose}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
