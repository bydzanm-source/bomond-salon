import { useEffect, useRef } from "react";
import maple from "../assets/leaves/maple.webp?inline";
import ginkgo from "../assets/leaves/ginkgo.webp?inline";
import oak from "../assets/leaves/oak.webp?inline";
import birch from "../assets/leaves/birch.webp?inline";
import beech from "../assets/leaves/beech.webp?inline";
import sweetgum from "../assets/leaves/sweetgum.webp?inline";
import { animateLeaves } from "./leafMotion";
import "../styles/leaves.css";

const leaves = { maple, ginkgo, oak, birch, beech, sweetgum };
const driftingLeaves = { "oak-drift": oak, "sweetgum-drift": sweetgum };

export function FallingLeaves() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (layer.current) return animateLeaves(layer.current);
  }, []);

  return (
    <div ref={layer} className="falling-leaves" aria-hidden="true">
      {Object.entries({ ...leaves, ...driftingLeaves }).map(([kind, image]) => (
        <span key={kind} data-leaf={kind}>
          <img src={image} alt="" decoding="async" draggable={false} />
        </span>
      ))}
    </div>
  );
}
