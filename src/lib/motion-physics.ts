export type SpringAxis = { position: number; velocity: number };

/** Substeps keep the same damped spring stable across variable display rates. */
export function stepSpring(axis: SpringAxis, target: number, elapsed: number): SpringAxis {
  let { position, velocity } = axis;
  let remaining = Math.min(Math.max(elapsed, 0), 0.05);
  while (remaining > 0) {
    const dt = Math.min(remaining, 1 / 120);
    velocity += ((target - position) * 180 - velocity * 24) * dt;
    position += velocity * dt;
    remaining -= dt;
  }
  return { position, velocity };
}
