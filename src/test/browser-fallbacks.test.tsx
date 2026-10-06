import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CountUp } from "@/components/portfolio/effects";
import { SpaceGravity } from "@/components/portfolio/SpaceGravity";
import { AlienCinema } from "@/components/portfolio/AlienCinema";
import { HeroLightField } from "@/components/portfolio/CinematicEffects";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset["theme"];
  sessionStorage.clear();
});
it("keeps content usable when a webview lacks observers and canvas support", () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  vi.stubGlobal("ResizeObserver", undefined);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  document.documentElement.dataset["theme"] = "alien";
  const { container, unmount } = render(
    <div className="portfolio-shell">
      <main>
        <section>
          <CountUp to={42} />
        </section>
      </main>
      <SpaceGravity />
      <AlienCinema />
      <HeroLightField />
    </div>,
  );
  expect(screen.getByText("42")).toBeInTheDocument();
  expect(container.querySelector("main > section")).toHaveClass("survey-visible");
  unmount();
  expect(document.documentElement).not.toHaveAttribute("data-alien-intro");
});
