import { delay, listen } from "../integrations/sectionRuntime";
import {
  findSeasonalSurfaces,
  firstTextLine,
  type SeasonalSurface,
} from "./seasonalSurfaces";

type SnowBank = {
  element: HTMLElement;
  flake: HTMLElement;
  target?: Element;
  kind?: SeasonalSurface;
  flight?: Animation;
  cancelNext?: () => void;
};

const maximumDepth = 4;

export function observeSnowfall(layer: HTMLElement) {
  const banks = Array.from(
    layer.querySelectorAll<HTMLElement>("[data-snow-drift]"),
  ).map((element): SnowBank => ({
    element,
    flake: element.querySelector<HTMLElement>(".snow-contact")!,
  }));
  const depths = new WeakMap<Element, number>();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let cancelRescan: (() => void) | undefined;

  function stopFlight(bank: SnowBank) {
    bank.flight?.cancel();
    bank.flight = undefined;
    bank.cancelNext?.();
    bank.cancelNext = undefined;
  }

  function paintDepth(bank: SnowBank, depth: number) {
    bank.element.dataset.snowDepth = String(depth);
    bank.element.style.setProperty("--snow-strength", depth === 0 ? "0" : "1");
    bank.element.style.setProperty(
      "--snow-height",
      String(0.34 + depth * 0.18),
    );
  }

  function sendFlake(bank: SnowBank, index: number) {
    const target = bank.target;
    if (!target || document.hidden || motion.matches) return;
    position(bank, index);
    const previous = depths.get(target) ?? 0;
    const side = (index + previous) % 2 ? 1 : -1;
    const distance = Math.min(210, Math.max(32, bank.element.offsetTop - 55));
    const flight = bank.flake.animate(
      [
        {
          transform:
            "translate(" + side * 32 + "px," + -distance + "px) rotate(-52deg)",
          opacity: 0,
        },
        {
          transform:
            "translate(" +
            -side * 18 +
            "px," +
            -distance * 0.67 +
            "px) rotate(8deg)",
          opacity: 0.96,
          offset: 0.26,
        },
        {
          transform:
            "translate(" +
            side * 14 +
            "px," +
            -distance * 0.21 +
            "px) rotate(67deg)",
          opacity: 0.93,
          offset: 0.76,
        },
        {
          transform: "translate(-50%, 2px) rotate(110deg) scale(.42)",
          opacity: 0.68,
          offset: 0.96,
        },
        {
          transform: "translate(-50%, 5px) rotate(110deg) scale(.18)",
          opacity: 0,
        },
      ],
      { duration: 1530 + index * 330, easing: "cubic-bezier(.28,.61,.50,1)" },
    );
    bank.flight = flight;
    flight.onfinish = () => {
      if (bank.flight !== flight) return;
      bank.flight = undefined;
      const next = Math.min(maximumDepth, previous + 1);
      depths.set(target, next);
      paintDepth(bank, next);
      bank.cancelNext = delay(() => sendFlake(bank, index), 550 + index * 190);
    };
  }

  function position(bank: SnowBank, index: number) {
    const { target, kind, element } = bank;
    if (!target?.isConnected || !kind) return false;
    const rect =
      kind === "heading"
        ? firstTextLine(target)
        : target.getBoundingClientRect();
    if (rect.top < 50 || rect.top > layer.clientHeight + 12 || rect.width < 35)
      return false;
    const width =
      kind === "photo"
        ? Math.min(155, Math.max(70, rect.width * 0.28))
        : Math.min(76, Math.max(38, rect.width * 0.32));
    const offset =
      index === 2
        ? rect.left + Math.min(16, rect.width * 0.05)
        : rect.right -
          width -
          (kind === "photo" ? Math.min(38, rect.width * 0.1) : 0);
    element.style.left =
      Math.round(Math.max(6, Math.min(offset, layer.clientWidth - width - 6))) +
      "px";
    element.style.top =
      Math.round(rect.top + (kind === "photo" ? 3 : 7)) + "px";
    element.style.width = Math.round(width) + "px";
    return true;
  }

  function release(bank: SnowBank) {
    stopFlight(bank);
    bank.target = undefined;
    bank.kind = undefined;
    delete bank.element.dataset.snowSurface;
    delete bank.element.dataset.snowDepth;
  }

  function rescan() {
    if (document.hidden) return;
    const surfaces = findSeasonalSurfaces(layer.clientHeight);
    const mobile = layer.clientWidth < 550;
    for (const [index, bank] of banks.entries()) {
      if (index === 2 && mobile) {
        release(bank);
        continue;
      }
      if (position(bank, index)) continue;
      release(bank);
      const preferred = index === 0 ? "heading" : "photo";
      const other = preferred === "heading" ? "photo" : "heading";
      const target = [...surfaces[preferred], ...surfaces[other]].find(
        (candidate) =>
          banks.every((otherBank) => otherBank.target !== candidate),
      );
      if (!target) continue;
      bank.target = target;
      bank.kind = surfaces.heading.includes(target) ? "heading" : "photo";
      if (!position(bank, index)) {
        release(bank);
        continue;
      }
      bank.element.dataset.snowSurface = bank.kind;
      paintDepth(bank, motion.matches ? 3 : (depths.get(target) ?? 0));
      if (!motion.matches && typeof bank.flake.animate === "function")
        sendFlake(bank, index);
    }
  }

  function update() {
    if (frame || document.hidden) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      let needsAnchor = false;
      banks.forEach((bank, index) => {
        if (bank.target && !position(bank, index)) {
          release(bank);
          needsAnchor = true;
        }
      });
      if (needsAnchor) rescan();
    });
    cancelRescan?.();
    cancelRescan = delay(rescan, 140);
  }

  function reset() {
    banks.forEach(release);
    rescan();
  }

  const cleanups = [
    listen(window, "scroll", update),
    listen(window, "resize", update),
    listen(document, "load", update, true),
    listen(document, "visibilitychange", reset),
  ];
  motion.addEventListener("change", reset);
  void document.fonts.ready.then(() => {
    if (layer.isConnected) update();
  });
  rescan();
  return () => {
    motion.removeEventListener("change", reset);
    cleanups.forEach((cleanup) => cleanup());
    cancelRescan?.();
    cancelAnimationFrame(frame);
    banks.forEach(release);
  };
}
