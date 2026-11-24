import {
  delay,
  listen,
  observeMutations,
} from "../integrations/sectionRuntime";

type Landing = { element: Element; kind: "heading" | "photo"; edge: number };
const content = ":is(.bomond main, [data-bomond-island])";
const gustTime = 7400;
const cycleTime = 10500;

function findLandings(height: number): Array<Landing | undefined> {
  function visible(selector: string, minimumHeight: number) {
    return Array.from(document.querySelectorAll(selector)).filter((element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.width > 36 &&
        rect.height > minimumHeight &&
        rect.top > 58 &&
        rect.top < height + 55
      );
    });
  }
  const headings = visible(content + " h1 span, " + content + " h2", 10);
  const heroPhoto = document
    .querySelector(content + " h1")
    ?.closest("section")
    ?.querySelector("img");
  // The portrait has no intrinsic height until its CDN image loads.
  const photos = visible(content + " img", -1).filter(
    (element) =>
      element === heroPhoto || element.getBoundingClientRect().height > 85,
  );
  const heading = (element?: Element): Landing | undefined =>
    element && { element, kind: "heading", edge: 0.78 };
  const photo = (
    element: Element | undefined,
    edge: number,
  ): Landing | undefined => element && { element, kind: "photo", edge };
  return [
    heading(headings[0]),
    photo(photos[0], 0.83),
    undefined,
    heading(headings[1]),
    undefined,
    photo(photos[1], 0.18),
  ];
}

function landingPoint(landing: Landing, width: number) {
  const rect = landing.element.getBoundingClientRect();
  if (landing.kind === "photo") {
    return { x: rect.left + rect.width * landing.edge, y: rect.top + 5 };
  }
  const text = document.createRange();
  text.selectNodeContents(landing.element);
  const line = text.getClientRects()[0] ?? rect;
  const hasSideSpace = line.right < width - 32;
  return {
    x: hasSideSpace ? line.right - 2 : line.left + line.width * landing.edge,
    y: line.top + (hasSideSpace ? 6 : -4),
  };
}

function pose(
  offset: number,
  x: number,
  y: number,
  angle: number,
  tilt: number,
  opacity = 0.96,
): Keyframe {
  return {
    offset,
    opacity,
    transform: `translate3d(${x}px,${y}px,0) rotate(${angle}deg) rotateY(${tilt}deg)`,
  };
}

function restAngle(index: number) {
  return (index % 2 === 0 ? 1 : -1) * (24 + index * 4);
}

function descend(y: number, landing: boolean, index: number): Keyframe[] {
  const angle = restAngle(index);
  const sway = Math.sign(angle);
  const drop = landing ? Math.min(265, y + 33) : y + 45;
  return [
    pose(0, -43 * sway, -drop, angle - 95, 34, 0),
    pose(0.26, 15 * sway, -drop * 0.73, angle + 12, 11),
    pose(0.56, -31 * sway, -drop * 0.36, angle - 51, 64),
    pose(0.82, 10 * sway, -drop * 0.1, angle + 24, 17),
    pose(0.94, -2 * sway, -1, angle - 5, 8),
    pose(1, 0, 0, angle, 0, landing ? 0.96 : 0),
  ];
}

function gust(direction: number, index: number, width: number): Keyframe[] {
  const angle = restAngle(index);
  const curl = Math.min(width * 0.2, 104) * direction;
  const lift = 65 + index * 6;
  return [
    pose(0, 0, 0, angle, 0),
    pose(0.12, 8 * direction, -13, angle - 18 * direction, 26),
    pose(0.37, curl * 0.78, -lift, angle + 105 * direction, 71),
    pose(0.57, curl * 0.43, -lift * 1.49, angle + 225 * direction, 147),
    pose(0.75, curl * 1.41, -lift * 1.3, angle + 330 * direction, 201, 0.89),
    pose(1, curl * 2.5, -lift * 1.8, angle + 450 * direction, 327, 0),
  ];
}

