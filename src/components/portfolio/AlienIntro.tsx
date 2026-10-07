import { useEffect, useRef, useState } from "react";
import "./alien-intro.css";

const SESSION_KEY = "alien-awareness-intro-seen";
type Phase =
  | "normal"
  | "detection"
  | "scanning"
  | "identified"
  | "glitch"
  | "hello"
  | "build"
  | "fading"
  | "done";
const sequence: [number, Phase][] = [
  [1500, "detection"],
  [1680, "scanning"],
  [2400, "identified"],
  [3100, "glitch"],
  [3500, "hello"],
  [4700, "build"],
  [6300, "fading"],
  [6800, "done"],
];

// Purely decorative: never captures focus, blocks links, or changes portfolio content.
export function AlienIntro({ repeatVisit = false }: { repeatVisit?: boolean }) {
  const [phase, setPhase] = useState<Phase>("normal");
  const [secret, setSecret] = useState(false);
  const label = useRef<HTMLSpanElement>(null);
  const finish = useRef<() => void>(() => {});
  useEffect(() => {
    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let timers: number[] = [],
      secretTimer = 0,
      ended = false,
      moved = false;
    const markSeen = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* Still allow this visit. */
      }
    };
    const clear = () => {
      ended = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
      window.clearTimeout(secretTimer);
      html.removeAttribute("data-alien-intro");
      html.removeAttribute("data-alien-flash");
      html.style.removeProperty("--alien-intro-cursor-origin");
    };
    const stop = () => {
      clear();
      markSeen();
      setPhase("done");
      setSecret(false);
    };
    finish.current = stop;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* Storage may be unavailable. */
    }
    // Explicit local preview lets the owner replay edits without clearing browser storage.
    const preview =
      import.meta.env.DEV && new URLSearchParams(window.location.search).get("alienIntro") === "1";
    if (seen && !preview) {
      let secondSeen = false;
      try {
        secondSeen = sessionStorage.getItem("alien-awareness-return-seen") === "1";
      } catch {
        /* Storage is optional. */
      }
      if (!repeatVisit || secondSeen || reduced.matches) {
        setPhase("done");
        return;
      }
      timers.push(
        window.setTimeout(() => {
          if (ended || document.hidden) return;
          try {
            sessionStorage.setItem("alien-awareness-return-seen", "1");
          } catch {
            /* Storage is optional. */
          }
          html.dataset["alienFlash"] = "echo";
        }, 0),
      );
      timers.push(
        window.setTimeout(() => {
          html.removeAttribute("data-alien-flash");
        }, 400),
      );
      timers.push(window.setTimeout(stop, 800));
    }
    if (!seen || preview)
      sequence.forEach(([delay, next]) => {
        timers.push(
          window.setTimeout(() => {
            if (ended) return;
            if (next === "detection") markSeen();
            if (next === "done") {
              stop();
              return;
            }
            const visual =
              reduced.matches && ["detection", "glitch"].includes(next) ? "scanning" : next;
            if (visual === "detection") {
              const cursor = document.querySelector<HTMLElement>(".planet-cursor");
              html.style.setProperty(
                "--alien-intro-cursor-origin",
                cursor?.style.transform || "none",
              );
            }
            html.dataset["alienIntro"] = visual;
            setPhase(next);
          }, delay),
        );
      });
    const move = (event: PointerEvent) => {
      if (ended || !html.dataset["alienIntro"] || !fine.matches || event.pointerType === "touch")
        return;
      if (label.current)
        label.current.style.transform = `translate3d(${Math.min(event.clientX + 22, Math.max(8, window.innerWidth - 300))}px,${Math.max(8, Math.min(event.clientY + 24, window.innerHeight - 50))}px,0)`;
      if (!moved) {
        moved = true;
        setSecret(true);
        secretTimer = window.setTimeout(() => setSecret(false), 3400);
      }
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") stop();
    };
    const visibility = () => {
      if (document.hidden) stop();
    };
    const preference = () => {
      if (reduced.matches) stop();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", stop, { passive: true });
    window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", preference);
    return () => {
      clear();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", preference);
    };
  }, [repeatVisit]);
  if (phase === "done") return null;
  const message =
    phase === "normal"
      ? ""
      : phase === "detection" || phase === "scanning"
        ? "SCANNING VISITOR..."
        : phase === "identified" || phase === "glitch"
          ? "IDENTITY DETECTED."
          : phase === "hello"
            ? "YOU FOUND MY PORTFOLIO."
            : "NOW LET ME SHOW YOU WHAT I CAN BUILD.";
  return (
    <div className="alien-intro" data-phase={phase}>
      <div className="alien-intro-mobile-venom" aria-hidden="true" />
      <div className="alien-intro-distortion" aria-hidden="true" />
      <div className="alien-intro-message" role="status" aria-live="polite" aria-atomic="true">
        <span className="alien-intro-caption">PORTFOLIO / INTERACTIVE INTRO</span>
        <span key={message}>{message}</span>
      </div>
      <button
        className="alien-intro-skip"
        onClick={() => finish.current()}
        aria-label="Skip Alien intro"
      >
        Skip intro <span aria-hidden="true">↗</span>
      </button>
      <span
        ref={label}
        className="alien-intro-secret"
        style={{ opacity: secret ? 1 : 0 }}
        aria-hidden="true"
      >
        Don't worry. I'm only watching your cursor.
      </span>
    </div>
  );
}
