import { delay, listen } from "../integrations/sectionRuntime";
import { findSeasonalSurfaces, type SeasonalSurface } from "./seasonalSurfaces";
import { headingSupports } from "./snowAnchor";

type SnowBank = {
  element: HTMLElement;
  flake: HTMLElement;
  ridge: SVGSVGElement;
  profile: SVGPathElement;
  target?: Element;
  kind?: SeasonalSurface;
  flight?: Animation;
  growth?: Animation;
  cancelNext?: () => void;
  lastRoute?: number;
};

const maximumDepth = 4;
const landingScale = 0.48;
const heightAtDepth = (depth: number) => 0.34 + depth * 0.18;
const between = (min: number, max: number) => min + Math.random() * (max - min);

const flutterCycles = [0.67, 1.02, 1.38, 1.76];

function snowSurface(bank: SnowBank, lane: number, depth: number) {
  const { width, height } = bank.ridge.viewBox.baseVal;
  const x = bank.element.clientWidth * lane;
  const baseline = bank.element.clientHeight;
  if (!depth) return { x, y: baseline };

  // Find the topmost snow at the precise point where this flake will land.
  let above = 0;
  let inside = height - 1;
  const point = new DOMPoint(width * lane, 0);
  for (let step = 0; step < 8; step++) {
    point.y = (above + inside) / 2;
    if (bank.profile.isPointInFill(point)) inside = point.y;
    else above = point.y;
  }
  const y = baseline - (1 - inside / height) * baseline * heightAtDepth(depth);
  return { x, y };
}

