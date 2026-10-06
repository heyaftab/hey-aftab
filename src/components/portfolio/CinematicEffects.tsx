import { useEffect, useRef } from "react";

/** Scroll-driven scenery only: document scrolling and content positions stay native. */
export function CinematicScroll() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const shell = ref.current?.closest<HTMLElement>(".portfolio-shell");
    if (!shell) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scenes = Array.from(shell.querySelectorAll<HTMLElement>("main > section"));
    let frame = 0;
    const update = () => {
      frame = 0;
      for (const scene of scenes) {
        const rect = scene.getBoundingClientRect();
        if (media.matches) {
          scene.style.removeProperty("--scene-drift");
          scene.style.removeProperty("--scene-focus");
          continue;
        }
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) continue;
        const progress = Math.max(
          -1,
          Math.min(
            1,
            (rect.top + rect.height / 2 - window.innerHeight / 2) /
              (window.innerHeight + rect.height / 2),
          ),
        );
        scene.style.setProperty("--scene-drift", `${(progress * 42).toFixed(2)}px`);
        scene.style.setProperty("--scene-focus", String(1 - Math.abs(progress) * 0.5));
      }
    };
    const schedule = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(update);
    };
    const pulse = (event: MouseEvent) => {
      if (media.matches || !(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>(
        "button:not(:disabled), a.bg-primary, a.magnetic-button",
      );
      if (!target || !shell.contains(target)) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty(
        "--press-x",
        `${event.detail ? event.clientX - rect.left : rect.width / 2}px`,
      );
      target.style.setProperty(
        "--press-y",
        `${event.detail ? event.clientY - rect.top : rect.height / 2}px`,
      );
      target
        .getAnimations?.()
        .filter(
          (animation) =>
            "animationName" in animation && animation.animationName === "pressure-wave",
        )
        .forEach((animation) => {
          animation.currentTime = 0;
        });
      target.classList.add("press-feedback");
    };
    const endPulse = (event: AnimationEvent) => {
      if (event.animationName === "pressure-wave" && event.target instanceof Element)
        event.target.classList.remove("press-feedback");
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(shell);
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    shell.addEventListener("click", pulse);
    shell.addEventListener("animationend", endPulse);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      shell.removeEventListener("click", pulse);
      shell.removeEventListener("animationend", endPulse);
      scenes.forEach((scene) => {
        scene.style.removeProperty("--scene-drift");
        scene.style.removeProperty("--scene-focus");
      });
      shell.querySelectorAll<HTMLElement>(".press-feedback").forEach((el) => {
        el.classList.remove("press-feedback");
        el.style.removeProperty("--press-x");
        el.style.removeProperty("--press-y");
      });
    };
  }, []);
  return <div ref={ref} className="cinematic-arrival" aria-hidden="true" />;
}

export function SceneDetails() {
  return (
    <div className="scene-details" aria-hidden="true">
      <span className="scene-halo" />
      <span className="scene-horizon" />
      <span className="scene-crosshair" />
      <span className="scene-dust" />
    </div>
  );
}

const VERTEX_SHADER = `attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
const FRAGMENT_SHADER = `precision mediump float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform vec3 tint;
uniform float time;
uniform float travel;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 p = (uv - vec2(.73, .51)) * vec2(resolution.x / resolution.y, 1.0);
  p += pointer * .025;
  float radius = length(p);
  float angle = atan(p.y, p.x);
  float wave = sin(angle * 3.0 + radius * 16.0 - time * .24 + travel * .5);
  float ring = exp(-abs(radius - .285 - wave * .012) * 95.0);
  float inner = exp(-abs(radius - .23) * 65.0) * .28;
  float mist = exp(-radius * radius * 6.0) * (.38 + .1 * sin(angle * 2.0 + time * .12));
  float silk = sin(p.x * 8.0 + sin(p.y * 6.0 + time * .09) + time * .08);
  vec3 color = mix(tint, vec3(.3, .65, .85), .5 + .3 * silk);
  float alpha = clamp(ring * .26 + inner + mist * .22, 0.0, .36);
  gl_FragColor = vec4(color, alpha);
}`;

/** A small native shader, with CSS scenery as the fallback. No 3D framework. */
export function HeroLightField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (
      !canvas ||
      window.innerWidth < 900 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "low-power",
      premultipliedAlpha: false,
    });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      shaders.forEach((shader) => gl.deleteShader(shader));
      if (program) gl.deleteProgram(program);
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      shaders.forEach((shader) => gl.deleteShader(shader));
      return;
    }
    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      shaders.forEach((shader) => gl.deleteShader(shader));
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = {
      resolution: gl.getUniformLocation(program, "resolution"),
      pointer: gl.getUniformLocation(program, "pointer"),
      tint: gl.getUniformLocation(program, "tint"),
      time: gl.getUniformLocation(program, "time"),
      travel: gl.getUniformLocation(program, "travel"),
    };
    let frame = 0,
      visible = false,
      lost = false,
      last = 0,
      elapsed = 0,
      px = 0,
      py = 0,
      tx = 0,
      ty = 0;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const draw = (now: number) => {
      frame = 0;
      if (!visible || lost || document.hidden || media.matches || window.innerWidth < 900) {
        last = 0;
        return;
      }
      if (last && now - last < 33) {
        frame = requestAnimationFrame(draw);
        return;
      }
      elapsed += last ? Math.min((now - last) / 1000, 0.1) : 1 / 30;
      last = now;
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      gl.uniform2f(uniforms.pointer, px, py);
      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform1f(uniforms.travel, Math.min(window.scrollY / Math.max(canvas.clientHeight, 1), 2));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frame = requestAnimationFrame(draw);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (visible && !lost && !document.hidden && !media.matches && window.innerWidth >= 900)
        frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      sync();
    };
    const theme = () => {
      const light = document.documentElement.dataset["theme"];
      gl.uniform3f(
        uniforms.tint,
        ...((light === "ocean" || light === "spider"
          ? [0.2, 0.75, 0.78]
          : light === "light"
            ? [0.55, 0.32, 0.48]
            : [0.85, 0.55, 0.35]) as [number, number, number]),
      );
    };
    const move = (event: MouseEvent) => {
      tx = event.clientX / window.innerWidth - 0.5;
      ty = event.clientY / window.innerHeight - 0.5;
    };
    const leave = () => {
      tx = 0;
      ty = 0;
    };
    const contextLost = () => {
      lost = true;
      canvas.style.opacity = "0";
      sync();
    };
    const io = window.IntersectionObserver
      ? new IntersectionObserver(([entry]) => {
          visible = entry?.isIntersecting ?? false;
          sync();
        })
      : undefined;
    if (io) io.observe(canvas);
    else visible = true;
    const observer = window.ResizeObserver ? new ResizeObserver(resize) : undefined;
    observer?.observe(canvas);
    const themes = new MutationObserver(theme);
    themes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    resize();
    theme();
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("blur", leave);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", sync);
    document.documentElement.addEventListener("mouseleave", leave);
    media.addEventListener("change", sync);
    canvas.addEventListener("webglcontextlost", contextLost);
    return () => {
      cancelAnimationFrame(frame);
      io?.disconnect();
      observer?.disconnect();
      themes.disconnect();
      window.removeEventListener("mousemove", move);
      window.removeEventListener("blur", leave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", sync);
      document.documentElement.removeEventListener("mouseleave", leave);
      media.removeEventListener("change", sync);
      canvas.removeEventListener("webglcontextlost", contextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      shaders.forEach((shader) => gl.deleteShader(shader));
    };
  }, []);
  return <canvas ref={ref} className="hero-light-field" aria-hidden="true" />;
}
