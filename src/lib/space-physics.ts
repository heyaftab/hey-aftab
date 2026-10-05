export const SPACE_SECTORS: Record<string, { gravity: number; color: string; label: string }> = {
  home: { gravity: 1, color: "#e6ba7a", label: "SOLAR ORIGIN" },
  about: { gravity: .65, color: "#bc9aee", label: "VIOLET NEBULA" },
  skills: { gravity: .85, color: "#79d9df", label: "CYAN CONSTELLATION" },
  projects: { gravity: 1.35, color: "#e59ac3", label: "CREATIVE GRAVITY WELL" },
  achievements: { gravity: 1.15, color: "#e6ba7a", label: "GOLDEN SUPERNOVA" },
  mindset: { gravity: .55, color: "#a5b9e9", label: "DEEP SPACE" },
  journey: { gravity: .75, color: "#79d9df", label: "ORBITAL PASSAGE" },
  contact: { gravity: .45, color: "#bc9aee", label: "TRANSMISSION STATION" },
};

/** Bounded attraction: foreground bodies respond more than distant ones. */
export function gravityOffset(dx: number, dy: number, depth: number, gravity: number, radius = 230, limit = 22) {
  const distance = Math.hypot(dx, dy);
  if (distance >= radius || distance === 0) return { x: 0, y: 0, influence: 0 };
  const influence = Math.pow(1 - distance / radius, 2);
  const strength = Math.min(limit, influence * limit * Math.max(0, Math.min(1, depth)) * Math.max(0, gravity));
  return { x: dx / distance * strength, y: dy / distance * strength, influence };
}

export function wrapSpace(value: number, extent: number) {
  return extent > 0 ? ((value % extent) + extent) % extent : 0;
}
