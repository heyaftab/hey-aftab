import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LightBackground } from "./LightBackground";

const LIGHT_SURVEY = { glitchMinMs: 20000, glitchMaxMs: 40000 };

export function LightSurvey() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const sync = () => setLight(document.documentElement.dataset["theme"] === "light");
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    sync();
    return () => observer.disconnect();
  }, []);
  return light ? (
    <>
      <LightBackground />
      <SpecimenScanner />
    </>
  ) : null;
}

function SpecimenScanner() {
  const root = useRef<HTMLDivElement>(null);
  const pointer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!;
    const shell = el.closest<HTMLElement>(".portfolio-shell")!;
    const lens = el.querySelector<HTMLElement>(".light-survey-lens")!;
    const reticle = pointer.current!;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      timer: ReturnType<typeof setTimeout> | undefined;
    let x = 0,
      y = 0,
      lx = 0,
      ly = 0,
      visible = false;
    let io: IntersectionObserver | undefined;
    let heading: HTMLElement | null = null;
    let decodeTimer: ReturnType<typeof setTimeout> | undefined;
    const scenes = Array.from(shell.querySelectorAll<HTMLElement>("main > section"));
    const hide = () => {
      visible = false;
      cancelAnimationFrame(frame);
      frame = 0;
      el.classList.remove("light-survey-tracking");
      reticle.style.opacity = "0";
    };
    const tick = () => {
      frame = 0;
      if (!visible || !fine.matches || document.hidden) return;
      lx += (x - lx) * (reduced.matches ? 1 : 0.12);
      ly += (y - ly) * (reduced.matches ? 1 : 0.12);
      lens.style.transform = `translate3d(${lx}px,${ly}px,0)`;
      reticle.style.transform = `translate3d(${x}px,${y}px,0)`;
      el.style.setProperty("--mx", `${lx}px`);
      el.style.setProperty("--my", `${ly}px`);
      if (!reduced.matches && Math.hypot(x - lx, y - ly) > 0.1) frame = requestAnimationFrame(tick);
    };
    const move = (event: MouseEvent) => {
      if (!fine.matches || document.hidden) return;
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        lx = x;
        ly = y;
      }
      visible = true;
      reticle.style.opacity = "1";
      el.classList.add("light-survey-tracking");
      const target = event.target instanceof Element ? event.target : null;
      el.classList.toggle("light-survey-lock", !!target?.closest("a,button,[role=button]"));
      reticle.classList.toggle(
        "light-survey-pointer-lock",
        !!target?.closest("a,button,[role=button]"),
      );
      if (!frame) frame = requestAnimationFrame(tick);
    };
    // Brief decorative decoding: preserve the actual heading and accessible name.
    const decode = (event: MouseEvent) => {
      if (reduced.matches || !(event.target instanceof Element)) return;
      const next = event.target.closest("article")?.querySelector<HTMLElement>("h3") ?? null;
      if (next === heading) return;
      heading?.removeAttribute("data-light-decode");
      clearTimeout(decodeTimer);
      heading = next;
      if (heading) {
        heading.dataset["lightDecode"] = "⌁ ⋮ ⊹ / 07 / ⌁";
        decodeTimer = setTimeout(() => heading?.removeAttribute("data-light-decode"), 450);
      }
    };
    const schedule = () => {
      timer = setTimeout(
        () => {
          if (!document.hidden) el.classList.add("light-survey-glitch");
          timer = setTimeout(() => {
            el.classList.remove("light-survey-glitch");
            schedule();
          }, 140);
        },
        LIGHT_SURVEY.glitchMinMs +
          Math.random() * (LIGHT_SURVEY.glitchMaxMs - LIGHT_SURVEY.glitchMinMs),
      );
    };
    const sync = () => {
      hide();
      clearTimeout(timer);
      clearTimeout(decodeTimer);
      el.classList.remove("light-survey-glitch");
      heading?.removeAttribute("data-light-decode");
      io?.disconnect();
      if (!reduced.matches && !document.hidden) {
        schedule();
        if (window.IntersectionObserver) {
          io = new IntersectionObserver(
            (entries) =>
              entries.forEach((entry) => {
                if (entry.isIntersecting) entry.target.classList.add("light-survey-arrived");
              }),
            { threshold: 0.08 },
          );
          scenes.forEach((scene) => io!.observe(scene));
        }
      }
    };
    sync();
    window.addEventListener("mousemove", move, { passive: true });
    shell.addEventListener("mouseover", decode);
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    document.addEventListener("visibilitychange", sync);
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      hide();
      clearTimeout(timer);
      clearTimeout(decodeTimer);
      io?.disconnect();
      heading?.removeAttribute("data-light-decode");
      scenes.forEach((scene) => scene.classList.remove("light-survey-arrived"));
      window.removeEventListener("mousemove", move);
      shell.removeEventListener("mouseover", decode);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.removeEventListener("visibilitychange", sync);
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);
  return (
    <div ref={root} className="light-survey" aria-hidden="true">
      <div className="light-survey-mist" />
      <div className="light-survey-grain" />
      <div className="light-survey-vignette" />
      <div className="light-survey-hidden">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M20 0 Q80 220 25 420 T50 1000 M980 0 Q920 240 975 440 T950 1000 M25 420 Q100 460 130 620 M975 440 Q900 500 860 700" />
          </g>
          <text x="140" y="420">
            ⌁ ⋮ ⊹ / SPECIMEN 07
          </text>
          <text x="680" y="760">
            ⊹ ⋮ ⌁ / SURVEY
          </text>
        </svg>
      </div>
      <div className="light-survey-lens" />
      {createPortal(
        <div ref={pointer} className="light-survey-reticle" aria-hidden="true">
          <span />
          <i />
        </div>,
        document.body,
      )}
    </div>
  );
}
