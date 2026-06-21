import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ArrowRight, Battery, Car, Home, Sun, Thermometer } from "lucide-react";
import {
  HOUSEHOLD_FIT,
  computeDynamicScenario,
  getBaselineModules,
  getDynamicCosts,
  type ModuleKey,
  type HouseholdInputs,
} from "@/lib/cloover-data";
import { CloverLogo } from "./Logo";
import { HouseScene } from "./HouseScene";
import { CountUp } from "./CountUp";
import { ProgressSteps } from "./ProgressSteps";

const CONFIG_OPTIONS: {
  key: ModuleKey;
  title: string;
  subtitle: string;
  icon: ReactNode;
}[] = [
  {
    key: "solar",
    title: "Solar",
    subtitle: "Self-consume roof production",
    icon: <Sun className="w-5 h-5" />,
  },
  {
    key: "battery",
    title: "Battery",
    subtitle: "Store cheap and solar energy",
    icon: <Battery className="w-5 h-5" />,
  },
  {
    key: "heatpump",
    title: "Heat pump",
    subtitle: "Replace gas or oil heating",
    icon: <Thermometer className="w-5 h-5" />,
  },
  {
    key: "ev",
    title: "Electric vehicle",
    subtitle: "Off-peak home charging",
    icon: <Car className="w-5 h-5" />,
  },
];

function normalizeModules(active: Set<ModuleKey>, lockedModules: Set<ModuleKey>) {
  const next = new Set(active);
  lockedModules.forEach((module) => next.add(module));
  if (!next.has("solar")) {
    next.delete("battery");
  }
  return next;
}

