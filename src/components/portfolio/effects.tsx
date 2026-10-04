import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1200px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={() => ref.current && (ref.current.style.transform = "")}
      className={`transition-transform duration-500 ease-out will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/** Lightweight canvas network: nodes + links, reacts to the mouse. */
export function NetworkField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const N = mobile ? 28 : 64;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 2 - 1,
    }));
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const onMove = (e: MouseEvent) => { mouse.tx = e.clientX / window.innerWidth - 0.5; mouse.ty = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue("--primary").trim() || "oklch(0.82 0.12 75)";
    let t = 0;
    const draw = () => {
      t += reduce ? 0 : 0.0016;
      mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
      const ay = t + mouse.x * 0.8, ax = mouse.y * 0.6;
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
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const a = proj[i]!, b = proj[j]!;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < s * 0.42) {
          ctx.strokeStyle = `color-mix(in oklab, ${accent} ${Math.round((1 - dist / (s * 0.42)) * 28)}%, transparent)`;
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      for (const p of proj) {
        ctx.fillStyle = `color-mix(in oklab, ${accent} ${Math.round(40 + (1 - p.d) * 60)}%, transparent)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 + (1 - p.d) * 1.6, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, []);
  return <canvas ref={ref} aria-hidden className="h-full w-full" />;
}

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"dot" | "ring" | "view">("dot");
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("has-cursor");
    const move = (e: MouseEvent) => {
      if (dot.current) dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const el = e.target as HTMLElement;
      if (el.closest("[data-cursor=view]")) setMode("view");
      else if (el.closest("a, button, input, textarea")) setMode("ring");
      else setMode("dot");
    };
    window.addEventListener("mousemove", move);
    return () => { window.removeEventListener("mousemove", move); document.body.classList.remove("has-cursor"); };
  }, []);
  if (!enabled) return null;
  const size = mode === "dot" ? "h-2 w-2 bg-primary" : mode === "ring" ? "h-10 w-10 border border-primary/70" : "h-16 w-16 bg-primary text-primary-foreground";
  return (
    <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[100]" aria-hidden>
      <div className={`-translate-x-1/2 -translate-y-1/2 rounded-full grid place-items-center font-mono text-[10px] tracking-widest transition-all duration-300 ${size}`}>
        {mode === "view" && "VIEW"}
      </div>
    </div>
  );
}