export function observeSnowfall(layer: HTMLElement) {
  const banks = Array.from(
    layer.querySelectorAll<HTMLElement>("[data-snow-drift]"),
  ).map((element): SnowBank => ({
    element,
    flake: element.querySelector<HTMLElement>(".snow-contact")!,
    ridge: element.querySelector<SVGSVGElement>(".snow-ridge")!,
    profile: element.querySelector<SVGPathElement>(".snow-ridge path")!,
  }));
  const depths = new WeakMap<Element, number>();
  let headingBoxes = new WeakMap<Element, ReturnType<typeof headingSupports>>();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let viewportWidth = layer.clientWidth;
  let cancelRescan: (() => void) | undefined;
  let cancelWeather: (() => void) | undefined;
  let wind = 0;

  function weather() {
    cancelWeather?.();
    wind = 0;
    layer.dataset.snowWeather = "calm";
    layer.style.removeProperty("--snow-wind");
    if (document.hidden || motion.matches) return;
    cancelWeather = delay(
      () => {
        wind = between(64, 100) * (Math.random() < 0.5 ? -1 : 1);
        layer.dataset.snowWeather = "squall";
        layer.style.setProperty("--snow-wind", wind + "px");
        layer.style.setProperty("--snow-side", String(Math.sign(wind)));
        cancelWeather = delay(weather, between(4400, 6200));
      },
      between(10000, 18500),
    );
  }

  function stopFlight(bank: SnowBank) {
    bank.flight?.cancel();
    bank.flight = undefined;
    bank.growth?.cancel();
    bank.growth = undefined;
    bank.cancelNext?.();
    bank.cancelNext = undefined;
  }

  function paintDepth(bank: SnowBank, depth: number) {
    bank.element.dataset.snowDepth = String(depth);
    bank.element.style.setProperty("--snow-strength", depth === 0 ? "0" : "1");
    bank.element.style.setProperty(
      "--snow-height",
      String(heightAtDepth(depth)),
    );
  }

  function sendFlake(bank: SnowBank, index: number) {
    const target = bank.target;
    if (!target || document.hidden || motion.matches) return;
    position(bank, index);
    const previous = depths.get(target) ?? 0;
    const side = Math.random() < 0.5 ? 1 : -1;
    const lastRoute = bank.lastRoute ?? flutterCycles.length;
    const draw = Math.floor(
      Math.random() *
        (flutterCycles.length - Number(bank.lastRoute !== undefined)),
    );
    const route = draw >= lastRoute ? draw + 1 : draw;
    bank.lastRoute = route;
    const amplitude = Math.min(between(21, 51), layer.clientWidth * 0.13);
    const lane = between(0.25, 0.75);
    const surface = snowSurface(bank, lane, previous);
    const halfFlake = bank.flake.offsetWidth / 2;
    const pose = (x: number, y: number, angle: number, scale = 1) =>
      `translate3d(${surface.x + x - halfFlake}px,${y - halfFlake}px,0) rotate(${angle}deg) scale(${scale})`;
    const distance = Math.min(
      between(120, 265),
      Math.max(32, bank.element.offsetTop - 55),
    );
    const contactY = surface.y - halfFlake * landingScale * 0.88;
    const contact = pose(0, contactY, 100, landingScale);
    const origin = bank.element.offsetLeft + surface.x;
    const tilt = between(38, 85) * side;
    const entry = side * between(22, 61) - wind * 0.61;
    const phase = between(0, Math.PI * 2);
    // Sample a continuous drift so neither direction nor descent speed snaps at a turn.
    const approach = Array.from({ length: 25 }, (_, step) => {
      const offset = step / 24;
      const remaining = 1 - offset;
      const flutter = Math.sin(
        phase + offset * Math.PI * 2 * flutterCycles[route],
      );
      const x =
        entry * remaining ** 1.25 +
        amplitude * flutter * Math.sin(Math.PI * offset) * remaining ** 0.45;
      const room = Math.max(
        1,
        x < 0 ? origin - 10 : layer.clientWidth - 10 - origin,
      );
      const boundedX = room * Math.tanh(x / room);
      const scale =
        landingScale + (0.74 - landingScale) * Math.min(1, remaining * 5);
      return {
        offset,
        transform: pose(
          boundedX,
          contactY - distance * remaining ** 1.16,
          100 + tilt * remaining + flutter * 19 * remaining,
          scale,
        ),
        opacity: Math.min(0.97, offset * 9),
      };
    });
    const flight = bank.flake.animate(approach, {
      duration:
        Math.max(1450, Math.min(3100, distance * between(10.3, 14.2))) +
        index * 85,
      fill: "forwards",
    });
    bank.flight = flight;
    flight.onfinish = () => {
      if (bank.flight !== flight) return;
      const next = Math.min(maximumDepth, previous + 1);
      depths.set(target, next);
      paintDepth(bank, next);
      const initialScale = heightAtDepth(previous);
      const finalScale = heightAtDepth(next);
      bank.growth = bank.ridge.animate(
        [
          { transform: `scaleY(${initialScale})`, opacity: previous ? 1 : 0 },
          {
            transform: `scaleY(${initialScale * (previous ? 0.97 : 1)})`,
            opacity: previous ? 1 : 0.55,
            offset: 0.18,
          },
          { transform: `scaleY(${finalScale})`, opacity: 1 },
        ],
        { duration: 410, easing: "cubic-bezier(.21,.62,.39,1)" },
      );
      const merge = bank.flake.animate(
        [
          { transform: contact, opacity: 0.97 },
          {
            transform: pose(side * 1.5, contactY + 1.5, 105, 0.35),
            opacity: 0.6,
            offset: 0.45,
          },
          { transform: pose(side * 2, contactY + 3, 108, 0.12), opacity: 0 },
        ],
        { duration: 330, easing: "ease-out" },
      );
      bank.flight = merge;
      flight.cancel();
      merge.onfinish = () => {
        if (bank.flight !== merge) return;
        bank.flight = undefined;
        bank.cancelNext = delay(
          () => sendFlake(bank, index),
          400 + index * 170,
        );
      };
    };
  }

  function position(bank: SnowBank, index: number) {
    const { target, kind, element } = bank;
    if (!target?.isConnected || !kind) return false;
    const rect = target.getBoundingClientRect();
    if (rect.top < 50 || rect.top > layer.clientHeight + 12 || rect.width < 35)
      return false;
    let width = Math.min(
      176,
      Math.max(66, (target as HTMLElement).offsetWidth * 0.34),
    );
    let offset = index === 2 ? rect.left + 24 : rect.right - width - 30;
    let edge = rect.top;
    if (kind === "heading") {
      if (!headingBoxes.has(target))
        headingBoxes.set(target, headingSupports(target));
      const support = headingBoxes.get(target);
      const glyph = index === 2 ? support?.first : support?.last;
      if (!glyph) return false;
      width = Math.max(12, Math.min(104, glyph.width * 0.88));
      offset = rect.left + glyph.left + (glyph.width - width) / 2;
      edge += glyph.top;
    }
    element.style.left =
      Math.max(6, Math.min(offset, layer.clientWidth - width - 6)).toFixed(2) +
      "px";
    element.style.top = (edge + 2.4).toFixed(2) + "px";
    element.style.width = width.toFixed(2) + "px";
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

  function onMotionChange() {
    layer.toggleAttribute("data-snow-paused", document.hidden);
    reset();
    weather();
  }

  function resize() {
    if (viewportWidth === layer.clientWidth) {
      update();
      return;
    }
    viewportWidth = layer.clientWidth;
    headingBoxes = new WeakMap();
    reset();
  }

  function varySway(event: Event) {
    const flake = event.target;
    if (!(flake instanceof HTMLElement) || !flake.dataset.snowSway) return;
    const sway = Number(flake.dataset.snowSway) * between(0.54, 1.47);
    flake.style.setProperty("--snow-drift", sway + "px");
  }

  const cleanups = [
    listen(window, "scroll", update),
    listen(window, "resize", resize),
    listen(document, "load", update, true),
    listen(document, "visibilitychange", onMotionChange),
    listen(layer, "animationiteration", varySway),
  ];
  motion.addEventListener("change", onMotionChange);
  void document.fonts.ready.then(() => {
    if (layer.isConnected) {
      headingBoxes = new WeakMap();
      update();
    }
  });
  onMotionChange();
  return () => {
    motion.removeEventListener("change", onMotionChange);
    cleanups.forEach((cleanup) => cleanup());
    cancelRescan?.();
    cancelWeather?.();
    cancelAnimationFrame(frame);
    banks.forEach(release);
  };
}
