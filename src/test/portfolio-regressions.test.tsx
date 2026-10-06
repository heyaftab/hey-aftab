import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NetworkField, Typewriter } from "@/components/portfolio/effects";
import { ThemePicker } from "@/components/portfolio/ThemePicker";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete document.documentElement.dataset["theme"];
});

describe("Portfolio runtime regressions", () => {
  it("switches themes even when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    render(<ThemePicker />);
    fireEvent.click(screen.getByRole("button", { name: "Change color theme" }));
    expect(document.documentElement.dataset["theme"]).toBe("ocean");
    fireEvent.click(screen.getByRole("button", { name: "Change color theme" }));
    expect(document.documentElement.dataset["theme"]).toBe("light");
  });

  it("renders without crashing when canvas is unavailable", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(() => render(<NetworkField />)).not.toThrow();
  });

  it("redraws static particles after resize and when the theme changes", async () => {
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
    const context = {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    render(<NetworkField />);
    context.clearRect.mockClear();
    fireEvent(window, new Event("resize"));
    expect(context.clearRect).toHaveBeenCalledTimes(1);
    context.clearRect.mockClear();
    await act(async () => {
      document.documentElement.dataset["theme"] = "ocean";
    });
    expect(context.clearRect).toHaveBeenCalledTimes(1);
  });

  it("does not run an endless typewriter timer for an empty phrase list", () => {
    vi.useFakeTimers();
    render(<Typewriter phrases={[]} />);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("skips blank typewriter phrases instead of leaving an endless empty animation", () => {
    vi.useFakeTimers();
    const { rerender } = render(<Typewriter phrases={["", "   "]} />);
    expect(vi.getTimerCount()).toBe(0);
    rerender(<Typewriter phrases={["", "Working"]} />);
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(screen.getByText("Working")).toBeInTheDocument();
  });
});
