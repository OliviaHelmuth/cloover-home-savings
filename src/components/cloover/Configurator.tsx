import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Sun, Thermometer, Plug, ArrowRight } from "lucide-react";
import {
  computeDynamicScenario,
  type ModuleKey,
  type HouseholdInputs,
} from "@/lib/cloover-data";
import { CloverLogo } from "./Logo";
import { HouseScene } from "./HouseScene";
import { CountUp } from "./CountUp";
import { ProgressSteps } from "./ProgressSteps";

const ENERGY_LEVERS: {
  key: ModuleKey;
  title: string;
  subtitle: string;
  detail: string;
  icon: React.ReactNode;
  saving: number;
}[] = [
  {
    key: "solar",
    title: "Electricity",
    subtitle: "Solar + battery + dynamic tariff",
    detail:
      "Add or remove solar panels on the roof. The advisor assumes cheap-hour battery charging and self-consumption optimization.",
    icon: <Sun className="w-5 h-5" />,
    saving: 106,
  },
  {
    key: "heatpump",
    title: "Heating",
    subtitle: "Oil or gas to heat pump",
    detail:
      "Add or remove the heat pump outside the home to replace fossil heating spend with partly self-generated electricity.",
    icon: <Thermometer className="w-5 h-5" />,
    saving: 43,
  },
  {
    key: "ev",
    title: "Mobility",
    subtitle: "Petrol car to EV charging",
    detail:
      "Add or remove the electric car and charger to swap petrol spend for cheap off-peak charging.",
    icon: <Plug className="w-5 h-5" />,
    saving: 7,
  },
];

type Props = {
  householdInputs: HouseholdInputs;
  active: Set<ModuleKey>;
  onActiveChange: Dispatch<SetStateAction<Set<ModuleKey>>>;
  onReview: () => void;
  onStepSelect: (step: 1 | 2 | 3) => void;
};

