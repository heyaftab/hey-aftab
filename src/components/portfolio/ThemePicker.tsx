import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, ChevronDown, Moon, Palette, Sun, Orbit } from "lucide-react";

const THEMES = [
  { id: "night", label: "Amber night", detail: "Warm gold on deep slate", Icon: Moon },
  { id: "ocean", label: "Ocean glow", detail: "Aqua and blue accents", Icon: Palette },
  { id: "light", label: "Soft daylight", detail: "Warm light with amber", Icon: Sun },
  { id: "alien", label: "Alien signal", detail: "An interface from beyond", Icon: Orbit },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

export function ThemePicker() {
  const [theme, setTheme] = useState<ThemeId>("night");
  const [preview, setPreview] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const disclosure = useRef<HTMLButtonElement>(null);
  const selected = useRef<ThemeId>("night");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem("portfolio-theme");
    } catch {
      // Themes still work when the browser blocks persistent storage.
    }
    const initial = THEMES.find((item) => item.id === saved)?.id ?? "night";
    document.documentElement.dataset["theme"] = initial;
    selected.current = initial;
    setTheme(initial);
  }, []);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !wrapper.current?.contains(event.target))
        setPreview(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const chooseTheme = (next: ThemeId) => {
    if (selected.current === next) return;
    selected.current = next;
    const apply = () => {
      // A newer click wins if a previous view-transition callback runs late.
      if (selected.current !== next) return;
      document.documentElement.dataset["theme"] = next;
      setTheme(next);
      try {
        window.localStorage.setItem("portfolio-theme", next);
      } catch {
        // Keep the selected theme for this visit without persistence.
      }
    };
    if (
      document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      try {
        const transition = document.startViewTransition(apply);
        void transition.ready.catch(() => {});
        void transition.finished.catch(() => {});
      } catch {
        apply();
      }
    } else apply();
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((item) => item.id === selected.current);
    // Preserve the original three-theme cycle; Alien is available in the gallery.
    chooseTheme(THEMES[currentIndex === 3 ? 0 : (currentIndex + 1) % 3]!.id);
  };

  const CurrentIcon = THEMES.find((item) => item.id === theme)?.Icon ?? Moon;
  const activeIndex = THEMES.findIndex((item) => item.id === theme);
  const active = THEMES[activeIndex]!;

  return (
    <div
      ref={wrapper}
      className="theme-control"
      data-color-theme={theme}
      onMouseEnter={() => {
        clearTimeout(closeTimer.current);
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setPreview(true);
      }}
      onMouseLeave={() => {
        closeTimer.current = setTimeout(() => {
          if (!wrapper.current?.contains(document.activeElement)) setPreview(false);
        }, 180);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPreview(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && preview) {
          event.stopPropagation();
          setPreview(false);
          disclosure.current?.focus();
        }
      }}
    >
      <button
        type="button"
        aria-label="Change color theme"
        title={`${active.label} · Click to cycle themes`}
        aria-describedby="theme-current-state"
        onClick={cycleTheme}
        className="theme-orb grid h-10 w-10 place-items-center rounded-full border bg-background/70 text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
      >
        <span className="theme-orb-aura" aria-hidden="true" />
        <span className="theme-orb-orbit" aria-hidden="true">
          <i />
        </span>
        <span key={theme} className="theme-icon">
          <CurrentIcon size={17} />
        </span>
        <span className="theme-orb-glint" aria-hidden="true" />
      </button>
      <button
        ref={disclosure}
        type="button"
        className="theme-preview-trigger"
        aria-label="Show theme previews"
        aria-expanded={preview}
        aria-controls="theme-previews"
        onClick={() => {
          clearTimeout(closeTimer.current);
          setPreview((value) => !value);
        }}
      >
        <ChevronDown size={11} aria-hidden="true" />
      </button>
      <span id="theme-current-state" className="sr-only" role="status" aria-live="polite">
        {active.label} theme active.
      </span>
      {preview && (
        <div
          id="theme-previews"
          className="theme-preview-panel"
          role="group"
          aria-label="Color theme previews"
        >
          <div className="theme-preview-heading">
            <span>Choose your atmosphere</span>
            <span className="theme-preview-count">0{THEMES.length}</span>
          </div>
          <div
            className="theme-preview-options"
            data-alien-gallery="true"
            style={{ "--selected-theme": activeIndex } as CSSProperties}
          >
            <span className="theme-selection-slide" aria-hidden="true" />
            {THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="theme-preview-option"
                data-preview-theme={item.id}
                aria-label={`Use ${item.label} theme`}
                aria-pressed={theme === item.id}
                onClick={() => chooseTheme(item.id)}
              >
                <span className="theme-miniature" aria-hidden="true">
                  <span className="theme-mini-glow" />
                  <span className="theme-mini-orb" />
                  <span className="theme-mini-lines">
                    <i />
                    <i />
                    <i />
                  </span>
                  <item.Icon size={12} />
                  <span className="theme-mini-check">
                    {theme === item.id && <Check size={10} />}
                  </span>
                </span>
                <span className="theme-preview-name">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="theme-preview-footer">
            <span className="theme-active-dot" />
            <span key={theme} className="theme-preview-detail">
              {active.detail}
            </span>
            <span className="theme-preview-shortcut">Click orb to cycle</span>
          </div>
        </div>
      )}
    </div>
  );
}
