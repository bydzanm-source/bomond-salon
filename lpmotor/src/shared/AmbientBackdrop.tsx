import { useEffect, useRef } from "react";
import { observeIntersections } from "../integrations/sectionRuntime";
import "../styles/ambient.css";

export function AmbientBackdrop({ className }: { className: string }) {
  const backdrop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = backdrop.current;
    if (!element) return;
    const observer = observeIntersections(([entry]) => {
      element.toggleAttribute("data-motion-visible", entry.isIntersecting);
    });
    observer?.observe(element);
    return () => observer?.disconnect();
  }, []);

  return (
    <div
      className={className}
      data-ambient-backdrop
      aria-hidden="true"
      ref={backdrop}
    />
  );
}
