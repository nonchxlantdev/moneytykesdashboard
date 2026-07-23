import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import PageChalkBanner from "../shared/PageChalkBanner";
import MagicBento from "../ui/MagicBento/MagicBento";
import QuizDemoOverlay from "./QuizDemoOverlay";
import { QUIZ_TIP_CARDS } from "./quizDemoData";
import "./quizzes.css";

function resolveTealRgb() {
  if (typeof window === "undefined") return "15, 157, 140";
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--teal").trim()
    || getComputedStyle(document.documentElement).getPropertyValue("--icon-accent").trim()
    || "#0f9d8c";
  if (raw.startsWith("#") && (raw.length === 7 || raw.length === 4)) {
    const hex = raw.length === 4
      ? `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`
      : raw;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if ([r, g, b].every(Number.isFinite)) return `${r}, ${g}, ${b}`;
  }
  const rgbMatch = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) return `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}`;
  return "15, 157, 140";
}

/**
 * Quizzes & Tests landing page (coming soon) with interactive demo.
 */
export default function QuizzesLandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const glowColor = useMemo(() => resolveTealRgb(), []);

  return (
    <div className="quizzes-page">
      <PageChalkBanner
        eyebrow="Assessments"
        title="Quizzes & Tests"
        subtitle="Build multiple choice and short answer assessments, launch them to your class, and grade with ease."
      />

      <div className="quizzes-body">
        <section className="soon-hero" data-tour="quizzes-hero">
          <span className="soon-hero-badge">🚧 Coming Soon</span>
          <h2>Quizzes & Tests is on its way</h2>
          <p>
            We are building a full assessment tool. Create mixed multiple choice and short answer tests,
            launch them to your class, and grade them right here. It is not live yet, but you can try an
            interactive demo below to see exactly how it will work.
          </p>
          <button
            type="button"
            className="btn primary-gold soon-hero-cta"
            data-tour="quizzes-demo-cta"
            onClick={() => setDemoOpen(true)}
          >
            <Play size={16} />
            Try the Interactive Demo
          </button>
        </section>

        <section className="quizzes-how" aria-labelledby="quizzes-how-title" data-tour="quizzes-how">
          <div className="quizzes-how-head">
            <h2 id="quizzes-how-title">How it will work</h2>
            <p>Four steps from blank quiz to graded student record.</p>
          </div>

          <MagicBento
            cards={QUIZ_TIP_CARDS}
            light
            textAutoHide={false}
            enableStars
            enableSpotlight
            enableBorderGlow
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={false}
            spotlightRadius={260}
            particleCount={6}
            glowColor={glowColor}
          />
        </section>
      </div>

      <QuizDemoOverlay open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
