import { useEffect, useRef } from "react";
import { gravityOffset, SPACE_SECTORS, wrapSpace } from "@/lib/space-physics";

export function SpaceGravity() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const shell = root.closest<HTMLElement>(".portfolio-shell");
    const ctx = canvas.getContext("2d");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pointer = { x: 0, y: 0, active: false };
    let frame = 0,
      width = 0,
      height = 0,
      lastTime = 0,
      time = 0,
      scroll = window.scrollY;
    let sector = SPACE_SECTORS["home"]!;
    let activeId = "";
    let zones: { id: string; top: number; bottom: number }[] = [];
    const targets = Array.from(
      shell?.querySelectorAll<HTMLElement>(
        ".magnetic-button, .signal-controls button, #skills button, #contact button[type=submit]",
      ) ?? [],
    );
    let targetRects: { el: HTMLElement; x: number; y: number; tx: number; ty: number }[] = [];
    const stars = Array.from({ length: window.innerWidth < 768 ? 42 : 110 }, () => ({
      x: Math.random(),
      y: Math.random(),
      depth: 0.15 + Math.random() * 0.85,
      phase: Math.random() * Math.PI * 2,
      ox: 0,
      oy: 0,
    }));
    const clearTargets = () => targets.forEach((el) => el.style.removeProperty("--gravity-offset"));
    const measure = () => {
      zones = Array.from(
        shell?.querySelectorAll<HTMLElement>("main section[data-space-sector]") ?? [],
      ).map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          id: el.dataset["spaceSector"] ?? "home",
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
        };
      });
      targetRects = targets.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          el,
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY + rect.height / 2,
          tx: 0,
          ty: 0,
        };
      });
    };
    const updateSector = () => {
      const position = scroll + window.innerHeight * 0.4;
      const id =
        zones.find((zone) => position >= zone.top && position < zone.bottom)?.id ??
        (activeId || "home");
      if (id === activeId) return;
      activeId = id;
      sector = SPACE_SECTORS[id] ?? SPACE_SECTORS["home"]!;
      shell?.style.setProperty("--space-color", sector.color);
      shell?.style.setProperty("--space-gravity", String(sector.gravity));
      root.dataset["sector"] = id;
      if (labelRef.current) labelRef.current.textContent = sector.label;
    };
    const draw = (now: number) => {
      frame = 0;
      if (!motion.matches && !document.hidden && width < 768 && lastTime && now - lastTime < 33) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const moving = !motion.matches && !document.hidden;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = now;
      if (moving) time += dt;
      const smoothing = 1 - Math.exp(-dt * 8);
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        const light = document.documentElement.dataset["theme"] === "light";
        const spider = ["ocean", "alien"].includes(document.documentElement.dataset["theme"] ?? "");
        for (const star of stars) {
          const x = star.x * width;
          const y = wrapSpace(
            star.y * height - (motion.matches ? 0 : scroll * star.depth * 0.24),
            height,
          );
          const force =
            pointer.active && moving && !spider
              ? gravityOffset(pointer.x - x, pointer.y - y, star.depth, sector.gravity)
              : { x: 0, y: 0, influence: 0 };
          const swirl = force.influence * star.depth * 8;
          star.ox +=
            (force.x + Math.sin(time * sector.gravity + star.phase) * swirl - star.ox) * smoothing;
          star.oy +=
            (force.y + Math.cos(time * sector.gravity + star.phase) * swirl - star.oy) * smoothing;
          ctx.globalAlpha =
            (light ? 0.25 : 0.2) +
            star.depth * 0.28 +
            (moving ? Math.sin(time * 0.6 + star.phase) * 0.06 : 0);
          ctx.fillStyle = star.depth > 0.7 ? sector.color : light ? "#637089" : "#b9c7dd";
          ctx.beginPath();
          ctx.arc(x + star.ox, y + star.oy, 0.5 + star.depth, 0, Math.PI * 2);
          ctx.fill();
        }
        if (pointer.active && moving && !spider) {
          for (let i = 0; i < 7; i++) {
            const depth = 0.35 + i / 11;
            const angle = time * sector.gravity * (1.8 - depth) + i * 2.4;
            const radius = 22 + i * 7;
            ctx.globalAlpha = 0.25 + depth * 0.25;
            ctx.fillStyle = sector.color;
            ctx.beginPath();
            ctx.arc(
              pointer.x + Math.cos(angle) * radius,
              pointer.y + Math.sin(angle) * radius * 0.65,
              1 + depth,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }
      for (const target of targetRects) {
        const force =
          pointer.active && moving && !target.el.matches(":focus-visible, :disabled")
            ? gravityOffset(
                pointer.x - target.x,
                pointer.y - (target.y - scroll),
                1,
                sector.gravity,
                155,
                5,
              )
            : { x: 0, y: 0 };
        target.tx += (force.x - target.tx) * smoothing;
        target.ty += (force.y - target.ty) * smoothing;
        if (moving) {
          const offset = `${target.tx.toFixed(2)}px ${target.ty.toFixed(2)}px`;
          if (target.el.style.getPropertyValue("--gravity-offset") !== offset)
            target.el.style.setProperty("--gravity-offset", offset);
        }
      }
      if (moving) frame = requestAnimationFrame(draw);
    };
    const requestDraw = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      measure();
      updateSector();
      requestDraw();
    };
    const onScroll = () => {
      scroll = window.scrollY;
      updateSector();
      requestDraw();
    };
    const move = (event: MouseEvent) => {
      if (!fine.matches || motion.matches) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      requestDraw();
    };
    const leave = () => {
      pointer.active = false;
      clearTargets();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      leave();
      if (motion.matches)
        stars.forEach((star) => {
          star.ox = 0;
          star.oy = 0;
        });
      if (!document.hidden) {
        draw(performance.now());
      }
    };
    const observer = new ResizeObserver(() => {
      measure();
      updateSector();
      requestDraw();
    });
    if (shell) observer.observe(shell);
    const themeObserver = new MutationObserver(requestDraw);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    resize();
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("mouseleave", leave);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      clearTargets();
      observer.disconnect();
      themeObserver.disconnect();
      shell?.style.removeProperty("--space-color");
      shell?.style.removeProperty("--space-gravity");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
    };
  }, []);
  return (
    <div ref={ref} className="space-gravity" aria-hidden="true">
      <canvas ref={canvasRef} className="space-starfield" />
      <div className="space-navigation">
        <span className="space-navigation-dot" />
        <span ref={labelRef}>SOLAR ORIGIN</span>
        <span className="space-navigation-line" />
      </div>
    </div>
  );
}
