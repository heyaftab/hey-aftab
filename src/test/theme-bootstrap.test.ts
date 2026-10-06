import { afterEach, expect, it, vi } from "vitest";
import { THEME_BOOTSTRAP } from "@/lib/theme-bootstrap";

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  delete document.documentElement.dataset["theme"];
});

it.each(["night", "ocean", "light", "alien"])("restores %s synchronously before hydration", (theme) => {
  localStorage.setItem("portfolio-theme", theme);
  new Function(THEME_BOOTSTRAP)();
  expect(document.documentElement.dataset["theme"]).toBe(theme);
});

it("ignores invalid themes and survives blocked storage", () => {
  document.documentElement.dataset["theme"] = "night";
  localStorage.setItem("portfolio-theme", "invalid");
  new Function(THEME_BOOTSTRAP)();
  expect(document.documentElement.dataset["theme"]).toBe("night");
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  expect(() => new Function(THEME_BOOTSTRAP)()).not.toThrow();
});
