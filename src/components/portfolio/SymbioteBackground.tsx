import { useEffect, useId, useRef } from "react";
import "./symbiote-background.css";

// Mounted by the existing AlienCinema theme lifecycle; never owns UI or cursor state.
export function SymbioteBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const root = ref.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const mobile = window.matchMedia("(max-width: 767px)");
    const nerves = Array.from(root.querySelectorAll<SVGGElement>("[data-anchor]"));
    const ripple = root.querySelector<HTMLElement>(".symbiote-sense")!;
    const burst = root.querySelector<HTMLElement>(".symbiote-ripple")!;
    const dust = Array.from(root.querySelectorAll<HTMLElement>(".symbiote-dust i"));
    const joints = nerves.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const paths = nerves.map((nerve) =>
      Array.from(
        nerve.querySelectorAll<SVGPathElement>(
          ".symbiote-branch > path:not(.symbiote-growth):not(.symbiote-membrane)",
        ),
      ),
    );
    const growth = Array.from(root.querySelectorAll<SVGPathElement>(".symbiote-growth"));
    const membranes = Array.from(root.querySelectorAll<SVGPathElement>(".symbiote-membrane"));
    let time = 0,
      activity = 0,
      hover = false,
      pulse = -10;
    let width = window.innerWidth,
      height = window.innerHeight;
    let frame = 0,
      last = 0;
    let x = window.innerWidth / 2,
      y = window.innerHeight / 2,
      tx = x,
      ty = y;
    let strength = 0,
      targetStrength = 0;
    const draw = (now: number) => {
      frame = 0;
      if (reduced.matches || mobile.matches || document.hidden) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      time += dt;
      activity *= Math.exp(-dt * 2.5);
      const energy = Math.max(0, 1 - (time - pulse) / 1.4);
      const ease = 1 - Math.exp(-dt * 5);
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      strength +=
        (targetStrength * (0.18 + activity * 0.82 + (hover ? 0.35 : 0)) - strength) * ease;
      nerves.forEach((nerve, i) => {
        const ax = i % 2 ? 0.85 : 0.15,
          ay = 0.2 + Math.floor(i / 2) * 0.3;
        const dx = x / width - ax,
          dy = y / height - ay;
        const influence = Math.max(0, 1 - Math.hypot(dx, dy) / 0.55) * (strength + energy * 0.65);
        const joint = joints[i]!;
        // Damped inertia bends the control points rather than dragging a rigid image.
        const reachX = dx * influence * 95 + Math.sin(time * 0.19 + i * 1.7) * 5;
        const reachY = dy * influence * 65 + Math.cos(time * 0.13 + i * 2.1) * 7;
        joint.vx += ((reachX - joint.x) * 18 - joint.vx * 7) * dt;
        joint.vy += ((reachY - joint.y) * 18 - joint.vy * 7) * dt;
        joint.x += joint.vx * dt;
        joint.y += joint.vy * dt;
        const side = i % 2 ? -1 : 1;
        const edge = side === 1 ? -80 : 1280;
        const baseY = Math.floor(i / 2) * 300 - 80;
        const tipX = edge + side * (310 + Math.sin(time * 0.071 + i) * 35) + joint.x;
        const tipY = baseY + 510 + joint.y;
        const path = `M${edge} ${baseY} C${edge + side * 310} ${baseY + 150} ${edge + side * 65 + joint.x} ${baseY + 280 + joint.y} ${tipX} ${tipY} S${tipX - side * 110 + joint.x} ${tipY + 210} ${edge + side * 410} ${baseY + 900}`;
        paths[i]!.forEach((layer) => layer.setAttribute("d", path));
        membranes[i]!.setAttribute(
          "d",
          `M${edge} ${baseY} C${edge + side * 200} ${baseY + 90} ${tipX - side * 145} ${tipY - 160} ${tipX} ${tipY} Q${edge + side * 60 + joint.x * 0.3} ${tipY - 65} ${edge} ${baseY + 720} Z`,
        );
        growth[i]!.setAttribute(
          "d",
          `M${tipX} ${tipY} Q${tipX + side * 85 + joint.x} ${tipY - 40} ${tipX + side * 170} ${tipY + 90 + joint.y}`,
        );
        const growing =
          (Math.sin(time * (0.047 + i * 0.006) + i * 2.4) + Math.sin(time * 0.029 + i)) / 2;
        growth[i]!.style.strokeDashoffset = String(100 - Math.max(0, growing) * 85);
        growth[i]!.style.opacity = String(0.18 + influence * 0.3);
        nerve.setAttribute(
          "transform",
          `translate(${(joint.x * 0.08).toFixed(3)} ${(joint.y * 0.08).toFixed(3)})`,
        );
      });
      dust.forEach((particle, i) => {
        const px = (((i * 37.3) % 100) / 100) * width;
        const py = (((i * 19.7) % 100) / 100) * height;
        const dx = x - px,
          dy = y - py;
        const distance = Math.hypot(dx, dy);
        const sensing = Math.max(0, 1 - distance / 250) * (strength + energy);
        const direction = i % 3 === 0 ? 0.24 : -0.16;
        particle.style.transform = `translate3d(${Math.sin(time * 0.12 + i) * 12 + dx * sensing * direction}px,${Math.cos(time * 0.09 + i) * 18 + dy * sensing * direction}px,0)`;
      });
      ripple.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      ripple.style.opacity = String(strength * (hover ? 0.32 : 0.18));
      ripple.style.scale = String(1 + Math.sin(time * 2.2) * (hover ? 0.06 : 0.015));
      burst.style.opacity = String(energy * energy * 0.3);
      burst.style.scale = String(0.2 + (1 - energy) * 2.3);
      frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (!frame && !reduced.matches && !mobile.matches && !document.hidden)
        frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch" || reduced.matches || mobile.matches)
        return;
      tx = Number.isFinite(event.clientX) ? event.clientX : tx;
      ty = Number.isFinite(event.clientY) ? event.clientY : ty;
      activity = 1;
      targetStrength = 1;
      schedule();
    };
    const leave = () => {
      targetStrength = 0;
      hover = false;
      schedule();
    };
    const over = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch") return;
      hover =
        event.target instanceof Element &&
        !!event.target.closest("a,button,input,textarea,select,[role=button],[data-cursor=view]");
    };
    const click = (event: PointerEvent) => {
      if (
        !fine.matches ||
        reduced.matches ||
        mobile.matches ||
        document.hidden ||
        event.pointerType === "touch"
      )
        return;
      pulse = time;
      tx = Number.isFinite(event.clientX) ? event.clientX : tx;
      ty = Number.isFinite(event.clientY) ? event.clientY : ty;
      burst.style.transform = `translate3d(${tx}px,${ty}px,0)`;
      schedule();
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = last = 0;
      root.classList.toggle("symbiote-paused", document.hidden);
      if (reduced.matches || mobile.matches) {
        nerves.forEach((nerve) => nerve.removeAttribute("transform"));
        ripple.style.opacity = "0";
        burst.style.opacity = "0";
        dust.forEach((particle) => particle.style.removeProperty("transform"));
        strength = targetStrength = 0;
      } else schedule();
    };
    sync();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", click, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    mobile.addEventListener("change", sync);
    fine.addEventListener("change", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", click);
      window.removeEventListener("resize", resize);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      mobile.removeEventListener("change", sync);
      fine.removeEventListener("change", leave);
    };
  }, []);
  const tendrils = [
    "M-80 -40 C200 80 15 260 165 390 S85 670 250 940 M165 390 Q300 410 345 550 M120 230 Q245 240 280 130",
    "M1280 -40 C960 60 1220 240 1050 410 S1180 680 960 940 M1050 410 Q925 440 870 600 M1110 210 Q960 220 910 110",
    "M-80 310 C240 320 25 510 190 610 S200 800 350 940 M190 610 Q330 560 410 690",
    "M1280 300 C970 340 1190 560 1020 650 S1000 850 870 940 M1020 650 Q850 570 800 700",
    "M-80 710 Q140 610 270 800 T500 940 M270 800 Q400 760 430 650",
    "M1280 740 Q1080 610 940 800 T720 940 M940 800 Q800 740 790 640",
  ];
  return (
    <div ref={ref} className="symbiote-background" aria-hidden="true">
      <div className="symbiote-base" />
      <div className="symbiote-form symbiote-form-one" />
      <div className="symbiote-form symbiote-form-two" />
      <svg className="symbiote-nerves" viewBox="0 0 1200 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${id}-wet`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#253c40" stopOpacity=".45" />
            <stop offset=".45" stopColor="#070c10" />
            <stop offset=".7" stopColor="#526166" stopOpacity=".24" />
            <stop offset="1" stopColor="#0c1519" />
          </linearGradient>
        </defs>
        {tendrils.map((path, i) => (
          <g key={path} data-anchor={i}>
            <g className={`symbiote-branch symbiote-branch-${i % 3}`}>
              <path className="symbiote-membrane" d="M0 0" fill={`url(#${id}-wet)`} opacity=".16" />
              <path d={path} fill="none" stroke="#010406" strokeWidth="12" />
              <path d={path} fill="none" stroke={`url(#${id}-wet)`} strokeWidth="6" />
              <path
                d={path}
                fill="none"
                stroke="#8da0a0"
                strokeWidth=".65"
                opacity=".14"
                transform="translate(-1 -2)"
              />
              <path
                className="symbiote-growth"
                d="M0 0"
                fill="none"
                stroke={`url(#${id}-wet)`}
                strokeWidth="3"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset="100"
              />
            </g>
          </g>
        ))}
      </svg>
      <div className="symbiote-smoke" />
      <div className="symbiote-dust">
        {Array.from({ length: 128 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${(i * 37.3) % 100}%`,
              top: `${(i * 19.7) % 100}%`,
              animationDelay: `${-(i % 17) * 0.31}s`,
            }}
          />
        ))}
      </div>
      <div className="symbiote-sense" />
      <div className="symbiote-ripple" />
      <div className="symbiote-texture" />
      <div className="symbiote-vignette" />
      <div className="symbiote-venom-flash" />
    </div>
  );
}
