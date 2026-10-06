import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CursorGlow,
  HeroGeometry,
  InteractiveIllustration,
  MorphingText,
} from "@/components/portfolio/effects";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Portfolio interactions", () => {
  it("lets keyboard and click users explore the illustration", () => {
    render(<InteractiveIllustration />);
    const output = screen.getByRole("button", { name: "OUTPUT" });
    fireEvent.focus(output);
    expect(output).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Create something people can use.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "BUILD" }));
    expect(screen.getByText("Turn experiments into working systems.")).toBeInTheDocument();
    expect(output).toHaveAttribute("aria-pressed", "false");
  });

  it("cycles words and removes the timer on unmount", () => {
    vi.useFakeTimers();
    const { unmount } = render(<MorphingText />);
    act(() => {
      vi.advanceTimersByTime(3400);
    });
    expect(screen.getByText("Problem Solver")).toBeInTheDocument();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("moves the light and rotates the object for a desktop pointer", () => {
    vi.useFakeTimers();
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
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) =>
      window.setTimeout(() => callback(16), 16),
    );
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => window.clearTimeout(id));
    const { container, unmount } = render(
      <>
        <CursorGlow />
        <HeroGeometry />
      </>,
    );
    fireEvent.mouseMove(window, { clientX: 400, clientY: 250 });
    act(() => {
      vi.advanceTimersByTime(16);
    });
    const light = container.querySelector<HTMLElement>(".cursor-glow");
    expect(light?.style.transform).toBe("translate3d(400px, 250px, 0)");
    expect(light?.style.opacity).toBe("1");
    expect(
      container.querySelector<HTMLElement>(".hero-geometry")?.style.getPropertyValue("--object-y"),
    ).not.toBe("");
    fireEvent.blur(window);
    expect(light?.style.opacity).toBe("0");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps text stable and pointer effects inactive with reduced motion", () => {
    vi.useFakeTimers();
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const { container } = render(
      <>
        <MorphingText />
        <CursorGlow />
        <HeroGeometry />
      </>,
    );
    fireEvent.mouseMove(window, { clientX: 400, clientY: 250 });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText("AI Engineer")).toBeInTheDocument();
    expect(container.querySelector<HTMLElement>(".cursor-glow")?.style.opacity).not.toBe("1");
    expect(
      container.querySelector<HTMLElement>(".hero-geometry")?.style.getPropertyValue("--object-y"),
    ).toBe("");
  });
});
