import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Portfolio } from "@/components/portfolio/Portfolio";

beforeEach(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", Observer);
  vi.stubGlobal("ResizeObserver", Observer);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function fillContactForm() {
  fireEvent.change(screen.getByLabelText("name"), { target: { value: "Test Visitor" } });
  fireEvent.change(screen.getByLabelText("email"), { target: { value: "visitor@example.com" } });
  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: "Let's discuss a new project." },
  });
  return screen.getByRole("button", { name: "Send Message" }).closest("form")!;
}

describe("Contact form regressions", () => {
  it("preserves every section, featured project, navigation destination and resume link", () => {
    const { container } = render(<Portfolio />);
    for (const id of [
      "home",
      "about",
      "skills",
      "projects",
      "achievements",
      "journey",
      "contact",
    ]) {
      expect(container.querySelector(`main section#${id}`)).toBeInTheDocument();
      expect(container.querySelector(`nav a[href="#${id}"]`)).toBeInTheDocument();
    }
    for (const title of [
      "National Healthcare Record Exchange",
      "Goynar Gontobbo",
      "BozoScope",
      "UIU CSE Course Planner",
      "Smart CNC Plotter",
      "How I approach software.",
    ])
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Download Resume" })).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Chat with Aftab's portfolio assistant" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(container.querySelector("#mobile-navigation a[href='#contact']")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(container.querySelector("#mobile-navigation")).not.toBeInTheDocument();
  });

  it("preserves skill filtering and cycles all four themes", async () => {
    const { container } = render(<Portfolio />);
    const skills = container.querySelector("#skills")!;
    const allRows = skills.querySelectorAll(".skill-row").length;
    const frontend = Array.from(skills.querySelectorAll("button")).find(
      (button) => button.textContent === "Frontend",
    )!;
    fireEvent.click(frontend);
    expect(skills.querySelectorAll(".skill-row")).toHaveLength(1);
    expect(skills.querySelector(".skill-row")?.textContent).toContain("React");
    fireEvent.click(
      Array.from(skills.querySelectorAll("button")).find((button) => button.textContent === "All")!,
    );
    expect(skills.querySelectorAll(".skill-row")).toHaveLength(allRows);
    const themeButton = screen.getByRole("button", { name: "Change color theme" });
    const original = document.documentElement.dataset["theme"];
    const selected = new Set<string | undefined>();
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        fireEvent.click(themeButton);
      });
      selected.add(document.documentElement.dataset["theme"]);
    }
    expect(selected.size).toBe(4);
    expect(document.documentElement.dataset["theme"]).toBe(original);
  });
  it("clears a previous success when the next submission is invalid", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetch);
    render(<Portfolio />);
    const form = fillContactForm();
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(screen.getByText("Message sent. Aftab will receive it by email.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "short" } });
    fireEvent.submit(form);
    expect(
      screen.queryByText("Message sent. Aftab will receive it by email."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Message should be between 10 and 2000 characters."),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("sends one request when submitted twice before delivery completes", async () => {
    let deliver!: (value: { ok: boolean; json: () => Promise<object> }) => void;
    const fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          deliver = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetch);
    render(<Portfolio />);
    const form = fillContactForm();
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
    await act(async () => {
      deliver({ ok: true, json: async () => ({ ok: true }) });
    });
    expect(screen.getByRole("button", { name: "Message Sent" })).toBeEnabled();
  });
});
