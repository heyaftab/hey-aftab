import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemePicker } from "@/components/portfolio/ThemePicker";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset["theme"];
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  delete document.documentElement.dataset["theme"];
});

describe("Premium theme control", () => {
  it("restores the saved setting and keeps the original cycle order", () => {
    localStorage.setItem("portfolio-theme", "ocean");
    render(<ThemePicker />);
    const button = screen.getByRole("button", { name: "Change color theme" });
    fireEvent.click(button);
    expect(document.documentElement.dataset["theme"]).toBe("light");
    fireEvent.click(button);
    expect(document.documentElement.dataset["theme"]).toBe("night");
    expect(localStorage.getItem("portfolio-theme")).toBe("night");
  });

  it("previews and selects all themes without changing the theme merely by opening", () => {
    render(<ThemePicker />);
    fireEvent.click(screen.getByRole("button", { name: "Show theme previews" }));
    expect(document.documentElement.dataset["theme"]).toBe("night");
    for (const [name, id] of [
      ["Ocean glow", "ocean"],
      ["Soft daylight", "light"],
      ["Amber night", "night"],
    ]) {
      const option = screen.getByRole("button", { name: `Use ${name} theme` });
      fireEvent.click(option);
      expect(option).toHaveAttribute("aria-pressed", "true");
      expect(document.documentElement.dataset["theme"]).toBe(id);
      expect(localStorage.getItem("portfolio-theme")).toBe(id);
    }
  });

  it("dismisses with Escape and returns focus to the preview button", () => {
    render(<ThemePicker />);
    const trigger = screen.getByRole("button", { name: "Show theme previews" });
    fireEvent.click(trigger);
    const option = screen.getByRole("button", { name: "Use Ocean glow theme" });
    act(() => {
      option.focus();
    });
    fireEvent.keyDown(option, { key: "Escape" });
    expect(screen.queryByRole("group", { name: "Color theme previews" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the gallery on an outside pointer press", () => {
    render(<ThemePicker />);
    fireEvent.click(screen.getByRole("button", { name: "Show theme previews" }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("group", { name: "Color theme previews" })).not.toBeInTheDocument();
  });

  it("lets the latest rapid click win when view-transition callbacks are delayed", () => {
    const callbacks: (() => void)[] = [];
    const original = Object.getOwnPropertyDescriptor(document, "startViewTransition");
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: (update: () => void) => {
        callbacks.push(update);
        return { ready: Promise.resolve(), finished: Promise.resolve() };
      },
    });
    try {
      render(<ThemePicker />);
      const button = screen.getByRole("button", { name: "Change color theme" });
      fireEvent.click(button);
      fireEvent.click(button);
      act(() => {
        callbacks[1]!();
        callbacks[0]!();
      });
      expect(document.documentElement.dataset["theme"]).toBe("light");
      expect(localStorage.getItem("portfolio-theme")).toBe("light");
    } finally {
      if (original) Object.defineProperty(document, "startViewTransition", original);
      else Reflect.deleteProperty(document, "startViewTransition");
    }
  });
});
