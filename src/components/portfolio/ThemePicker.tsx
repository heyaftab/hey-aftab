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
const getInitialTheme = (): ThemeId => {
  try {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved === "spider") return "ocean";
    if ((THEMES as readonly { id: ThemeId }[]).some(({ id }) => id === saved)) {
      return saved as ThemeId;
    }
  } catch {
    /* Storage may be blocked; use the first-visit default. */
  }
  return "light";
};

export function ThemePicker() {
  const [theme, setTheme] = useState<ThemeId>("light");
  const [arrival, setArrival] = useState<{ theme: ThemeId; key: number } | null>(null);
  const selected = useRef<ThemeId>("light");
  const sequence = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const initial = getInitialTheme();
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
    if (
      next !== "alien" &&
      next !== "ocean" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
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
