import { useEffect, useRef, useState } from "react";
import { Moon, Palette, Sun, Orbit } from "lucide-react";
import { createPortal } from "react-dom";
import "./theme-transitions.css";

const THEMES = [
  { id: "night", label: "Galuxy", Icon: Moon },
  { id: "ocean", label: "Spider", Icon: Palette },
  { id: "light", label: "Soft daylight", Icon: Sun },
  { id: "alien", label: "Alien signal", Icon: Orbit },
] as const;
type ThemeId = (typeof THEMES)[number]["id"];

export function ThemePicker() {
  const [theme, setTheme] = useState<ThemeId>("night");
  const [arrival, setArrival] = useState<{ theme: ThemeId; key: number } | null>(null);
  const selected = useRef<ThemeId>("night");
  const sequence = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("portfolio-theme");
    } catch {
      /* Storage may be blocked. */
    }
    const initial = THEMES.find((item) => item.id === saved)?.id ?? "night";
    selected.current = initial;
    document.documentElement.dataset["theme"] = initial;
    setTheme(initial);
    return () => clearTimeout(timer.current);
  }, []);
  const cycle = () => {
    const index = THEMES.findIndex((item) => item.id === selected.current);
    const next = THEMES[(index + 1) % THEMES.length]!.id;
    selected.current = next;
    document.documentElement.dataset["theme"] = next;
    setTheme(next);
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch {
      /* Persist for this visit. */
    }
    clearTimeout(timer.current);
    // Alien already owns its transmission title sequence in AlienCinema.
    if (next !== "alien" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setArrival({ theme: next, key: ++sequence.current });
      timer.current = setTimeout(() => setArrival(null), 2200);
    } else setArrival(null);
  };
  const current = THEMES.find((item) => item.id === theme)!;
  const Icon = current.Icon;
  return (
    <>
      <div className="theme-control" data-color-theme={theme}>
        <button
          type="button"
          aria-label="Change color theme"
          aria-describedby="theme-current-state"
          onClick={cycle}
          className="theme-orb grid h-10 w-10 place-items-center rounded-full border bg-background/70 text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
        >
          <span className="theme-orb-aura" aria-hidden="true" />
          <span className="theme-orb-orbit" aria-hidden="true">
            <i />
          </span>
          <span key={theme} className="theme-icon">
            <Icon size={17} />
          </span>
          <span className="theme-orb-glint" aria-hidden="true" />
        </button>
        <span id="theme-current-state" className="sr-only" role="status" aria-live="polite">
          {current.label} theme active.
        </span>
      </div>
      {arrival &&
        createPortal(
          <div
            key={arrival.key}
            className={`theme-arrival theme-arrival-${arrival.theme}`}
            aria-hidden="true"
          >
            {arrival.theme === "night" && (
              <>
                <div className="galuxy-eclipse" />
                <div className="galuxy-dust">
                  {Array.from({ length: 28 }, (_, i) => (
                    <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 29) % 100}%` }} />
                  ))}
                </div>
              </>
            )}
            {arrival.theme === "ocean" && (
              <svg
                className="spider-arrival-web"
                viewBox="0 0 1000 800"
                preserveAspectRatio="xMidYMid slice"
              >
                <g fill="none" stroke="currentColor" strokeWidth=".7">
                  <path d="M500 340L0 0M500 340L1000 0M500 340L1000 800M500 340L0 800M500 340L500 0M500 340L500 800M500 340L0 340M500 340L1000 340" />
                  {[70, 150, 260, 390, 520].map((r) => (
                    <path
                      key={r}
                      d={`M ${500 - r} 340 Q ${500 - r * 0.6} ${340 - r * 0.6} 500 ${340 - r} Q ${500 + r * 0.6} ${340 - r * 0.6} ${500 + r} 340 Q ${500 + r * 0.6} ${340 + r * 0.6} 500 ${340 + r} Q ${500 - r * 0.6} ${340 + r * 0.6} ${500 - r} 340 Z`}
                    />
                  ))}
                </g>
                <g
                  className="spider-arrival-creature"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M500 0V310" opacity=".5" />
                  <ellipse cx="500" cy="330" rx="7" ry="11" fill="currentColor" />
                  <ellipse cx="500" cy="315" rx="4" ry="5" fill="currentColor" />
                  {[-1, 1].flatMap((side) =>
                    [0, 1, 2, 3].map((row) => (
                      <path
                        key={`${side}-${row}`}
                        d={`M${500 + side * 3} ${314 + row * 4} L${500 + side * 18} ${300 + row * 12} L${500 + side * 29} ${296 + row * 17}`}
                      />
                    )),
                  )}
                </g>
              </svg>
            )}
            {arrival.theme === "light" && (
              <>
                <div className="specimen-shutter specimen-shutter-left" />
                <div className="specimen-shutter specimen-shutter-right" />
                <div className="specimen-arrival-scan" />
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
