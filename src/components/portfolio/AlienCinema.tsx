import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./alien-cinema.css";
import { SymbioteBackground } from "./SymbioteBackground";
import { AlienIntro } from "./AlienIntro";

const SURVEY = { particleCount: 24 };

export function AlienCinema() {
  const [active, setActive] = useState(false);
  const visits = useRef(0);
  const wasActive = useRef(false);
  useEffect(() => {
    const sync = () => {
      const next = document.documentElement.dataset["theme"] === "alien";
      if (next && !wasActive.current) visits.current += 1;
      wasActive.current = next;
      setActive(next);
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    sync();
    return () => observer.disconnect();
  }, []);
  return active ? (
    <>
      <SymbioteBackground />
      <SurveyAtmosphere />
      <AlienIntro repeatVisit={visits.current > 1} />
    </>
  ) : null;
}

function SurveyAtmosphere() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!;
    const shell = el.closest<HTMLElement>(".portfolio-shell")!;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowPower = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let x = 0,
      y = 0,
      sx = 0,
      sy = 0,
      scroll = window.scrollY;
    const fog = Array.from(el.querySelectorAll<HTMLElement>(".survey-depth"));
    const spores = Array.from(el.querySelectorAll<HTMLElement>(".survey-spore"));
    const scenes = Array.from(shell.querySelectorAll<HTMLElement>("main > section"));
    // SCROLL REVEALS: add decorative state without altering content or focus order.
    const io = window.IntersectionObserver
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) entry.target.classList.add("survey-visible");
            });
          },
          { threshold: 0.08 },
        )
      : undefined;
    scenes.forEach((scene) => (io ? io.observe(scene) : scene.classList.add("survey-visible")));
    // ATMOSPHERE / PARTICLES: a single loop for all depth layers, capped particle count.
    const tick = (now: number) => {
      if (media.matches || lowPower.matches || document.hidden) {
        frame = 0;
        return;
      }
      sx += (x - sx) * 0.025;
      sy += (y - sy) * 0.025;
      fog.forEach((layer, i) => {
        const depth = i + 1;
        layer.style.transform = `translate3d(${sx * depth * 8}px, ${sy * depth * 5 - Math.min(scroll, 2000) * 0.006 * depth}px, 0)`;
      });
      spores.forEach((spore, i) => {
        spore.style.transform = `translate3d(${Math.sin(now / 12000 + i) * 16 + sx * 5}px, ${Math.cos(now / 18000 + i) * 22 + sy * 4}px, 0)`;
      });
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      el.classList.toggle("survey-paused", document.hidden || lowPower.matches);
      el.classList.remove("survey-interference");
      if (!media.matches && !lowPower.matches && !document.hidden) {
        frame = requestAnimationFrame(tick);
      } else {
        fog.forEach((layer) => layer.style.removeProperty("transform"));
        scenes.forEach((scene) => scene.classList.add("survey-visible"));
      }
    };
    const move = (event: MouseEvent) => {
      if (media.matches || lowPower.matches || !fine.matches) return;
      x = event.clientX / window.innerWidth - 0.5;
      y = event.clientY / window.innerHeight - 0.5;
      el.querySelector<HTMLElement>(".survey-torch")!.style.transform =
        `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const onScroll = () => {
      scroll = window.scrollY;
    };
    sync();
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", sync);
    lowPower.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      io?.disconnect();
      window.removeEventListener("mousemove", move);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", sync);
      lowPower.removeEventListener("change", sync);
      scenes.forEach((scene) => scene.classList.remove("survey-visible"));
    };
  }, []);

  return (
    <div ref={root} className="survey-cinema" aria-hidden="true">
      {/* BOOT SEQUENCE: decorative, never intercepts input. */}
      <div className="survey-boot" hidden>
        <span className="survey-heartbeat" />
        <span className="survey-classification">DEEP SPACE SURVEY // TRANSMISSION 07</span>
        <div className="survey-title">
          {"AFTAB UDDIN AHMAD".split("").map((letter, i) => (
            <span key={i} style={{ "--letter": i } as CSSProperties}>
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
        </div>
        <span className="survey-status">SIGNAL ACQUIRED // ARCHIVE OPEN</span>
      </div>
      <div className="survey-letterbox survey-letterbox-top" />
      <div className="survey-letterbox survey-letterbox-bottom" />
      {/* ATMOSPHERE */}
      <div className="survey-depth">
        <div className="survey-derelict" />
      </div>
      <div className="survey-depth">
        <div className="survey-fog survey-fog-one" />
      </div>
      <div className="survey-depth">
        <div className="survey-fog survey-fog-two" />
      </div>
      <div className="survey-torch" />
      <div className="survey-grain" />
      <div className="survey-vignette" />
      {/* VEINS: static linework; opacity supplies a slow biological pulse. */}
      <svg className="survey-veins" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <g fill="none" stroke="currentColor" strokeWidth=".7">
          <path d="M 18 0 Q 55 180 24 320 T 40 650 T 20 1000 M 982 0 Q 930 220 976 390 T 955 700 T 980 1000" />
          <path d="M 24 320 Q 70 345 85 420 M 40 650 Q 80 670 100 750 M 976 390 Q 925 410 910 490 M 955 700 Q 920 720 900 810" />
        </g>
      </svg>
      {/* PARTICLES */}
      <div className="survey-spores">
        {Array.from({ length: SURVEY.particleCount }, (_, i) => (
          <i
            key={i}
            className="survey-spore"
            style={{
              left: `${(i * 37.7) % 100}%`,
              top: `${(i * 23.3) % 100}%`,
              opacity: 0.08 + (i % 3) * 0.035,
              animationDelay: `${-(i % 13) * 0.27}s`,
            }}
          />
        ))}
      </div>
      <svg className="survey-wave" viewBox="0 0 400 50">
        <path
          d="M0 25 H40 L48 23 L56 27 H90 L96 17 L103 34 L110 25 H170 L178 4 L185 44 L192 25 H260 L268 19 L276 31 L284 25 H400"
          fill="none"
          stroke="currentColor"
          strokeWidth=".8"
        />
      </svg>
      <span className="survey-timecode">SURVEY 07 / REMOTE ARCHIVE / ⌁ ⋮ ⊹</span>
    </div>
  );
}
