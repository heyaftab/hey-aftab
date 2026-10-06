import { useEffect, useRef } from "react";
import "./galuxy-background.css";

export function GaluxyBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sync = () => ref.current?.classList.toggle("galuxy-background-paused", document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return <div ref={ref} className="galuxy-background" aria-hidden="true" />;
}
