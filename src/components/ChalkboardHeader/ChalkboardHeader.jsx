import { useCallback, useEffect, useMemo, useState } from "react";
import { Eraser, Pencil } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "../../themes/ThemeContext";
import ChalkClock from "./ChalkClock";
import useChalkCanvas from "./useChalkCanvas";
import "./chalkboard-header.css";

const INTRO_DURATION = 3200;

export default function ChalkboardHeader({
  teacherName,
  classId,
  userId = "teacher"
}) {
  const reducedMotion = useReducedMotion();
  const { theme } = useTheme();
  const [introDone, setIntroDone] = useState(false);
  const [animateIntro, setAnimateIntro] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [erasing, setErasing] = useState(false);
  const baseUrl = import.meta.env.BASE_URL;

  const sessionKey = useMemo(() => `welcomeSeen_v7_${userId}`, [userId]);
  // v2 ink-only store — drops old stretched welcome bitmaps.
  const storageKey = useMemo(() => `chalkboard-ink:v2:${classId || "class"}`, [classId]);

  useEffect(() => {
    if (reducedMotion == null) return undefined;

    let seen = false;
    try {
      seen = sessionStorage.getItem(sessionKey) === "true";
    } catch {
      // Storage may be unavailable.
    }

    if (seen || reducedMotion) {
      setAnimateIntro(false);
      setIntroDone(true);
      setWelcomeVisible(true);
      return undefined;
    }

    setAnimateIntro(true);
    setWelcomeVisible(true);
    setIntroDone(false);

    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(sessionKey, "true");
      } catch {
        // Feature still works without session storage.
      }
      setAnimateIntro(false);
      setIntroDone(true);
    }, INTRO_DURATION);

    return () => window.clearTimeout(timer);
  }, [reducedMotion, sessionKey]);

  const handleEraseStart = useCallback(() => {
    setWelcomeVisible(false);
  }, []);

  const handleBoardEmpty = useCallback(() => {
    setWelcomeVisible(true);
  }, []);

  const {
    containerRef,
    backgroundCanvasRef,
    inkCanvasRef,
    dustLayerRef,
    canvasHandlers
  } = useChalkCanvas({
    storageKey,
    enabled: introDone,
    erasing,
    reducedMotion: Boolean(reducedMotion),
    onEraseStart: handleEraseStart,
    onBoardEmpty: handleBoardEmpty,
    themeKey: theme
  });

  const chalkCursor = `url("${baseUrl}cursors/chalk-cursor.svg") 4 28, crosshair`;
  const eraserCursor = `url("${baseUrl}cursors/eraser-cursor.svg") 16 16, cell`;

  return (
    <header
      className={`chalkboard-header ${animateIntro ? "is-writing" : "is-ready"}`}
      aria-label={`Class chalkboard. Welcome, ${teacherName}.`}
    >
      <div ref={containerRef} className="chalkboard-surface">
        <canvas ref={backgroundCanvasRef} className="chalkboard-canvas chalkboard-texture" aria-hidden="true" />

        {welcomeVisible ? (
          <div className={`chalkboard-copy ${animateIntro ? "" : "is-settled"}`} aria-hidden={animateIntro}>
            <p className="chalkboard-kicker">Today&apos;s class</p>
            <h1 className="chalkboard-write-line">
              <span className="chalkboard-welcome-lead">Welcome, </span>
              <span className="chalkboard-name-shine">{teacherName}!</span>
            </h1>
            <p className="chalkboard-meta">
              <span className="chalkboard-write-meta">Let&apos;s get started!</span>
            </p>
          </div>
        ) : null}

        <canvas
          ref={inkCanvasRef}
          className={`chalkboard-canvas chalkboard-ink ${introDone ? "is-enabled" : ""} ${erasing ? "is-erasing" : "is-chalk"}`}
          style={{ cursor: erasing ? eraserCursor : chalkCursor }}
          tabIndex={introDone ? 0 : -1}
          aria-label={erasing ? "Writable chalkboard in eraser mode" : "Writable chalkboard in chalk mode"}
          {...canvasHandlers}
        />

        <div ref={dustLayerRef} className="chalkboard-dust-layer" aria-hidden="true" />
        <ChalkClock />
      </div>

      <div className="chalkboard-ledge" aria-hidden="true">
        <span className="chalkboard-ledge-rail" />
        <span className="chalkboard-ledge-shelf" />
        <span className="chalkboard-ledge-chalk chalk-white" />
        <span className="chalkboard-ledge-chalk chalk-gold" />
      </div>

      <button
        type="button"
        className={`chalkboard-eraser ${introDone ? "is-visible" : ""} ${erasing ? "is-active" : ""}`}
        onClick={() => setErasing(current => !current)}
        aria-label={erasing ? "Switch to chalk" : "Switch to eraser"}
        aria-pressed={erasing}
        title={erasing ? "Switch to chalk" : "Erase part of the board"}
      >
        {erasing ? <Pencil size={16} /> : <Eraser size={16} />}
        <span className="chalkboard-eraser-body" aria-hidden="true" />
      </button>
    </header>
  );
}
