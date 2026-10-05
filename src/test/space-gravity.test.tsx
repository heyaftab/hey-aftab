import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SpaceGravity } from "@/components/portfolio/SpaceGravity";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setup(reduced = false) {
  vi.useFakeTimers();
  class Observer {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", Observer);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: query === "(prefers-reduced-motion: reduce)" ? reduced : true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) =>
    window.setTimeout(() => callback(performance.now()), 16),
  );
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => window.clearTimeout(id));
  return render(
    <div className="portfolio-shell">
      <SpaceGravity />
      <main>
        <section data-space-sector="projects">
          <button className="magnetic-button">Explore</button>
        </section>
      </main>
    </div>,
  );
}

describe("Space travel interactions", () => {
  it("attracts UI within a small range and releases it on unmount", () => {
    const { container, unmount } = setup();
    const button = container.querySelector("button")!;
    fireEvent.mouseMove(window, { clientX: 20, clientY: 15 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const [x, y] = button.style.getPropertyValue("--gravity-offset").split(" ").map(parseFloat);
    expect(x).toBeGreaterThan(0);
    expect(Math.hypot(x!, y!)).toBeLessThanOrEqual(5);
    unmount();
    expect(button.style.getPropertyValue("--gravity-offset")).toBe("");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps UI still and schedules no perpetual frames with reduced motion", () => {
    const { container } = setup(true);
    fireEvent.mouseMove(window, { clientX: 20, clientY: 15 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(container.querySelector("button")!.style.getPropertyValue("--gravity-offset")).toBe("");
    expect(vi.getTimerCount()).toBe(0);
  });
});
