import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AlienIntro } from "@/components/portfolio/AlienIntro";
import { StrictMode } from "react";

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  document.documentElement.dataset["theme"] = "alien";
});
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete document.documentElement.dataset["theme"];
  window.history.replaceState(null, "", "/");
});
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
it("shakes briefly after the final flash and clears the effect", () => {
  render(<AlienIntro />);
  advance(3500);
  expect(document.documentElement).not.toHaveAttribute("data-alien-flash");
  expect(document.documentElement.dataset["alienShake"]).toBe("active");
  advance(400);
  expect(document.documentElement).not.toHaveAttribute("data-alien-shake");
});
it("shows the second flash only on the next Alien return and cancels it on skip", () => {
  sessionStorage.setItem("alien-awareness-intro-seen", "1");
  const first = render(<AlienIntro repeatVisit />);
  advance(1);
  expect(document.documentElement.dataset["alienFlash"]).toBe("echo");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(document.documentElement).not.toHaveAttribute("data-alien-flash");
  advance(1000);
  expect(document.documentElement).not.toHaveAttribute("data-alien-flash");
  first.unmount();
  const third = render(<AlienIntro repeatVisit />);
  expect(third.container).toBeEmptyDOMElement();
});
it("allows an explicit local preview even after the session intro has played", () => {
  sessionStorage.setItem("alien-awareness-intro-seen", "1");
  window.history.replaceState(null, "", "/?alienIntro=1");
  render(<AlienIntro />);
  advance(3100);
  expect(document.documentElement.dataset["alienIntro"]).toBe("glitch");
});
it("survives the development StrictMode effect replay", () => {
  render(
    <StrictMode>
      <AlienIntro />
    </StrictMode>,
  );
  advance(1500);
  expect(screen.getByText("SCANNING VISITOR...")).toBeInTheDocument();
});

it("starts normally, sequences the awareness intro, and plays only once per session", () => {
  const { unmount } = render(<AlienIntro />);
  expect(screen.queryByText("SCANNING VISITOR...")).toBeNull();
  advance(1500);
  expect(screen.getByText("SCANNING VISITOR...")).toBeInTheDocument();
  expect(document.documentElement.dataset["alienIntro"]).toBe("detection");
  advance(180);
  expect(document.documentElement.dataset["alienIntro"]).toBe("scanning");
  advance(720);
  expect(screen.getByText("IDENTITY DETECTED.")).toBeInTheDocument();
  advance(700);
  expect(document.documentElement.dataset["alienIntro"]).toBe("glitch");
  advance(400);
  expect(screen.getByText("YOU FOUND MY PORTFOLIO.")).toBeInTheDocument();
  advance(1200);
  expect(screen.getByText("NOW LET ME SHOW YOU WHAT I CAN BUILD.")).toBeInTheDocument();
  advance(2100);
  expect(document.documentElement).not.toHaveAttribute("data-alien-intro");
  expect(vi.getTimerCount()).toBe(0);
  unmount();
  const { container } = render(<AlienIntro />);
  expect(container).toBeEmptyDOMElement();
});

it.each(["skip", "navigation", "escape", "unmount"])(
  "cleans up without blocking access on %s",
  (action) => {
    const { unmount } = render(<AlienIntro />);
    advance(1500);
    if (action === "skip")
      fireEvent.click(screen.getByRole("button", { name: "Skip Alien intro" }));
    if (action === "navigation") fireEvent.pointerDown(window);
    if (action === "escape") fireEvent.keyDown(window, { key: "Escape" });
    if (action === "unmount") unmount();
    advance(1); // Flush jsdom's deferred storage event after recording the session.
    expect(document.documentElement).not.toHaveAttribute("data-alien-intro");
    expect(vi.getTimerCount()).toBe(0);
  },
);

it("offers the text sequence without freezing or glitching under reduced motion", () => {
  vi.spyOn(window, "matchMedia").mockImplementation((media) => ({
    matches: media.includes("prefers-reduced-motion"),
    media,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  render(<AlienIntro />);
  advance(1500);
  expect(document.documentElement.dataset["alienIntro"]).toBe("scanning");
  advance(1600);
  expect(document.documentElement.dataset["alienIntro"]).not.toBe("glitch");
  advance(1600);
  expect(screen.getByText("NOW LET ME SHOW YOU WHAT I CAN BUILD.")).toBeInTheDocument();
});
