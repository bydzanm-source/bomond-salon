import {
  delay,
  listen,
  observeMutations,
} from "../integrations/sectionRuntime";

type Landing = { element: Element; kind: "heading" | "photo"; edge: number };
const content = ":is(.bomond main, [data-bomond-island])";
const landingSelectors = {
  heading: content + " h1 span, " + content + " h2, " + content + " h3",
  photo: content + " img",
};

function findLandings(height: number) {
  const heroPhoto = document
    .querySelector(content + " h1")
    ?.closest("section")
    ?.querySelector("img");
  function visible(kind: Landing["kind"]) {
    return Array.from(document.querySelectorAll(landingSelectors[kind])).filter(
      (element) => {
        const rect = element.getBoundingClientRect();
        // The hero portrait may still be loading when the leaves first appear.
        const hasHeight =
          kind === "photo"
            ? rect.height > 65 || element === heroPhoto
            : rect.height > 9;
        return (
          hasHeight &&
          rect.width > 36 &&
          rect.top > 62 &&
          rect.top < height - 8 &&
          getComputedStyle(element).visibility === "visible"
        );
      },
    );
  }
  return { heading: visible("heading"), photo: visible("photo") };
}

function landingPoint(landing: Landing, width: number) {
  const rect = landing.element.getBoundingClientRect();
  if (landing.kind === "photo") {
    return { x: rect.left + rect.width * landing.edge, y: rect.top + 5 };
  }
  const text = document.createRange();
  text.selectNodeContents(landing.element);
  const line = text.getClientRects()[0] ?? rect;
  if (landing.edge < 0.5) {
    return { x: line.left + 3, y: line.top - 4 };
  }
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
  const drop = landing ? Math.min(265, Math.max(75, y - 35)) : y + 45;
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

type Leaf = {
  element: HTMLElement;
  index: number;
  rounds: number;
  landing?: Landing;
  animation?: Animation;
  cancelRest?: () => void;
};

export function animateLeaves(layer: HTMLElement) {
  const leaves = Array.from(
    layer.querySelectorAll<HTMLElement>("[data-leaf]"),
  ).map((element, index): Leaf => ({ element, index, rounds: 0 }));
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let cancelScrollSettle: (() => void) | undefined;

  const isAutumn = () => document.documentElement.dataset.season === "autumn";
  const isStill = () => motion.matches || typeof layer.animate !== "function";

  function clear(leaf: Leaf) {
    leaf.cancelRest?.();
    leaf.cancelRest = undefined;
    leaf.animation?.cancel();
    leaf.animation = undefined;
    leaf.landing = undefined;
    delete leaf.element.dataset.leafPhase;
    delete leaf.element.dataset.leafSurface;
  }

  function chooseLanding(
    leaf: Leaf,
    surfaces: ReturnType<typeof findLandings>,
  ): Landing | undefined {
    const occupants = (element: Element) =>
      leaves.filter((other) => other.landing?.element === element).length;
    const preferred = leaf.index % 2 === 0 ? "heading" : "photo";
    const alternate = preferred === "heading" ? "photo" : "heading";
    const candidates = [...surfaces[preferred], ...surfaces[alternate]];
    const element =
      candidates.find((candidate) => occupants(candidate) === 0) ??
      candidates.find((candidate) => occupants(candidate) === 1);
    if (!element) return;
    const kind = surfaces.heading.includes(element) ? "heading" : "photo";
    const oppositeCorner =
      occupants(element) === 1
        ? leaves.find((other) => other.landing?.element === element)!.landing!
            .edge > 0.5
        : leaf.index % 4 > 1;
    return { element, kind, edge: oppositeCorner ? 0.18 : 0.83 };
  }

  function position(leaf: Leaf) {
    const { clientWidth: width, clientHeight: height } = layer;
    const lane = (leaf.index * 0.38197 + leaf.rounds * 0.17) % 1;
    const point = leaf.landing
      ? landingPoint(leaf.landing, width)
      : { x: width * (0.09 + lane * 0.82), y: height + 46 };
    leaf.element.style.left =
      Math.round(Math.max(20, Math.min(point.x, width - 20))) + "px";
    leaf.element.style.top = Math.round(point.y) + "px";
    return point;
  }

  function begin(
    leaf: Leaf,
    surfaces: ReturnType<typeof findLandings>,
    skipEntrance = false,
  ) {
    clear(leaf);
    const { element, index } = leaf;
    const drifting = index >= 6;
    const still = isStill();
    if (still && index >= 2) return;

    if (!drifting) leaf.landing = chooseLanding(leaf, surfaces);
    const landing = leaf.landing;
    const { y } = position(leaf);
    if (landing) element.dataset.leafSurface = landing.kind;
    if (still) {
      if (landing) element.dataset.leafPhase = "still";
      return;
    }

    const duration = landing ? 2010 + index * 170 : 5250 + index * 160;
    element.dataset.leafPhase = "falling";
    const flight = element.animate(descend(y, Boolean(landing), index), {
      duration: drifting ? 6250 : duration,
      delay: !drifting && leaf.rounds === 0 && !skipEntrance ? index * 140 : 0,
      fill: "both",
      easing: drifting ? "linear" : "cubic-bezier(.32,.10,.46,1)",
      iterations: drifting ? Infinity : 1,
    });
    // The drifting pair is staggered and independent of scrolling and landings.
    if (drifting) flight.currentTime = 6250 * (index === 6 ? 0.28 : 0.78);
    else if (skipEntrance) flight.currentTime = duration * 0.29;
    leaf.animation = flight;
    flight.onfinish = () => {
      if (leaf.animation !== flight) return;
      if (!landing) {
        recycle(leaf);
        return;
      }
      element.dataset.leafPhase = "resting";
      leaf.cancelRest = delay(() => lift(leaf), 4150 + index * 260);
    };
  }

  function recycle(leaf: Leaf) {
    leaf.rounds++;
    begin(
      leaf,
      leaf.index >= 6
        ? { heading: [], photo: [] }
        : findLandings(layer.clientHeight),
    );
  }

  function lift(leaf: Leaf) {
    const { element, index } = leaf;
    const direction = (leaf.rounds + index) % 2 === 0 ? 1 : -1;
    const wind = element.animate(gust(direction, index, layer.clientWidth), {
      duration: 1430 + index * 85,
      fill: "both",
    });
    leaf.animation?.cancel();
    leaf.animation = wind;
    element.dataset.leafPhase = "gust";
    wind.onfinish = () => {
      if (leaf.animation === wind) recycle(leaf);
    };
  }

  function start() {
    leaves.forEach(clear);
    if (!isAutumn() || document.hidden) return;
    const surfaces = findLandings(layer.clientHeight);
    leaves.forEach((leaf) => begin(leaf, surfaces));
  }

  function updatePosition() {
    if (frame || !isAutumn() || document.hidden) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const height = layer.clientHeight;
      const outside = leaves.filter(({ landing }) => {
        if (!landing) return false;
        const top = landing.element.getBoundingClientRect().top;
        return (
          top < 43 ||
          top > height + 28 ||
          !landing.element.isConnected ||
          landing.element.getBoundingClientRect().width === 0
        );
      });
      outside.forEach(clear);
      const surfaces = outside.length ? findLandings(height) : undefined;
      for (const leaf of leaves) {
        if (outside.includes(leaf)) begin(leaf, surfaces!, true);
        else if (leaf.element.dataset.leafPhase) position(leaf);
      }
    });
  }

  function handleScroll() {
    updatePosition();
    if (!isAutumn() || document.hidden) return;
    cancelScrollSettle?.();
    cancelScrollSettle = delay(() => {
      if (!isAutumn() || document.hidden) return;
      const surfaces = findLandings(layer.clientHeight);
      for (const leaf of leaves) {
        if (
          !leaf.landing &&
          leaf.index < (isStill() ? 2 : 6) &&
          chooseLanding(leaf, surfaces)
        ) {
          begin(leaf, surfaces, true);
        }
      }
    }, 130);
  }

  const observer = observeMutations(start);
  observer?.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-season"],
  });
  const cleanups = [
    listen(window, "scroll", handleScroll),
    listen(window, "resize", updatePosition),
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
    leaves.forEach(clear);
    cancelScrollSettle?.();
    cancelAnimationFrame(frame);
    observer?.disconnect();
    cleanups.forEach((cleanup) => cleanup());
    motion.removeEventListener("change", start);
  };
}
