import { studio } from "../content/studio";

const entranceX = Math.round(
  ((studio.courtyardEntrance.longitude - 37.9295) / 0.0053) * 620,
);
const entranceY = Math.round(
  ((55.79612 - studio.courtyardEntrance.latitude) / 0.002) * 420,
);

export function ContactApproach() {
  return (
    <figure className="contacts-approach">
      <svg
        viewBox="0 0 620 420"
        role="img"
        aria-label="Вход в Bomond со двора. Проход слева от дома и через арку."
      >
        <defs>
          <marker
            id="contacts-arrow-left"
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            markerWidth="3"
            markerHeight="3"
            orient="auto"
          >
            <path d="M1 1l10 5-10 5z" fill="#9f3e19" />
          </marker>
          <marker
            id="contacts-arrow-arch"
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            markerWidth="3"
            markerHeight="3"
            orient="auto"
          >
            <path d="M1 1l10 5-10 5z" fill="#2c5f80" />
          </marker>
        </defs>

        <rect width="620" height="420" fill="#f4f0e9" />
        <path
          d="M34 43h208v176H34zm298 9h138v155H332zm-290 282h432v35H42z"
          fill="#e6eadc"
        />
        <path
          d="M-15 309l125 7 151-9 178-10 23-1 86-4M261 307l1-13-3-48-58-5-91 2-67 12-20 0V120M259 246l15-6 56-10 105 2 24-1 14-1 8-8 8-83 8-139M330 230V0M435 232l3 43 1 22M459 231v16l2 27 1 22M574 0l-4 50-3 61-5 87-10 42-4 52-7 95M-18 423l151-7 107-8 222-14 79-7 79 3"
          fill="none"
          stroke="#ded8cf"
          strokeWidth="17"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M-15 309l125 7 151-9 178-10 23-1 86-4M261 307l1-13-3-48-58-5-91 2-67 12-20 0V120M259 246l15-6 56-10 105 2 24-1 14-1 8-8 8-83 8-139M330 230V0M435 232l3 43 1 22M459 231v16l2 27 1 22M574 0l-4 50-3 61-5 87-10 42-4 52-7 95M-18 423l151-7 107-8 222-14 79-7 79 3"
          fill="none"
          stroke="#fffdfa"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g fill="#ded4c6" stroke="#c5b8a6" strokeWidth="1.5">
          <path d="M295 257l117-7 18-1 2 27-135 8z" fill="#e9d5be" />
          <path d="M465 247l37-3 2-26 5-99 27 1-5 99-2 53-62 4z" />
          <path d="M295 51h23v162h-23z" />
        </g>
        <g className="contacts-approach-label" fill="#544637">
          <text x="40" y="38" fontSize="15" textAnchor="middle">
            С
          </text>
          <path d="M40 47l-6 13h12z" fill="#544637" />
          <text x="205" y="196" fontSize="20">
            Двор
          </text>
          <text x="301" y="111" fontSize="15">
            7А
          </text>
          <text x="351" y="274" fontSize="16">
            7/1
          </text>
          <text x="569" y="262" fontSize="18" transform="rotate(-90 569 262)">
            Советская улица
          </text>
          <text x="135" y="385" fontSize="18">
            Шоссе Энтузиастов · дублёр
          </text>
        </g>

        <path
          d="M115 315l136-7q11-1 11-14l-3-46 15-8 48-9"
          fill="none"
          stroke="#9f3e19"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd="url(#contacts-arrow-left)"
        />
        <path
          d="M283 306l171-10q8 0 8-10l-3-45q0-9-11-9l-91-1"
          fill="none"
          stroke="#2c5f80"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd="url(#contacts-arrow-arch)"
        />
        <path
          d={`M${entranceX} 231V${entranceY}`}
          fill="none"
          stroke="#574832"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 5"
        />
        <circle
          cx={entranceX}
          cy={entranceY}
          r="8"
          fill="#4e2d21"
          stroke="#fffdfa"
          strokeWidth="3"
        />
        <path d="M339 218v28" stroke="#4e2d21" strokeWidth="1.5" />
        <rect x="317" y="179" width="151" height="39" rx="10" fill="#4e2d21" />
        <text
          className="contacts-approach-label"
          x="330"
          y="203"
          fontSize="18"
          fontWeight="700"
          fill="#fffdfa"
        >
          Вход со двора
        </text>
        <text
          className="contacts-approach-label"
          x="99"
          y="346"
          fontSize="17"
          fontWeight="700"
          fill="#9f3e19"
        >
          Слева от дома
        </text>
        <text
          className="contacts-approach-label"
          x="382"
          y="333"
          fontSize="17"
          fontWeight="700"
          fill="#2c5f80"
        >
          Через арку
        </text>
      </svg>
      <figcaption>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener"
        >
          © OpenStreetMap
        </a>
      </figcaption>
    </figure>
  );
}
