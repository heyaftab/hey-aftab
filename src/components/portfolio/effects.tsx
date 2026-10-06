import { useEffect, useRef, useState, type ReactNode } from "react";
import { stepSpring } from "@/lib/motion-physics";
import { LightSpiderCursor } from "./LightSpiderCursor";
import { AlienCursor } from "./AlienCursor";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const animation = useRef({
    frame: 0,
    last: 0,
    targetX: 0,
    targetY: 0,
    x: { position: 0, velocity: 0 },
    y: { position: 0, velocity: 0 },
  });
  const settle = () => {
    const state = animation.current;
    state.targetX = 0;
    state.targetY = 0;
    start();
  };
  const start = () => {
    if (
      document.hidden ||
      window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches
    )
      return;
    const state = animation.current;
    if (state.frame) return;
    state.last = 0;
    const tick = (now: number) => {
      const el = ref.current;
      if (!el) return;
      const dt = state.last ? (now - state.last) / 1000 : 1 / 60;
      state.last = now;
      state.x = stepSpring(state.x, state.targetX, dt);
      state.y = stepSpring(state.y, state.targetY, dt);
      el.style.transform = `perspective(1400px) rotateX(${state.x.position.toFixed(3)}deg) rotateY(${state.y.position.toFixed(3)}deg)`;
      if (
        Math.abs(state.x.position - state.targetX) +
          Math.abs(state.y.position - state.targetY) +
          Math.abs(state.x.velocity) +
          Math.abs(state.y.velocity) <
        0.015
      ) {
        state.frame = 0;
        if (!state.targetX && !state.targetY) el.style.transform = "";
      } else state.frame = requestAnimationFrame(tick);
    };
    state.frame = requestAnimationFrame(tick);
  };
  useEffect(() => {
    const state = animation.current;
    const media = window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)");
    const reset = () => {
      cancelAnimationFrame(state.frame);
      state.frame = 0;
      state.x = { position: 0, velocity: 0 };
      state.y = { position: 0, velocity: 0 };
      state.targetX = 0;
      state.targetY = 0;
      if (ref.current) ref.current.style.transform = "";
    };
    media.addEventListener("change", reset);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      reset();
      media.removeEventListener("change", reset);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, []);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--pointer-x", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--pointer-y", `${(y + 0.5) * 100}%`);
    animation.current.targetX = -y * 7;
    animation.current.targetY = x * 9;
    start();
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={settle}
      onBlur={settle}
      className={`tilt-surface spring-tilt transition-transform duration-500 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

export function Atmosphere() {
  const progress = useRef<HTMLDivElement>(null);
  const mesh = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const amount = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${amount})`;
      if (mesh.current) {
        mesh.current.style.setProperty("--mesh-hue", `${amount * 110}deg`);
        mesh.current.style.setProperty("--mesh-shift", `${amount * -18}%`);
      }
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return (
    <>
      <div ref={mesh} className="atmosphere" aria-hidden="true">
        <div className="gradient-mesh">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="noise-veil" />
      </div>
      <div ref={progress} className="reading-progress" aria-hidden="true" />
    </>
  );
}

export function HeroGeometry() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    let x = 0,
      y = 0;
    const update = () => {
      if (ref.current) {
        ref.current.style.setProperty("--object-x", `${-y * 35}deg`);
        ref.current.style.setProperty("--object-y", `${x * 50}deg`);
      }
      frame = 0;
    };
    const move = (event: MouseEvent) => {
      if (!media.matches) return;
      x = event.clientX / window.innerWidth - 0.5;
      y = event.clientY / window.innerHeight - 0.5;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const reset = () => {
      x = 0;
      y = 0;
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", reset);
    media.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", reset);
      media.removeEventListener("change", reset);
    };
  }, []);
  return (
    <div ref={ref} className="hero-geometry" aria-hidden="true">
      <div className="geometry-orbit">
        <span />
        <span />
        <span />
      </div>
      <div className="geometry-reactor">
        <div className="geometry-cube">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>
      <div className="galuxy-eclipse-sculpture" aria-hidden="true">
        <span className="galuxy-eclipse-planet" />
        <span className="galuxy-eclipse-orbit">
          <i />
        </span>
      </div>
      <span className="geometry-label">CREATIVE SYSTEMS / IN MOTION</span>
    </div>
  );
}

