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
    let travel = 0;
    let walking = 0;
    let idleBlend = 0;
    const joints = Array.from({ length: 8 }, () => ({
      kneeX: 0,
      kneeY: 0,
      ankleX: 0,
      ankleY: 0,
      footX: 0,
      footY: 0,
      initialized: false,
    }));
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
      const spiderTheme = document.documentElement.dataset["theme"] === "ocean";
      // Accumulate distance across pointer events so high-frequency mice still walk.
      const movement = Math.min(travel / Math.max(dt * 350, 1), 1);
      walking += (movement - walking) * (1 - Math.exp(-dt * 9));
      travel = 0;
      const speed = spiderTheme ? walking : Math.min(Math.hypot(dx, dy) / 18, 1);
      // Three quiet activities, separated by pauses, after 1.8 seconds at rest.
      const idleTime = Math.max(0, now - lastMove - 1800);
      const idleMode = Math.floor(idleTime / 6000) % 3;
      const idlePhase = (idleTime % 6000) / 6000;
      const idleEnvelope = idlePhase < 0.72 ? Math.sin((Math.PI * idlePhase) / 0.72) ** 2 : 0;
      idleBlend += ((spiderTheme && now - lastMove > 1800 ? 1 : 0) - idleBlend) * ease;
      const idle = idleEnvelope * idleBlend;
      element.dataset["idleActivity"] =
        idleBlend > 0.1 ? ["groom", "silk", "alert"][idleMode] : "walking";
      heading += (((((targetHeading - heading) % 360) + 540) % 360) - 180) * ease;
      const idleTurn = idleMode === 2 ? Math.sin(idleTime * 0.0014) * idle * 7 : 0;
      body.current?.setAttribute("transform", `rotate(${(heading + idleTurn).toFixed(2)})`);
      gait += dt * (spiderTheme ? 0.45 + speed * 12 : 2 + speed * 22);
      legs.forEach((leg, index) => {
        const side = index < 4 ? -1 : 1;
        const row = index % 4;
        if (spiderTheme) {
          // Longer planted stance, shorter lifted recovery; stagger pairs rather
          // than moving all four legs on one side together.
          const phase =
            (gait / (Math.PI * 2) + row * 0.5 + (side === 1 ? 0.5 : 0) + row * 0.035) % 1;
          const stance = 0.64;
          const u = phase < stance ? phase / stance : (phase - stance) / (1 - stance);
          const smooth = u * u * (3 - 2 * u);
          const stride = (phase < stance ? 1 - 2 * smooth : -1 + 2 * smooth) * speed * 4.5;
          const lift = phase < stance ? 0 : Math.sin(Math.PI * u) ** 2 * speed * 2.8;
          const breath = Math.sin(now * 0.0015 + row * 0.7) * 0.18;
          const hipX = side * 2.5,
            hipY = -3 + row * 2;
          let footX = side * (16.5 + spread * 1.5 - Math.abs(row - 1.5) - lift) + breath;
          let footY = -15 + row * 9.5 + stride;
          const gesture = Math.sin(idleTime * 0.003 + side * 0.8);
          if (idleMode === 0 && row === 0) {
            // Grooming: front feet fold inward and brush past the mouthparts.
            footX += side * (-9 + gesture) * idle;
            footY += (7 + gesture * 1.5) * idle;
          } else if (idleMode === 1 && row === 3) {
            // Silk testing: rear feet alternate tiny pulls at the spinneret.
            footX -= side * 5 * idle;
            footY += gesture * 2 * idle;
          } else if (idleMode === 2 && row < 2) {
            // Alert posture: feelers reach outward while the core quietly scans.
            footX += side * 2.5 * idle;
            footY -= (2 + gesture) * idle;
          }
          const ankleX = footX - side * 2.2,
            ankleY = footY - 2;
          // Solve two fixed-length segments to keep joints anatomically connected.
          const vx = ankleX - hipX,
            vy = ankleY - hipY;
          const reach = Math.min(20.9, Math.max(1, Math.hypot(vx, vy)));
          const direction = Math.atan2(vy, vx);
          const bend = Math.acos(
            Math.max(-1, Math.min(1, (11 * 11 + reach * reach - 10 * 10) / (2 * 11 * reach))),
          );
          const angle = direction - side * bend;
          const target = {
            kneeX: hipX + Math.cos(angle) * 11,
            kneeY: hipY + Math.sin(angle) * 11,
            ankleX,
            ankleY,
            footX,
            footY,
          };
          const joint = joints[index]!;
          const blend = joint.initialized ? 1 - Math.exp(-dt * 20) : 1;
          for (const key of ["kneeX", "kneeY", "ankleX", "ankleY", "footX", "footY"] as const)
            joint[key] += (target[key] - joint[key]) * blend;
          joint.initialized = true;
          leg.setAttribute(
            "d",
            `M ${hipX} ${hipY} L ${joint.kneeX.toFixed(3)} ${joint.kneeY.toFixed(3)} L ${joint.ankleX.toFixed(3)} ${joint.ankleY.toFixed(3)} L ${joint.footX.toFixed(3)} ${joint.footY.toFixed(3)}`,
          );
          return;
        }
        // Alternating groups lift and plant their feet, with three segments per leg.
        const phase = gait + row * Math.PI + (side === 1 ? Math.PI : 0);
        const stride = Math.sin(phase) * speed * (spiderTheme ? 5.5 : 3.8);
        const lift = Math.max(0, Math.cos(phase)) * speed * (spiderTheme ? 3 : 2);
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
        if (spiderTheme && points.length > 1) {
          const angle = (heading * Math.PI) / 180;
          const back = { x: -Math.sin(angle) * 11, y: Math.cos(angle) * 11 };
          points.push(back);
          thread = `M ${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`;
          for (let i = 1; i < points.length - 1; i++) {
            const point = points[i]!;
            const next = points[i + 1]!;
            thread += ` Q ${point.x.toFixed(2)} ${point.y.toFixed(2)} ${((point.x + next.x) / 2).toFixed(2)} ${((point.y + next.y) / 2).toFixed(2)}`;
          }
          thread += ` Q ${back.x.toFixed(2)} ${back.y.toFixed(2)} ${back.x.toFixed(2)} ${back.y.toFixed(2)}`;
        }
        // Keep the previous treatment outside Spider; its silk is a continuous curve.
        points.forEach((point, i) => {
          if (!spiderTheme && i % 3 === 0 && i > 0)
            thread += ` M ${point.x - 6} ${point.y - 4} L ${point.x} ${point.y} L ${point.x + 6} ${point.y + 4}`;
        });
        web.current.setAttribute("d", thread);
        web.current.style.opacity = String(Math.max(0, 1 - (now - lastMove) / 900));
        if (spiderTheme && idleMode === 1 && idle > 0.01) {
          const angle = (heading * Math.PI) / 180;
          const bx = -Math.sin(angle) * 11,
            by = Math.cos(angle) * 11;
          const endX = -Math.sin(angle) * (24 + idle * 10);
          const endY = Math.cos(angle) * (24 + idle * 10);
          web.current.setAttribute(
            "d",
            `M ${bx} ${by} Q ${(bx + endX) / 2 + Math.sin(idleTime * 0.002) * 2} ${(by + endY) / 2} ${endX} ${endY}`,
          );
          web.current.style.opacity = String(idle * 0.55);
        }
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
        if (active) travel += Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
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
      travel = walking = 0;
      idleBlend = 0;
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
        <path
          ref={web}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
