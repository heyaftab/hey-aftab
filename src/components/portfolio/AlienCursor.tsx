import { useEffect, useRef } from "react";
import "./alien.css";

export function AlienCursor() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const structure = svg.querySelector<SVGGElement>(".alien-structure")!;
    const core = svg.querySelector<SVGEllipseElement>(".alien-core")!;
    const ripple = svg.querySelector<SVGCircleElement>(".alien-pulse")!;
    const trail = svg.querySelector<SVGPathElement>(".alien-trail")!;
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let active = false,
      visible = false,
      frame = 0,
      last = 0;
    let x = 0,
      y = 0,
      lagX = 0,
      lagY = 0,
      lock = 0,
      target = 0;
    let pulse = -Infinity;
    let section: Element | null = null;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const tick = (now: number) => {
      if (!active || !visible || document.hidden) {
        stop();
        return;
      }
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const ease = 1 - Math.exp(-dt * 16);
      lagX += (x - lagX) * ease;
      lagY += (y - lagY) * ease;
      lock += (target - lock) * ease;
      const breath = Math.sin(now * 0.0018) * 0.025;
      structure.setAttribute(
        "transform",
        `rotate(${now * 0.008 + lock * 20}) scale(${1 + breath + lock * 0.12})`,
      );
      core.setAttribute("rx", String(3.2 + lock * 1.2));
      core.setAttribute("ry", String(5 - lock));
      const tx = Math.max(-24, Math.min(24, lagX - x));
      const ty = Math.max(-24, Math.min(24, lagY - y));
      trail.setAttribute("d", `M 0 0 Q ${tx * 0.5 + 2} ${ty * 0.5} ${tx} ${ty}`);
      trail.style.opacity = String(Math.min(0.3, Math.hypot(tx, ty) / 80));
      const age = (now - pulse) / 650;
      ripple.setAttribute("r", String(8 + Math.min(1, Math.max(0, age)) * 16));
      ripple.style.opacity = String(age >= 0 && age < 1 ? (1 - age) * 0.55 : 0);
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (active && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      active = document.documentElement.dataset["theme"] === "alien" && media.matches;
      if (active) {
        lagX = x;
        lagY = y;
        start();
      } else {
        stop();
        pulse = -Infinity;
        target = lock = 0;
        ripple.style.opacity = "0";
        trail.setAttribute("d", "");
      }
    };
    const move = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        lagX = x;
        lagY = y;
      }
      visible = true;
      const element = event.target instanceof Element ? event.target : null;
      target = element?.closest(
        "a, button, input, textarea, select, [role=button], article, [data-cursor=view]",
      )
        ? 1
        : 0;
      const next = element?.closest("main section") ?? null;
      if (active && next && next !== section) pulse = performance.now();
      section = next;
      start();
    };
    const click = () => {
      if (active && visible) {
        pulse = performance.now();
        start();
      }
    };
    const hide = () => {
      visible = false;
      stop();
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    sync();
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("pointerdown", click, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    document.addEventListener("visibilitychange", hide);
    media.addEventListener("change", sync);
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("mousemove", move);
      window.removeEventListener("pointerdown", click);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.removeEventListener("visibilitychange", hide);
      media.removeEventListener("change", sync);
    };
  }, []);
  return (
    <svg ref={ref} className="alien-cursor" viewBox="-30 -30 60 60" aria-hidden="true">
      <path className="alien-trail" fill="none" stroke="currentColor" strokeWidth=".7" />
      <circle
        className="alien-pulse"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth=".6"
        opacity="0"
      />
      <g
        className="alien-structure"
        fill="none"
        stroke="currentColor"
        strokeWidth=".85"
        strokeLinecap="round"
      >
        <path d="M -4 -10 Q -15 -8 -11 3 L -15 7 M 5 11 Q 16 7 10 -4 L 14 -9 M -7 -12 L -3 -15 L 2 -14 M 7 12 L 4 16 L 0 15" />
        <path d="M -17 -3 L -17 1 M 17 3 L 19 3 L 19 0 M 0 -20 L 2 -18" opacity=".55" />
        <circle cx="-13" cy="-9" r="1.1" fill="currentColor" />
        <path d="M 10 13 L 12 15 L 14 12 Z" fill="currentColor" />
      </g>
      <path d="M -7 0 Q 0 -8 7 0 Q 0 8 -7 0" fill="none" stroke="currentColor" strokeWidth=".8" />
      <ellipse className="alien-core" rx="3.2" ry="5" fill="currentColor" />
      <ellipse rx=".8" ry="2.8" fill="#11191e" />
      <circle cx="-1" cy="-2" r=".65" fill="#e5f2eb" />
    </svg>
  );
}
