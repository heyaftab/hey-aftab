import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ThemePicker } from "@/components/portfolio/ThemePicker";
beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset["theme"];
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
  delete document.documentElement.dataset["theme"];
});
it("cycles all four themes with one button, persists Alien, and returns to Galuxy", () => {
  const { baseElement: container } = render(<ThemePicker />);
  expect(screen.getAllByRole("button")).toHaveLength(1);
  const button = screen.getByRole("button", { name: "Change color theme" });
  for (const id of ["ocean", "light", "alien", "night"]) {
    fireEvent.click(button);
    expect(document.documentElement.dataset["theme"]).toBe(id);
    expect(localStorage.getItem("portfolio-theme")).toBe(id);
  }
  expect(container.querySelectorAll(".theme-arrival")).toHaveLength(1);
});
it("restores Alien on refresh", () => {
  localStorage.setItem("portfolio-theme", "alien");
  render(<ThemePicker />);
  expect(document.documentElement.dataset["theme"]).toBe("alien");
});
it("replaces rapid arrivals and clears the timer on unmount", () => {
  vi.useFakeTimers();
  const { baseElement: container, unmount } = render(<ThemePicker />);
  const button = screen.getByRole("button", { name: "Change color theme" });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(container.querySelector(".theme-arrival-light")).not.toBeNull();
  act(() => vi.advanceTimersByTime(2200));
  expect(container.querySelector(".theme-arrival")).toBeNull();
  fireEvent.click(button);
  fireEvent.click(button);
  unmount();
  act(() => vi.runOnlyPendingTimers());
  expect(vi.getTimerCount()).toBe(0);
});
it("switches without arrivals when reduced motion is enabled", () => {
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
  const { baseElement: container } = render(<ThemePicker />);
  fireEvent.click(screen.getByRole("button", { name: "Change color theme" }));
  expect(document.documentElement.dataset["theme"]).toBe("ocean");
  expect(container.querySelector(".theme-arrival")).toBeNull();
});
