import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LightSurvey } from "@/components/portfolio/LightSurvey";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete document.documentElement.dataset["theme"];
});

it("mounts only in light and removes layers and timers on theme exit", async () => {
  vi.useFakeTimers();
  const { container } = render(
    <div className="portfolio-shell">
      <LightSurvey />
    </div>,
  );
  expect(container.querySelector(".light-survey")).toBeNull();
  await act(async () => {
    document.documentElement.dataset["theme"] = "light";
  });
  expect(container.querySelector(".light-survey")).not.toBeNull();
  expect(document.querySelectorAll(".light-survey-reticle")).toHaveLength(1);
  expect(container.querySelector(".bg-light")).not.toBeNull();
  expect(vi.getTimerCount()).toBe(1); // Background frame only; random glitches are disabled.
  await act(async () => {
    document.documentElement.dataset["theme"] = "ocean";
  });
  expect(container.querySelector(".light-survey")).toBeNull();
  expect(container.querySelector(".bg-light")).toBeNull();
  expect(document.querySelector(".light-survey-reticle")).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});

it("tracks without easing or glitch timers under reduced motion", () => {
  vi.useFakeTimers();
  vi.spyOn(window, "matchMedia").mockImplementation((media) => ({
    matches: true,
    media,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) =>
    window.setTimeout(() => cb(16), 16),
  );
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => window.clearTimeout(id));
  document.documentElement.dataset["theme"] = "light";
  const { container } = render(
    <div className="portfolio-shell">
      <LightSurvey />
    </div>,
  );
  fireEvent.mouseMove(window, { clientX: 100, clientY: 120 });
  act(() => vi.advanceTimersByTime(16));
  fireEvent.mouseMove(window, { clientX: 300, clientY: 220 });
  act(() => vi.advanceTimersByTime(16));
  expect(
    container.querySelector<HTMLElement>(".light-survey")?.style.getPropertyValue("--mx"),
  ).toBe("300px");
  expect(document.querySelector<HTMLElement>(".light-survey-reticle")?.style.transform).toBe(
    "translate3d(300px,220px,0)",
  );
  expect(vi.getTimerCount()).toBe(0);
});
