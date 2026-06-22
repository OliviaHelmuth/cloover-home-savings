import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  ArrowRight,
  Battery,
  Car,
  Home,
  MapPin,
  Ruler,
  ShieldCheck,
  Sun,
  Thermometer,
} from "lucide-react";
import {
  computeFinancialPlan,
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
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

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
  financingTerm: number;
  onReview: () => void;
  onStepSelect: (step: 1 | 2 | 3) => void;
};

export function Configurator({
  householdInputs,
  active,
  onActiveChange,
  financingTerm,
  onReview,
  onStepSelect,
}: Props) {
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
  const financialPlan = useMemo(
    () => computeFinancialPlan(active, householdInputs, financingTerm),
    [active, financingTerm, householdInputs],
  );
  const selectedOptionalModules = Array.from(active).filter((module) => !lockedModules.has(module));
  const isCurrentSetup = selectedOptionalModules.length === 0;
  const monthlySaving = scenario.saving;
  const projectedMonthlyEnergySpend = Math.max(currentCosts.total - monthlySaving, 0);
  const monthlyDuringLoan = projectedMonthlyEnergySpend + financialPlan.monthlyInstallment;
  const monthlyLoanDelta = monthlyDuringLoan - currentCosts.total;
  const selectedUpgradeNames = CONFIG_OPTIONS.filter(
    (option) => active.has(option.key) && !lockedModules.has(option.key),
  ).map((option) => option.title);
  const ownedModuleNames = CONFIG_OPTIONS.filter((option) => lockedModules.has(option.key)).map(
    (option) => option.title,
  );
  const selectedUpgradeCopy = isCurrentSetup ? "Current setup" : selectedUpgradeNames.join(" + ");
  const freeEstimate = householdInputs.freeEstimate;
  const solarSource =
    freeEstimate?.irradianceSource === "pvgis"
      ? "PVGIS live solar yield"
      : freeEstimate
        ? "regional solar fallback"
        : "built-in regional profile";
  const transparencyChecks = [
    {
      icon: MapPin,
      label: "Address and roof",
      value: `${householdInputs.street} ${householdInputs.streetNumber}`,
      detail: `${scenario.roof.usableRoofAreaM2.toFixed(0)} m² usable roof estimate for ${householdInputs.postalCode}.`,
    },
    {
      icon: Sun,
      label: "Local sunlight",
      value: `${scenario.roof.location.specificYieldKwhPerKwp} kWh/kWp`,
      detail: `${solarSource}; adjusted by roof orientation and selected PV size.`,
    },
    {
      icon: Ruler,
      label: "Usable roof size",
      value: `${scenario.roof.usableRoofAreaM2.toFixed(0)} m²`,
      detail: `${scenario.roof.panelCountMax} panel cap before installer shading and obstruction checks.`,
    },
    {
      icon: ShieldCheck,
      label: "Home profile",
      value: `${householdInputs.householdSize} people`,
      detail: `${householdInputs.heatingType} heating and ${householdInputs.carType} mobility spend included.`,
    },
  ];
  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Announcement bar */}
      <div className="bg-cloover text-white text-xs md:text-sm py-2 text-center">
        New: live monthly savings preview. 500+ installer partners. 10,000+ projects financed.
      </div>

      <SiteHeader />
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
                  <span className="text-xs font-extrabold">€0/mo</span>
                </span>
                <p
                  className={`mt-1 text-[11px] ${
                    isCurrentSetup ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  Today: €{currentCosts.total.toLocaleString()}/mo
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
                const optionSaving = Math.max(0, optionScenario.saving - scenario.saving);
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
                        {isLocked ? "€0/mo" : batteryBlocked ? "Locked" : `+€${optionSaving}/mo`}
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
            <div className="mb-1 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {transparencyChecks.map((check) => (
                <div key={check.label} className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cloover-soft text-cloover">
                      <check.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold uppercase tracking-wide text-cloover">
                        {check.label}
                      </p>
                      <p className="truncate text-xs font-extrabold text-ink">{check.value}</p>
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                    {check.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="relative h-[calc(100svh-220px)] min-h-[360px] overflow-hidden rounded-[18px] bg-surface-soft">
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
              <div className="mt-2 rounded-[20px] border border-cloover/15 bg-cloover-soft p-4">
                <p className="text-sm font-semibold text-cloover">Monthly saving after the loan</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-cloover xl:text-5xl">
                    €<CountUp value={monthlySaving} />
                  </span>
                  <span className="text-sm font-bold text-cloover">/mo</span>
                </div>
                <p className="mt-1 text-sm font-bold text-cloover">
                  from year {financialPlan.termYears + 1}, once the loan is paid off
                </p>
              </div>
              {isCurrentSetup ? (
                <div className="mt-2 rounded-2xl border border-line bg-surface-soft px-3 py-2.5 text-sm text-muted-foreground">
                  This is the customer&apos;s current setup: €{currentCosts.total.toLocaleString()}
                  /mo today. Add upgrades to compare equipment cost, financing and monthly bill
                  reduction.
                </div>
              ) : (
                <div className="mt-2 rounded-2xl border border-line bg-white px-3 py-2.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Financing details
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <FinanceMetric
                      label="Current monthly cost"
                      value={`€${currentCosts.total.toLocaleString()}/mo`}
                      note="energy, heating and mobility"
                      tone="neutral"
                    />
                    <FinanceMetric
                      label="Cost during loan"
                      value={`€${monthlyDuringLoan.toLocaleString()}/mo`}
                      note={
                        monthlyLoanDelta > 0
                          ? `€${Math.round(monthlyLoanDelta).toLocaleString()}/mo extra at first`
                          : `€${Math.abs(Math.round(monthlyLoanDelta)).toLocaleString()}/mo ahead from month one`
                      }
                      tone={monthlyLoanDelta > 0 ? "warning" : "success"}
                    />
                    <FinanceMetric
                      label="Cost after loan"
                      value={`€${projectedMonthlyEnergySpend.toLocaleString()}/mo`}
                      note={`€${monthlySaving.toLocaleString()}/mo lower than today`}
                      tone="success"
                    />
                    <FinanceMetric
                      label="Package price"
                      value={`€${financialPlan.netCapex.toLocaleString()}`}
                      note={
                        financialPlan.subsidy > 0
                          ? `estimated after €${financialPlan.subsidy.toLocaleString()} subsidy`
                          : "estimated equipment and install cost"
                      }
                      tone="neutral"
                    />
                  </div>
                  <div className="mt-2 rounded-xl bg-surface-soft px-3 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      Cumulative break-even
                    </p>
                    <p className="mt-0.5 text-sm font-extrabold text-ink">
                      {financialPlan.breakEvenYear > 0
                        ? `Year ${financialPlan.breakEvenYear}`
                        : "No upgrade selected"}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                      The point where cumulative Solara spending becomes lower than staying with the
                      current setup.
                    </p>
                  </div>
                </div>
              )}
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
      <SiteFooter />
    </div>
  );
}

function FinanceMetric({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "warning" ? "text-amber-600" : "text-ink";

  return (
    <div className="rounded-xl bg-surface-soft px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-extrabold ${toneClass}`}>{value}</p>
      {note && <p className="mt-0.5 text-[10px] leading-3 text-muted-foreground">{note}</p>}
    </div>
  );
}
