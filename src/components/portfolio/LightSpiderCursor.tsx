import { useEffect, useRef } from "react";

// The parent cursor owns pointer position, visibility, and native-cursor hiding.
// Only the light theme activates this SVG's articulated leg animation.
export function LightSpiderCursor() {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const legs = Array.from(element.querySelectorAll<SVGPathElement>(".spider-leg"));
    let frame = 0;
    let active = false;
    let visible = false;
    let previous: { x: number; y: number } | undefined;
    let dx = 0;
    let dy = 0;
    let hover = false;
    let spread = 0;
    let last = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const animate = (now: number) => {
      if (!active || !visible || document.hidden) {
        stop();
        return;
      }
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const ease = 1 - Math.exp(-dt * 12);
      spread += ((hover ? 1 : 0) - spread) * ease;
      const speed = Math.min(Math.hypot(dx, dy) / 18, 1);
      legs.forEach((leg, index) => {
        const side = index < 4 ? -1 : 1;
        const row = index % 4;
        const phase = now * 0.003 + row * 1.6 + (side === 1 ? Math.PI : 0);
        const breath = Math.sin(phase) * (0.35 + speed * 1.2);
        const hipY = -3 + row * 2;
        const kneeX = side * (9 + spread * 1.5 + breath);
        const kneeY = -12 + row * 7 - dy * 0.06;
        const footX = side * (17 + spread * 2 - Math.abs(row - 1.5)) - dx * 0.1;
        const footY = -16 + row * 10 + breath * side - dy * 0.12;
        leg.setAttribute("d", `M ${side * 2.5} ${hipY} L ${kneeX} ${kneeY} L ${footX} ${footY}`);
      });
      dx *= Math.exp(-dt * 10);
      dy *= Math.exp(-dt * 10);
      frame = requestAnimationFrame(animate);
    };
    const start = () => {
      if (active && visible && !document.hidden && !frame) frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      active = document.documentElement.dataset["theme"] === "light" && media.matches;
      if (active) start();
      else stop();
    };
    const move = (event: MouseEvent) => {
      if (previous) {
        dx = Math.max(-24, Math.min(24, event.clientX - previous.x));
        dy = Math.max(-24, Math.min(24, event.clientY - previous.y));
      }
      previous = { x: event.clientX, y: event.clientY };
      visible = true;
      hover =
        event.target instanceof Element &&
        !!event.target.closest(
          "a, button, input, textarea, select, [role=button], [data-cursor=view]",
        );
      start();
    };
    const hide = () => {
      visible = false;
      previous = undefined;
      dx = dy = 0;
      stop();
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    sync();
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    document.addEventListener("visibilitychange", hide);
    media.addEventListener("change", sync);
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("mousemove", move);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.removeEventListener("visibilitychange", hide);
      media.removeEventListener("change", sync);
    };
  }, []);

  return (
    <svg ref={svg} className="light-spider-cursor" viewBox="-24 -24 48 48" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {Array.from({ length: 8 }, (_, index) => {
          const side = index < 4 ? -1 : 1;
          const row = index % 4;
          return (
            <path
              key={index}
              className="spider-leg"
              d={`M ${side * 2.5} ${-3 + row * 2} L ${side * 9} ${-12 + row * 7} L ${side * 16} ${-16 + row * 10}`}
            />
          );
        })}
        <path d="M 0 -5 L 0 10 M -2 2 Q -6 4 -3 8 L 0 11 L 3 8 Q 6 4 2 2 M -3 4 L 3 4 M -3 7 L 3 7" />
        <path d="M -1 -6 L -3 -9 M 1 -6 L 3 -9" />
      </g>
      <ellipse cx="0" cy="-3" rx="2.8" ry="3.7" fill="currentColor" />
      <circle cx="-1" cy="-4.5" r="0.45" fill="#faf9f6" />
      <circle cx="1" cy="-4.5" r="0.45" fill="#faf9f6" />
    </svg>
  );
}
