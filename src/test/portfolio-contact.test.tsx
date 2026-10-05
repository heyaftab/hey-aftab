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
