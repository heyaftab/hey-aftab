import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LightBackground } from "./LightBackground";

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
    const mesh = el.querySelector<HTMLElement>(".light-survey-hidden")!;
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
    const scenes = Array.from(shell.querySelectorAll<HTMLElement>("main > section"));
    const hide = () => {
      visible = false;
      cancelAnimationFrame(frame);
      frame = 0;
      el.classList.remove("light-survey-tracking");
      reticle.style.opacity = "0";
      reticle.classList.remove("light-survey-click");
    };
    const tick = () => {
      frame = 0;
      if (!visible || !fine.matches || document.hidden) return;
      lx += (x - lx) * (reduced.matches ? 1 : 0.12);
      ly += (y - ly) * (reduced.matches ? 1 : 0.12);
      lens.style.transform = `translate3d(${lx}px,${ly}px,0)`;
      // Move a bounded reveal instead of repainting a viewport-sized moving mask.
      mesh.style.transform = `translate3d(${lx}px,${ly}px,0)`;
      mesh.style.backgroundPosition = `${-lx}px ${-ly}px`;
      reticle.style.transform = `translate3d(${x}px,${y}px,0)`;
      reticle.style.setProperty(
        "--pearl-tilt-x",
        `${reduced.matches ? 0 : Math.max(-18, Math.min(18, (y - ly) * -0.5))}deg`,
      );
      reticle.style.setProperty(
        "--pearl-tilt-y",
        `${reduced.matches ? 0 : Math.max(-18, Math.min(18, (x - lx) * 0.5))}deg`,
      );
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
    // A short tactile pulse uses the same pointer layer and cleans up on exit.
    const click = (event: MouseEvent) => {
      if (!fine.matches || reduced.matches || !visible || document.hidden) return;
      x = event.clientX;
      y = event.clientY;
      reticle.style.transform = `translate3d(${x}px,${y}px,0)`;
      reticle.classList.remove("light-survey-click");
      void reticle.offsetWidth;
      reticle.classList.add("light-survey-click");
      clearTimeout(timer);
      timer = setTimeout(() => reticle.classList.remove("light-survey-click"), 600);
    };
    const sync = () => {
      hide();
      clearTimeout(timer);
      el.classList.remove("light-survey-glitch");
      io?.disconnect();
      if (!reduced.matches && !document.hidden) {
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
    shell.addEventListener("click", click);
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    document.addEventListener("visibilitychange", sync);
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      hide();
      clearTimeout(timer);
      io?.disconnect();
      scenes.forEach((scene) => scene.classList.remove("light-survey-arrived"));
      window.removeEventListener("mousemove", move);
      shell.removeEventListener("click", click);
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
          <span>
            <b className="light-cursor-pearl" />
          </span>
          <i />
        </div>,
        document.body,
      )}
    </div>
  );
}
