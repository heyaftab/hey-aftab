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
