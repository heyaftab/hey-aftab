import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SpiderBackground } from "@/components/portfolio/SpiderBackground";

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset["theme"];
  vi.restoreAllMocks();
});

it("mounts only in Spider and cancels its frame on repeated theme switches", async () => {
  const pending = new Map<number, FrameRequestCallback>();
  let id = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    pending.set(++id, callback);
    return id;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((key) => {
    pending.delete(key);
  });
  const { container, unmount } = render(<SpiderBackground />);
  expect(container.querySelector(".spider-background")).toBeNull();
  for (const other of ["night", "light", "alien"]) {
    await act(async () => {
      document.documentElement.dataset["theme"] = "ocean";
    });
    expect(container.querySelectorAll(".spider-background")).toHaveLength(1);
    expect(pending.size).toBe(1);
    fireEvent.scroll(window);
    expect(pending.size).toBe(1);
    await act(async () => {
      document.documentElement.dataset["theme"] = other;
    });
    expect(container.querySelector(".spider-background")).toBeNull();
    expect(pending.size).toBe(0);
  }
  unmount();
});

it("keeps a static atmosphere without animation frames for reduced motion", () => {
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
  const request = vi.spyOn(window, "requestAnimationFrame");
  document.documentElement.dataset["theme"] = "ocean";
  const { container } = render(<SpiderBackground />);
  fireEvent.scroll(window);
  expect(container.querySelector(".spider-background")).toBeInTheDocument();
  expect(request).not.toHaveBeenCalled();
});
