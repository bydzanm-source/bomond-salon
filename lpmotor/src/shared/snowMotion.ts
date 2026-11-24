import { delay, listen } from "../integrations/sectionRuntime";
import {
  findSeasonalSurfaces,
  firstTextLine,
  type SeasonalSurface,
} from "./seasonalSurfaces";

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

// Each waypoint gives the time, sideways displacement and remaining height.
const descentRoutes = [
  [
    [0, 1, 1],
    [0.26, 0.82, 0.74],
    [0.54, 0.46, 0.42],
    [0.78, 0.12, 0.15],
  ],
  [
    [0, -0.68, 1],
    [0.17, 0.32, 0.79],
    [0.38, -0.54, 0.6],
    [0.58, 0.48, 0.43],
    [0.78, -0.21, 0.19],
  ],
  [
    [0, 0.8, 1],
    [0.23, 0.5, 0.74],
    [0.52, -0.69, 0.39],
    [0.74, -0.54, 0.22],
    [0.87, -0.16, 0.07],
  ],
  [
    [0, -0.93, 1],
    [0.23, -0.45, 0.61],
    [0.43, 0.5, 0.36],
    [0.58, 0.72, 0.43],
    [0.77, 0.2, 0.19],
  ],
];

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
    const lastRoute = bank.lastRoute ?? descentRoutes.length;
    const draw = Math.floor(
      Math.random() *
        (descentRoutes.length - Number(bank.lastRoute !== undefined)),
    );
    const route = draw >= lastRoute ? draw + 1 : draw;
    bank.lastRoute = route;
    const amplitude = Math.min(between(72, 151), layer.clientWidth * 0.32);
    const lane = between(0.28, 0.72);
    const surface = snowSurface(bank, lane, previous);
    const halfFlake = bank.flake.offsetWidth / 2;
    const pose = (x: number, y: number, angle: number, scale = 1) =>
      `translate3d(${surface.x + x - halfFlake}px,${y - halfFlake}px,0) rotate(${angle}deg) scale(${scale})`;
    const distance = Math.min(
      between(132, 300),
      Math.max(32, bank.element.offsetTop - 55),
    );
    const contactY = surface.y - halfFlake * landingScale * 0.88;
    const contact = pose(0, contactY, 100, landingScale);
    const origin = bank.element.offsetLeft + surface.x;
    const tilt = between(65, 140) * side;
    const approach = descentRoutes[route].map(([offset, sway, height]) => {
      const x = sway * side * amplitude - wind * height * 0.68;
      const boundedX = Math.max(
        15 - origin,
        Math.min(x, layer.clientWidth - 15 - origin),
      );
      return {
        offset,
        transform: pose(
          boundedX,
          contactY - distance * height,
          100 - tilt * (1 - offset),
          1 - offset * 0.29,
        ),
        opacity: offset === 0 ? 0 : 0.96,
        easing: "cubic-bezier(.32,.16,.63,.89)",
      };
    });
    const flight = bank.flake.animate(
      [
        ...approach,
        {
          transform: pose(side * 5, contactY - 6, 100 - tilt * 0.07, 0.61),
          opacity: 0.94,
          offset: 0.93,
        },
        {
          transform: contact,
          opacity: 0.97,
        },
      ],
      {
        duration: between(1540, 2320) + index * 165,
        fill: "forwards",
      },
    );
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
      const rise = surface.y - snowSurface(bank, lane, next).y;
      const merge = bank.flake.animate(
        [
          { transform: contact, opacity: 0.97 },
          {
            transform: pose(0, surface.y - rise * 0.55, 103, 0.26),
            opacity: 0.6,
            offset: 0.45,
          },
          { transform: pose(0, surface.y - rise, 108, 0.12), opacity: 0 },
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

  function onMotionChange() {
    reset();
    weather();
  }

  function resize() {
    if (viewportWidth === layer.clientWidth) {
      update();
      return;
    }
    viewportWidth = layer.clientWidth;
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
    if (layer.isConnected) update();
  });
  rescan();
  weather();
  return () => {
    motion.removeEventListener("change", onMotionChange);
    cleanups.forEach((cleanup) => cleanup());
    cancelRescan?.();
    cancelWeather?.();
    cancelAnimationFrame(frame);
    banks.forEach(release);
  };
}
