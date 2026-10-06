import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CinematicScroll, HeroLightField } from "@/components/portfolio/CinematicEffects";
import { Tilt } from "@/components/portfolio/effects";
import { stepSpring } from "@/lib/motion-physics";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function frames() {
  vi.useFakeTimers();
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) =>
    window.setTimeout(() => callback(performance.now()), 16),
  );
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => window.clearTimeout(id));
}

describe("Cinematic enhancements", () => {
  it("settles the spring consistently at different frame rates", () => {
    for (const rate of [30, 60, 120]) {
      let axis = { position: 0, velocity: 0 };
      for (let i = 0; i < rate * 2; i++) axis = stepSpring(axis, 4, 1 / rate);
      expect(axis.position).toBeCloseTo(4, 2);
      expect(Math.abs(axis.velocity)).toBeLessThan(0.01);
      for (let i = 0; i < rate * 2; i++) axis = stepSpring(axis, 0, 1 / rate);
      expect(axis.position).toBeCloseTo(0, 2);
    }
  });

  it("returns tilted surfaces to rest and stops its animation", () => {
    frames();
    const { container, unmount } = render(
      <Tilt>
        <button>Open project</button>
      </Tilt>,
    );
    const surface = container.firstElementChild as HTMLElement;
    vi.spyOn(surface, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
    } as DOMRect);
    fireEvent.mouseMove(surface, { clientX: 180, clientY: 30 });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(surface.style.transform).toContain("rotateX(");
    fireEvent.mouseLeave(surface);
    act(() => {
      vi.advanceTimersByTime(2400);
    });
    expect(surface.style.transform).toBe("");
    expect(vi.getTimerCount()).toBe(0);
    unmount();
  });

  it("adds click feedback and scenery without moving content or intercepting navigation", () => {
    frames();
    class Observer {
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", Observer);
    const { container, unmount } = render(
      <div className="portfolio-shell">
        <CinematicScroll />
        <main>
          <section>
            <a className="magnetic-button" href="#contact">
              Explore work
            </a>
          </section>
        </main>
      </div>,
    );
    const link = screen.getByRole("link", { name: "Explore work" });
    fireEvent.click(link);
    expect(link).toHaveClass("press-feedback");
    expect(link).toHaveAttribute("href", "#contact");
    act(() => {
      vi.advanceTimersByTime(16);
    });
    const section = container.querySelector("section")!;
    expect(section.style.getPropertyValue("--scene-drift")).not.toBe("");
    expect(section.style.transform).toBe("");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(section.style.getPropertyValue("--scene-drift")).toBe("");
  });

  it("keeps the shader optional when WebGL is unavailable", () => {
    const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { container } = render(<HeroLightField />);
    expect(context).toHaveBeenCalledWith(
      "webgl",
      expect.objectContaining({ powerPreference: "low-power" }),
    );
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
  });

  it("falls back cleanly and releases resources if shader compilation fails", () => {
    const gl = {
      createShader: vi.fn(() => ({})),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn(() => false),
      createProgram: vi.fn(() => ({})),
      deleteShader: vi.fn(),
      deleteProgram: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      gl as unknown as WebGLRenderingContext,
    );
    expect(() => render(<HeroLightField />)).not.toThrow();
    expect(gl.deleteShader).toHaveBeenCalledTimes(2);
    expect(gl.deleteProgram).toHaveBeenCalledTimes(1);
  });

  it("does not allocate WebGL or animate tilt with reduced motion", () => {
    frames();
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const context = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { container } = render(
      <>
        <HeroLightField />
        <Tilt>Project</Tilt>
      </>,
    );
    fireEvent.mouseMove(container.querySelector(".tilt-surface")!, { clientX: 180, clientY: 30 });
    expect(context).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