const MORPH_WORDS = ["AI Engineer", "Problem Solver", "Creative Builder", "Systems Thinker"];
export function MorphingText() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      // Keep the editorial light theme's role stable instead of remounting its text.
      if (document.documentElement.dataset["theme"] === "light") {
        setIndex(0);
      } else if (!media.matches)
        timer = setInterval(() => {
          if (!document.hidden) setIndex((value) => (value + 1) % MORPH_WORDS.length);
        }, 3400);
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    sync();
    media.addEventListener("change", sync);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      media.removeEventListener("change", sync);
    };
  }, []);
  return (
    <span className="morph-copy">
      <span className="sr-only">
        Aspiring AI engineer, problem solver, creative builder, and systems thinker.
      </span>
      <span
        key={index}
        aria-hidden="true"
        className="morph-word text-accent-gradient font-display font-semibold"
      >
        {MORPH_WORDS[index]}
      </span>
    </span>
  );
}

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    let x = 0,
      y = 0;
    const update = () => {
      if (ref.current) ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = 0;
    };
    const move = (event: MouseEvent) => {
      if (!media.matches || !ref.current) return;
      x = event.clientX;
      y = event.clientY;
      ref.current.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(update);
    };
    const hide = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    media.addEventListener("change", hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
      media.removeEventListener("change", hide);
    };
  }, []);
  return (
    <div ref={ref} className="cursor-glow" aria-hidden="true">
      <span />
    </div>
  );
}

