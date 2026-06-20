import { useMemo, useState } from "react";
import {
  Sun,
  Battery,
  Thermometer,
  Plug,
  Droplet,
  Zap,
  Activity,
  Sparkles,
  ArrowRight,
  Check,
  Leaf,
  TrendingDown,
} from "lucide-react";
import {
  computeScenario,
  CURRENT_COSTS,
  MODULE_LABELS,
  MODULE_SAVINGS,
  TARIFF_MONTHLY,
  type ModuleKey,
  type OnboardingData,
} from "@/lib/cloover-data";
import { CloverLogo } from "./Logo";
import { HouseScene } from "./HouseScene";
import { CountUp } from "./CountUp";

const MODULE_ICONS: Record<ModuleKey, React.ReactNode> = {
  solar: <Sun className="w-5 h-5" />,
  battery: <Battery className="w-5 h-5" />,
  heatpump: <Thermometer className="w-5 h-5" />,
  ev: <Plug className="w-5 h-5" />,
  boiler: <Droplet className="w-5 h-5" />,
  electricheating: <Zap className="w-5 h-5" />,
  tariff: <Activity className="w-5 h-5" />,
};

const ALL_MODULES: ModuleKey[] = ["solar", "battery", "heatpump", "ev", "boiler", "electricheating", "tariff"];

type Props = { onboarding: OnboardingData; onReview: () => void };

