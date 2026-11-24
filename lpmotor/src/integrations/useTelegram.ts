import { useCallback, useEffect, useState } from "react";
import { listen, observeMutations } from "./sectionRuntime";

type TelegramWebApp = {
  initData?: string;
  platform?: string;
  colorScheme?: "light" | "dark";
  ready?: () => void;
  expand?: () => void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp>();

  useEffect(() => {
    const script = document.getElementById("telegram-sdk");
    function connect() {
      const app = window.Telegram?.WebApp;
      if (app && (app.initData || (app.platform && app.platform !== "unknown")))
        setWebApp(app);
    }
    connect();
    if (script) return listen(script, "load", connect);
  }, []);

  useEffect(() => {
    if (!webApp) return;
    const root = document.documentElement;
    root.classList.add("is-tg");
    for (const method of [
      "ready",
      "expand",
      "disableVerticalSwipes",
    ] as const) {
      try {
        webApp[method]?.();
      } catch {
        // Older Telegram clients can expose methods they cannot execute.
      }
    }
    try {
      if (!localStorage.getItem("bomond-theme") && webApp.colorScheme)
        root.dataset.theme = webApp.colorScheme;
    } catch {
      // Keep the current theme when browser storage is unavailable.
    }

    function syncColors() {
      const color = root.dataset.theme === "dark" ? "#17120f" : "#faf6f1";
      for (const method of ["setHeaderColor", "setBackgroundColor"] as const) {
        try {
          webApp?.[method]?.(color);
        } catch {
          // Theme changes on the site still apply on older clients.
        }
      }
    }

    syncColors();
    const themeObserver = observeMutations(syncColors);
    themeObserver?.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      themeObserver?.disconnect();
      root.classList.remove("is-tg");
    };
  }, [webApp]);

  return useCallback(
    (event: MouseEvent) => {
      if (
        !webApp ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.protocol !== "https:" && url.protocol !== "http:") return;
      if (url.origin === location.origin && link.target !== "_blank") return;
      const isTelegram = ["t.me", "telegram.me"].includes(url.hostname);
      const open = isTelegram ? webApp.openTelegramLink : webApp.openLink;
      if (open) {
        try {
          open.call(webApp, url.href);
          event.preventDefault();
        } catch {
          // Fall back to the browser link when the bridge fails.
        }
      }
    },
    [webApp],
  );
}