const SIGNALS = ["INPUT", "LEARN", "BUILD", "OUTPUT"];
export function InteractiveIllustration() {
  const [active, setActive] = useState(1);
  return (
    <div className="signal-illustration">
      <div className={`signal-art signal-stage-${active}`} aria-hidden="true">
        <svg viewBox="0 0 320 140" fill="none">
          <path className="signal-path" d="M30 70 C80 0 110 140 160 70 S240 0 290 70" />
          <path
            className="signal-path signal-path-secondary"
            d="M30 70 C80 140 110 0 160 70 S240 140 290 70"
          />
          {[30, 115, 205, 290].map((x, i) => (
            <g key={x} className={active === i ? "signal-node active" : "signal-node"}>
              <circle cx={x} cy="70" r="12" />
              <circle cx={x} cy="70" r="4" />
            </g>
          ))}
        </svg>
        <div className="signal-core">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="signal-controls" role="group" aria-label="Explore the creative process">
        {SIGNALS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={active === i}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="signal-caption">
        {
          [
            "Every idea starts with a question.",
            "Connect ideas. Discover patterns.",
            "Turn experiments into working systems.",
            "Create something people can use.",
          ][active]
        }
      </p>
    </div>
  );
}

/** Lightweight canvas network: nodes + links, reacts to the mouse. */
export function NetworkField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = motion.matches;
    const mobile = window.innerWidth < 768;
    let lowPower = mobile || reduce;
    let visible = true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0,
      h = 0,
      raf = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const N = mobile ? 18 : 64;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1,
    }));
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, mobile ? 1.25 : 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = e.clientY / window.innerHeight - 0.5;
    };
    let accent = "";
    const readAccent = () => {
      accent =
        getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() ||
        "oklch(0.82 0.12 75)";
    };
    readAccent();
    let t = 0;
    const draw = () => {
      t += lowPower ? 0 : 0.0016;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const ay = t + mouse.x * 0.8,
        ax = mouse.y * 0.6;
      const s = Math.min(w, h) * 0.42;
      ctx.clearRect(0, 0, w, h);
      const proj = pts.map((p) => {
        const x1 = p.x * Math.cos(ay) - p.z * Math.sin(ay);
        const z1 = p.x * Math.sin(ay) + p.z * Math.cos(ay);
        const y1 = p.y * Math.cos(ax) - z1 * Math.sin(ax);
        const z2 = p.y * Math.sin(ax) + z1 * Math.cos(ax);
        const k = 2.2 / (2.2 + z2);
        return { x: w / 2 + x1 * s * k, y: h / 2 + y1 * s * k, d: (z2 + 1) / 2 };
      });
      for (let i = 0; i < N; i++)
        for (let j = i + 1; j < N; j++) {
          const a = proj[i]!,
            b = proj[j]!;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < s * 0.42) {
            ctx.strokeStyle = `color-mix(in oklab, ${accent} ${Math.round((1 - dist / (s * 0.42)) * 28)}%, transparent)`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      for (const p of proj) {
        ctx.fillStyle = `color-mix(in oklab, ${accent} ${Math.round(40 + (1 - p.d) * 60)}%, transparent)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2 + (1 - p.d) * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = lowPower || !visible || document.hidden ? 0 : requestAnimationFrame(draw);
    };
    const redraw = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (visible && !document.hidden) draw();
    };
    const syncMotion = () => {
      lowPower = window.innerWidth < 768 || motion.matches;
      window.removeEventListener("mousemove", onMove);
      if (!lowPower) window.addEventListener("mousemove", onMove, { passive: true });
      redraw();
    };
    const onResize = () => {
      resizeCanvas();
      syncMotion();
    };
    const themeObserver = new MutationObserver(() => {
      readAccent();
      redraw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const visibility = window.IntersectionObserver
      ? new IntersectionObserver(([entry]) => {
          visible = entry?.isIntersecting ?? false;
          redraw();
        })
      : null;
    visibility?.observe(canvas);
    document.addEventListener("visibilitychange", redraw);
    window.addEventListener("resize", onResize);
    if (!lowPower) window.addEventListener("mousemove", onMove, { passive: true });
    motion.addEventListener("change", syncMotion);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      visibility?.disconnect();
      document.removeEventListener("visibilitychange", redraw);
      motion.removeEventListener("change", syncMotion);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);
  return <canvas ref={ref} aria-hidden className="network-field h-full w-full" />;
}

/** Rotating typewriter that cycles through phrases. */
export function Typewriter({ phrases, className = "" }: { phrases: string[]; className?: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const usablePhrases = phrases.filter((phrase) => phrase.trim().length > 0);
    if (!usablePhrases.length) {
      setText("");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(usablePhrases[0] ?? "");
      return;
    }
    let phrase = 0,
      char = 0,
      deleting = false,
      timer = 0;
    const tick = () => {
      const current = usablePhrases[phrase] ?? "";
      char += deleting ? -1 : 1;
      setText(current.slice(0, char));
      let wait = deleting ? 32 : 62;
      if (!deleting && char === current.length) {
        wait = 1800;
        deleting = true;
      } else if (deleting && char === 0) {
        deleting = false;
        phrase = (phrase + 1) % usablePhrases.length;
        wait = 350;
      }
      timer = window.setTimeout(tick, wait);
    };
    timer = window.setTimeout(tick, 600);
    return () => window.clearTimeout(timer);
  }, [phrases]);
  return (
    <span className={className}>
      {text}
      <span className="type-caret" aria-hidden />
    </span>
  );
}

/** Counts up to `to` when scrolled into view. */
export function CountUp({
  to,
  suffix = "",
  duration = 1400,
  className = "",
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = duration <= 0 ? 1 : Math.min(1, (now - start) / duration);
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);
  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}

/** Thin progress bar showing scroll position through the page. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current)
        ref.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary via-accent to-primary"
    />
  );
}

export function Cursor() {
  const [spiderTheme, setSpiderTheme] = useState(false);
  useEffect(() => {
    const sync = () =>
      setSpiderTheme(["ocean", "alien"].includes(document.documentElement.dataset["theme"] ?? ""));
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    sync();
    return () => observer.disconnect();
  }, []);
  const dot = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"dot" | "ring" | "view">("dot");
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const hide = () => {
      if (dot.current) dot.current.style.opacity = "0";
      document.body.classList.remove("has-cursor");
    };
    const sync = () => {
      setEnabled(media.matches);
      hide();
    };
    const visibility = () => {
      if (document.hidden) hide();
    };
    sync();
    const move = (e: MouseEvent) => {
      if (!media.matches || !dot.current) return;
      document.body.classList.add("has-cursor");
      dot.current.style.opacity = "1";
      if (dot.current)
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest("a, button, input, textarea")) setMode("ring");
      else if (el?.closest("[data-cursor=view]")) setMode("view");
      else setMode("dot");
    };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", sync);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", sync);
      document.body.classList.remove("has-cursor");
    };
  }, []);
  if (!enabled) return null;
  const size =
    mode === "dot"
      ? "h-2 w-2 bg-primary"
      : mode === "ring"
        ? "h-10 w-10 border border-primary/70"
        : "h-16 w-16 bg-primary text-primary-foreground";
  return (
    <div
      ref={dot}
      className={`planet-cursor planet-mode-${mode} pointer-events-none fixed left-0 top-0 z-[100]`}
      style={{ opacity: 0 }}
      aria-hidden
    >
      <LightSpiderCursor />
      <AlienCursor />
      {!spiderTheme && (
        <>
          <span className="planet-orbit planet-orbit-one">
            <i />
          </span>
          <span className="planet-orbit planet-orbit-two">
            <i />
          </span>
          <div
            className={`-translate-x-1/2 -translate-y-1/2 rounded-full grid place-items-center font-mono text-[10px] tracking-widest transition-all duration-300 ${size}`}
          >
            {mode === "view" && "VIEW"}
          </div>
        </>
      )}
    </div>
  );
}