export function Configurator({ onboarding, onReview }: Props) {
  const [active, setActive] = useState<Set<ModuleKey>>(
    new Set<ModuleKey>(["solar", "battery", "heatpump", "tariff"]),
  );
  const [term, setTerm] = useState(20);
  const [annualKwh, setAnnualKwh] = useState(4500);
  const [draggingOver, setDraggingOver] = useState(false);

  const toggle = (k: ModuleKey) => {
    setActive((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const scenario = useMemo(() => computeScenario(active), [active]);
  const installment = Math.round(150 * (20 / term));
  const remainingElec = 30;
  const feedin = active.has("solar") ? 40 : 0;
  const afterFinancing = CURRENT_COSTS.total - remainingElec + feedin;

  // Best upsell
  const upsell = useMemo(() => {
    if (!active.has("heatpump")) return { k: "heatpump" as ModuleKey, text: "Add a heat pump", detail: "Removes expensive oil/gas spend.", saving: MODULE_SAVINGS.heatpump };
    if (active.has("solar") && !active.has("battery")) return { k: "battery" as ModuleKey, text: "Add a home battery", detail: "Use more of your own solar.", saving: MODULE_SAVINGS.battery };
    if (!active.has("tariff") && (active.has("battery") || active.has("ev"))) return { k: "tariff" as ModuleKey, text: "Activate dynamic tariff", detail: "Shift use into cheap hours.", saving: MODULE_SAVINGS.tariff };
    if (!active.has("ev")) return { k: "ev" as ModuleKey, text: "Add an EV charger", detail: "Future-ready for cheap-hour charging.", saving: MODULE_SAVINGS.ev };
    return null;
  }, [active]);

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Announcement bar */}
      <div className="bg-ink text-white text-xs md:text-sm py-2 text-center">
        New: live monthly savings preview. 500+ installer partners. 10,000+ projects financed.
      </div>

      {/* Header */}
      <header className="bg-white border-b border-line sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <CloverLogo />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden md:inline text-muted-foreground">{onboarding.address}</span>
            <button onClick={onReview} className="px-5 py-2.5 rounded-full bg-cloover text-white font-semibold hover:bg-cloover/90 transition">
              Review Cloover offer
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
        {/* House canvas */}
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDraggingOver(true);
          }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDraggingOver(false);
            const k = e.dataTransfer.getData("module") as ModuleKey;
            if (k) toggle(k);
          }}
          className={`bg-white rounded-[28px] border-2 transition p-4 md:p-6 relative overflow-hidden ${
            draggingOver ? "border-cloover bg-cloover-soft/40" : "border-line"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-cloover uppercase tracking-wide">Your home</p>
              <h2 className="text-2xl font-bold">Interactive configurator</h2>
            </div>
            <div className="hidden md:block text-xs text-muted-foreground text-right">
              Drag upgrades onto the house, <br />or tap tiles to toggle.
            </div>
          </div>
          <HouseScene active={active} />

          {/* Upsell pill */}
          {upsell && (
            <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-md anim-pulse-blue rounded-2xl bg-white border-2 border-cloover px-4 py-3 flex items-center gap-3 shadow-lg">
              <Sparkles className="w-5 h-5 text-cloover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">Best next step: {upsell.text.toLowerCase()}</p>
                <p className="text-xs text-muted-foreground truncate">{upsell.detail} Extra ~€{upsell.saving}/mo.</p>
              </div>
              <button
                onClick={() => toggle(upsell.k)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-cloover text-white text-xs font-semibold"
              >
                Add
              </button>
            </div>
          )}
        </section>

        {/* Metrics panel */}
        <aside className="bg-white rounded-[28px] border border-line p-6 flex flex-col gap-4 h-fit lg:sticky lg:top-24">
          <div>
            <p className="text-xs font-semibold text-cloover uppercase tracking-wide">Your Cloover plan</p>
            <p className="text-sm text-muted-foreground mt-1">Estimated monthly saving</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-cloover">
                €<CountUp value={scenario.saving} />
              </span>
              <span className="text-muted-foreground font-medium">/mo</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
              <Check className="w-3.5 h-3.5" /> High confidence estimate
            </div>
          </div>

          <div className="rounded-2xl bg-surface-soft p-4 space-y-2 text-sm">
            <Row label="Current cost" value={`€${CURRENT_COSTS.total}/mo`} />
            <Row label="Cloover cost incl. financing" value={<>€<CountUp value={scenario.cloover} />/mo</>} bold />
            <Row label="Cloover installment" value={`€${installment}/mo`} />
            <Row label="Remaining electricity" value={`€${remainingElec}/mo`} />
            <Row label="Feed-in credit" value={`-€${feedin}/mo`} positive />
            <Row label="Saved after financing" value={`€${afterFinancing - 421 + scenario.saving}/mo`} positive />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Stat icon={<Activity className="w-4 h-4" />} label="Household fit" value={`${scenario.fit}/100`} />
            <Stat icon={<Leaf className="w-4 h-4" />} label="CO₂ avoided" value="4.1 t/yr" />
          </div>

          <div className="rounded-2xl bg-cloover-soft p-4">
            <p className="text-xs font-semibold text-cloover uppercase">Dynamic tariff</p>
            <p className="text-2xl font-bold mt-1">€417.90<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
            <p className="text-xs text-muted-foreground">2,065 kWh shifted into cheaper hours</p>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            All figures are estimates based on your inputs and average German tariffs.
          </p>
        </aside>
      </main>

      {/* Configurator bar */}
      <div className="sticky bottom-0 z-20 px-4 md:px-6 pb-4">
        <div className="max-w-7xl mx-auto bg-white rounded-[24px] border border-line shadow-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Add upgrades</h3>
            <span className="text-xs text-muted-foreground">Drag onto the house or click to toggle</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {ALL_MODULES.map((k) => {
              const on = active.has(k);
              return (
                <button
                  key={k}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("module", k)}
                  onClick={() => toggle(k)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-full border-2 transition text-sm font-medium ${
                    on
                      ? "bg-cloover text-white border-cloover"
                      : "bg-white text-ink border-line hover:border-ink/40"
                  }`}
                >
                  <span className={on ? "text-white" : "text-cloover"}>{MODULE_ICONS[k]}</span>
                  <span className="truncate">{MODULE_LABELS[k]}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid md:grid-cols-3 gap-4">
            <SliderRow
              label="Annual consumption"
              value={`${annualKwh.toLocaleString()} kWh`}
              min={2000}
              max={9000}
              step={100}
              val={annualKwh}
              onChange={setAnnualKwh}
            />
            <SliderRow
              label="Financing term"
              value={`${term} years`}
              min={10}
              max={25}
              step={1}
              val={term}
              onChange={setTerm}
            />
            <button
              onClick={onReview}
              className="self-end px-5 py-3 rounded-full bg-ink text-white font-semibold hover:bg-ink/90 flex items-center justify-center gap-2"
            >
              Review Cloover offer <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Spacer for sticky bar */}
      <div className="h-4" />

      {/* Inline tariff teaser */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white border border-line rounded-[28px] p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-cloover" />
            <h3 className="text-xl font-bold">Dynamic tariff monthly savings</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
            Cloover uses your battery, heat pump, and EV charger to buy electricity when it's cheap and avoid expensive hours.
          </p>
          <div className="grid grid-cols-12 gap-1 items-end h-32">
            {TARIFF_MONTHLY.map((m) => {
              const h = (m.saving / 40) * 100;
              return (
                <div key={m.month} className="flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-cloover rounded-t-md transition"
                    style={{ height: `${h}%` }}
                    title={`€${m.saving.toFixed(2)}`}
                  />
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, bold, positive }: { label: string; value: React.ReactNode; bold?: boolean; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-bold" : ""} ${positive ? "text-success" : "text-ink"}`}>{value}</span>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">{icon}{label}</div>
      <div className="mt-1 font-bold text-ink">{value}</div>
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, val, onChange,
}: { label: string; value: string; min: number; max: number; step: number; val: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-bold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cloover"
      />
    </div>
  );
}
