import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AlienCinema } from "@/components/portfolio/AlienCinema";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset["theme"];
});

it("mounts cinematic scenery only in Alien and clears animation and glitch timers on exit", async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) =>
    window.setTimeout(() => callback(16), 16),
  );
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => window.clearTimeout(id));
  const { container } = render(
    <div className="portfolio-shell">
      <AlienCinema />
    </div>,
  );
  expect(container.querySelector(".survey-cinema")).toBeNull();
  expect(container.querySelector(".symbiote-background")).toBeNull();
  await act(async () => {
    document.documentElement.dataset["theme"] = "alien";
  });
  expect(container.querySelectorAll(".survey-cinema")).toHaveLength(1);
  expect(container.querySelectorAll(".symbiote-background")).toHaveLength(1);
  expect(container.querySelectorAll(".survey-spore")).toHaveLength(24);
  expect(vi.getTimerCount()).toBe(2);
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(container.querySelector(".survey-cinema")).toHaveClass("survey-paused");
  expect(vi.getTimerCount()).toBe(0);
  hidden.mockReturnValue(false);
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(container.querySelector(".survey-cinema")).not.toHaveClass("survey-paused");
  expect(vi.getTimerCount()).toBe(2);
  await act(async () => {
    document.documentElement.dataset["theme"] = "ocean";
  });
  expect(container.querySelector(".survey-cinema")).toBeNull();
  expect(container.querySelector(".symbiote-background")).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});

it("keeps Alien static when reduced motion is requested", async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(window, "matchMedia").mockImplementation((media) => ({
    matches: media.includes("reduced-motion"),
    media,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  document.documentElement.dataset["theme"] = "alien";
  const { container } = render(
    <div className="portfolio-shell">
      <AlienCinema />
    </div>,
  );
  expect(container.querySelector(".survey-cinema")).not.toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});
