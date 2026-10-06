import { useEffect, useId, useRef } from "react";
import "./alien.css";

type Axis = { position: number; velocity: number };
function spring(axis: Axis, target: number, elapsed: number, stiffness: number, damping: number) {
  let remaining = elapsed;
  while (remaining > 0) {
    const dt = Math.min(remaining, 1 / 240);
    axis.velocity += ((target - axis.position) * stiffness - axis.velocity * damping) * dt;
    axis.position += axis.velocity * dt;
    remaining -= dt;
  }
}

// Retains the Alien cursor slot, parent pointer tracking, and theme lifecycle.
export function AlienCursor() {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current!;
    const structure = svg.querySelector<SVGGElement>(".alien-structure")!;
    const core = svg.querySelector<SVGPathElement>(".alien-core")!;
    const gloss = svg.querySelector<SVGPathElement>(".symbiote-gloss")!;
    const ripple = svg.querySelector<SVGCircleElement>(".alien-pulse")!;
    const trail = svg.querySelector<SVGPathElement>(".alien-trail")!;
    const limbs = Array.from(svg.querySelectorAll<SVGPathElement>(".venom-limb"));
    const highlights = Array.from(svg.querySelectorAll<SVGPathElement>(".venom-highlight"));
    const shadows = Array.from(svg.querySelectorAll<SVGPathElement>(".venom-contact-shadow"));
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const joints = Array.from({ length: 8 }, () => ({
      x: { position: 0, velocity: 0 },
      y: { position: 0, velocity: 0 },
      ready: false,
    }));
    const rotation = { position: 0, velocity: 0 };
    const deformation = { position: 0, velocity: 0 };
    const alert = { position: 0, velocity: 0 };
    let gait = 0;
    let frame = 0,
      last = 0,
      active = false,
      visible = false;
    let x = 0,
      y = 0,
      previous: { x: number; y: number } | undefined;
    let dx = 0,
      dy = 0,
      vx = 0,
      vy = 0,
      heading = 0,
      hover = false;
    let reachX = 0,
      reachY = 0,
      pulse = -Infinity,
      hoverPulse = -Infinity;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = last = 0;
    };
    const reset = () => {
      stop();
      previous = undefined;
      dx = dy = vx = vy = 0;
      pulse = hoverPulse = -Infinity;
      hover = false;
      reachX = reachY = 0;
      for (const axis of [rotation, deformation, alert]) axis.position = axis.velocity = 0;
      heading = 0;
      joints.forEach((joint) => {
        joint.ready = false;
        joint.x.velocity = joint.y.velocity = 0;
      });
      trail.style.opacity = ripple.style.opacity = "0";
    };
    const tick = (now: number) => {
      if (!active || !visible || document.hidden) {
        stop();
        return;
      }
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const smoothing = 1 - Math.exp(-dt * (dx || dy ? 32 : 12));
      vx += (Math.max(-1800, Math.min(1800, dx / dt)) - vx) * smoothing;
      vy += (Math.max(-1800, Math.min(1800, dy / dt)) - vy) * smoothing;
      dx = dy = 0;
      const speed = Math.min(Math.hypot(vx, vy) / 850, 1);
      gait += dt * (0.35 + speed * 7);
      const turn = ((((heading - rotation.position) % 360) + 540) % 360) - 180;
      spring(rotation, rotation.position + turn, dt, 900, 52);
      spring(deformation, speed * 0.2, dt, 640, 42);
      spring(alert, hover ? 1 : 0, dt, 520, 34);
      const angle = (rotation.position * Math.PI) / 180,
        cos = Math.cos(angle),
        sin = Math.sin(angle);
      const localX = vx * cos + vy * sin,
        localY = -vx * sin + vy * cos;
      const age = (now - pulse) / 480;
      const burst = age >= 0 && age < 1 ? Math.sin(age * Math.PI) * (1 - age) : 0;
      const breath = Math.sin(now * 0.0019) * 0.012;
      // Pointer origin remains exact; only the small internal organism leans and deforms.
      structure.setAttribute(
        "transform",
        `rotate(${rotation.position.toFixed(3)}) scale(${(1 - deformation.position * 0.35 + alert.position * 0.05 + breath).toFixed(4)} ${(1 + deformation.position + alert.position * 0.05 + breath).toFixed(4)})`,
      );
      const points = Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        const r =
          5.2 +
          Math.sin(now * 0.0014 + i * 2.3) * 0.48 +
          Math.cos(i * 1.7) * 0.45 +
          alert.position * 0.3 +
          burst * 0.5;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      });
      const first = points[0]!,
        end = points[points.length - 1]!;
      let blob = `M ${(first.x + end.x) / 2} ${(first.y + end.y) / 2}`;
      points.forEach((point, i) => {
        const next = points[(i + 1) % points.length]!;
        blob += ` Q ${point.x} ${point.y} ${(point.x + next.x) / 2} ${(point.y + next.y) / 2}`;
      });
      core.setAttribute("d", blob + " Z");
      gloss.setAttribute("d", `M -3.8 -1.5 Q -4 -4 ${-1.1 + breath * 12} -4.2`);
      const localReachX = reachX * cos + reachY * sin,
        localReachY = -reachX * sin + reachY * cos;
      limbs.forEach((limb, i) => {
        const a = (i * Math.PI) / 4 + Math.sin(i * 1.8) * 0.13;
        // Long support phase, lifted forward reach, then a controlled plant.
        const phase = (gait / (Math.PI * 2) + (i % 4) * 0.5 + (i >= 4 ? 0.5 : 0) + i * 0.025) % 1;
        const planted = phase < 0.72;
        const u = planted ? phase / 0.72 : (phase - 0.72) / 0.28;
        const smooth = u * u * (3 - 2 * u);
        const step = (planted ? 1 - 2 * smooth : -1 + 2 * smooth) * speed * 9;
        const lift = planted ? 0 : Math.sin(Math.PI * u) ** 2 * speed * 5;
        const state = speed > 0.1 ? (planted ? "plant" : "swing") : "idle";
        if (limb.dataset["step"] !== state) limb.dataset["step"] = state;
        const length = 18 + (i % 3) * 3 + burst * 7 + alert.position * 2;
        const organic = Math.sin(now * (0.0014 + i * 0.00009) + i * 2.7) * 0.65;
        const targetX =
          Math.cos(a) * length - localX * (0.002 + i * 0.00015) + localReachX * alert.position * 2;
        const targetY =
          Math.sin(a) * length -
          localY * (0.0025 + i * 0.00018) +
          localReachY * alert.position * 2 +
          organic +
          step;
        const joint = joints[i]!;
        if (!joint.ready) {
          joint.x.position = targetX;
          joint.y.position = targetY;
          joint.ready = true;
        }
        spring(joint.x, targetX, dt, 700 + i * 85, 38 + i * 1.5);
        spring(joint.y, targetY, dt, 780 + i * 65, 40 + i * 1.3);
        const px = Math.max(-35, Math.min(35, joint.x.position)),
          py = Math.max(-35, Math.min(35, joint.y.position));
        const curl = Math.sin(now * 0.002 + i) * 1.2;
        const path = `M ${Math.cos(a) * 3.8} ${Math.sin(a) * 3.8} C ${px * 0.45 - Math.sin(a) * curl} ${py * 0.35 + Math.cos(a) * curl - lift} ${px * 0.85 + Math.sin(a) * 1.6} ${py * 0.7 - Math.cos(a) * 1.6 - lift * 0.6} ${px} ${py}`;
        limb.setAttribute("d", path);
        highlights[i]?.setAttribute("d", path);
        shadows[i]?.setAttribute("d", path);
        shadows[i]?.setAttribute("transform", `translate(1 ${(2 + lift * 0.4).toFixed(3)})`);
        shadows[i]?.setAttribute("opacity", (0.45 - lift * 0.04).toFixed(3));
      });
      const tailX = Math.max(-12, Math.min(12, -vx * 0.009)),
        tailY = Math.max(-12, Math.min(12, -vy * 0.009));
      trail.setAttribute(
        "d",
        `M0 0 Q${tailX * 0.4 + Math.sin(now * 0.005) * 0.6} ${tailY * 0.5} ${tailX} ${tailY}`,
      );
      trail.style.opacity = String(speed * 0.2);
      const rippleAge = (now - Math.max(pulse, hoverPulse)) / 500;
      ripple.setAttribute("r", String(6 + Math.max(0, Math.min(1, rippleAge)) * 10));
      ripple.style.opacity = String(rippleAge >= 0 && rippleAge < 1 ? (1 - rippleAge) * 0.24 : 0);
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (active && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      reset();
      active = document.documentElement.dataset["theme"] === "alien" && media.matches;
      start();
    };
    const move = (event: MouseEvent) => {
      if (!active) return;
      x = event.clientX;
      y = event.clientY;
      if (previous) {
        const mx = x - previous.x,
          my = y - previous.y;
        dx += mx;
        dy += my;
        if (Math.hypot(mx, my) > 0.5) heading = (Math.atan2(-mx, my) * 180) / Math.PI;
      }
      previous = { x, y };
      visible = true;
      const element =
        event.target instanceof Element
          ? event.target.closest(
              "a, button, input, textarea, select, [role=button], article, [data-cursor=view]",
            )
          : null;
      if (!!element !== hover && element) hoverPulse = performance.now();
      hover = !!element;
      if (element) {
        const rect = element.getBoundingClientRect();
        const rx = rect.left + rect.width / 2 - x,
          ry = rect.top + rect.height / 2 - y;
        const distance = Math.max(1, Math.hypot(rx, ry));
        reachX = rx / distance;
        reachY = ry / distance;
      } else reachX = reachY = 0;
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
      reset();
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
    <svg ref={ref} className="alien-cursor venom-cursor" viewBox="-48 -48 96 96" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-skin`} cx="28%" cy="20%" r="80%">
          <stop stopColor="#68777c" />
          <stop offset=".15" stopColor="#43565e" />
          <stop offset=".32" stopColor="#202a30" />
          <stop offset=".65" stopColor="#070c11" />
          <stop offset="1" stopColor="#020407" />
        </radialGradient>
        <linearGradient id={`${id}-limb`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#45545b" />
          <stop offset=".35" stopColor="#111b21" />
          <stop offset="1" stopColor="#03060a" />
        </linearGradient>
        <radialGradient id={`${id}-contact`}>
          <stop stopColor="#000" stopOpacity=".55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        className="alien-trail"
        fill="none"
        stroke="#0a1117"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        className="alien-pulse"
        r="6"
        fill="none"
        stroke="#4c5d61"
        strokeWidth=".45"
        opacity="0"
      />
      <g className="alien-structure" fill="none" strokeLinecap="round">
        <ellipse cx="1" cy="3" rx="9" ry="7" fill={`url(#${id}-contact)`} />
        <g stroke="#010306" strokeWidth="2.6">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} className="venom-contact-shadow" />
          ))}
        </g>
        <g stroke={`url(#${id}-limb)`} strokeWidth="1.8">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} className="venom-limb" />
          ))}
        </g>
        <g stroke="#94a9ac" strokeWidth=".25" opacity=".55" transform="translate(-.25 -.35)">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} className="venom-highlight" />
          ))}
        </g>
        <path
          className="alien-core"
          d="M-5 0 Q-4 -6 1 -5 T5 1 Q4 6 -1 5 T-5 0Z"
          fill={`url(#${id}-skin)`}
          stroke="#415158"
          strokeWidth=".35"
        />
        <path
          className="symbiote-gloss"
          d="M-3.8 -1.5 Q-4 -4 -1.1 -4.2"
          stroke="#a8b6b6"
          strokeWidth=".35"
          opacity=".65"
        />
      </g>
    </svg>
  );
}
