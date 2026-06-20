import type { ModuleKey } from "@/lib/cloover-data";

type Props = { active: Set<ModuleKey> };

export function HouseScene({ active }: Props) {
  const has = (k: ModuleKey) => active.has(k);
  return (
    <svg viewBox="0 0 720 480" className="w-full h-full max-h-[520px]">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dde7ff" />
          <stop offset="100%" stopColor="#f5f7ff" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef0f4" />
          <stop offset="100%" stopColor="#dde0e6" />
        </linearGradient>
        <linearGradient id="roof" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a4452" />
          <stop offset="100%" stopColor="#252b35" />
        </linearGradient>
        <linearGradient id="roofR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#525d6e" />
          <stop offset="100%" stopColor="#39414e" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8eaf0" />
        </linearGradient>
        <linearGradient id="wallSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dde0e8" />
          <stop offset="100%" stopColor="#c6cbd6" />
        </linearGradient>
        <pattern id="panel" width="14" height="10" patternUnits="userSpaceOnUse">
          <rect width="14" height="10" fill="#0b2a8a" />
          <rect x="0.5" y="0.5" width="13" height="9" fill="#1d3fbf" stroke="#0a2270" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Sky and ground */}
      <rect width="720" height="320" fill="url(#sky)" />
      <rect y="320" width="720" height="160" fill="url(#ground)" />
      {/* Sun */}
      <circle cx="600" cy="80" r="32" fill="#ffd66b" opacity="0.6" />
      <circle cx="600" cy="80" r="22" fill="#ffc83d" />

      {/* Distant grid pole */}
      <g opacity="0.8">
        <rect x="640" y="220" width="4" height="160" fill="#8892a3" />
        <rect x="615" y="230" width="54" height="4" fill="#8892a3" />
        <rect x="620" y="245" width="44" height="3" fill="#8892a3" />
      </g>

      {/* House body — isometric */}
      {/* Front wall */}
      <polygon points="180,210 420,210 420,360 180,360" fill="url(#wall)" />
      {/* Side wall */}
      <polygon points="420,210 510,180 510,330 420,360" fill="url(#wallSide)" />
      {/* Door */}
      <rect x="270" y="280" width="40" height="80" fill="#2a3142" />
      <circle cx="302" cy="322" r="2" fill="#ffd66b" />
      {/* Windows */}
      <rect x="200" y="240" width="50" height="40" fill="#bcd4ff" stroke="#5b6b85" strokeWidth="1.5" />
      <rect x="345" y="240" width="50" height="40" fill="#bcd4ff" stroke="#5b6b85" strokeWidth="1.5" />
      {/* Roof gable - front */}
      <polygon points="160,210 300,120 440,210" fill="url(#roof)" />
      <polygon points="440,210 300,120 380,80 510,180" fill="url(#roofR)" />
      <polygon points="300,120 380,80 380,80" fill="none" />

      {/* Solar panels on roof */}
      {has("solar") && (
        <g className="anim-roof">
          <polygon points="220,200 290,150 380,150 320,200" fill="url(#panel)" stroke="#08185a" strokeWidth="1" />
          <line x1="240" y1="185" x2="345" y2="185" stroke="#5fa3ff" strokeWidth="0.5" />
          <line x1="260" y1="170" x2="365" y2="170" stroke="#5fa3ff" strokeWidth="0.5" />
          {/* Side panel */}
          <polygon points="440,200 380,150 430,130 490,180" fill="url(#panel)" stroke="#08185a" strokeWidth="1" opacity="0.85" />
        </g>
      )}

      {/* Battery — left of house */}
      {has("battery") && (
        <g className="anim-pop">
          <rect x="90" y="300" width="60" height="60" rx="6" fill="#fff" stroke="#1a2330" strokeWidth="2" />
          <rect x="95" y="305" width="50" height="6" rx="2" fill="#e5e8ee" />
          <rect x="100" y="320" width="40" height="32" rx="3" fill="#EBEFFF" />
          <rect x="100" y="340" width="28" height="12" rx="2" fill="#002EFF" />
          <text x="120" y="375" fontSize="9" fill="#6F6F6F" textAnchor="middle" fontWeight="600">Battery</text>
        </g>
      )}

      {/* Heat pump — outside right of house */}
      {has("heatpump") && (
        <g className="anim-pop">
          <rect x="525" y="305" width="62" height="55" rx="6" fill="#fff" stroke="#1a2330" strokeWidth="2" />
          <circle cx="556" cy="333" r="18" fill="#EBEFFF" stroke="#1a2330" strokeWidth="1.5" />
          <g transform="translate(556 333)">
            <line x1="-12" y1="0" x2="12" y2="0" stroke="#1a2330" strokeWidth="2" />
            <line x1="0" y1="-12" x2="0" y2="12" stroke="#1a2330" strokeWidth="2" />
            <line x1="-8" y1="-8" x2="8" y2="8" stroke="#1a2330" strokeWidth="2" />
            <line x1="-8" y1="8" x2="8" y2="-8" stroke="#1a2330" strokeWidth="2" />
          </g>
          <text x="556" y="378" fontSize="9" fill="#6F6F6F" textAnchor="middle" fontWeight="600">Heat pump</text>
        </g>
      )}

      {/* EV + charger — driveway in front */}
      {has("ev") && (
        <g className="anim-pop">
          {/* Driveway */}
          <polygon points="430,400 580,400 590,440 420,440" fill="#c1c5cd" />
          {/* Car */}
          <g transform="translate(450 380)">
            <path d="M5,30 L15,12 L75,12 L88,30 L88,42 L5,42 Z" fill="#2c3e50" />
            <path d="M18,28 L25,15 L70,15 L80,28 Z" fill="#a8d0ff" opacity="0.7" />
            <circle cx="22" cy="44" r="6" fill="#1a1a1a" />
            <circle cx="72" cy="44" r="6" fill="#1a1a1a" />
            <circle cx="22" cy="44" r="2.5" fill="#666" />
            <circle cx="72" cy="44" r="2.5" fill="#666" />
          </g>
          {/* Charger pole */}
          <rect x="555" y="380" width="8" height="40" fill="#fff" stroke="#1a2330" strokeWidth="1.5" />
          <rect x="551" y="378" width="16" height="14" rx="2" fill="#002EFF" />
          <text x="559" y="430" fontSize="8" fill="#6F6F6F" textAnchor="middle" fontWeight="600">EV charger</text>
        </g>
      )}

      {/* Heat pump boiler — small inside indicator */}
      {has("boiler") && (
        <g className="anim-pop">
          <rect x="160" y="380" width="34" height="44" rx="4" fill="#fff" stroke="#1a2330" strokeWidth="1.5" />
          <circle cx="177" cy="395" r="4" fill="#EBEFFF" stroke="#1a2330" />
          <rect x="168" y="404" width="18" height="14" rx="2" fill="#EBEFFF" />
          <text x="177" y="438" fontSize="8" fill="#6F6F6F" textAnchor="middle" fontWeight="600">Boiler</text>
        </g>
      )}

      {/* Electric heating — small radiator */}
      {has("electricheating") && (
        <g className="anim-pop">
          <rect x="210" y="395" width="48" height="28" rx="3" fill="#fff" stroke="#1a2330" strokeWidth="1.5" />
          <line x1="218" y1="395" x2="218" y2="423" stroke="#1a2330" />
          <line x1="226" y1="395" x2="226" y2="423" stroke="#1a2330" />
          <line x1="234" y1="395" x2="234" y2="423" stroke="#1a2330" />
          <line x1="242" y1="395" x2="242" y2="423" stroke="#1a2330" />
          <line x1="250" y1="395" x2="250" y2="423" stroke="#1a2330" />
          <text x="234" y="438" fontSize="8" fill="#6F6F6F" textAnchor="middle" fontWeight="600">El. heating</text>
        </g>
      )}

      {/* Energy flow lines for dynamic tariff */}
      {has("tariff") && (
        <g>
          <path
            d="M150 360 Q 240 410 420 410 T 640 360"
            stroke="#002EFF"
            strokeWidth="2.5"
            fill="none"
            className="anim-flow"
          />
          {has("solar") && (
            <path
              d="M310 180 L 310 240 L 150 320"
              stroke="#002EFF"
              strokeWidth="2"
              fill="none"
              className="anim-flow"
              opacity="0.7"
            />
          )}
        </g>
      )}
    </svg>
  );
}
