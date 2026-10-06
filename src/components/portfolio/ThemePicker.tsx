import { useEffect, useRef, useState } from "react";
import { Moon, Orbit } from "lucide-react";
import { createPortal } from "react-dom";
import "./theme-transitions.css";

function SpiderEmblem({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5.1 10.4 7.4 10.8 10.5 9.8 13.3 10.4 17.7 12 20.5 13.6 17.7 14.2 13.3 13.2 10.5 13.6 7.4Z" />
      <path
        d="M10.8 8.5 7 6 6 1.8 M10.5 10 5.8 8.5 3.3 3.3 M10.3 12 5.5 12.8 2 9.5 M10.5 14 7 17 5.5 22.2 M13.2 8.5 17 6 18 1.8 M13.5 10 18.2 8.5 20.7 3.3 M13.7 12 18.5 12.8 22 9.5 M13.5 14 17 17 18.5 22.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="miter"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DaylightEmblem({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6.5 14a5.5 5.5 0 0 1 11 0" />
      <path d="M8.5 14a3.5 3.5 0 0 1 7 0" opacity=".3" />
      <path d="M12 3v2M4.5 6.5 6 8M19.5 6.5 18 8M2 12h2M20 12h2" />
      <path d="M3 15h18M6 18h12M9 21h6" />
    </svg>
  );
}

const THEMES = [
  { id: "night", label: "Galuxy", Icon: Moon },
  { id: "ocean", label: "Spider", Icon: SpiderEmblem },
  { id: "light", label: "Soft daylight", Icon: DaylightEmblem },
  { id: "alien", label: "Alien signal", Icon: Orbit },
] as const;
type ThemeId = (typeof THEMES)[number]["id"];
const legacyThemeName = (value: string | null): ThemeId | null => {
  if (value === "spider") return "ocean";
  if ((THEMES as readonly { id: ThemeId }[]).some((theme) => theme.id === value)) {
    return value as ThemeId;
  }
  return null;
};

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
    const initial = legacyThemeName(saved) ?? "night";
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
      localStorage.setItem("portfolio-theme", next === "ocean" ? "ocean" : next);
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