export function Configurator({
  householdInputs,
  active,
  onActiveChange,
  onReview,
  onStepSelect,
}: Props) {
  const [term, setTerm] = useState(20);
  const [draggingOver, setDraggingOver] = useState(false);

  const toggle = (k: ModuleKey) => {
    onActiveChange((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
      }
      return next;
    });
  };

  const scenario = useMemo(
    () => computeDynamicScenario(active, householdInputs),
    [active, householdInputs],
  );
  const installment = Math.round(150 * (20 / term));
  const grossMonthlyBenefit = scenario.saving;
  const netMonthlySaving = grossMonthlyBenefit - installment;
  const paidOffSaving = grossMonthlyBenefit;
  const isNearNeutral = Math.abs(netMonthlySaving) <= 10;

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Announcement bar */}
      <div className="bg-cloover text-white text-xs md:text-sm py-2 text-center">
        New: live monthly savings preview. 500+ installer partners. 10,000+ projects financed.
      </div>

      {/* Header */}
      <header className="bg-white/90 border-b border-line sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <CloverLogo />
        </div>
      </header>
      <ProgressSteps activeStep={2} onStepSelect={onStepSelect} />

      <main className="mx-auto max-w-[1680px] px-2 py-3 md:px-3">
        <section className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_320px] xl:grid-cols-[230px_minmax(0,1fr)_340px]">
          <aside className="bg-white rounded-[22px] border border-line p-3 h-fit lg:sticky lg:top-24">
            <p className="text-xs font-semibold text-cloover uppercase tracking-wide">Configure</p>
            <h3 className="text-base font-bold">Choose what changes</h3>
            <div className="mt-3 grid gap-2">
              {ENERGY_LEVERS.map((lever) => {
                const on = active.has(lever.key);
                return (
                  <button
                    key={lever.key}
                    data-testid={`energy-lever-${lever.key}`}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("module", lever.key)}
                    onClick={() => toggle(lever.key)}
                    className={`group rounded-[16px] border-2 p-2.5 text-left transition ${
                      on
                        ? "border-cloover bg-cloover text-white shadow-lg shadow-cloover/20"
                        : "border-line bg-white text-ink hover:border-cloover/40 hover:bg-cloover-soft/40"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                          on ? "bg-white/15 text-white" : "bg-cloover-soft text-cloover"
                        }`}
                      >
                        {lever.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-extrabold">{lever.title}</span>
                        <span
                          className={`block truncate text-[11px] ${
                            on ? "text-white/75" : "text-muted-foreground"
                          }`}
                        >
                          {lever.subtitle}
                        </span>
                      </span>
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          on ? "bg-white text-ink" : "bg-surface-soft text-ink"
                        }`}
                      >
                        {on ? "Added" : "Add"}
                      </span>
                      <span
                        className={`text-xs font-extrabold ${on ? "text-white" : "text-success"}`}
                      >
                        +€{lever.saving}/mo
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

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
            className={`bg-white rounded-[24px] border-2 transition p-3 relative overflow-hidden ${
              draggingOver ? "border-cloover bg-cloover-soft/40" : "border-line"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-cloover uppercase tracking-wide">
                  Your home
                </p>
                <h2 className="text-xl font-bold">Interactive configurator</h2>
              </div>
              <p className="hidden text-right text-xs text-muted-foreground md:block">
                Drag an item here or tap it on the left.
              </p>
            </div>
            <div className="relative h-[calc(100svh-190px)] min-h-[420px] overflow-hidden rounded-[20px] bg-surface-soft">
              <div className="absolute inset-0 flex items-center justify-center">
                <HouseScene active={active} />
              </div>
            </div>
          </section>

          <aside className="bg-white rounded-[22px] border border-line p-4 md:p-5 flex flex-col gap-3 h-fit lg:sticky lg:top-24">
            <div>
              <p className="text-xs font-semibold text-cloover uppercase tracking-wide">
                Approximate saving
              </p>
              <div className="mt-2 rounded-[22px] bg-cloover-soft p-5">
                <p className="text-sm font-semibold text-cloover">
                  You approximately {netMonthlySaving < 0 ? "pay extra" : "save"}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-6xl font-extrabold text-cloover">
                    {netMonthlySaving < 0 ? "-€" : "€"}
                    <CountUp value={Math.abs(netMonthlySaving)} />
                  </span>
                  <span className="text-muted-foreground font-medium">/mo</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Compared with today's electricity, heating and mobility spend, including financing
                  and the dynamic tariff.
                </p>
              </div>
              <div
                className={`mt-2 rounded-2xl px-3 py-2.5 text-sm ${
                  isNearNeutral ? "bg-cloover-soft text-ink" : "bg-success/10 text-success"
                }`}
              >
                {netMonthlySaving < 0
                  ? `Financing is €${Math.abs(netMonthlySaving)}/mo above the modeled savings during the loan. Estimated saving becomes about €${paidOffSaving}/mo once the installment is paid off.`
                  : isNearNeutral
                    ? `Near cost-neutral during financing. Estimated saving rises to about €${paidOffSaving}/mo once the installment is paid off.`
                    : `Positive from month one. Estimated saving rises to about €${paidOffSaving}/mo once the installment is paid off.`}
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">Financing term</span>
                <span className="text-sm font-bold">{term} years</span>
              </div>
              <input
                type="range"
                min={10}
                max={25}
                step={1}
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
                className="w-full accent-cloover"
              />
            </div>

            <button
              onClick={onReview}
              className="px-5 py-3 rounded-full bg-cloover text-white font-semibold hover:bg-cloover/90 flex items-center justify-center gap-2"
            >
              Review full offer <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Estimates use your household inputs and average German tariffs. Final quote should
              confirm roof geometry, grid fees, subsidies and installer pricing.
            </p>
          </aside>
        </section>
      </main>
    </div>
  );
}
