import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Cursor } from "@/components/portfolio/effects";

let frames: Map<number, FrameRequestCallback>;
let nextId: number;
let eligible: boolean;

beforeEach(() => {
  frames = new Map();
  nextId = 0;
  eligible = true;
  vi.spyOn(window, "matchMedia").mockImplementation((media) => ({
    matches: eligible,
    media,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++nextId, callback);
    return nextId;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
});

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset["theme"];
  vi.restoreAllMocks();
});

async function theme(value: string) {
  await act(async () => {
    document.documentElement.dataset["theme"] = value;
  });
}

function tick(now: number) {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(now));
  });
}

describe("Light-theme spider cursor isolation", () => {
  it("runs a single Alien loop, responds to clicks, and restores other cursor states", async () => {
    await theme("alien");
    const { container, unmount } = render(<Cursor />);
    fireEvent.mouseMove(window, { clientX: 130, clientY: 110 });
    expect(frames.size).toBe(1);
    fireEvent.pointerDown(window);
    tick(performance.now() + 16);
    expect(
      Number((container.querySelector(".alien-pulse") as SVGElement).style.opacity),
    ).toBeGreaterThan(0);
    for (let i = 0; i < 5; i++) {
      await theme("ocean");
      expect(frames.size).toBe(0);
      await theme("light");
      expect(frames.size).toBe(1);
      await theme("alien");
      expect(frames.size).toBe(1);
    }
    expect(container.querySelectorAll(".alien-cursor")).toHaveLength(1);
    unmount();
    expect(frames.size).toBe(0);
  });
  it("turns and walks with movement, trails silk, and clears it when leaving light", async () => {
    await theme("light");
    const { container } = render(<Cursor />);
    const leg = container.querySelector(".spider-leg")!;
    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    tick(performance.now());
    const resting = leg.getAttribute("d");
    fireEvent.mouseMove(window, { clientX: 120, clientY: 110 });
    tick(performance.now() + 16);
    expect(leg.getAttribute("d")).not.toBe(resting);
    expect(container.querySelector(".light-spider-cursor > g")?.getAttribute("transform")).not.toBe(
      "rotate(0.00)",
    );
    const silk = container.querySelector(".light-spider-web > path")!;
    expect(silk.getAttribute("d")).toContain("L");
    tick(performance.now() + 1000);
    expect(silk.getAttribute("d")).toBe("");
    await theme("ocean");
    expect(silk.getAttribute("d")).toBe("");
    expect(frames.size).toBe(0);
  });
  it("animates only in light, retains pointer coordinates, and cleans up across repeated switches", async () => {
    await theme("night");
    const { container, unmount } = render(<Cursor />);
    fireEvent.mouseMove(window, { clientX: 210, clientY: 170 });
    const planet = container.querySelector<HTMLElement>(".planet-cursor")!;
    const originalOrbit = container.querySelector(".planet-orbit");
    expect(planet.style.transform).toBe("translate3d(210px, 170px, 0)");
    expect(frames.size).toBe(0);
    const leg = container.querySelector(".spider-leg")!;
    const initial = leg.getAttribute("d");
    for (let cycle = 0; cycle < 5; cycle++) {
      await theme("light");
      expect(frames.size).toBe(1);
      tick(100 + cycle * 100);
      expect(leg.getAttribute("d")).not.toBe(initial);
      expect(frames.size).toBe(1);
      for (const other of ["night", "ocean"]) {
        await theme(other);
        expect(frames.size).toBe(0);
        expect(container.querySelector(".planet-orbit")).toBe(originalOrbit);
        expect(planet.style.transform).toBe("translate3d(210px, 170px, 0)");
      }
    }
    expect(container.querySelectorAll(".light-spider-cursor")).toHaveLength(1);
    await theme("light");
    fireEvent.blur(window);
    expect(frames.size).toBe(0);
    expect(planet.style.opacity).toBe("0");
    fireEvent.mouseMove(window, { clientX: 240, clientY: 190 });
    expect(frames.size).toBe(1);
    unmount();
    expect(frames.size).toBe(0);
    expect(document.body).not.toHaveClass("has-cursor");
  });

  it.each(["night", "ocean", "light"])(
    "loads the appropriate animation state in %s",
    async (value) => {
      await theme(value);
      render(<Cursor />);
      fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
      expect(frames.size).toBe(value === "light" ? 1 : 0);
    },
  );

  it("leaves the native cursor available for touch or reduced motion", async () => {
    eligible = false;
    await theme("light");
    const { container } = render(<Cursor />);
    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    expect(container.querySelector(".planet-cursor")).toBeNull();
    expect(document.body).not.toHaveClass("has-cursor");
    expect(frames.size).toBe(0);
  });
});
