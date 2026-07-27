import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./MagicBento.css";

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "15, 157, 140";
const MOBILE_BREAKPOINT = 768;

const DEFAULT_CARDS = [
  { color: "#120F17", title: "Analytics", description: "Track user behavior", label: "Insights" },
  { color: "#120F17", title: "Dashboard", description: "Centralized data view", label: "Overview" },
  { color: "#120F17", title: "Collaboration", description: "Work together seamlessly", label: "Teamwork" },
  { color: "#120F17", title: "Automation", description: "Streamline workflows", label: "Efficiency" }
];

function createParticleElement(x, y, color = DEFAULT_GLOW_COLOR) {
  const el = document.createElement("div");
  el.className = "magic-bento-particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
}

function calculateSpotlightValues(radius) {
  return { proximity: radius * 0.5, fadeDistance: radius * 0.75 };
}

function updateCardGlowProperties(card, mouseX, mouseY, glow, radius) {
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--glow-x", `${((mouseX - rect.left) / rect.width) * 100}%`);
  card.style.setProperty("--glow-y", `${((mouseY - rect.top) / rect.height) * 100}%`);
  card.style.setProperty("--glow-intensity", String(glow));
  card.style.setProperty("--glow-radius", `${radius}px`);
}

function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function ParticleCard({
  children,
  className = "",
  style,
  disableAnimations = false,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false
}) {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, moved: false });
  const rafRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();
    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => particle.parentNode?.removeChild(particle)
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);
        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true
        });
        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true
        });
      }, index * 100);
      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return undefined;
    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      if (enableTilt) {
        gsap.to(element, { rotateX: 5, rotateY: 5, duration: 0.3, ease: "power2.out", transformPerspective: 1000 });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      mouseRef.current.moved = false;
      if (enableTilt) gsap.to(element, { rotateX: 0, rotateY: 0, duration: 0.3, ease: "power2.out" });
      if (enableMagnetism) gsap.to(element, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
    };

    // rAF-throttle: store latest mouse position; layout reads run at most once per frame.
    const runFrame = () => {
      rafRef.current = null;
      if (!mouseRef.current.moved || (!enableTilt && !enableMagnetism)) return;
      mouseRef.current.moved = false;
      const rect = element.getBoundingClientRect();
      const x = mouseRef.current.x - rect.left;
      const y = mouseRef.current.y - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      if (enableTilt) {
        gsap.to(element, {
          rotateX: ((y - centerY) / centerY) * -10,
          rotateY: ((x - centerX) / centerX) * 10,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000
        });
      }
      if (enableMagnetism) {
        magnetismAnimationRef.current = gsap.to(element, {
          x: (x - centerX) * 0.05,
          y: (y - centerY) * 0.05,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    const handleMouseMove = e => {
      if (!enableTilt && !enableMagnetism) return;
      mouseRef.current = { x: e.clientX, y: e.clientY, moved: true };
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(runFrame);
    };

    const handleClick = e => {
      if (!clickEffect) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;
      element.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, {
        scale: 1,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => ripple.remove()
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);
    return () => {
      isHoveredRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div ref={cardRef} className={className} style={{ ...style, position: "relative", overflow: "hidden" }}>
      {children}
    </div>
  );
}

function GlobalSpotlight({ gridRef, disableAnimations = false, enabled = true, spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS, glowColor = DEFAULT_GLOW_COLOR }) {
  const spotlightRef = useRef(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return undefined;

    const spotlight = document.createElement("div");
    spotlight.className = "magic-bento-global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: multiply;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    let cards = gridRef.current.querySelectorAll(".magic-bento-card");
    const refreshCards = () => {
      if (gridRef.current) cards = gridRef.current.querySelectorAll(".magic-bento-card");
    };
    window.addEventListener("resize", refreshCards);

    const mouse = { x: 0, y: 0, moved: false };
    let rafId = null;

    const runFrame = () => {
      rafId = null;
      if (!mouse.moved || !spotlightRef.current || !gridRef.current) return;
      mouse.moved = false;

      const section = gridRef.current.closest(".magic-bento-section");
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        mouse.x >= rect.left &&
        mouse.x <= rect.right &&
        mouse.y >= rect.top &&
        mouse.y <= rect.bottom;

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
        cards.forEach(card => card.style.setProperty("--glow-intensity", "0"));
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(mouse.x - centerX, mouse.y - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);
        let glowIntensity = 0;
        if (effectiveDistance <= proximity) glowIntensity = 1;
        else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }
        updateCardGlowProperties(card, mouse.x, mouse.y, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, { left: mouse.x, top: mouse.y, duration: 0.1, ease: "power2.out" });
      const targetOpacity =
        minDistance <= proximity
          ? 0.55
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.55
            : 0;
      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out"
      });
    };

    const handleMouseMove = e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.moved = true;
      if (rafId == null) rafId = requestAnimationFrame(runFrame);
    };

    const handleMouseLeave = () => {
      cards.forEach(card => {
        card.style.setProperty("--glow-intensity", "0");
      });
      if (spotlightRef.current) gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", refreshCards);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
}

/**
 * Interactive bento grid (React Bits MagicBento, forked to accept a cards prop).
 */
export default function MagicBento({
  cards = DEFAULT_CARDS,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = true,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
  light = false,
  className = ""
}) {
  const gridRef = useRef(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <div
      className={`magic-bento-section ${light ? "is-light" : ""} ${className}`.trim()}
      style={{ "--glow-color": glowColor }}
    >
      {enableSpotlight ? (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      ) : null}

      <div className="magic-bento-grid" ref={gridRef}>
        {cards.map((card, index) => {
          const baseClassName = `magic-bento-card ${enableBorderGlow ? "magic-bento-card--border-glow" : ""}`;
          const cardStyle = {
            backgroundColor: card.color || (light ? "var(--surface, #fff)" : "#120F17"),
            color: light ? "var(--mt-ink, #1c2b2a)" : "#fff",
            "--glow-x": "50%",
            "--glow-y": "50%",
            "--glow-intensity": "0",
            "--glow-radius": "200px"
          };

          const content = (
            <>
              <div className="magic-bento-card-header">
                <span className="magic-bento-card-label">{card.label}</span>
              </div>
              <div className="magic-bento-card-content">
                <h3 className={`magic-bento-card-title ${textAutoHide ? "is-clamp-1" : ""}`}>{card.title}</h3>
                <p className={`magic-bento-card-desc ${textAutoHide ? "is-clamp-2" : ""}`}>{card.description}</p>
              </div>
            </>
          );

          if (enableStars) {
            return (
              <ParticleCard
                key={`${card.title}-${index}`}
                className={baseClassName}
                style={cardStyle}
                disableAnimations={shouldDisableAnimations}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                clickEffect={clickEffect}
                enableMagnetism={enableMagnetism}
              >
                {content}
              </ParticleCard>
            );
          }

          return (
            <div key={`${card.title}-${index}`} className={baseClassName} style={cardStyle}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
