import { describe, expect, it } from "vitest";
import { gravityOffset, SPACE_SECTORS, wrapSpace } from "@/lib/space-physics";

describe("Space gravity", () => {
  it("pulls nearby bodies toward the pointer and leaves distant bodies alone", () => {
    const nearby = gravityOffset(60, -30, 0.8, 1);
    expect(nearby.x).toBeGreaterThan(0);
    expect(nearby.y).toBeLessThan(0);
    expect(gravityOffset(300, 300, 1, 1)).toEqual({ x: 0, y: 0, influence: 0 });
    expect(gravityOffset(0, 0, 1, 1)).toEqual({ x: 0, y: 0, influence: 0 });
  });
  it("moves distant stars less and keeps UI movement bounded", () => {
    expect(gravityOffset(30, 0, 0.2, 1).x).toBeLessThan(gravityOffset(30, 0, 0.9, 1).x);
    const ui = gravityOffset(1, 1, 1, 100, 155, 5);
    expect(Math.hypot(ui.x, ui.y)).toBeLessThanOrEqual(5);
  });
  it("gives projects stronger gravity than the calm contact section", () => {
    expect(gravityOffset(50, 0, 1, SPACE_SECTORS["projects"]!.gravity).x).toBeGreaterThan(
      gravityOffset(50, 0, 1, SPACE_SECTORS["contact"]!.gravity).x,
    );
  });
  it("wraps stars during forward and backward travel without invalid positions", () => {
    expect(wrapSpace(-20, 600)).toBe(580);
    expect(wrapSpace(620, 600)).toBe(20);
    expect(wrapSpace(10, 0)).toBe(0);
  });
});