export function animateLeaves(layer: HTMLElement) {
  const elements = Array.from(
    layer.querySelectorAll<HTMLElement>("[data-leaf]"),
  );
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let landings: Array<Landing | undefined> = [];
  let animations: Animation[] = [];
  let stopTimers: Array<() => void> = [];
  let frame = 0;
  let cycle = 0;
  let lastScroll = window.scrollY;

  function stop() {
    stopTimers.forEach((cancel) => cancel());
    stopTimers = [];
    animations.forEach((animation) => animation.cancel());
    animations = [];
    elements.forEach((element) => {
      delete element.dataset.leafPhase;
      delete element.dataset.leafSurface;
    });
  }

  function place() {
    const { clientWidth: width, clientHeight: height } = layer;
    const positions = elements.map((_, index) => {
      const landing = landings[index];
      if (landing) return landingPoint(landing, width);
      const space = (index * 0.38197 + cycle * 0.19) % 1;
      return { x: width * (0.06 + space * 0.88), y: height + 46 };
    });
    elements.forEach((element, index) => {
      const { x, y } = positions[index];
      element.style.left =
        Math.round(Math.max(18, Math.min(x, width - 18))) + "px";
      element.style.top = Math.round(y) + "px";
    });
    return positions;
  }

  function start() {
    stop();
    if (document.documentElement.dataset.season !== "autumn" || document.hidden)
      return;

    const { clientWidth: width, clientHeight: height } = layer;
    const still = motion.matches || typeof layer.animate !== "function";
    landings = findLandings(height);
    const positions = place();
    const direction = cycle % 2 === 0 ? 1 : -1;
    lastScroll = window.scrollY;

    elements.forEach((element, index) => {
      const landing = landings[index];
      if (landing) element.dataset.leafSurface = landing.kind;
      if (still) {
        if (landing && index < 2) element.dataset.leafPhase = "still";
        return;
      }
      element.dataset.leafPhase = "falling";
      const flight = element.animate(
        descend(positions[index].y, Boolean(landing), index),
        {
          duration: landing ? 2190 + index * 245 : 3900 + index * 280,
          delay: index * 235,
          fill: "both",
          easing: "cubic-bezier(.32,.10,.46,1)",
        },
      );
      flight.onfinish = () => {
        element.dataset.leafPhase = landing ? "resting" : "gone";
      };
      animations.push(flight);
      if (!landing) return;

      stopTimers.push(
        delay(
          () => {
            const wind = element.animate(gust(direction, index, width), {
              duration: 1500 + index * 85,
              fill: "forwards",
            });
            animations.push(wind);
            flight.cancel();
            element.dataset.leafPhase = "gust";
            wind.onfinish = () => {
              element.dataset.leafPhase = "gone";
            };
          },
          gustTime + index * 105,
        ),
      );
    });

    if (!still)
      stopTimers.push(
        delay(() => {
          cycle++;
          start();
        }, cycleTime),
      );
  }

  function updatePosition() {
    if (frame || document.documentElement.dataset.season !== "autumn") return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (Math.abs(window.scrollY - lastScroll) > layer.clientHeight * 0.43)
        start();
      else place();
    });
  }

  const observer = observeMutations(start);
  observer?.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-season"],
  });
  const cleanups = [
    listen(window, "scroll", updatePosition),
    listen(window, "resize", start),
    listen(document, "load", updatePosition, true),
    listen(document, "visibilitychange", start),
  ];
  // MediaQueryList isn't a DOM target managed by the LPmotor section runtime.
  motion.addEventListener("change", start);
  void document.fonts.ready.then(() => {
    if (layer.isConnected) updatePosition();
  });
  start();
  return () => {
    stop();
    cancelAnimationFrame(frame);
    observer?.disconnect();
    cleanups.forEach((cleanup) => cleanup());
    motion.removeEventListener("change", start);
  };
}
