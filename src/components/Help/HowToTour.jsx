import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Compass, Lightbulb, X } from "lucide-react";
import {
  HOW_TO_OVERVIEW_STEPS,
  HOW_TO_SECTIONS,
  HOW_TO_TOPICS,
  markHowToSeen
} from "../../data/helpTips";
import "./howto-tour.css";

const PAD = 10;

function isFixedLike(el) {
  let node = el;
  while (node && node !== document.body) {
    const pos = window.getComputedStyle(node).position;
    if (pos === "fixed" || pos === "sticky") return true;
    node = node.parentElement;
  }
  return false;
}

function measureTarget(selector) {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;
  return {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
    bottom: rect.bottom + PAD,
    right: rect.right + PAD,
    midY: rect.top + rect.height / 2,
    midX: rect.left + rect.width / 2,
    fixed: isFixedLike(el)
  };
}

function tooltipStyle(rect, placement) {
  const gap = 14;
  const maxW = Math.min(340, window.innerWidth - 24);

  if (!rect) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: maxW
    };
  }

  if (placement === "right") {
    return {
      top: Math.min(Math.max(16, rect.midY - 80), window.innerHeight - 220),
      left: Math.min(rect.right + gap, window.innerWidth - maxW - 12),
      width: maxW
    };
  }
  if (placement === "left") {
    return {
      top: Math.min(Math.max(16, rect.midY - 80), window.innerHeight - 220),
      left: Math.max(12, rect.left - maxW - gap),
      width: maxW
    };
  }
  if (placement === "top") {
    return {
      top: Math.max(12, rect.top - gap - 180),
      left: Math.min(Math.max(12, rect.midX - maxW / 2), window.innerWidth - maxW - 12),
      width: maxW
    };
  }
  return {
    top: Math.min(rect.bottom + gap, window.innerHeight - 200),
    left: Math.min(Math.max(12, rect.midX - maxW / 2), window.innerWidth - maxW - 12),
    width: maxW
  };
}

/**
 * How To — topic picker (sidebar areas) + spotlight walkthrough.
 */
