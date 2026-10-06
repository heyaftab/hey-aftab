import { useEffect, useId, useRef, type CSSProperties } from "react";

// Matches the Spider-only SVG scale in styles.css.
const SPIDER_SCALE = 1.35;
const JOINT_AXES = ["kneeX", "kneeY", "ankleX", "ankleY", "footX", "footY"] as const;
// Mutating, bounded substeps avoid per-frame allocations and unstable springs.
function spring(
  axis: { position: number; velocity: number },
  target: number,
  dt: number,
  stiffness: number,
  damping: number,
) {
  let remaining = dt;
  while (remaining > 0) {
    const step = Math.min(remaining, 1 / 240);
    axis.velocity += ((target - axis.position) * stiffness - axis.velocity * damping) * step;
    axis.position += axis.velocity * step;
    remaining -= step;
  }
}

// The parent cursor owns pointer position, visibility, and native-cursor hiding.
// Light and Ocean glow share the articulated spider; other cursors stay independent.
export function LightSpiderCursor() {
  const depthId = useId();
  const svg = useRef<SVGSVGElement>(null);
  const web = useRef<SVGPathElement>(null);
  const body = useRef<SVGGElement>(null);
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const legs = Array.from(element.querySelectorAll<SVGPathElement>(".spider-leg"));
    const raisedJoints = Array.from(
      element.querySelectorAll<SVGCircleElement>(".spider-raised-joint"),
    );
    const legHighlights = Array.from(
      element.querySelectorAll<SVGPathElement>(".spider-leg-highlight"),
    );
    const legShadows = Array.from(element.querySelectorAll<SVGPathElement>(".spider-leg-shadow"));
    let frame = 0;
    let active = false;
    let visible = false;
    let previous: { x: number; y: number } | undefined;
    let dx = 0;
    let dy = 0;
    let hover = false;
    let spread = 0;
    let last = 0;
    let gait = 0;
    let heading = 0;
    let targetHeading = 0;
    let lastMove = 0;
    let travel = 0;
    let walking = 0;
    let idleBlend = 0;
    let pendingX = 0,
      pendingY = 0;
    let velocityX = 0,
      velocityY = 0;
    let previousTheme = "";
    const lean = { position: 0, velocity: 0 };
    const alert = { position: 0, velocity: 0 };
    const jointAxis = { position: 0, velocity: 0 };
    const joints = Array.from({ length: 8 }, () => ({
      kneeX: 0,
      kneeY: 0,
      ankleX: 0,
      ankleY: 0,
      footX: 0,
      footY: 0,
      initialized: false,
      velocities: Object.fromEntries(JOINT_AXES.map((key) => [key, 0])) as Record<
        (typeof JOINT_AXES)[number],
        number
      >,
      contactX: 0,
      contactY: 0,
      planted: false,
    }));
    const silk: { x: number; y: number; time: number }[] = [];
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const animate = (now: number) => {
      if (!active || !visible || document.hidden) {
        stop();
        return;
      }
      const dt = last ? Math.max(1 / 1000, Math.min((now - last) / 1000, 0.05)) : 1 / 60;
      last = now;
      const ease = 1 - Math.exp(-dt * 12);
      spread += ((hover ? 1 : 0) - spread) * ease;
      const spiderTheme = ["ocean", "spider"].includes(document.documentElement.dataset["theme"] ?? "");
      if (spiderTheme) {
        const blend = 1 - Math.exp(-dt * (travel > 0 ? 40 : 14));
        velocityX += (Math.max(-2200, Math.min(2200, pendingX / dt)) - velocityX) * blend;
        velocityY += (Math.max(-2200, Math.min(2200, pendingY / dt)) - velocityY) * blend;
        spring(alert, hover ? 1 : 0, dt, 520, 36);
      }
      pendingX = pendingY = 0;
      // Accumulate distance across pointer events so high-frequency mice still walk.
      const movement = Math.min(travel / Math.max(dt * 350, 1), 1);
      // Velocity bridges frames between mouse events instead of suppressing slow steps.
      const drive = spiderTheme
        ? Math.max(movement, Math.min(Math.hypot(velocityX, velocityY) / 500, 1))
        : movement;
      walking +=
        (drive - walking) * (1 - Math.exp(-dt * (spiderTheme ? (drive > walking ? 27 : 10) : 9)));
      travel = 0;
      const speed = spiderTheme ? walking : Math.min(Math.hypot(dx, dy) / 18, 1);
      // Three quiet activities, separated by pauses, after 1.8 seconds at rest.
      const idleTime = Math.max(0, now - lastMove - 1800);
      const idleMode = Math.floor(idleTime / 6000) % 3;
      const idlePhase = (idleTime % 6000) / 6000;
      const idleEnvelope = idlePhase < 0.72 ? Math.sin((Math.PI * idlePhase) / 0.72) ** 2 : 0;
      idleBlend += ((spiderTheme && now - lastMove > 1800 ? 1 : 0) - idleBlend) * ease;
      const idle = idleEnvelope * idleBlend;
      element.dataset["idleActivity"] =
        idleBlend > 0.1 ? ["groom", "silk", "alert"][idleMode] : "walking";
      // Spider reacts three times faster while retaining time-based smoothing.
      const turnEase = spiderTheme ? 1 - Math.exp(-dt * 36) : ease;
      heading += (((((targetHeading - heading) % 360) + 540) % 360) - 180) * turnEase;
      const idleTurn = idleMode === 2 ? Math.sin(idleTime * 0.0014) * idle * 7 : 0;
      if (spiderTheme) {
        const turn = ((targetHeading - heading + 540) % 360) - 180;
        spring(lean, Math.max(-4, Math.min(4, turn * speed * 0.12)), dt, 600, 40);
        const breathing = Math.sin(now * 0.0017) * 0.002 * (1 - speed);
        const stretch = speed * 0.025;
        const bodyLift =
          Math.sin(gait * 2) * speed * 0.45 + Math.sin(now * 0.0017) * (1 - speed) * 0.12;
        element.style.setProperty("--spider-body-lift", `${bodyLift.toFixed(3)}px`);
        body.current?.setAttribute(
          "transform",
          `rotate(${(heading + idleTurn).toFixed(2)}) skewX(${lean.position.toFixed(3)}) scale(${(1 - stretch * 0.35 + alert.position * 0.012 + breathing).toFixed(4)} ${(1 + stretch + alert.position * 0.012 + breathing).toFixed(4)})`,
        );
      } else body.current?.setAttribute("transform", `rotate(${(heading + idleTurn).toFixed(2)})`);
      gait += dt * (spiderTheme ? 0.7 + speed * 16 : 2 + speed * 22);
      legs.forEach((leg, index) => {
        const side = index < 4 ? -1 : 1;
        const row = index % 4;
        if (spiderTheme) {
          // Longer planted stance, shorter lifted recovery; stagger pairs rather
          // than moving all four legs on one side together.
          const phase =
            (gait / (Math.PI * 2) +
              row * 0.5 +
              (side === 1 ? 0.5 : 0) +
              row * 0.035 +
              Math.sin(now * 0.0007 + index * 1.9) * 0.012 * speed) %
            1;
          const stance = 0.74;
          const u = phase < stance ? phase / stance : (phase - stance) / (1 - stance);
          // A quicker reaching swing, then a brief hold before the foot bears weight.
          const reachPhase = phase >= stance ? Math.min(u / 0.82, 1) : u;
          const smooth = reachPhase ** 3 * (reachPhase * (reachPhase * 6 - 15) + 10);
          const activity = speed + (1 - speed) * 0.065;
          // Front-to-back support, then a lifted return toward the head.
          const swinging = phase >= stance;
          const stride = (swinging ? 1 - 2 * smooth : -1 + 2 * smooth) * activity * 8.5;
          const lift = swinging ? Math.sin(Math.PI * reachPhase) ** 2 * activity * 6.2 : 0;
          const stepState = speed > 0.12 ? (swinging ? "swing" : "plant") : "idle";
          if (leg.dataset["step"] !== stepState) leg.dataset["step"] = stepState;
          // Double the bend range without shortening the leg segments.
          const flex = Math.sin(phase * Math.PI * 2) * speed * 0.35;
          const breath = Math.sin(now * 0.0015 + row * 0.7) * 0.18;
          const hipX = side * 1.375,
            hipY = (-3 + row * 2) * 0.55;
          const restingX = [24, 31, 32, 25][row]!;
          const restingY = [-36, -15, 15, 36][row]!;
          let footX = side * (restingX + spread * 1.2 - lift) + breath;
          // Fan the resting feet apart; smoothly narrow the stance while walking.
          let footY = restingY + stride;
          const rotation = (heading * Math.PI) / 180;
          const cos = Math.cos(rotation),
            sin = Math.sin(rotation);
          // Small velocity anticipation in body coordinates; feet briefly trail a turn.
          footX += (velocityX * cos + velocityY * sin) * 0.0012;
          footY += (-velocityX * sin + velocityY * cos) * 0.0012;
          footX += side * alert.position * 0.5;
          footY += Math.sin(now * 0.0011 + index * 2.4) * 0.12 * (1 - speed);
          const gesture = Math.sin(idleTime * 0.003 + side * 0.8);
          if (idleMode === 0 && row === 0) {
            // Grooming: front feet fold inward and brush past the mouthparts.
            footX += side * (-9 + gesture) * idle;
            footY += (7 + gesture * 1.5) * idle;
          } else if (idleMode === 1 && row === 3) {
            // Silk testing: rear feet alternate tiny pulls at the spinneret.
            footX -= side * 5 * idle;
            footY += gesture * 2 * idle;
          } else if (idleMode === 2 && row < 2) {
            // Alert posture: feelers reach outward while the core quietly scans.
            footX += side * 2.5 * idle;
            footY -= (2 + gesture) * idle;
          }
          const joint = joints[index]!;
          if (previous && speed > 0.12 && phase < stance && idle < 0.01) {
            const worldX = previous.x + (footX * cos - footY * sin) * SPIDER_SCALE;
            const worldY = previous.y + (footX * sin + footY * cos) * SPIDER_SCALE;
            if (
              !joint.planted ||
              Math.hypot(worldX - joint.contactX, worldY - joint.contactY) > 12
            ) {
              joint.contactX = worldX;
              joint.contactY = worldY;
            }
            joint.planted = true;
            const cx = joint.contactX - previous.x,
              cy = joint.contactY - previous.y;
            // Limit contact lag so feet never cross the body or another leg lane.
            footX += Math.max(-2.5, Math.min(2.5, (cx * cos + cy * sin) / SPIDER_SCALE - footX));
            footY += Math.max(-2.5, Math.min(2.5, (-cx * sin + cy * cos) / SPIDER_SCALE - footY));
          } else joint.planted = false;
          // Keep planted-foot inertia inside the existing cursor viewport.
          footX = Math.max(-53, Math.min(53, footX));
          footY = Math.max(-53, Math.min(53, footY));
          const ankleX = footX - side * (2.6 + lift * 0.25),
            ankleY = footY - 2.4 - lift * 0.45;
          // Four distinct anatomical fans on each side. Knees stay outside
          // the thorax instead of the IK solution folding across its center.
          const kneeX = side * ([14, 20, 21, 15][row]! + spread * 0.7 - lift * 0.65);
          const kneeY = [-20, -9, 9, 21][row]! + stride * 0.3 - lift * 0.35;
          const target = {
            kneeX,
            kneeY,
            ankleX,
            ankleY,
            footX,
            footY,
          };
          // Independent, slightly underdamped joints: responsive without jitter.
          for (const key of JOINT_AXES) {
            if (!joint.initialized) {
              joint[key] = target[key];
              continue;
            }
            jointAxis.position = joint[key];
            jointAxis.velocity = joint.velocities[key];
            spring(jointAxis, target[key], dt, 1500 + speed * 900 + index * 18, 68 + index * 0.6);
            joint[key] = jointAxis.position;
            joint.velocities[key] = jointAxis.velocity;
          }
          joint.initialized = true;
          raisedJoints[index]?.setAttribute("cx", joint.kneeX.toFixed(3));
          raisedJoints[index]?.setAttribute("cy", joint.kneeY.toFixed(3));
          leg.setAttribute(
            "d",
            `M ${hipX} ${hipY} Q ${((hipX + joint.kneeX) / 2 + side * (1.4 + flex * 0.7)).toFixed(3)} ${((hipY + joint.kneeY) / 2).toFixed(3)} ${joint.kneeX.toFixed(3)} ${joint.kneeY.toFixed(3)} Q ${((joint.kneeX + joint.ankleX) / 2 + side * (1.8 - flex * 0.9)).toFixed(3)} ${((joint.kneeY + joint.ankleY) / 2).toFixed(3)} ${joint.ankleX.toFixed(3)} ${joint.ankleY.toFixed(3)} L ${joint.footX.toFixed(3)} ${joint.footY.toFixed(3)}`,
          );
          const path = leg.getAttribute("d")!;
          legHighlights[index]?.setAttribute("d", path);
          legShadows[index]?.setAttribute("d", path);
          legShadows[index]?.setAttribute(
            "transform",
            `translate(${(lift * 0.15).toFixed(3)} ${(lift * 0.3).toFixed(3)})`,
          );
          legShadows[index]?.setAttribute("opacity", (1 - lift * 0.1).toFixed(3));
          raisedJoints[index]?.setAttribute("r", (0.72 + lift * 0.08).toFixed(3));
          return;
        }
        // Alternating groups lift and plant their feet, with three segments per leg.
        const phase = gait + row * Math.PI + (side === 1 ? Math.PI : 0);
        const stride = Math.sin(phase) * speed * (spiderTheme ? 5.5 : 3.8);
        const lift = Math.max(0, Math.cos(phase)) * speed * (spiderTheme ? 3 : 2);
        const breath = Math.sin(now * 0.002 + row) * 0.3;
        const hipY = -3 + row * 2;
        const kneeX = side * (9 + spread * 1.5 + breath);
        const kneeY = -12 + row * 7 - dy * 0.06;
        const footX = side * (17 + spread * 2 - Math.abs(row - 1.5)) - dx * 0.1;
        const footY = -16 + row * 10 + breath * side + stride;
        const ankleX = footX - side * (3 + lift);
        const ankleY = footY - 3;
        leg.setAttribute(
          "d",
          `M ${side * 2.5} ${hipY} L ${kneeX} ${kneeY} L ${ankleX} ${ankleY} L ${footX} ${footY}`,
        );
      });
      while (silk.length && now - silk[0]!.time > 900) silk.shift();
      if (web.current && previous) {
        const points = silk.map((point) => ({
          x: point.x - previous!.x,
          y: point.y - previous!.y,
        }));
        let thread = points.map((point, i) => `${i ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
        if (spiderTheme && points.length > 1) {
          const angle = (heading * Math.PI) / 180;
          const back = {
            x: -Math.sin(angle) * 6.05 * SPIDER_SCALE,
            y: Math.cos(angle) * 6.05 * SPIDER_SCALE,
          };
          points.push(back);
          thread = `M ${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`;
          for (let i = 1; i < points.length - 1; i++) {
            const point = points[i]!;
            const next = points[i + 1]!;
            thread += ` Q ${point.x.toFixed(2)} ${point.y.toFixed(2)} ${((point.x + next.x) / 2).toFixed(2)} ${((point.y + next.y) / 2).toFixed(2)}`;
          }
          thread += ` Q ${back.x.toFixed(2)} ${back.y.toFixed(2)} ${back.x.toFixed(2)} ${back.y.toFixed(2)}`;
        }
        // Keep the previous treatment outside Spider; its silk is a continuous curve.
        points.forEach((point, i) => {
          if (!spiderTheme && i % 3 === 0 && i > 0)
            thread += ` M ${point.x - 6} ${point.y - 4} L ${point.x} ${point.y} L ${point.x + 6} ${point.y + 4}`;
        });
        web.current.setAttribute("d", thread);
        web.current.style.opacity = String(Math.max(0, 1 - (now - lastMove) / 900));
        if (spiderTheme && idleMode === 1 && idle > 0.01) {
          const angle = (heading * Math.PI) / 180;
          const bx = -Math.sin(angle) * 6.05 * SPIDER_SCALE,
            by = Math.cos(angle) * 6.05 * SPIDER_SCALE;
          const endX = -Math.sin(angle) * (24 + idle * 10);
          const endY = Math.cos(angle) * (24 + idle * 10);
          web.current.setAttribute(
            "d",
            `M ${bx} ${by} Q ${(bx + endX) / 2 + Math.sin(idleTime * 0.002) * 2} ${(by + endY) / 2} ${endX} ${endY}`,
          );
          web.current.style.opacity = String(idle * 0.55);
        }
      }
      dx *= Math.exp(-dt * 10);
      dy *= Math.exp(-dt * 10);
      frame = requestAnimationFrame(animate);
    };
    const start = () => {
      if (active && visible && !document.hidden && !frame) frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      const theme = document.documentElement.dataset["theme"] ?? "";
      if (theme !== previousTheme) {
        element.style.removeProperty("--spider-body-lift");
        pendingX = pendingY = velocityX = velocityY = 0;
        lean.position = lean.velocity = alert.position = alert.velocity = 0;
        joints.forEach((joint) => {
          joint.initialized = joint.planted = false;
          JOINT_AXES.forEach((key) => {
            joint.velocities[key] = 0;
          });
        });
        previousTheme = theme;
      }
      element.setAttribute(
        "viewBox",
        ["ocean", "spider"].includes(document.documentElement.dataset["theme"] ?? "") ? "-60 -60 120 120" : "-24 -24 48 48",
      );
      active =
        ["light", "ocean", "spider"].includes(document.documentElement.dataset["theme"] ?? "") &&
        media.matches;
      if (active) start();
      else {
        stop();
        silk.length = 0;
        web.current?.setAttribute("d", "");
      }
    };
    const move = (event: MouseEvent) => {
      if (previous) {
        if (active && ["ocean", "spider"].includes(document.documentElement.dataset["theme"] ?? "")) {
          pendingX += event.clientX - previous.x;
          pendingY += event.clientY - previous.y;
        }
        if (active) travel += Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
        dx = Math.max(-24, Math.min(24, event.clientX - previous.x));
        dy = Math.max(-24, Math.min(24, event.clientY - previous.y));
        if (Math.hypot(dx, dy) > 0.5) targetHeading = (Math.atan2(dx, -dy) * 180) / Math.PI;
      }
      previous = { x: event.clientX, y: event.clientY };
      lastMove = performance.now();
      if (active) {
        const tail = silk[silk.length - 1];
        if (!tail || Math.hypot(tail.x - event.clientX, tail.y - event.clientY) > 5) {
          silk.push({ x: event.clientX, y: event.clientY, time: lastMove });
          if (silk.length > 20) silk.shift();
        }
      }
      visible = true;
      hover =
        event.target instanceof Element &&
        !!event.target.closest(
          "a, button, input, textarea, select, [role=button], [data-cursor=view]",
        );
      start();
    };
    const hide = () => {
      visible = false;
      previous = undefined;
      dx = dy = 0;
      travel = walking = 0;
      pendingX = pendingY = velocityX = velocityY = 0;
      lean.position = lean.velocity = alert.position = alert.velocity = 0;
      joints.forEach((joint) => {
        joint.initialized = joint.planted = false;
        JOINT_AXES.forEach((key) => {
          joint.velocities[key] = 0;
        });
      });
      idleBlend = 0;
      silk.length = 0;
      web.current?.setAttribute("d", "");
      stop();
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    sync();
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    document.addEventListener("visibilitychange", hide);
    media.addEventListener("change", sync);
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("mousemove", move);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.removeEventListener("visibilitychange", hide);
      media.removeEventListener("change", sync);
    };
  }, []);

  return (
    <>
      <svg className="light-spider-web" viewBox="-140 -140 280 280" aria-hidden="true">
        <path
          ref={web}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g fill="none" stroke="currentColor" strokeWidth="0.45" opacity="0.28">
          <path d="M -8 10 L -36 40 M -8 10 L -10 44 M -8 10 L 18 40 M -8 10 L -42 18 M -8 10 L 28 18 M -24 26 Q -15 22 -9 29 Q 0 22 6 26 M -34 36 Q -20 30 -10 40 Q 4 30 15 36 M -28 14 Q -28 20 -24 26 M 12 14 Q 12 20 6 26" />
        </g>
      </svg>
      <svg
        ref={svg}
        className="light-spider-cursor"
        viewBox="-24 -24 48 48"
        aria-hidden="true"
        style={
          {
            "--spider-shell-material": `url(#${depthId}-shell)`,
            "--spider-limb-material": `url(#${depthId}-limb)`,
          } as CSSProperties
        }
      >
        <defs>
          <radialGradient id={`${depthId}-shell`} cx="30%" cy="23%" r="80%">
            <stop offset="0" stopColor="#d0e5df" />
            <stop offset=".26" stopColor="#799f98" />
            <stop offset=".65" stopColor="#294f4b" />
            <stop offset="1" stopColor="#0a201f" />
          </radialGradient>
          <linearGradient id={`${depthId}-limb`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#d3e9df" />
            <stop offset=".4" stopColor="#6c9b93" />
            <stop offset="1" stopColor="#21413d" />
          </linearGradient>
          <radialGradient id={`${depthId}-shadow`}>
            <stop stopColor="#020a0a" stopOpacity=".65" />
            <stop offset="1" stopColor="#020a0a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g ref={body}>
          <ellipse
            className="spider-depth"
            cx="1.5"
            cy="4"
            rx="17"
            ry="25"
            fill={`url(#${depthId}-shadow)`}
          />
          <g
            className="spider-depth"
            fill="none"
            stroke="#020b0b"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity=".45"
            transform="translate(1.2 2)"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <path key={index} className="spider-leg-shadow" />
            ))}
          </g>
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {Array.from({ length: 8 }, (_, index) => {
              const side = index < 4 ? -1 : 1;
              const row = index % 4;
              return (
                <path
                  key={index}
                  id={`${depthId}-leg-${index}`}
                  className="spider-leg"
                  style={{ stroke: `var(--spider-limb-fill, currentColor)` }}
                  d={`M ${side * 2.5} ${-3 + row * 2} L ${side * 9} ${-12 + row * 7} L ${side * 16} ${-16 + row * 10}`}
                />
              );
            })}
            <g className="spider-anatomy">
              <path d="M 0 -5 L 0 10 M -2 2 Q -6 4 -3 8 L 0 11 L 3 8 Q 6 4 2 2 M -3 4 L 3 4 M -3 7 L 3 7" />
              <path d="M -1 -6 L -3 -9 M 1 -6 L 3 -9" />
            </g>
          </g>
          <g
            className="spider-depth"
            fill="none"
            stroke="#d8ede5"
            strokeWidth=".2"
            opacity=".65"
            transform="translate(-.18 -.25)"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <path key={index} className="spider-leg-highlight" />
            ))}
          </g>
          <g className="spider-depth" fill={`url(#${depthId}-shell)`}>
            {Array.from({ length: 8 }, (_, index) => (
              <circle key={index} className="spider-raised-joint" r=".72" />
            ))}
          </g>
          <g className="spider-anatomy">
            <ellipse
              cx="0"
              cy="6"
              rx="4.5"
              ry="6"
              fill="currentColor"
              style={{ fill: `var(--spider-shell-fill, currentColor)` }}
            />
            <path
              d="M 0 2 L 0 10 M -2.5 4 L 2.5 4 M -3 6 L 3 6 M -2 8 L 2 8"
              fill="none"
              stroke="#92908a"
              strokeWidth="0.5"
            />
            <ellipse
              cx="0"
              cy="-3"
              rx="2.8"
              ry="3.7"
              fill="currentColor"
              style={{ fill: `var(--spider-shell-fill, currentColor)` }}
            />
            <path
              className="spider-depth"
              d="M-2.8 7 Q-4 2 -1.4 1.5 M-1.7 -2 Q-2.4 -5 -.8 -5.5"
              fill="none"
              stroke="#def0e7"
              strokeWidth=".55"
              opacity=".7"
            />
            <path
              className="spider-depth"
              d="M-3 3 Q0 1 3 3 M-3.5 5 Q0 3 3.5 5 M-3.5 7 Q0 5 3.5 7 M-2.5 9 Q0 7 2.5 9"
              fill="none"
              stroke="#9ac5b7"
              strokeWidth=".35"
              opacity=".45"
            />
            <circle cx="-1" cy="-4.5" r="0.45" fill="#faf9f6" />
            <circle cx="1" cy="-4.5" r="0.45" fill="#faf9f6" />
          </g>
        </g>
      </svg>
    </>
  );
}
