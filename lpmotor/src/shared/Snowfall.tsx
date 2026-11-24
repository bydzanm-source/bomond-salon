import { useEffect, useRef, type CSSProperties } from "react";
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

const ridges = [
  "M1 23 Q6 18 15 17 Q22 8 33 11 Q44 3 57 9 Q69 1 82 8 Q91 7 99 13 Q108 9 118 14 Q134 12 153 22 Q113 24 78 23 Q35 24 1 23Z",
  "M1 23 Q12 17 21 17 Q29 12 37 14 Q50 5 62 11 Q76 3 92 10 Q104 8 113 15 Q126 13 153 23 Q117 24 77 23 Q33 24 1 23Z",
];

export function Snowfall() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (layer.current) return observeSnowfall(layer.current);
  }, []);

  return (
    <div ref={layer} className="snowfall" aria-hidden="true">
      {lanes.map(([lane, size, speed, offset, drift], index) => (
        <span
          className="snow-flurry"
          key={lane}
          style={
            {
              left: lane + "%",
              width: size,
              animationDuration: speed + "s",
              animationDelay: offset + "s",
              "--snow-drift": drift + "px",
            } as CSSProperties
          }
        >
          <Crystal variant={index} />
        </span>
      ))}
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="snow-drift" data-snow-drift>
          <svg
            className="snow-ridge"
            viewBox="0 0 154 24"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path fill="#f9fbff" d={ridges[index % ridges.length]} />
            <path
              fill="#dce8f3"
              fillOpacity=".8"
              d="M3 22 Q20 22 34 18 Q47 20 61 16 Q76 20 91 17 Q111 21 126 19 Q142 22 153 22 Q115 24 78 23 Q34 24 3 22Z"
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