export default function HowToTour({ open, onClose, onBeforeStep }) {
  const [phase, setPhase] = useState("picker"); // picker | tour
  const [steps, setSteps] = useState(HOW_TO_OVERVIEW_STEPS);
  const [tourTitle, setTourTitle] = useState("Full walkthrough");
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);

  const topicsBySection = useMemo(() => {
    return HOW_TO_SECTIONS.map(section => ({
      section,
      topics: HOW_TO_TOPICS.filter(topic => topic.section === section)
    })).filter(group => group.topics.length);
  }, []);

  const total = steps.length;
  const step = steps[stepIndex] || steps[0];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;

  useEffect(() => {
    if (!open) return undefined;
    setPhase("picker");
    setStepIndex(0);
    setRect(null);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("howto-active");
    return () => {
      document.body.style.overflow = previous;
      document.documentElement.classList.remove("howto-active");
      document.querySelectorAll(".howto-target-live").forEach(node => {
        node.classList.remove("howto-target-live");
      });
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || phase !== "tour" || !step) return undefined;

    onBeforeStep?.(step);

    let cancelled = false;
    let tries = 0;
    const maxTries = step.clickSelector ? 20 : 12;
    const startDelay = step.clickSelector ? 160 : 60;

    function refresh() {
      if (cancelled) return;
      const next = measureTarget(step.selector);
      setRect(next);
      document.querySelectorAll(".howto-target-live").forEach(node => {
        node.classList.remove("howto-target-live");
      });
      const el = document.querySelector(step.selector);
      if (el) {
        el.classList.add("howto-target-live");
        if (!next?.fixed) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
      } else if (tries < maxTries) {
        tries += 1;
        window.setTimeout(refresh, 90);
      }
    }

    const timer = window.setTimeout(refresh, startDelay);
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
    };
  }, [open, phase, step, stepIndex, onBeforeStep]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") {
        if (phase === "tour") backToPicker();
        else finish();
      }
      if (phase === "tour") {
        if (event.key === "ArrowRight") goNext();
        if (event.key === "ArrowLeft") goBack();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phase, stepIndex, total]);

  if (!open) return null;

  function finish() {
    markHowToSeen();
    onClose?.();
  }

  function backToPicker() {
    document.querySelectorAll(".howto-target-live").forEach(node => {
      node.classList.remove("howto-target-live");
    });
    setRect(null);
    setPhase("picker");
    setStepIndex(0);
  }

  function startTour(nextSteps, title) {
    setSteps(nextSteps);
    setTourTitle(title);
    setStepIndex(0);
    setPhase("tour");
  }

  function startFullWalkthrough() {
    startTour(HOW_TO_OVERVIEW_STEPS, "Full walkthrough");
  }

  function startTopic(topic) {
    startTour(topic.steps, topic.label);
  }

  function goNext() {
    if (isLast) {
      backToPicker();
      return;
    }
    setStepIndex(index => Math.min(total - 1, index + 1));
  }

  function goBack() {
    if (isFirst) {
      backToPicker();
      return;
    }
    setStepIndex(index => Math.max(0, index - 1));
  }

  if (phase === "picker") {
    return createPortal(
      <div className="howto-spotlight howto-picker-mode" role="dialog" aria-modal="true" aria-labelledby="howto-picker-title">
        <div className="howto-dim howto-dim-solid" onClick={finish} aria-hidden="true" />
        <div className="howto-picker-card">
          <header className="howto-card-head">
            <p className="howto-card-progress">How To</p>
            <button type="button" className="howto-close" aria-label="Close How To" onClick={finish}>
              <X size={16} />
            </button>
          </header>
          <h2 id="howto-picker-title">What would you like to learn?</h2>
          <p className="howto-text">
            Take the full walkthrough, or pick a sidebar area and we will highlight it on the real screen.
          </p>

          <button type="button" className="howto-topic-btn howto-topic-btn-primary" onClick={startFullWalkthrough}>
            <Compass size={18} aria-hidden="true" />
            <span>
              <strong>Full walkthrough</strong>
              <small>Dashboard highlights plus the main sidebar stops</small>
            </span>
          </button>

          {topicsBySection.map(group => (
            <div key={group.section} className="howto-topic-section">
              <p className="howto-topic-section-label">{group.section}</p>
              <div className="howto-topic-grid">
                {group.topics.map(topic => (
                  <button
                    key={topic.id}
                    type="button"
                    className="howto-topic-btn"
                    onClick={() => startTopic(topic)}
                    title={topic.summary}
                  >
                    <Lightbulb size={16} aria-hidden="true" />
                    <span>
                      <strong>{topic.label}</strong>
                      <small>{topic.summary}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <footer className="howto-footer">
            <button type="button" className="btn howto-skip" onClick={finish}>
              Close
            </button>
          </footer>
        </div>
      </div>,
      document.body
    );
  }

  const tipStyle = tooltipStyle(rect, step?.placement);

  return createPortal(
    <div className="howto-spotlight" role="dialog" aria-modal="true" aria-labelledby="howto-title">
      <div className="howto-dim" onClick={finish} aria-hidden="true" />

      {rect ? (
        <div
          className="howto-hole"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          }}
          aria-hidden="true"
        />
      ) : null}

      <div className="howto-card" style={tipStyle}>
        <header className="howto-card-head">
          <p className="howto-card-progress">
            {tourTitle} · {stepIndex + 1} / {total}
          </p>
          <button type="button" className="howto-close" aria-label="Close walkthrough" onClick={finish}>
            <X size={16} />
          </button>
        </header>
        <h2 id="howto-title">{step.title}</h2>
        <p className="howto-text">{step.body}</p>
        <footer className="howto-footer">
          <button type="button" className="btn howto-skip" onClick={backToPicker} title="Back to topic list">
            Topics
          </button>
          <div className="howto-nav">
            <button type="button" className="btn" onClick={goBack} title={isFirst ? "Back to topics" : "Previous step"}>
              <ChevronLeft size={16} aria-hidden="true" />
              Back
            </button>
            <button type="button" className="btn primary-gold" onClick={goNext} title={isLast ? "Back to topics" : "Next step"}>
              {isLast ? "Done" : "Next"}
              {!isLast ? <ChevronRight size={16} aria-hidden="true" /> : null}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
