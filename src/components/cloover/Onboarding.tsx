import { useState } from "react";
import { ChevronDown, Sun, Flame, Plug, Home as HomeIcon, Zap } from "lucide-react";
import { CloverLogo } from "./Logo";
import type { OnboardingData } from "@/lib/cloover-data";
import { DEFAULT_ONBOARDING } from "@/lib/cloover-data";

type Props = { onComplete: (data: OnboardingData) => void };

const ROOF_TYPES = ["Hip roof", "Flat roof", "Gable roof", "Pyramid roof", "Shed roof"];
const ORIENTATIONS = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
const ANGLES = ["0°", "30°", "45°", "Manual"];

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(DEFAULT_ONBOARDING);
  const update = (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch }));

  const monthlyCost = ((data.yearlyKwh * data.pricePerKwh) / 12).toFixed(2);

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const screens = [
    <AddressScreen key="0" data={data} update={update} onNext={next} />,
    <MapScreen key="1" drawn={data.roofDrawn} setDrawn={(v) => update({ roofDrawn: v })} onBack={back} onNext={next} />,
    <RoofTypeScreen key="2" value={data.roofType} onChange={(v) => update({ roofType: v })} onBack={back} onNext={next} />,
    <PitchScreen key="3" data={data} update={update} onBack={back} onNext={next} />,
    <ConsumptionScreen key="4" data={data} update={update} onBack={back} onNext={next} />,
    <YearlyScreen key="5" data={data} update={update} monthlyCost={monthlyCost} onBack={back} onNext={next} />,
    <SummaryScreen key="6" data={data} monthlyCost={monthlyCost} onBack={back} onNext={() => onComplete(data)} />,
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        background:
          "linear-gradient(180deg, rgba(180,200,230,0.45) 0%, rgba(120,130,150,0.5) 100%)",
      }}
    >
      <div className="min-h-full flex items-start justify-center p-4 md:p-10">
        <div className="w-full max-w-3xl bg-white rounded-[28px] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center pt-8 pb-6 border-b border-line">
            <CloverLogo />
          </div>
          <div className="px-6 md:px-12 py-10 min-h-[520px] flex flex-col">
            <StepDots step={step} total={7} />
            <div className="flex-1 mt-6">{screens[step]}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === step ? "w-8 bg-cloover" : i < step ? "w-4 bg-cloover/40" : "w-4 bg-line"
          }`}
        />
      ))}
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl md:text-4xl font-bold text-center text-ink">{children}</h1>;
}
function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-muted-foreground mt-3 max-w-xl mx-auto">{children}</p>;
}

function FooterBtns({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Next",
  onSkip,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  onSkip?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-10 pt-6">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full bg-surface-soft text-ink font-semibold hover:bg-line transition"
          >
            Back
          </button>
        )}
      </div>
      <div className="flex gap-3">
        {onSkip && (
          <button onClick={onSkip} className="px-6 py-3 rounded-full bg-surface-soft text-ink font-semibold hover:bg-line transition">
            Skip
          </button>
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="px-8 py-3 rounded-full bg-ink text-white font-semibold disabled:bg-line disabled:text-muted-foreground transition hover:bg-ink/90"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

function AddressScreen({ data, update, onNext }: any) {
  return (
    <div className="flex flex-col h-full">
      <Title>Calculate your roof's potential!</Title>
      <Sub>
        In a few clicks, you can simulate the production, costs and feasibility of your home-energy upgrade.
      </Sub>
      <div className="my-10 flex justify-center">
        <div className="w-24 h-24 rounded-full border-2 border-ink flex items-center justify-center">
          <Sun className="w-10 h-10 text-ink" strokeWidth={1.5} />
        </div>
      </div>
      <div className="max-w-lg mx-auto w-full">
        <label className="block text-center text-ink mb-3">
          Let's start by entering the address of the project below.
        </label>
        <input
          value={data.address}
          onChange={(e) => update({ address: e.target.value })}
          className="w-full px-5 py-4 rounded-xl border border-line bg-surface-soft focus:border-cloover focus:bg-white outline-none transition"
          placeholder="Address"
        />
      </div>
      <div className="mt-auto flex justify-center pt-8">
        <button
          onClick={onNext}
          disabled={!data.address}
          className="px-10 py-3 rounded-full bg-ink text-white font-semibold disabled:bg-line disabled:text-muted-foreground hover:bg-ink/90 transition"
        >
          Show map
        </button>
      </div>
    </div>
  );
}

function MapScreen({ drawn, setDrawn, onBack, onNext }: any) {
  return (
    <div className="flex flex-col h-full">
      <Title>Draw your roof on the map</Title>
      <Sub>Click on the map to draw the corners of your roof.</Sub>
      <div className="relative mt-6 rounded-2xl overflow-hidden border border-line aspect-[16/9] cursor-crosshair"
        onClick={() => setDrawn(true)}
        style={{
          background:
            "linear-gradient(135deg, #6b7a6f 0%, #5d6b5f 30%, #4a5a4d 60%, #6b7a6f 100%)",
        }}
      >
        {/* Fake satellite */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 225">
          <defs>
            <pattern id="trees" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="6" cy="6" r="4" fill="#3e5a40" opacity="0.6" />
              <circle cx="14" cy="14" r="5" fill="#2f4a32" opacity="0.7" />
            </pattern>
          </defs>
          <rect width="400" height="225" fill="url(#trees)" />
          <rect x="50" y="40" width="120" height="60" fill="#8a8580" />
          <rect x="220" y="35" width="140" height="80" fill="#7a756f" />
          <rect x="80" y="140" width="160" height="60" fill="#8a8580" />
          <rect x="270" y="150" width="100" height="55" fill="#7a756f" />
          <rect x="0" y="105" width="400" height="14" fill="#3a3a3a" />
          <rect x="190" y="0" width="14" height="225" fill="#3a3a3a" />
          {drawn && (
            <polygon
              points="160,60 280,55 290,105 170,110"
              fill="rgba(0,46,255,0.35)"
              stroke="#002EFF"
              strokeWidth="2"
              className="anim-pop"
            />
          )}
        </svg>
        <div className="absolute top-3 left-3 flex gap-1">
          <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white shadow">Satellite</button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white/80 shadow">Map</button>
        </div>
        {!drawn && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 text-ink text-sm font-medium px-4 py-2 rounded-full shadow">
            Click the map to draw your roof
          </div>
        )}
      </div>
      <FooterBtns onBack={onBack} onNext={onNext} nextDisabled={!drawn} onSkip={onNext} />
    </div>
  );
}

function RoofTypeScreen({ value, onChange, onBack, onNext }: any) {
  return (
    <div className="flex flex-col h-full">
      <Title>What type of roof do you have?</Title>
      <Sub>Please select the type of your house.</Sub>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-10">
        {ROOF_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 ${
              value === t
                ? "border-cloover bg-cloover-soft"
                : "border-line hover:border-ink/40"
            }`}
          >
            <RoofIcon type={t} />
            <span className="text-xs font-medium text-center">{t}</span>
          </button>
        ))}
      </div>
      <FooterBtns onBack={onBack} onNext={onNext} />
    </div>
  );
}

