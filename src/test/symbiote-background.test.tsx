import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SymbioteBackground } from "@/components/portfolio/SymbioteBackground";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("bends background branches with a single scheduled frame and cleans up on unmount", () => {
  vi.spyOn(window, "matchMedia").mockImplementation((media) => ({
    matches: media.includes("pointer: fine"),
    media,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  const pending = new Map<number, FrameRequestCallback>();
  let id = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    pending.set(++id, callback);
    return id;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((key) => {
    pending.delete(key);
  });
  const { container, unmount } = render(<SymbioteBackground />);
  fireEvent.pointerMove(window, { clientX: 200, clientY: 220 });
  fireEvent.pointerMove(window, { clientX: 230, clientY: 240 });
  expect(pending.size).toBe(1);
  act(() => {
    const callbacks = [...pending.values()];
    pending.clear();
    callbacks.forEach((callback) => callback(16));
  });
  expect(container.querySelector("[data-anchor]")?.getAttribute("transform")).toContain(
    "translate",
  );
  expect(container.querySelector(".symbiote-background")).toHaveAttribute("aria-hidden", "true");
  const advance = (now: number) =>
    act(() => {
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback(now));
    });
  const limb = container.querySelector(".symbiote-branch > path")!;
  const initialShape = limb.getAttribute("d");
  advance(1000);
  expect(limb.getAttribute("d")).not.toBe(initialShape);
  expect(pending.size).toBe(1);
  fireEvent.pointerDown(window, { clientX: 230, clientY: 240 });
  advance(1016);
  expect(
    Number((container.querySelector(".symbiote-ripple") as HTMLElement).style.opacity),
  ).toBeGreaterThan(0);
  expect((container.querySelector(".symbiote-dust i") as HTMLElement).style.transform).toContain(
    "translate3d",
  );
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  fireEvent(document, new Event("visibilitychange"));
  expect(pending.size).toBe(0);
  hidden.mockReturnValue(false);
  fireEvent(document, new Event("visibilitychange"));
  expect(pending.size).toBe(1);
  unmount();
  expect(pending.size).toBe(0);
});

it.each(["prefers-reduced-motion", "max-width"])("keeps the %s fallback static", (fallback) => {
  vi.spyOn(window, "matchMedia").mockImplementation((media) => ({
    matches: media.includes(fallback),
    media,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  const request = vi.spyOn(window, "requestAnimationFrame");
  render(<SymbioteBackground />);
  fireEvent.pointerMove(window, { clientX: 200, clientY: 220 });
  expect(request).not.toHaveBeenCalled();
});
