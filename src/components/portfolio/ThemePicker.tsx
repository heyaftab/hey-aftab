import { useEffect, useState } from "react";
import { Moon, Palette, Sun } from "lucide-react";

const THEMES = [
  { id: "night", label: "Amber night", detail: "Warm gold on deep slate", Icon: Moon },
  { id: "ocean", label: "Ocean glow", detail: "Aqua and blue accents", Icon: Palette },
  { id: "light", label: "Soft daylight", detail: "Warm light with amber", Icon: Sun },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

export function ThemePicker() {
  const [theme, setTheme] = useState<ThemeId>("night");

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-theme");
    const initial = THEMES.find((item) => item.id === saved)?.id ?? "night";
    document.documentElement.dataset.theme = initial;
    setTheme(initial);
  }, []);

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((item) => item.id === theme);
    const next = THEMES[(currentIndex + 1) % THEMES.length]!.id;
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("portfolio-theme", next);
    setTheme(next);
  };

  const CurrentIcon = THEMES.find((item) => item.id === theme)?.Icon ?? Moon;

  return (
    <button
      type="button"
      aria-label="Change color theme"
      title="Change color theme"
      onClick={cycleTheme}
      className="grid h-10 w-10 place-items-center rounded-full border bg-background/70 text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
    >
      <span key={theme} className="theme-icon"><CurrentIcon size={17} /></span>
    </button>
  );
}
