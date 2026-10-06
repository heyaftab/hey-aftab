import { useEffect, useState } from "react";
import "./spider-portrait.css";

export function SpiderPortrait() {
  const [spider, setSpider] = useState(false);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const sync = () => {
      setSpider(document.documentElement.dataset["theme"] === "ocean");
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
        src="/assets/Aftab.png"
        alt="Portrait of Aftab Uddin Ahmad"
        className="h-full w-full object-cover object-center"
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
