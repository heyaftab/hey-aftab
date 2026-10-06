import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SpiderPortrait } from "@/components/portfolio/SpiderPortrait";
afterEach(() => {
  cleanup();
  delete document.documentElement.dataset["theme"];
});
it("toggles the lower portrait on tap and restores the normal portrait outside Spider", async () => {
  document.documentElement.dataset["theme"] = "ocean";
  const { container } = render(<SpiderPortrait />);
  const button = screen.getByRole("button");
  fireEvent.click(button);
  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(container.querySelector(".spider-portrait-cover")).toHaveAttribute(
    "data-revealed",
    "true",
  );
  fireEvent.click(button);
  expect(button).toHaveAttribute("aria-pressed", "false");
  await act(async () => {
    document.documentElement.dataset["theme"] = "alien";
  });
  expect(screen.queryByRole("button")).toBeNull();
  expect(screen.getByRole("img")).toHaveAttribute("src", "/assets/Aftab.png");
});
