import { useEffect, useRef } from "react";
import "./light-background.css";

const PARALLAX_SPEED = 1;

// Mounted exclusively by LightSurvey while data-theme="light" is selected.
export function LightBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current!;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      if (media.matches || document.hidden) return;
      // Bound movement so long pages never expose a layer's edge.
      const scroll = Math.min(window.scrollY, 1800);
      layers.forEach((layer) => {
        layer.style.transform = `translate3d(0,${-scroll * Number(layer.dataset["depth"]) * PARALLAX_SPEED}px,0)`;
      });
    };
    const schedule = () => {
      if (!media.matches && !document.hidden && !frame) frame = requestAnimationFrame(update);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      root.classList.toggle("light-bg-paused", document.hidden);
      if (media.matches) layers.forEach((layer) => layer.style.removeProperty("transform"));
      else schedule();
    };
    sync();
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div ref={ref} className="bg-light" aria-hidden="true">
      <div className="light-bg-base" />
      <div className="light-bg-depth" data-depth=".02">
        <svg
          className="light-bg-horizon"
          viewBox="0 0 1400 700"
          preserveAspectRatio="xMidYMax slice"
        >
          <defs>
            <linearGradient id="light-monolith" x2="0" y2="1">
              <stop stopColor="#44655a" />
              <stop offset="1" stopColor="#8ba095" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-80 680 Q80 620 340 650 Q440 610 530 625 L560 240 Q615 130 660 205 L700 520 Q790 480 840 570 L880 340 Q930 265 968 360 L990 635 Q1150 600 1480 680Z"
            fill="url(#light-monolith)"
          />
          <g fill="none" stroke="#405b50" strokeWidth="3">
            {Array.from({ length: 16 }, (_, i) => (
              <path
                key={i}
                d={`M${565 + i * 6} ${250 + i * 3} Q${620 + i * 3} ${310 + i * 9} ${600 + i * 8} 670`}
              />
            ))}
            <path d="M878 375 Q934 450 935 660 M889 353 Q947 460 950 660 M900 342 Q961 465 967 660" />
          </g>
        </svg>
      </div>
      {[0.035, 0.05, 0.065].map((depth, i) => (
        <div key={depth} className="light-bg-depth" data-depth={depth}>
          <div className={`light-bg-mist light-bg-mist-${i}`} />
        </div>
      ))}
      <div className="light-bg-depth" data-depth=".08">
        <svg className="light-bg-veins" viewBox="0 0 1200 900" preserveAspectRatio="none">
          <g fill="none" stroke="currentColor" strokeWidth=".8">
            <path d="M0 100 Q100 140 120 300 T200 700 L260 900 M120 300 Q230 250 300 380 T380 650 M180 630 Q100 620 0 750 M1200 80 Q1100 180 1060 400 T990 900 M1060 400 Q940 380 860 520 T770 850 M1100 250 Q1190 330 1200 500" />
            <path d="M300 380 L360 320 L395 325 M860 520 L800 480 L775 510 M200 700 L290 740 L325 800" />
          </g>
          <g fill="currentColor" fontSize="10" fontFamily="monospace">
            <text x="400" y="330">
              ⌁ ⋮ ⊹
            </text>
            <text x="730" y="500">
              ⊹ ⌁
            </text>
            <text x="325" y="800">
              ⋮ / 07
            </text>
          </g>
        </svg>
      </div>
      <div className="light-bg-depth" data-depth=".025">
        <div className="light-bg-sun" />
        <div className="light-bg-shafts" />
      </div>
      <div className="light-bg-grain" />
      <div className="light-bg-vignette" />
    </div>
  );
}