function RoofIcon({ type }: { type: string }) {
  // Simple iso shapes
  const common = "w-16 h-12";
  if (type === "Flat roof")
    return (
      <svg className={common} viewBox="0 0 64 48">
        <polygon points="8,30 56,30 50,38 14,38" fill="#888" />
        <rect x="14" y="36" width="36" height="8" fill="#eee" stroke="#bbb" />
      </svg>
    );
  if (type === "Shed roof")
    return (
      <svg className={common} viewBox="0 0 64 48">
        <polygon points="8,28 56,16 56,28 14,40 8,40" fill="#888" />
        <rect x="14" y="38" width="42" height="6" fill="#eee" stroke="#bbb" />
      </svg>
    );
  if (type === "Pyramid roof")
    return (
      <svg className={common} viewBox="0 0 64 48">
        <polygon points="8,28 32,12 56,28 32,34" fill="#888" />
        <polygon points="8,28 32,34 32,42 8,36" fill="#aaa" />
      </svg>
    );
  if (type === "Hip roof")
    return (
      <svg className={common} viewBox="0 0 64 48">
        <polygon points="10,28 24,16 48,16 56,28 40,32 18,32" fill="#888" />
        <rect x="14" y="30" width="36" height="10" fill="#eee" stroke="#bbb" />
      </svg>
    );
  // Gable
  return (
    <svg className={common} viewBox="0 0 64 48">
      <polygon points="14,30 32,14 50,30 32,36" fill="#888" />
      <rect x="18" y="28" width="28" height="14" fill="#eee" stroke="#bbb" />
    </svg>
  );
}

