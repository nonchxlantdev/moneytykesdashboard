import { useCallback, useEffect, useRef, useState } from "react";

const CHALK_COLOR = "rgba(246, 241, 224, 0.92)";
const ERASER_SIZE = 28;

function canvasContext(canvas) {
  return canvas?.getContext("2d", { alpha: true });
}

/** True when the ink layer has no meaningful chalk left. */
function isInkEmpty(canvas) {
  const ctx = canvasContext(canvas);
  if (!ctx || !canvas?.width || !canvas?.height) return true;

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 16) {
    if (data[i] > 16) return false;
  }
  return true;
}

/**
 * Teacher chalk only — welcome text stays as crisp HTML (never baked to a bitmap).
 * Persists drawings with board size metadata so restores never stretch.
 */
export default function useChalkCanvas({
  storageKey,
  enabled,
  erasing,
  reducedMotion,
  onEraseStart,
  onBoardEmpty,
  themeKey = "teal-gold"
}) {
  const containerRef = useRef(null);
  const backgroundCanvasRef = useRef(null);
  const inkCanvasRef = useRef(null);
  const dustLayerRef = useRef(null);
  const drawingRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const restoredRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const paintTexture = useCallback((width, height) => {
    const canvas = backgroundCanvasRef.current;
    const ctx = canvasContext(canvas);
    if (!ctx) return;

    const themeRoot =
      containerRef.current?.closest("[data-theme]") || containerRef.current;
    const base =
      getComputedStyle(themeRoot || document.documentElement)
        .getPropertyValue("--header-bg")
        .trim() || "#123e35";

    const gradient = ctx.createRadialGradient(
      width * 0.48,
      height * 0.42,
      10,
      width * 0.5,
      height * 0.5,
      width * 0.8
    );
    gradient.addColorStop(0, base);
    gradient.addColorStop(0.62, base);
    gradient.addColorStop(1, base);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let i = 0; i < Math.floor((width * height) / 220); i += 1) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }
  }, [themeKey]);

  const saveInk = useCallback(() => {
    const canvas = inkCanvasRef.current;
    const { width, height } = sizeRef.current;
    if (!canvas || !width || !height) return;
    try {
      if (isInkEmpty(canvas)) {
        localStorage.removeItem(storageKey);
        setHasInk(false);
        return;
      }
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          v: 2,
          w: width,
          h: height,
          data: canvas.toDataURL("image/png")
        })
      );
      setHasInk(true);
    } catch {
      // Drawing remains usable if storage is unavailable or full.
    }
  }, [storageKey]);

  const drawSavedInk = useCallback((width, height) => {
    if (restoredRef.current) return false;
    restoredRef.current = true;

    let raw;
    try {
      raw = localStorage.getItem(storageKey);
    } catch {
      return false;
    }
    if (!raw) return false;

    let payload = null;
    try {
      payload = JSON.parse(raw);
    } catch {
      // Legacy bare data-URL saves were stretching — discard them.
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
      return false;
    }

    if (!payload?.data || payload.v !== 2) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
      return false;
    }

    const image = new Image();
    image.onload = () => {
      const canvas = inkCanvasRef.current;
      const ctx = canvasContext(canvas);
      if (!ctx || !canvas) return;

      const dpr = sizeRef.current.dpr || 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const srcW = payload.w || image.naturalWidth;
      const srcH = payload.h || image.naturalHeight;
      const scale = Math.min(width / srcW, height / srcH);
      const drawW = srcW * scale;
      const drawH = srcH * scale;
      const dx = (width - drawW) / 2;
      const dy = (height - drawH) / 2;
      ctx.drawImage(image, dx, dy, drawW, drawH);

      if (isInkEmpty(canvas)) {
        try {
          localStorage.removeItem(storageKey);
        } catch {
          // ignore
        }
        setHasInk(false);
        return;
      }
      setHasInk(true);
    };
    image.src = payload.data;
    return true;
  }, [storageKey]);

  useEffect(() => {
    const container = containerRef.current;
    const background = backgroundCanvasRef.current;
    const ink = inkCanvasRef.current;
    if (!container || !background || !ink) return undefined;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const previous = sizeRef.current;

      const snapshot = document.createElement("canvas");
      if (previous.width && previous.height && ink.width && ink.height) {
        snapshot.width = ink.width;
        snapshot.height = ink.height;
        snapshot.getContext("2d")?.drawImage(ink, 0, 0);
      }

      [background, ink].forEach(canvas => {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvasContext(canvas);
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      });

      sizeRef.current = { width, height, dpr };
      paintTexture(width, height);

      if (snapshot.width && snapshot.height) {
        const ctx = canvasContext(ink);
        if (ctx) {
          // Uniform scale — never stretch chalk to a new aspect ratio.
          const scale = Math.min(ink.width / snapshot.width, ink.height / snapshot.height);
          const drawW = snapshot.width * scale;
          const drawH = snapshot.height * scale;
          const dx = (ink.width - drawW) / 2;
          const dy = (ink.height - drawH) / 2;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, ink.width, ink.height);
          ctx.drawImage(snapshot, dx, dy, drawW, drawH);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      } else {
        drawSavedInk(width, height);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [drawSavedInk, paintTexture]);

  const pointFromEvent = useCallback(event => {
    const rect = inkCanvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const spawnDust = useCallback((x, y) => {
    if (reducedMotion || !dustLayerRef.current) return;
    for (let i = 0; i < 3; i += 1) {
      const particle = document.createElement("span");
      particle.className = "chalkboard-dust-particle";
      particle.style.left = `${x + Math.random() * 12 - 6}px`;
      particle.style.top = `${y + Math.random() * 12 - 6}px`;
      particle.style.setProperty("--dust-x", `${Math.random() * 18 - 9}px`);
      particle.style.setProperty("--dust-y", `${-8 - Math.random() * 16}px`);
      dustLayerRef.current.appendChild(particle);
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
    }
  }, [reducedMotion]);

  const drawSegment = useCallback((event) => {
    if (!drawingRef.current || !enabled) return;
    const ctx = canvasContext(inkCanvasRef.current);
    if (!ctx) return;

    const events = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [event];
    events.forEach(pointerEvent => {
      const { x, y } = pointFromEvent(pointerEvent);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (erasing) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = ERASER_SIZE;
        ctx.shadowBlur = 0;
        ctx.lineTo(x, y);
        ctx.stroke();
        spawnDust(x, y);
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = CHALK_COLOR;
        ctx.lineWidth = 3;
        ctx.shadowColor = "rgba(246, 241, 224, 0.3)";
        ctx.shadowBlur = 3;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        for (let i = 0; i < 3; i += 1) {
          ctx.fillStyle = `rgba(246, 241, 224, ${0.12 + Math.random() * 0.18})`;
          ctx.fillRect(x + Math.random() * 6 - 3, y + Math.random() * 6 - 3, 1, 1);
        }
      }
    });
    setHasInk(true);
  }, [enabled, erasing, pointFromEvent, spawnDust]);

  const handlePointerDown = useCallback((event) => {
    if (!enabled || event.button > 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const ctx = canvasContext(inkCanvasRef.current);
    if (!ctx) return;
    const { x, y } = pointFromEvent(event);
    drawingRef.current = true;
    if (erasing) {
      onEraseStart?.();
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01);
    drawSegment(event);
  }, [drawSegment, enabled, erasing, onEraseStart, pointFromEvent]);

  const finishStroke = useCallback((event) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    canvasContext(inkCanvasRef.current)?.closePath();
    event?.currentTarget?.releasePointerCapture?.(event.pointerId);
    saveInk();

    if (erasing && isInkEmpty(inkCanvasRef.current)) {
      onBoardEmpty?.();
    }
  }, [erasing, onBoardEmpty, saveInk]);

  return {
    containerRef,
    backgroundCanvasRef,
    inkCanvasRef,
    dustLayerRef,
    hasInk,
    canvasHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: drawSegment,
      onPointerUp: finishStroke,
      onPointerCancel: finishStroke,
      onPointerLeave: finishStroke
    }
  };
}
