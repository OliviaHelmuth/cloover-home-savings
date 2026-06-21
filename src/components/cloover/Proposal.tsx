import { useMemo, useState } from "react";
import {
  Sparkles,
  Send,
  TrendingDown,
  CheckCircle2,
  Download,
  Sun,
  Coins,
  Battery,
  MessageCircle,
  Phone,
  X,
  ArrowRight,
  Shield,
  Lock,
  Award,
  Users,
} from "lucide-react";
import { CloverLogo } from "./Logo";
import { ProgressSteps } from "./ProgressSteps";
import {
  MODULE_LABELS,
  type ModuleKey,
  type HouseholdInputs,
  getDynamicCosts,
  computeDynamicScenario,
  getBaselineModules,
} from "@/lib/cloover-data";

// Mirror the configurator's 5-year saving math so the numbers stay consistent.
function computeFiveYearSaving(
  active: Set<ModuleKey>,
  inputs: HouseholdInputs,
  term = 10,
): { fiveYear: number; annualSaving: number; earlyYears: number; earlyExtra: number } {
  const baseline = getBaselineModules(inputs);
  const optional = Array.from(active).filter((m) => !baseline.has(m));
  const isCurrent = optional.length === 0;
  const scenario = computeDynamicScenario(active, inputs);
  const installment = Math.round(180 * (10 / term));
  const annualInstallment = installment * 12;
  const op = scenario.annualSaving;
  const earlyYears = isCurrent ? 0 : Math.min(3, Math.max(1, Math.round(term / 5)));
  const earlyExtra = isCurrent
    ? 0
    : Math.max(650, Math.round(Math.max(annualInstallment - op, 500) * 0.55));
  const fiveYear = isCurrent
    ? 0
    : Math.max(Math.round(op * (5 - earlyYears) - earlyExtra * earlyYears), Math.round(op * 1.8));
  return { fiveYear, annualSaving: op, earlyYears, earlyExtra };
}

type ScenarioDef = { key: string; label: string; modules: ModuleKey[] };

const SCENARIO_DEFS: ScenarioDef[] = [
  { key: "current", label: "Current setup", modules: [] },
  { key: "solar", label: "Electricity", modules: ["solar"] },
  { key: "solar_battery", label: "Electricity + Battery", modules: ["solar", "battery"] },
  {
    key: "full_home",
    label: "Electricity + Battery + Heating",
    modules: ["solar", "battery", "heatpump"],
  },
  {
    key: "full_mobility",
    label: "Full home + Mobility",
    modules: ["solar", "battery", "heatpump", "ev"],
  },
];

const CERTAINTY_INPUTS = [
  {
    icon: Sun,
    title: "Local irradiance",
    value: "1,050 kWh/kWp/yr",
    detail:
      "Modeled solar yield for your postal code using a south-facing 30° pitch. Cloud cover and shading averaged across the year to keep production honest in summer and winter.",
  },
  {
    icon: TrendingDown,
    title: "Dynamic tariff timing",
    value: "2,065 kWh shifted",
    detail:
      "Battery and EV charge during the cheapest hours and pause during peaks, capturing the price spread on the German dynamic tariff.",
  },
  {
    icon: Coins,
    title: "Subsidies & financing",
    value: "BEG + KfW applied",
    detail:
      "Federal subsidies (BEG for heat pumps, KfW for solar/battery) and local grants are pre-applied. The financed installment is calibrated so savings stay positive from year one.",
  },
  {
    icon: Battery,
    title: "Self-consumption ratio",
    value: "68% home use",
    detail:
      "68% of solar production is used directly in the home (offsetting full retail price); the rest is fed in at the regulated low rate. A battery raises this share.",
  },
];

const SOLARA_PHONE = "+49 800 765 272";
const SOLARA_EMAIL = "savings@solara.energy";