function PitchScreen({ data, update, onBack, onNext }: any) {
  return (
    <div className="flex flex-col h-full">
      <Title>What is your roof pitch?</Title>
      <div className="mt-10 space-y-8 max-w-2xl mx-auto w-full">
        <div>
          <label className="block text-sm font-medium mb-2">
            Roof Orientation <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select
              value={data.orientation}
              onChange={(e) => update({ orientation: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-line bg-white outline-none focus:border-cloover appearance-none"
            >
              {ORIENTATIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-3">Roof Angle</label>
          <div className="grid grid-cols-4 gap-3">
            {ANGLES.map((a) => (
              <button
                key={a}
                onClick={() => update({ angle: a })}
                className={`aspect-square rounded-2xl border-2 transition flex flex-col items-center justify-center gap-1 ${
                  data.angle === a ? "border-ink bg-white" : "border-line hover:border-ink/40"
                }`}
              >
                <AngleIcon a={a} active={data.angle === a} />
                <span className="text-sm font-semibold">{a === "Manual" ? "Manually?" : a}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <FooterBtns onBack={onBack} onNext={onNext} />
    </div>
  );
}

function AngleIcon({ a, active }: { a: string; active: boolean }) {
  const color = active ? "#000" : "#999";
  if (a === "0°")
    return (
      <svg width="56" height="20" viewBox="0 0 56 20">
        <line x1="6" y1="10" x2="50" y2="10" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  if (a === "30°")
    return (
      <svg width="56" height="28" viewBox="0 0 56 28">
        <polyline points="6,22 28,6 50,22" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (a === "45°")
    return (
      <svg width="56" height="32" viewBox="0 0 56 32">
        <polyline points="10,28 28,4 46,28" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return <input placeholder="Angle°" className="w-16 text-center text-xs px-2 py-1 border border-line rounded" />;
}

function IconCard({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-2xl border-2 transition flex flex-col items-center gap-3 ${
        active ? "border-ink bg-white" : "border-line opacity-60 hover:opacity-100"
      }`}
    >
      <div className={active ? "text-ink" : "text-muted-foreground"}>{icon}</div>
      <span className="text-sm font-medium text-center">{label}</span>
    </button>
  );
}

function ConsumptionScreen({ data, update, onBack, onNext }: any) {
  const water = ["Oil, gas, wood, district heat", "Heat pump boiler", "Electric boiler"];
  const heat = ["Oil, gas, wood, district heat", "Heat pump", "Electric heating"];
  return (
    <div className="flex flex-col h-full">
      <Title>Average consumption</Title>
      <div className="mt-8 space-y-6">
        <div>
          <label className="block text-sm mb-2">How many people live there?</label>
          <input
            type="number"
            value={data.people}
            onChange={(e) => update({ people: Number(e.target.value) })}
            className="w-full px-5 py-4 rounded-xl border border-line bg-white outline-none focus:border-cloover"
          />
        </div>
        <div>
          <label className="block text-sm mb-3">How do you heat service water?</label>
          <div className="grid grid-cols-3 gap-3">
            {water.map((w) => (
              <IconCard
                key={w}
                active={data.hotWater === w}
                onClick={() => update({ hotWater: w })}
                icon={w.includes("Heat pump") ? <Flame className="w-10 h-10" /> : w.includes("Electric") ? <Plug className="w-10 h-10" /> : <Flame className="w-10 h-10" />}
                label={w}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm mb-3">How do you heat your building?</label>
          <div className="grid grid-cols-3 gap-3">
            {heat.map((h) => (
              <IconCard
                key={h}
                active={data.heating === h}
                onClick={() => update({ heating: h })}
                icon={h.includes("Heat pump") ? <HomeIcon className="w-10 h-10" /> : h.includes("Electric") ? <Zap className="w-10 h-10" /> : <Flame className="w-10 h-10" />}
                label={h}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Do you have an electric vehicle (EV)?</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!data.ev} onChange={() => update({ ev: false })} className="w-5 h-5 accent-ink" />
            No
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.ev} onChange={() => update({ ev: true })} className="w-5 h-5 accent-ink" />
            Yes
          </label>
        </div>
      </div>
      <FooterBtns onBack={onBack} onNext={onNext} />
    </div>
  );
}

function YearlyScreen({ data, update, monthlyCost, onBack, onNext }: any) {
  return (
    <div className="flex flex-col h-full">
      <Title>Yearly consumption</Title>
      <div className="mt-8 space-y-6">
        <div>
          <label className="block text-sm mb-2">What is your yearly total kWh usage?</label>
          <div className="relative">
            <input
              type="number"
              value={data.yearlyKwh}
              onChange={(e) => update({ yearlyKwh: Number(e.target.value) })}
              className="w-full px-5 py-4 pr-16 rounded-xl border border-line bg-white outline-none focus:border-cloover"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground">kWh</span>
          </div>
          <p className="mt-3 px-4 py-3 bg-surface-soft rounded-xl text-sm text-muted-foreground">
            Our estimate based on your answers is <b className="text-ink">{data.yearlyKwh} kWh</b>, but you can look at your past bills to find your exact consumption.
          </p>
        </div>
        <div>
          <label className="block text-sm mb-2">How much do you pay per kWh?</label>
          <input
            type="number"
            step="0.01"
            value={data.pricePerKwh}
            onChange={(e) => update({ pricePerKwh: Number(e.target.value) })}
            className="w-full px-5 py-4 rounded-xl border border-line bg-white outline-none focus:border-cloover"
          />
          <p className="mt-3 px-4 py-3 bg-surface-soft rounded-xl text-sm text-muted-foreground">
            The average is 0.4 EUR/kWh, but you can look at your past bills to find the exact price.
          </p>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-muted-foreground">Your electricity monthly cost</span>
          <span className="text-xl font-bold">€{monthlyCost}</span>
        </div>
      </div>
      <FooterBtns onBack={onBack} onNext={onNext} />
    </div>
  );
}

function SummaryScreen({ data, monthlyCost, onBack, onNext }: any) {
  const rows = [
    ["Roof type", data.roofType],
    ["Roof orientation", data.orientation],
    ["Roof inclination", data.angle],
    ["Heating water", data.hotWater],
    ["Heating system", data.heating],
    ["Monthly electricity cost", `€ ${monthlyCost}`],
  ];
  return (
    <div className="flex flex-col h-full">
      <Title>Summary</Title>
      <Sub>A summary of the information you provided for your house</Sub>
      <div className="mt-8 space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-5 py-4 border border-line rounded-xl">
            <span className="text-ink">{k}</span>
            <span className="font-bold text-ink">{v}</span>
          </div>
        ))}
      </div>
      <FooterBtns onBack={onBack} onNext={onNext} nextLabel="Build my Cloover configuration" />
    </div>
  );
}
