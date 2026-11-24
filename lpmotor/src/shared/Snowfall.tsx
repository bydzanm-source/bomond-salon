import { useEffect, useRef, useState, type CSSProperties } from "react";
import snowCap from "../assets/snow/powder-cap.webp?inline";
import { observeSnowfall } from "./snowMotion";
import "../styles/snow.css";

const arms = [
  "M0 0V-10 M-3-6 0-4 3-6 M-2-9 0-7.5 2-9",
  "M0 0V-10 M0-5-3-8 0-11 3-8Z",
  "M0 0V-10 M-4-6 0-3 4-6 M-3-9 0-6.5 3-9",
  "M0 0V-8 M0-7-1.5-9 0-11 1.5-9Z M-2-5 0-3 2-5",
  "M0 0V-10 M-3.5-6.5 0-6.5 3.5-6.5 M-2-4 0-2 2-4",
];

function Crystal({ variant }: { variant: number }) {
  return (
    <svg viewBox="-12 -12 24 24" focusable="false">
      {Array.from({ length: 6 }, (_, arm) => (
        <path
          key={arm}
          d={arms[variant % arms.length]}
          transform={"rotate(" + arm * 60 + ")"}
        />
      ))}
    </svg>
  );
}

const lanes = [
  [4, 9, 15, -8, 42],
  [12, 18, 14, -4, -36],
  [22, 7, 19, -14, 24],
  [31, 12, 17, -11, -48],
  [42, 9, 16, -2, 35],
  [53, 14, 18, -13, 54],
  [61, 7, 16, -5, -40],
  [72, 11, 20, -17, 39],
  [83, 17, 14, -9, -56],
  [92, 10, 13, -6, 30],
  [49, 7, 18, -7, -27],
  [76, 7, 17, -3, 35],
];

const squallLanes = [
  [8, 9, 6, -2, 48],
  [27, 12, 7, -4, 58],
  [45, 8, 5, -1, 42],
  [64, 10, 6, -3, 65],
  [82, 11, 8, -5, 56],
];

function Flurry({ tracks }: { tracks: number[][] }) {
  const [weatherStyles] = useState(() =>
    tracks.map(
      ([lane, size, speed, offset, drift]) =>
        ({
          left: lane + (Math.random() * 4 - 2) + "%",
          width: size,
          animationDuration: speed * (0.84 + Math.random() * 0.32) + "s",
          animationDelay: offset + "s",
          "--snow-drift": drift * (0.54 + Math.random() * 0.93) + "px",
          "--snow-response": 0.55 + Math.random() * 0.45,
        }) as CSSProperties,
    ),
  );
  return weatherStyles.map((style, index) => (
    <span
      className="snow-flurry"
      data-snow-sway={tracks[index][4]}
      key={tracks[index][0]}
      style={style}
    >
      <Crystal variant={index} />
    </span>
  ));
}

// Collision outline sampled from the alpha channel of the Blender render.
const ridgeOutline = [
  "M4.8,19.35 L9.6,17.81 L14.4,17.03 L19.2,13.16 L24.1,10.06 L28.9,6.97 L33.7,7.74 L38.5,6.19 L43.3,4.65 L48.1,3.87 L52.9,3.87 L57.8,7.74",
  "L62.6,6.19 L67.4,4.65 L72.2,0.0 L77.0,0.0 L81.8,3.1 L86.6,6.19 L91.4,7.74 L96.2,4.65 L101.1,5.42 L105.9,5.42 L110.7,8.52 L115.5,7.74",
  "L120.3,7.74 L125.1,6.97 L129.9,9.29 L134.8,13.16 L139.6,15.48 L144.4,17.81 L149.2,19.35 L149.2,21.68 L144.4,22.45 L139.6,22.45 L134.8,23.23 L129.9,24.0",
  "L125.1,24.0 L120.3,24.0 L115.5,24.0 L110.7,24.0 L105.9,24.0 L101.1,24.0 L96.2,24.0 L91.4,24.0 L86.6,24.0 L81.8,24.0 L77.0,24.0 L72.2,24.0",
  "L67.4,24.0 L62.6,24.0 L57.8,24.0 L52.9,24.0 L48.1,24.0 L43.3,24.0 L38.5,24.0 L33.7,24.0 L28.9,24.0 L24.1,24.0 L19.2,23.23 L14.4,22.45",
  "L9.6,22.45 L4.8,21.68 Z",
].join(" ");

export function Snowfall() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (layer.current) return observeSnowfall(layer.current);
  }, []);

  return (
    <div ref={layer} className="snowfall" aria-hidden="true">
      <Flurry tracks={lanes} />
      <div className="snow-squall">
        <Flurry tracks={squallLanes} />
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="snow-drift" data-snow-drift>
          <svg
            className="snow-ridge"
            viewBox="0 0 154 24"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path fill="transparent" d={ridgeOutline} />
            <image
              href={snowCap}
              width={154}
              height={24}
              preserveAspectRatio="none"
            />
          </svg>
          <span className="snow-contact">
            <Crystal variant={index + 2} />
          </span>
        </div>
      ))}
    </div>
  );
}
