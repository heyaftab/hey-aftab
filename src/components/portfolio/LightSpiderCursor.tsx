import { useEffect, useRef } from "react";

// The parent cursor owns pointer position, visibility, and native-cursor hiding.
// Light and Ocean glow share the articulated spider; other cursors stay independent.
export function LightSpiderCursor() {
  const svg = useRef<SVGSVGElement>(null);
  const web = useRef<SVGPathElement>(null);
  const body = useRef<SVGGElement>(null);
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
    let gait = 0;
    let heading = 0;
    let targetHeading = 0;
    let lastMove = 0;
    const silk: { x: number; y: number; time: number }[] = [];
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
      heading += (((((targetHeading - heading) % 360) + 540) % 360) - 180) * ease;
      body.current?.setAttribute("transform", `rotate(${heading.toFixed(2)})`);
      gait += dt * (2 + speed * 22);
      legs.forEach((leg, index) => {
        const side = index < 4 ? -1 : 1;
        const row = index % 4;
        // Alternating groups lift and plant their feet, with three segments per leg.
        const phase = gait + row * Math.PI + (side === 1 ? Math.PI : 0);
        const stride = Math.sin(phase) * speed * 3.8;
        const lift = Math.max(0, Math.cos(phase)) * speed * 2;
        const breath = Math.sin(now * 0.002 + row) * 0.3;
        const hipY = -3 + row * 2;
        const kneeX = side * (9 + spread * 1.5 + breath);
        const kneeY = -12 + row * 7 - dy * 0.06;
        const footX = side * (17 + spread * 2 - Math.abs(row - 1.5)) - dx * 0.1;
        const footY = -16 + row * 10 + breath * side + stride;
        const ankleX = footX - side * (3 + lift);
        const ankleY = footY - 3;
        leg.setAttribute(
          "d",
          `M ${side * 2.5} ${hipY} L ${kneeX} ${kneeY} L ${ankleX} ${ankleY} L ${footX} ${footY}`,
        );
      });
      while (silk.length && now - silk[0]!.time > 900) silk.shift();
      if (web.current && previous) {
        const points = silk.map((point) => ({
          x: point.x - previous!.x,
          y: point.y - previous!.y,
        }));
        let thread = points.map((point, i) => `${i ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
        // Short cross-strands suggest silk rather than a glowing pointer trail.
        points.forEach((point, i) => {
          if (i % 3 === 0 && i > 0)
            thread += ` M ${point.x - 6} ${point.y - 4} L ${point.x} ${point.y} L ${point.x + 6} ${point.y + 4}`;
        });
        web.current.setAttribute("d", thread);
        web.current.style.opacity = String(Math.max(0, 1 - (now - lastMove) / 900));
      }
      dx *= Math.exp(-dt * 10);
      dy *= Math.exp(-dt * 10);
      frame = requestAnimationFrame(animate);
    };
    const start = () => {
      if (active && visible && !document.hidden && !frame) frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      active =
        ["light", "ocean"].includes(document.documentElement.dataset["theme"] ?? "") &&
        media.matches;
      if (active) start();
      else {
        stop();
        silk.length = 0;
        web.current?.setAttribute("d", "");
      }
    };
    const move = (event: MouseEvent) => {
      if (previous) {
        dx = Math.max(-24, Math.min(24, event.clientX - previous.x));
        dy = Math.max(-24, Math.min(24, event.clientY - previous.y));
        if (Math.hypot(dx, dy) > 0.5) targetHeading = (Math.atan2(dx, -dy) * 180) / Math.PI;
      }
      previous = { x: event.clientX, y: event.clientY };
      lastMove = performance.now();
      if (active) {
        const tail = silk[silk.length - 1];
        if (!tail || Math.hypot(tail.x - event.clientX, tail.y - event.clientY) > 5) {
          silk.push({ x: event.clientX, y: event.clientY, time: lastMove });
          if (silk.length > 20) silk.shift();
        }
      }
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
      silk.length = 0;
      web.current?.setAttribute("d", "");
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
    <>
      <svg className="light-spider-web" viewBox="-140 -140 280 280" aria-hidden="true">
        <path ref={web} fill="none" stroke="currentColor" strokeWidth="0.65" />
        <g fill="none" stroke="currentColor" strokeWidth="0.45" opacity="0.28">
          <path d="M -8 10 L -36 40 M -8 10 L -10 44 M -8 10 L 18 40 M -8 10 L -42 18 M -8 10 L 28 18 M -24 26 Q -15 22 -9 29 Q 0 22 6 26 M -34 36 Q -20 30 -10 40 Q 4 30 15 36 M -28 14 Q -28 20 -24 26 M 12 14 Q 12 20 6 26" />
        </g>
      </svg>
      <svg ref={svg} className="light-spider-cursor" viewBox="-24 -24 48 48" aria-hidden="true">
        <g ref={body}>
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
          <ellipse cx="0" cy="6" rx="4.5" ry="6" fill="currentColor" />
          <path
            d="M 0 2 L 0 10 M -2.5 4 L 2.5 4 M -3 6 L 3 6 M -2 8 L 2 8"
            fill="none"
            stroke="#92908a"
            strokeWidth="0.5"
          />
          <ellipse cx="0" cy="-3" rx="2.8" ry="3.7" fill="currentColor" />
          <circle cx="-1" cy="-4.5" r="0.45" fill="#faf9f6" />
          <circle cx="1" cy="-4.5" r="0.45" fill="#faf9f6" />
        </g>
      </svg>
    </>
  );
}
