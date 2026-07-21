import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { HOW_TO_STEPS, markHowToSeen } from "../../data/helpTips";
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
  // bottom
  return {
    top: Math.min(rect.bottom + gap, window.innerHeight - 200),
    left: Math.min(Math.max(12, rect.midX - maxW / 2), window.innerWidth - maxW - 12),
    width: maxW
  };
}

/**
 * Spotlight walkthrough — highlights real UI regions on the page.
 */
export default function HowToTour({ open, onClose, onBeforeStep }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const total = HOW_TO_STEPS.length;
  const step = HOW_TO_STEPS[stepIndex] || HOW_TO_STEPS[0];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;

  useEffect(() => {
    if (!open) return undefined;
    setStepIndex(0);
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
    if (!open || !step) return undefined;

    onBeforeStep?.(step);

    let cancelled = false;
    let tries = 0;

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
        // Fixed/sticky targets (Events rail, sidebar) are already on-screen —
        // scrolling them recenters the page and looks like they were yanked out.
        if (!next?.fixed) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
      } else if (tries < 8) {
        tries += 1;
        window.setTimeout(refresh, 80);
      }
    }

    const timer = window.setTimeout(refresh, 40);
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
    };
  }, [open, step, stepIndex, onBeforeStep]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") finish();
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goBack();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIndex]);

  if (!open || !step) return null;

  function finish() {
    markHowToSeen();
    onClose?.();
  }

  function goNext() {
    if (isLast) {
      finish();
      return;
    }
    setStepIndex(index => Math.min(total - 1, index + 1));
  }

  function goBack() {
    setStepIndex(index => Math.max(0, index - 1));
  }

  const tipStyle = tooltipStyle(rect, step.placement);

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
            {stepIndex + 1} / {total}
          </p>
          <button type="button" className="howto-close" aria-label="Close walkthrough" onClick={finish}>
            <X size={16} />
          </button>
        </header>
        <h2 id="howto-title">{step.title}</h2>
        <p className="howto-text">{step.body}</p>
        <footer className="howto-footer">
          <button type="button" className="btn howto-skip" onClick={finish}>
            Skip
          </button>
          <div className="howto-nav">
            <button type="button" className="btn" onClick={goBack} disabled={isFirst}>
              <ChevronLeft size={16} aria-hidden="true" />
              Back
            </button>
            <button type="button" className="btn primary-gold" onClick={goNext}>
              {isLast ? "Finish" : "Next"}
              {!isLast ? <ChevronRight size={16} aria-hidden="true" /> : null}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
