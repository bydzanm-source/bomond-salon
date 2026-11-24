import { hydrateRoot } from "react-dom/client";
import {
  observeMutations,
  setSectionRuntime,
} from "../integrations/sectionRuntime";
import type { SectionRuntime } from "../integrations/sectionRuntime";
import { MottorSite } from "./MottorSite";
import { sections } from "./sections";

declare const sectionJs: SectionRuntime;

setSectionRuntime(sectionJs);
sectionJs.ready(() => {
  for (const { name, Component } of sections) {
    const root = document.querySelector<HTMLElement>(
      `[data-bomond-island="${name}"]`,
    );
    if (!root || root.dataset.reactMounted) continue;
    root.dataset.reactMounted = "true";
    const rendered = hydrateRoot(
      root,
      <>
        <Component />
        {name === "header" && <MottorSite />}
      </>,
    );
    const observer = observeMutations(() => {
      if (root.isConnected) return;
      observer?.disconnect();
      rendered.unmount();
    });
    observer?.observe(document.body, { subtree: true, childList: true });
  }
});
