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
      const ease = 1 - Math.exp(-dt * 5);
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      strength += (targetStrength - strength) * ease;
      nerves.forEach((nerve, i) => {
        const ax = i % 2 ? 0.85 : 0.15,
          ay = 0.2 + Math.floor(i / 2) * 0.3;
        const dx = x / window.innerWidth - ax,
          dy = y / window.innerHeight - ay;
        const influence = Math.max(0, 1 - Math.hypot(dx, dy) / 0.55) * strength;
        nerve.setAttribute(
          "transform",
          `translate(${(dx * influence * 14).toFixed(3)} ${(dy * influence * 10).toFixed(3)})`,
        );
      });
      ripple.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      ripple.style.opacity = String(strength * 0.12);
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(targetStrength - strength) > 0.02)
        frame = requestAnimationFrame(draw);
      else last = 0;
    };
    const schedule = () => {
      if (!frame && !reduced.matches && !mobile.matches && !document.hidden)
        frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch" || reduced.matches || mobile.matches)
        return;
      tx = event.clientX;
      ty = event.clientY;
      targetStrength = 1;
      schedule();
    };
    const leave = () => {
      targetStrength = 0;
      schedule();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = last = 0;
      root.classList.toggle("symbiote-paused", document.hidden);
      if (reduced.matches || mobile.matches) {
        nerves.forEach((nerve) => nerve.removeAttribute("transform"));
        ripple.style.opacity = "0";
        strength = targetStrength = 0;
      } else if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(targetStrength - strength) > 0.02)
        schedule();
    };
    sync();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    mobile.addEventListener("change", sync);
    fine.addEventListener("change", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
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
            </g>
          </g>
        ))}
      </svg>
      <div className="symbiote-smoke" />
      <div className="symbiote-dust">
        {Array.from({ length: 14 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${(i * 37.3) % 100}%`,
              top: `${(i * 19.7) % 100}%`,
              animationDelay: `${-i * 7}s`,
            }}
          />
        ))}
      </div>
      <div className="symbiote-sense" />
      <div className="symbiote-texture" />
      <div className="symbiote-vignette" />
    </div>
  );
}
