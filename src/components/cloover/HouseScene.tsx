import type { ModuleKey } from "@/lib/cloover-data";

type Props = { active: Set<ModuleKey> };

const ASSETS = {
  house: "/cloover-assets/house-cloover.png",
  solar: "/cloover-assets/solar-cloover.png",
  heatPump: "/cloover-assets/heat-pump-cloover.png",
  car: "/cloover-assets/car-cloover.png",
  grid: "/cloover-assets/power-grid-cloover.png",
  battery: "/cloover-assets/battery-cloover.png",
};

export function HouseScene({ active }: Props) {
  const has = (k: ModuleKey) => active.has(k);
  const hasElectricity = has("solar");
  const hasBattery = has("battery");
  const hasHeating = has("heatpump");
  const hasMobility = has("ev");

  return (
    <svg viewBox="0 0 720 480" className="h-full w-full" role="img">
      <title>Home with electricity, heating, and mobility upgrades</title>
      <defs>
        <linearGradient id="imageSceneSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dbe8ff" />
          <stop offset="58%" stopColor="#b8ccff" />
          <stop offset="100%" stopColor="#91afff" />
        </linearGradient>
        <linearGradient id="imageSceneGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eef2fb" />
        </linearGradient>
        <pattern id="imageSceneDots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.1" fill="#dfe6f2" opacity="0.9" />
        </pattern>
        <filter id="imageSoftShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#657491" floodOpacity="0.24" />
        </filter>
      </defs>

      <rect width="720" height="480" rx="26" fill="url(#imageSceneSky)" />
      <path
        d="M0 302 C 128 286 198 328 320 306 C 450 282 520 294 720 278 L720 480 L0 480 Z"
        fill="url(#imageSceneGround)"
      />
      <rect y="302" width="720" height="178" fill="url(#imageSceneDots)" opacity="0.58" />

      <g className="cute-float-slow" opacity="0.75">
        <ellipse cx="96" cy="88" rx="35" ry="19" fill="#fff" opacity="0.55" />
        <ellipse cx="133" cy="84" rx="48" ry="24" fill="#fff" opacity="0.45" />
      </g>

      {/* <g className="cute-price-pill" filter="url(#imageSoftShadow)">
        <rect x="548" y="36" width="112" height="45" rx="13" fill="#ffffff" />
        <circle cx="574" cy="58" r="8" fill="#1F6FEB" />
        <text x="592" y="65" fontSize="22" fontWeight="800" fill="#252a36">
          7.24 ct
        </text>
      </g> */}

      <g className="cute-float-slow" opacity="0.95" filter="url(#imageSoftShadow)">
        <image
          href={ASSETS.grid}
          x="508"
          y="72"
          width="218"
          height="207"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>

      <g id="grid-line">
        <path
          d="M630 188 C590 238 540 286 486 314 C438 338 382 336 330 318"
          fill="none"
          stroke="#355b62"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.58"
        />
        <path
          d="M630 188 C590 238 540 286 486 314 C438 338 382 336 330 318"
          fill="none"
          stroke="#7CFF30"
          strokeWidth="5"
          strokeLinecap="round"
          className="cute-flow"
        />
      </g>

      <g className="cute-house-bob" filter="url(#imageSoftShadow)">
        <image
          href={ASSETS.house}
          x="82"
          y="92"
          width="502"
          height="366"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>

      {hasElectricity && (
        <g id="panel-probe" className="anim-pop" filter="url(#imageSoftShadow)">
          <image
            href={ASSETS.solar}
            x="46"
            y="14"
            width="236"
            height="192"
            preserveAspectRatio="xMidYMid meet"
          />
          <path
            d="M198 172 C232 206 258 248 300 292"
            fill="none"
            stroke="#7CFF30"
            strokeWidth="5"
            strokeLinecap="round"
            className="cute-flow"
          />
        </g>
      )}

      {hasBattery && (
        <g id="battery-probe" className="anim-pop" filter="url(#imageSoftShadow)">
          <image
            href={ASSETS.battery}
            x="490"
            y="262"
            width="92"
            height="137"
            preserveAspectRatio="xMidYMid meet"
          />
          <path
            d="M500 334 C458 330 410 318 360 304"
            fill="none"
            stroke="#7CFF30"
            strokeWidth="5"
            strokeLinecap="round"
            className="cute-flow"
          />
        </g>
      )}

      {hasHeating && (
        <g id="heatpump-probe" className="anim-pop" filter="url(#imageSoftShadow)">
          <image
            href={ASSETS.heatPump}
            x="12"
            y="294"
            width="138"
            height="164"
            preserveAspectRatio="xMidYMid meet"
          />
          <path
            d="M142 386 C190 374 240 348 292 318"
            fill="none"
            stroke="#7CFF30"
            strokeWidth="5"
            strokeLinecap="round"
            className="cute-flow"
          />
        </g>
      )}

      {hasMobility && (
        <g id="ev-probe" className="anim-pop" filter="url(#imageSoftShadow)">
          <image
            href={ASSETS.car}
            x="536"
            y="304"
            width="176"
            height="169"
            preserveAspectRatio="xMidYMid meet"
          />
          <path
            d="M590 382 C548 356 494 336 436 322"
            fill="none"
            stroke="#7CFF30"
            strokeWidth="5"
            strokeLinecap="round"
            className="cute-flow"
          />
        </g>
      )}

      {hasElectricity && (
        <g className="cute-feed-card" filter="url(#imageSoftShadow)">
          <rect x="232" y="390" width="252" height="68" rx="18" fill="#ffffff" opacity="0.96" />
          <text x="358" y="415" fontSize="15" fontWeight="700" fill="#8a8e9a" textAnchor="middle">
            Feed In
          </text>
          <text x="358" y="445" fontSize="38" fontWeight="900" fill="#1F6FEB" textAnchor="middle">
            3639W
          </text>
        </g>
      )}
    </svg>
  );
}
