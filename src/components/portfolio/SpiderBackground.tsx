import { useEffect, useRef, useState } from "react";
import "./spider-background.css";

// Keep the atmosphere and its listeners mounted exclusively in Spider.
export function SpiderBackground() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const sync = () => setActive(document.documentElement.dataset["theme"] === "ocean");
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    sync();
    return () => observer.disconnect();
  }, []);
  return active ? <WebAtmosphere /> : null;
}

function WebAtmosphere() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const layers = Array.from(element.querySelectorAll<HTMLElement>("[data-depth]"));
    let frame = 0,
      last = 0;
    let x = 0,
      y = 0,
      targetX = 0,
      targetY = 0,
      scroll = 0;
    const draw = (now: number) => {
      frame = 0;
      if (document.hidden || reduced.matches) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const blend = 1 - Math.exp(-dt * 3);
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      const targetScroll = Math.min(window.scrollY, 1600);
      scroll += (targetScroll - scroll) * blend;
      layers.forEach((layer) => {
        const depth = Number(layer.dataset["depth"]);
        layer.style.transform = `translate3d(${x * depth}px,${y * depth - scroll * depth * 0.025}px,0)`;
      });
      if (Math.abs(targetX - x) + Math.abs(targetY - y) + Math.abs(targetScroll - scroll) > 0.1)
        frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (!frame && !document.hidden && !reduced.matches) frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch" || reduced.matches) return;
      targetX = (event.clientX / window.innerWidth - 0.5) * 24;
      targetY = (event.clientY / window.innerHeight - 0.5) * 18;
      schedule();
    };
    const leave = () => {
      targetX = targetY = 0;
      schedule();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = last = 0;
      element.classList.toggle("spider-bg-paused", document.hidden);
      if (reduced.matches) {
        x = y = targetX = targetY = scroll = 0;
        layers.forEach((layer) => layer.style.removeProperty("transform"));
      } else schedule();
    };
    sync();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    fine.addEventListener("change", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      fine.removeEventListener("change", leave);
    };
  }, []);
  return (
    <div ref={root} className="spider-background" aria-hidden="true">
      <div className="spider-bg-bed" />
      {[0.4, 0.7, 1].map((depth, i) => (
        <div key={depth} className="spider-bg-layer" data-depth={depth}>
          <div className={`spider-bg-fog spider-bg-fog-${i}`} />
        </div>
      ))}
      {["left", "right"].map((side, index) => (
        <div key={side} className="spider-bg-layer" data-depth={index ? 1.2 : 0.8}>
          <svg className={`spider-bg-web spider-bg-web-${side}`} viewBox="0 0 440 800" fill="none">
            <g className="spider-bg-web-sway" stroke="currentColor" strokeWidth=".7">
              {Array.from({ length: 7 }, (_, i) => (
                <path
                  key={i}
                  d={`M-20 -30 Q${20 + i * 16} ${160 + i * 20} ${50 + i * 62} ${740 - i * 72}`}
                />
              ))}
              {Array.from({ length: 9 }, (_, i) => {
                const y = 65 + i * 66;
                return (
                  <path
                    key={i}
                    opacity={0.75 - i * 0.05}
                    d={`M${i * 5} ${y} Q${70 + i * 8} ${y + 65} ${125 + i * 19} ${y - 12} Q${170 + i * 14} ${y + 26} ${235 + i * 22} ${y - 58} Q${275 + i * 12} ${y - 20} ${310 + i * 13} ${y - 102}`}
                  />
                );
              })}
            </g>
          </svg>
        </div>
      ))}
      <div className="spider-bg-layer" data-depth="1.3">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className="spider-bg-filament"
            style={{ left: `${7 + i * 17}%`, animationDelay: `${-i * 7}s` }}
          />
        ))}
      </div>
      <div className="spider-bg-vignette" />
    </div>
  );
}
