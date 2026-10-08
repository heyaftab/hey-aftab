import { useLayoutEffect, useState } from "react";
import GalaxyProfile from "../../assets/Galaxy-Profile.jpg";
import WhiteProfile from "../../assets/White_Profile.png";
import "./spider-portrait.css";

export function SpiderPortrait() {
  const [spider, setSpider] = useState(false);
  const [whiteTheme, setWhiteTheme] = useState(true);
  const [galaxyTheme, setGalaxyTheme] = useState(false);
  const [revealed, setRevealed] = useState(false);
  useLayoutEffect(() => {
    const sync = () => {
      const theme = document.documentElement.dataset["theme"] ?? "";
      setSpider(["ocean", "spider"].includes(theme));
      setWhiteTheme(theme === "light");
      setGalaxyTheme(theme === "night");
      setRevealed(false);
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    sync();
    return () => observer.disconnect();
  }, []);
  if (!spider)
    return (
      <img
        src={whiteTheme ? WhiteProfile : galaxyTheme ? GalaxyProfile : "/assets/Aftab.png"}
        alt="Portrait of Aftab Uddin Ahmad"
        className={`h-full w-full object-cover object-center ${whiteTheme ? "white-profile-image" : galaxyTheme ? "galaxy-profile-image" : ""}`}
        fetchPriority="high"
      />
    );
  return (
    <button
      type="button"
      className="spider-portrait"
      aria-label="Reveal Aftab's Spider-Man portrait"
      aria-pressed={revealed}
      onClick={() => setRevealed((value) => !value)}
    >
      <img
        src="/assets/Aftab-Spiderman.png"
        alt="Aftab's Spider-Man portrait"
        className="h-full w-full object-cover object-center"
        fetchPriority="high"
      />
      <img
        src="/assets/Spiderman.png"
        alt=""
        aria-hidden="true"
        className="spider-portrait-cover"
        data-revealed={revealed}
      />
    </button>
  );
}