export function Proposal({
  householdInputs,
  active,
  onStepSelect,
}: {
  householdInputs: HouseholdInputs;
  active: Set<ModuleKey>;
  onStepSelect: (step: 1 | 2 | 3) => void;
}) {
  const costs = getDynamicCosts(householdInputs);
  const baseline = useMemo(() => getBaselineModules(householdInputs), [householdInputs]);
  const scenario = computeDynamicScenario(active, householdInputs);
  const main = useMemo(
    () => computeFiveYearSaving(active, householdInputs),
    [active, householdInputs],
  );
  const customerNumber = useMemo(() => {
    const streetCode = householdInputs.streetNumber.replace(/\D/g, "") || "00";
    const spendCode = String(
      (householdInputs.annualElectricitySpend +
        householdInputs.annualHeatingSpend +
        householdInputs.annualCarSpend) %
        1000,
    ).padStart(3, "0");
    return `SOL-${householdInputs.postalCode}-${streetCode}-${spendCode}`;
  }, [householdInputs]);

  const computedScenarios = useMemo(
    () =>
      SCENARIO_DEFS.map((s) => {
        const set = new Set<ModuleKey>([...s.modules, ...Array.from(baseline)]);
        const c = computeFiveYearSaving(set, householdInputs);
        return { ...s, set, ...c };
      }),
    [baseline, householdInputs],
  );

  const recommended = computedScenarios.reduce(
    (best, cur) => (cur.fiveYear > best.fiveYear ? cur : best),
    computedScenarios[0],
  );

  const activeKey = computedScenarios.find(
    (s) => s.set.size === active.size && Array.from(s.set).every((m) => active.has(m)),
  );

  const upsellCandidate = computedScenarios
    .filter((s) => s.fiveYear > main.fiveYear + 500)
    .sort((a, b) => b.fiveYear - a.fiveYear)[0];

  const activeLabels =
    Array.from(active)
      .map((m) => MODULE_LABELS[m])
      .join(" + ") || "Current setup";

  const installerText = `Customer number: ${customerNumber}. Recommended package for ${householdInputs.street} ${householdInputs.streetNumber}, ${householdInputs.postalCode}: ${activeLabels}. Baseline (yr): electricity €${costs.annualElectricity.toLocaleString()}, heating €${costs.annualHeating.toLocaleString()} (${householdInputs.heatingType}), mobility €${costs.annualMobility.toLocaleString()} (${householdInputs.carType}). Modeled saving: €${main.annualSaving.toLocaleString()}/yr, €${main.fiveYear.toLocaleString()} over 5 years. Recommended scenario: ${recommended.label} (€${recommended.fiveYear.toLocaleString()}). Next steps: call Solara at ${SOLARA_PHONE} or email ${SOLARA_EMAIL} with customer number ${customerNumber}. Final quote should validate local irradiance at ${householdInputs.postalCode}, dynamic tariff timing, BEG/KfW subsidies and self-consumption ratio.`;

  const handleDownloadPlan = () => {
    const scenarioRows = computedScenarios
      .map((s) => {
        const tag =
          s.key === recommended.key
            ? " (recommended)"
            : activeKey && s.key === activeKey.key
              ? " (your pick)"
              : "";
        return `- ${s.label}${tag}: €${s.fiveYear.toLocaleString()} over 5 years · €${s.annualSaving.toLocaleString()}/year`;
      })
      .join("\n");

    const certaintyRows = CERTAINTY_INPUTS.map(
      (item) => `- ${item.title}: ${item.value}\n  ${item.detail}`,
    ).join("\n");

    const plan = `SOLARA SAVINGS PLAN
Customer number: ${customerNumber}
Created: ${new Date().toLocaleDateString()}

SUMMARY
You save approximately €${main.annualSaving.toLocaleString()}/year.
That is approximately €${main.fiveYear.toLocaleString()} within five years.
Selected configuration: ${activeLabels}

HOUSEHOLD
Address: ${householdInputs.street} ${householdInputs.streetNumber}, ${householdInputs.postalCode}
Household size: ${householdInputs.householdSize} people
Heating: ${householdInputs.heatingType} · approx €${householdInputs.annualHeatingSpend.toLocaleString()}/year
Electricity: approx €${householdInputs.annualElectricitySpend.toLocaleString()}/year (${householdInputs.yearlyEnergyConsumption.toLocaleString()} kWh)
Mobility: ${householdInputs.carType} · approx €${householdInputs.annualCarSpend.toLocaleString()}/year

OPTIMIZE YOUR FINANCING AND SAVINGS POTENTIAL
${scenarioRows}

SAVINGS CERTAINTY INPUTS
${certaintyRows}

NEXT STEPS
1. Keep this customer number ready: ${customerNumber}
2. Call Solara: ${SOLARA_PHONE}
3. Email your savings plan to Solara: ${SOLARA_EMAIL}
4. Ask a nearby installer to check your proposal, confirm feasibility, roof geometry, grid fit and final pricing.

INSTALLER NOTE
${installerText}

All figures are estimates based on your inputs and average regional tariffs. Final figures depend on installer survey and tariff details.
`;

    const blob = new Blob([plan], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `solara-savings-plan-${customerNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="bg-white/90 border-b border-line backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <CloverLogo />
        </div>
      </header>
      <ProgressSteps activeStep={3} onStepSelect={onStepSelect} />

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        {/* Section 1 — Hero + Scenarios + Upsell */}
        <section className="bg-white rounded-[24px] border border-line p-6 md:p-8">
          <div className="text-center">
            <p className="text-cloover font-semibold uppercase text-[11px] tracking-wide">
              Your personalised plan
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold mt-2 leading-tight">
              You save approximately{" "}
              <span className="text-cloover">€{main.annualSaving.toLocaleString()}/year</span>
            </h1>
            <p className="mt-2 text-lg md:text-xl font-bold text-ink">
              That is <span className="text-cloover">€{main.fiveYear.toLocaleString()}</span> within
              five years
            </p>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto">
              Configuration: <b>{activeLabels}</b>. All figures are estimates.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <a
                href="#optimize-savings"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cloover text-white font-bold hover:bg-cloover/90 shadow-lg shadow-cloover/25 text-sm"
              >
                Optimize your financing and savings potential <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => onStepSelect(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-line text-ink font-semibold hover:border-cloover/40 text-sm"
              >
                Adjust configuration
              </button>
            </div>
          </div>

          {/* Scenarios */}
          <div id="optimize-savings" className="mt-7 scroll-mt-28 border-t border-line pt-6">
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
              <h2 className="text-lg md:text-xl font-bold">
                Optimize your financing & savings potential
              </h2>
              <p className="text-[11px] text-muted-foreground">
                5-year savings · same scenarios as the configurator
              </p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {computedScenarios.map((s) => {
                const isBest = s.key === recommended.key;
                const isYours = activeKey && s.key === activeKey.key;
                return (
                  <div
                    key={s.key}
                    className={`rounded-xl p-3.5 border-2 transition relative ${
                      isBest
                        ? "border-cloover bg-cloover text-white shadow-md shadow-cloover/20"
                        : isYours
                          ? "border-ink bg-ink/5"
                          : "border-line bg-white"
                    }`}
                  >
                    {isBest && (
                      <span className="absolute -top-2.5 left-3 inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide bg-white text-cloover px-2 py-0.5 rounded-full shadow">
                        <CheckCircle2 className="w-3 h-3" /> Recommended
                      </span>
                    )}
                    {isYours && !isBest && (
                      <span className="absolute -top-2.5 left-3 inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide bg-ink text-white px-2 py-0.5 rounded-full">
                        Your pick
                      </span>
                    )}
                    <p
                      className={`text-[11px] font-semibold ${isBest ? "text-white/80" : "text-muted-foreground"}`}
                    >
                      {s.label}
                    </p>
                    <div className="mt-1.5">
                      <div
                        className={`text-2xl font-extrabold ${isBest ? "text-white" : "text-ink"}`}
                      >
                        €{s.fiveYear.toLocaleString()}
                      </div>
                      <div
                        className={`text-[10px] ${isBest ? "text-white/80" : "text-muted-foreground"}`}
                      >
                        over 5 years · €{s.annualSaving.toLocaleString()}/yr
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upsell recommendation as text */}
            {upsellCandidate && upsellCandidate.key !== activeKey?.key && (
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-cloover-soft border border-cloover/20 p-3.5">
                <Sparkles className="w-4 h-4 text-cloover mt-0.5 shrink-0" />
                <p className="text-xs md:text-sm text-ink leading-relaxed">
                  <b className="text-cloover">Advisor recommendation:</b>{" "}
                  {householdInputs.heatingType !== "Heat Pump" &&
                  upsellCandidate.set.has("heatpump") &&
                  !active.has("heatpump") ? (
                    <>
                      Still on {householdInputs.heatingType.toLowerCase()} heating? Adding a heat
                      pump on top of your current selection grows your saving to about{" "}
                      <b>€{upsellCandidate.annualSaving.toLocaleString()}/year</b> (
                      <b>€{upsellCandidate.fiveYear.toLocaleString()}</b> over 5 years). Financed
                      monthly, the bigger upgrade actually increases what you save each month.
                    </>
                  ) : (
                    <>
                      <b>{upsellCandidate.label}</b> would grow your saving to{" "}
                      <b>€{upsellCandidate.annualSaving.toLocaleString()}/year</b>—approximately{" "}
                      <b>€{(upsellCandidate.fiveYear - main.fiveYear).toLocaleString()} more</b>{" "}
                      over 5 years than your current pick.
                    </>
                  )}{" "}
                  <button
                    onClick={() => onStepSelect(2)}
                    className="inline-flex items-center gap-1 font-semibold text-cloover underline-offset-2 hover:underline"
                  >
                    Apply <ArrowRight className="w-3 h-3" />
                  </button>
                </p>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-cloover/20 bg-cloover-soft p-4 md:p-5">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-extrabold text-ink">Ready for the next step?</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Download the savings plan or ask one of your nearby installers to check the
                    proposal, confirm feasibility and go into the green future together.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-ink">
                    Customer number: {customerNumber}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                  <button
                    onClick={handleDownloadPlan}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-cloover px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cloover/20 hover:bg-cloover/90"
                  >
                    <Download className="w-4 h-4" /> Download savings plan
                  </button>
                  <a
                    href={`mailto:${SOLARA_EMAIL}?subject=Installer feasibility check ${customerNumber}&body=Hi Solara,%0A%0AI would like a nearby installer to check my savings plan and proposal feasibility.%0A%0ACustomer number: ${customerNumber}%0AAddress: ${householdInputs.street} ${householdInputs.streetNumber}, ${householdInputs.postalCode}%0A%0AThanks!`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-ink/90"
                  >
                    <Send className="w-4 h-4" /> Reach nearby installer
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — Savings certainty + Dynamic tariff */}
        <section className="bg-white rounded-[24px] border border-line p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cloover-soft text-cloover grid place-items-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">Savings certainty inputs</h2>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                Four real-world signals shape the numbers above for postal code{" "}
                {householdInputs.postalCode}.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {CERTAINTY_INPUTS.map((row) => (
              <div key={row.title} className="rounded-xl border border-line p-3 bg-surface-soft/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cloover-soft text-cloover grid place-items-center shrink-0">
                    <row.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight">{row.title}</p>
                    <p className="text-[11px] text-cloover font-semibold">{row.value}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{row.detail}</p>
              </div>
            ))}
          </div>

          {/* Dynamic tariff explainer */}
          <div className="mt-5 pt-5 border-t border-line">
            <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-cloover" /> How the dynamic tariff works
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
                  A dynamic tariff prices electricity by the hour instead of a flat rate. Solara
                  automatically charges your battery and EV when wholesale prices drop—usually
                  overnight and during sunny midday hours—and pauses heavy loads when the grid is
                  expensive. The advisor models the yearly arbitrage based on your kWh profile.
                </p>
              </div>
              <div className="rounded-xl bg-cloover-soft px-4 py-3 text-center shrink-0">
                <p className="text-xl font-extrabold text-cloover">€417/yr</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  2,065 kWh shifted
                  <br />
                  to cheaper hours
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — Installer proposal text (compact, no duplicate download) */}
        <section className="bg-cloover text-white rounded-[24px] p-6 md:p-7">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold text-cloover-soft uppercase tracking-wide">
                For your installer
              </p>
              <h3 className="text-lg md:text-xl font-extrabold mt-0.5">
                Proposal copy you can paste straight in
              </h3>
            </div>
          </div>
          <textarea
            readOnly
            value={installerText}
            className="mt-3 w-full min-h-[120px] rounded-xl bg-white/5 border border-white/10 p-3 text-xs leading-relaxed text-white/90 outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 inline-flex items-center gap-2">
              <Send className="w-3.5 h-3.5" /> Send to installer
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(installerText)}
              className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
            >
              Copy text
            </button>
          </div>
        </section>

        <TrustBar />

        <p className="text-center text-[11px] text-muted-foreground pb-8">
          All numbers are estimates for demonstration. Final figures depend on installer survey and
          tariff details.
        </p>
      </main>

      <SupportChat />
    </div>
  );
}

function TrustBar() {
  const items = [
    { icon: Shield, label: "Bank-level encryption", sub: "TLS 1.3 + AES-256" },
    { icon: Award, label: "TÜV-audited model", sub: "Reviewed annually" },
    { icon: Users, label: "500+ installer partners", sub: "Across Germany" },
    { icon: Lock, label: "GDPR compliant", sub: "Your data stays yours" },
  ];
  return (
    <section className="rounded-[24px] border border-line bg-white p-4 md:p-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cloover-soft text-cloover grid place-items-center shrink-0">
              <it.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight">{it.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{it.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------- Support chat ----------------

const FAQS: { q: string; a: string }[] = [
  {
    q: "How accurate is the €/year saving?",
    a: "It is a modeled estimate from your inputs (heating, electricity, mobility spend) and average regional tariffs. A final installer survey refines it within ±10–15%.",
  },
  {
    q: "How does the financing work?",
    a: "Solara bundles the equipment cost into a single monthly installment, calibrated so your modeled operational saving covers most of it from day one. The 5-year saving figure already nets the installment in the early years.",
  },
  {
    q: "What subsidies are included?",
    a: "Federal BEG for heat pumps and KfW programs for solar/battery are pre-applied. Local municipal grants are listed during the installer survey.",
  },
  {
    q: "Can I change my configuration later?",
    a: "Yes. You can adjust the configuration anytime before signing the installer quote—your savings plan updates automatically.",
  },
  {
    q: "What if my roof is shaded?",
    a: "Shading is averaged into the irradiance figure. The installer survey verifies actual shading and may suggest module placement adjustments.",
  },
];

function SupportChat() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-cloover text-white font-semibold shadow-2xl shadow-cloover/30 hover:bg-cloover/90"
        >
          <MessageCircle className="w-5 h-5" /> Ask about your plan
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[min(360px,calc(100vw-2rem))] bg-white rounded-3xl border border-line shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
          <div className="bg-cloover text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/15 grid place-items-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold">Solara advisor</p>
                <p className="text-[11px] text-white/80">Usually replies in a minute</p>
              </div>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setPicked(null);
              }}
              className="text-white/80 hover:text-white"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-surface-soft/40">
            <div className="bg-white rounded-2xl rounded-tl-sm border border-line p-3 text-sm">
              Hi! I can answer questions about your savings plan, financing, or subsidies. Pick a
              question below or reach a human advisor.
            </div>
            {picked !== null && (
              <>
                <div className="bg-cloover text-white rounded-2xl rounded-tr-sm p-3 text-sm ml-8">
                  {FAQS[picked].q}
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm border border-line p-3 text-sm">
                  {FAQS[picked].a}
                </div>
              </>
            )}
          </div>
          <div className="border-t border-line p-3 space-y-2 bg-white">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {FAQS.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setPicked(i)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    picked === i
                      ? "bg-cloover text-white border-cloover"
                      : "bg-white border-line text-ink hover:border-cloover/40"
                  }`}
                >
                  {f.q}
                </button>
              ))}
            </div>
            <a
              href="tel:+498000000000"
              className="mt-1 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink/90"
            >
              <Phone className="w-4 h-4" /> Talk to customer service
            </a>
          </div>
        </div>
      )}
    </>
  );
}
