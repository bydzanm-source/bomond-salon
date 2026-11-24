import { useEffect, useState } from "react";
import { observeMutations } from "../integrations/sectionRuntime";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const root = document.documentElement;
    const observer = observeMutations(() => {
      setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    });
    observer?.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    return () => observer?.disconnect();
  }, []);

  function toggleTheme(button: HTMLButtonElement) {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
      setTheme(next);
    };

    try {
      localStorage.setItem("bomond-theme", next);
    } catch {
      // The switch still works when browser storage is unavailable.
    }

    if (
      !document.startViewTransition ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      apply();
      return;
    }
    const { left, top, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );
    root.style.setProperty("--header-vt-x", `${x}px`);
    root.style.setProperty("--header-vt-y", `${y}px`);
    root.style.setProperty("--header-vt-r", `${Math.ceil(radius)}px`);
    document.startViewTransition(apply);
  }

  return { theme, toggleTheme };
}