function sameModuleSet(a: Set<ModuleKey>, b: Set<ModuleKey>) {
  return a.size === b.size && Array.from(a).every((module) => b.has(module));
}

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
  const [term, setTerm] = useState(10);
  const [draggingOver, setDraggingOver] = useState(false);
  const lockedModules = useMemo(() => getBaselineModules(householdInputs), [householdInputs]);

  useEffect(() => {
    onActiveChange((previous) => {
      const next = normalizeModules(previous, lockedModules);
      return sameModuleSet(previous, next) ? previous : next;
    });
  }, [lockedModules, onActiveChange]);

  const clearModules = () => {
    onActiveChange(new Set(lockedModules));
  };

  const toggleModule = (module: ModuleKey) => {
    if (lockedModules.has(module)) {
      return;
    }
    if (module === "battery" && !active.has("solar")) {
      return;
    }

    onActiveChange((previous) => {
      const next = normalizeModules(previous, lockedModules);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      if (module === "solar" && !next.has("solar")) {
        next.delete("battery");
      }
      lockedModules.forEach((lockedModule) => next.add(lockedModule));
      return next;
    });
  };

  const currentCosts = useMemo(() => getDynamicCosts(householdInputs), [householdInputs]);
  const scenario = useMemo(
    () => computeDynamicScenario(active, householdInputs),
    [active, householdInputs],
  );
  const selectedOptionalModules = Array.from(active).filter((module) => !lockedModules.has(module));
  const isCurrentSetup = selectedOptionalModules.length === 0;
  const installment = Math.round(180 * (10 / term));
  const annualInstallment = installment * 12;
  const operationalAnnualSaving = scenario.annualSaving;
  const earlyYears = isCurrentSetup ? 0 : Math.min(3, Math.max(1, Math.round(term / 5)));
  const savingStartYear = isCurrentSetup ? 0 : earlyYears + 1;
  const earlyAnnualExtra = isCurrentSetup
    ? 0
    : Math.max(650, Math.round(Math.max(annualInstallment - operationalAnnualSaving, 500) * 0.55));
  const fiveYearSaving = isCurrentSetup
    ? 0
    : Math.max(
        Math.round(operationalAnnualSaving * (5 - earlyYears) - earlyAnnualExtra * earlyYears),
        Math.round(operationalAnnualSaving * 1.8),
      );
  const certaintyScore = isCurrentSetup
    ? 0
    : Math.min(
        94,
        74 + (active.has("solar") ? 6 : 0) + (active.has("battery") ? 5 : 0) + active.size * 2,
      );
  const householdFitScore = isCurrentSetup ? 0 : scenario.fit;
  const selectedUpgradeNames = CONFIG_OPTIONS.filter(
    (option) => active.has(option.key) && !lockedModules.has(option.key),
  ).map((option) => option.title);
  const ownedModuleNames = CONFIG_OPTIONS.filter((option) => lockedModules.has(option.key)).map(
    (option) => option.title,
  );
  const selectedUpgradeCopy = isCurrentSetup ? "Current setup" : selectedUpgradeNames.join(" + ");
  const fitNotes = selectedOptionalModules
    .map((module) => HOUSEHOLD_FIT[module])
    .filter(Boolean)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Announcement bar */}
      <div className="bg-cloover text-white text-xs md:text-sm py-2 text-center">
        New: live yearly savings preview. 500+ installer partners. 10,000+ projects financed.
      </div>

      {/* Header */}
      <header className="bg-white/90 border-b border-line sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <CloverLogo />
        </div>
      </header>
      <ProgressSteps activeStep={2} onStepSelect={onStepSelect} />

      <main className="mx-auto max-w-[1680px] px-2 py-2 md:px-3">
        <section className="grid gap-3 lg:grid-cols-[250px_minmax(0,1fr)_270px] xl:grid-cols-[270px_minmax(0,1fr)_290px]">
          <aside className="bg-white rounded-[22px] border border-line p-2.5 h-fit lg:sticky lg:top-24">
            <p className="text-xs font-semibold text-cloover uppercase tracking-wide">
              Upgrade options
            </p>
            <h3 className="text-base font-bold">Select one or more</h3>
            <div className="mt-2 grid gap-1.5">
              <button
                data-testid="scenario-current"
                onClick={clearModules}
                className={`group rounded-[16px] border-2 p-2.5 text-left transition ${
                  isCurrentSetup
                    ? "border-ink bg-ink text-white shadow-lg shadow-ink/15"
                    : "border-line bg-surface-soft text-ink hover:border-ink/40"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      isCurrentSetup ? "bg-white/15 text-white" : "bg-white text-ink"
                    }`}
                  >
                    <Home className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold">Current setup</span>
                    <span
                      className={`block truncate text-[11px] ${
                        isCurrentSetup ? "text-white/75" : "text-muted-foreground"
                      }`}
                    >
                      Customer estimate from inputs
                    </span>
                  </span>
                </span>
                <span className="mt-2 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-ink">
                    {isCurrentSetup ? "Selected" : "Reset"}
                  </span>
                  <span className="text-xs font-extrabold">€0/yr</span>
                </span>
                <p
                  className={`mt-1 text-[11px] ${
                    isCurrentSetup ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  Today: €{currentCosts.annualTotal.toLocaleString()}/yr
                </p>
              </button>

              {CONFIG_OPTIONS.map((option) => {
                const on = active.has(option.key);
                const isLocked = lockedModules.has(option.key);
                const batteryBlocked = option.key === "battery" && !active.has("solar");
                const disabled = isLocked || batteryBlocked;
                const optionScenario = computeDynamicScenario(
                  new Set([...Array.from(active), option.key]),
                  householdInputs,
                );
                const optionSaving = Math.max(
                  0,
                  optionScenario.annualSaving - scenario.annualSaving,
                );
                return (
                  <button
                    key={option.key}
                    data-testid={`module-${option.key}`}
                    disabled={disabled}
                    draggable={!disabled}
                    onDragStart={(e) => e.dataTransfer.setData("module", option.key)}
                    onClick={() => toggleModule(option.key)}
                    className={`group rounded-[16px] border-2 p-2 text-left transition ${
                      on
                        ? "border-cloover bg-cloover text-white shadow-lg shadow-cloover/20"
                        : disabled
                          ? "cursor-not-allowed border-line bg-surface-soft text-muted-foreground opacity-70"
                          : "border-line bg-white text-ink hover:border-cloover/40 hover:bg-cloover-soft/40"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                          on
                            ? "bg-white/15 text-white"
                            : disabled
                              ? "bg-white text-muted-foreground"
                              : "bg-cloover-soft text-cloover"
                        }`}
                      >
                        {option.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-extrabold">{option.title}</span>
                        <span
                          className={`block truncate text-[11px] ${
                            on ? "text-white/75" : "text-muted-foreground"
                          }`}
                        >
                          {option.subtitle}
                        </span>
                      </span>
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          on ? "bg-white text-ink" : "bg-surface-soft text-ink"
                        }`}
                      >
                        {isLocked
                          ? "Already yours"
                          : batteryBlocked
                            ? "Needs solar"
                            : on
                              ? "Added"
                              : "Add"}
                      </span>
                      <span
                        className={`text-xs font-extrabold ${
                          on
                            ? "text-white"
                            : batteryBlocked
                              ? "text-muted-foreground"
                              : "text-success"
                        }`}
                      >
                        {isLocked ? "€0/yr" : batteryBlocked ? "Locked" : `+€${optionSaving}/yr`}
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
              if (k) {
                toggleModule(k);
              }
            }}
            className={`bg-white rounded-[24px] border-2 transition p-2 relative overflow-hidden ${
              draggingOver ? "border-cloover bg-cloover-soft/40" : "border-line"
            }`}
          >
            <div className="mb-1 grid gap-2 md:grid-cols-2">
              <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-cloover">
                    Savings certainty
                  </p>
                  <p className="text-xl font-extrabold text-ink">{certaintyScore}%</p>
                </div>
                <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                  Approx. estimate from irradiance, dynamic tariff timing, subsidies and
                  self-consumption.
                </p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-cloover">
                    Household fit
                  </p>
                  <p className="text-xl font-extrabold text-ink">{householdFitScore}%</p>
                </div>
                <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                  {fitNotes.length > 0
                    ? fitNotes[0]
                    : "Add an upgrade to see how many customers were happy with the same configuration in your neighborhood."}
                </p>
              </div>
            </div>
            <div className="relative h-[calc(100svh-190px)] min-h-[380px] overflow-hidden rounded-[18px] bg-surface-soft">
              <div className="absolute inset-0 flex items-center justify-center">
                <HouseScene active={active} />
              </div>
            </div>
          </section>

          <aside className="bg-white rounded-[22px] border border-line p-3 md:p-4 flex flex-col gap-2.5 h-fit lg:sticky lg:top-24">
            <div>
              <p className="text-xs font-semibold text-cloover uppercase tracking-wide">
                Approximate saving
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{selectedUpgradeCopy}</p>
              {ownedModuleNames.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Already in your current setup: {ownedModuleNames.join(", ")}.
                </p>
              )}
              <div className="mt-2 rounded-[20px] bg-cloover-soft p-4">
                <p className="text-sm font-semibold text-cloover">You approximately save</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-cloover xl:text-5xl">
                    €<CountUp value={fiveYearSaving} />
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold text-cloover">within five years</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Based on your yearly electricity, heating and car costs, reduced by modeled
                  upgrade percentages. Financing timing is reflected below.
                </p>
              </div>
              <div className="mt-2 rounded-2xl bg-success/10 px-3 py-2.5 text-sm text-success">
                {isCurrentSetup
                  ? `This is the current setup from the customer estimate: €${currentCosts.annualTotal.toLocaleString()}/yr today. Add upgrades to see the modeled savings.`
                  : `In the first ${earlyYears} years you pay about €${earlyAnnualExtra.toLocaleString()}/yr extra because of the initial installment. Starting from year ${savingStartYear}, the model estimates about €${operationalAnnualSaving.toLocaleString()}/yr saved.`}
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">Financing term</span>
                <span className="text-sm font-bold">{term} years</span>
              </div>
              <input
                type="range"
                min={5}
                max={15}
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
