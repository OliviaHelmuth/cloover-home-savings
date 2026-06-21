import { Sparkles, Send, Leaf, TrendingDown, CheckCircle2 } from "lucide-react";
import { CloverLogo } from "./Logo";
import { ProgressSteps } from "./ProgressSteps";
import {
  SCENARIOS,
  MODULE_LABELS,
  type ModuleKey,
  type HouseholdInputs,
  getDynamicCosts,
  computeDynamicScenario,
} from "@/lib/cloover-data";

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
  const scenario = computeDynamicScenario(active, householdInputs);

  const activeLabels =
    Array.from(active)
      .map((m) => MODULE_LABELS[m])
      .join(" + ") || "None";

  const advisorText = `Your strongest option is the setup: ${activeLabels}. Your current electricity, heating, and mobility costs are estimated at €${costs.total} per month: €${costs.electricity} electricity, €${costs.heating} heating, and €${costs.mobility} mobility. With the recommended plan, your new monthly cost including financing is estimated at €${scenario.cloover}, so you save €${scenario.saving} per month during financing and the saving grows again once financing is paid off.

The Electricity lever adds roof solar and models self-consumption, cheap-hour battery charging, and dynamic tariff arbitrage. The Heating lever is a powerful upsell because fossil heating spend moves to a heat pump powered partly by self-generated electricity. The Mobility lever completes the path by replacing petrol spend with cheap off-peak EV charging.`;

  const installerText = `Recommended home energy package: ${activeLabels}. Based on the household's current electricity (€${costs.electricity}/month), heating (€${costs.heating}/month), and mobility (€${costs.mobility}/month) spend, current energy-related outgoings are estimated at €${costs.total}/month. The Electricity lever adds solar self-consumption and dynamic tariff optimization; Heating replaces oil/gas with a heat pump; Mobility replaces petrol with off-peak EV charging. The package is estimated at €${scenario.cloover}/month including financing, creating an estimated monthly saving of €${scenario.saving} during financing, with higher savings once financing is paid off. The package also avoids about 4.1 tonnes of CO₂ per year.`;

  const fitBuckets = [
    [
      "Electricity",
      "Solar self-consumption + battery cheap-hour arbitrage",
      `+€${Math.round(costs.electricity * 0.625)}/mo`,
    ],
    [
      "Heating",
      "Oil/gas spend displaced by heat pump electricity",
      `+€${householdInputs.heatingType !== "Heat Pump" ? Math.round(costs.heating * 0.196) : 0}/mo`,
    ],
    [
      "Mobility",
      "Petrol spend displaced by off-peak EV charging",
      `+€${householdInputs.carType !== "EV" && householdInputs.carType !== "No Car" ? Math.round(costs.mobility * 0.04) : 0}/mo`,
    ],
  ];

  const certaintyRows = [
    ["Local irradiance", `${householdInputs.street || "Local"} roof estimate: 1,050 kWh/kWp/yr`],
    ["Dynamic tariff", "2,065 kWh shifted into cheaper hours"],
    ["Subsidies", "Grant and financing support checked before final quote"],
    ["Self-consumption", "68% home use, remaining output treated as lower-value feed-in"],
  ];

  const remainingElec = Math.round(costs.electricity * 0.176);
  const feedin = active.has("solar") ? 40 : 0;
  const clooverRate = Math.max(0, scenario.cloover - remainingElec + feedin);

  // Compute dynamic scenarios for comparison list
  const computedScenarios = SCENARIOS.map((s) => {
    const sActive = new Set<ModuleKey>(s.modules);
    return computeDynamicScenario(sActive, householdInputs);
  });

  const recommendedScenario = computedScenarios.reduce(
    (best, current) => (current.saving > best.saving ? current : best),
    computedScenarios[0],
  );

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="bg-white/90 border-b border-line backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <CloverLogo />
        </div>
      </header>
      <ProgressSteps activeStep={3} onStepSelect={onStepSelect} />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <section className="bg-white rounded-[28px] border border-line p-8 md:p-12 text-center">
          <p className="text-cloover font-semibold uppercase text-xs tracking-wide">
            Recommended package
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
            You save <span className="text-cloover">€{scenario.saving}/month</span> with this plan
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {activeLabels}. All figures are estimates based on your inputs.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {Array.from(active).map((m) => (
              <span
                key={m}
                className="px-3 py-1.5 rounded-full bg-cloover-soft text-cloover text-sm font-semibold"
              >
                {MODULE_LABELS[m]}
              </span>
            ))}
          </div>
        </section>

        {/* Plan effect visual */}
        <section className="bg-white rounded-[28px] border border-line p-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            The plan effect: customers benefit from month 1
          </h2>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            You pay a monthly plan rate, but your old energy bill drops by more than the rate costs.
            That's why you benefit from the first month.
          </p>

          <div className="mt-8 grid md:grid-cols-[140px_1fr_140px] gap-6 items-end">
            {/* Without */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-2">Without the upgrade</div>
              <div className="w-full h-48 bg-line rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold">€{costs.total}</span>
              </div>
            </div>

            {/* Middle composition */}
            <div className="relative bg-cloover-soft rounded-2xl p-6">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cloover text-white text-sm font-bold px-3 py-1 rounded-full">
                -€{scenario.saving}
              </div>
              <div className="grid grid-cols-3 gap-4 items-end h-48 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-ink mb-1">Plan rate</span>
                  <div className="w-full h-full bg-white border border-cloover/20 rounded-xl flex items-end justify-center pb-3">
                    <span className="font-bold text-ink">€{clooverRate}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-ink mb-1">New electricity</span>
                  <div className="w-full h-1/3 bg-line rounded-xl flex items-end justify-center pb-2">
                    <span className="font-bold text-ink">€{remainingElec}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-ink mb-1">Feed-in credit</span>
                  <div className="w-full h-1/3 bg-cloover/30 rounded-xl flex items-end justify-center pb-2">
                    <span className="font-bold text-cloover">-€{feedin}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* With */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-2">With the plan</div>
              <div className="w-full h-32 bg-cloover rounded-2xl flex items-center justify-center text-white">
                <span className="text-2xl font-bold">€{scenario.cloover}</span>
              </div>
              <div className="mt-3 text-success font-bold text-sm">
                €{scenario.saving}/mo saved from month 1
              </div>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-line p-5">
              <p className="text-xs uppercase font-semibold text-muted-foreground">
                During financing
              </p>
              <p className="text-xl font-bold mt-1">€{scenario.saving}/month saved</p>
            </div>
            <div className="rounded-2xl border border-line p-5">
              <p className="text-xs uppercase font-semibold text-cloover">After financing</p>
              <p className="text-xl font-bold mt-1">Bigger savings — the installment ends</p>
            </div>
          </div>
        </section>

        {/* Scenario comparison */}
        <section className="bg-white rounded-[28px] border border-line p-8">
          <h2 className="text-2xl font-bold mb-4">Compare scenarios</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {SCENARIOS.map((s, i) => {
              const cs = computedScenarios[i];
              const isBest =
                cs.modules.length === recommendedScenario.modules.length &&
                cs.modules.every((m) => recommendedScenario.modules.includes(m));
              return (
                <div
                  key={i}
                  className={`rounded-2xl p-4 border-2 ${
                    isBest ? "border-cloover bg-cloover-soft" : "border-line bg-white"
                  }`}
                >
                  <div className="text-xs text-muted-foreground">
                    {s.modules.length === 0
                      ? "Current setup"
                      : s.modules.map((m) => MODULE_LABELS[m]).join(" + ")}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold">€{cs.saving}</span>
                    <span className="text-xs text-muted-foreground">/mo saved</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Plan cost €{cs.cloover}/mo · Fit {cs.fit}/100
                  </div>
                  {isBest && (
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cloover">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Recommended
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[28px] border border-line p-6">
            <h3 className="text-lg font-bold">Household fit by spend bucket</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The recommendation is strongest where home energy output replaces bills the customer
              already pays, not where solar is exported as low-value feed-in.
            </p>
            <div className="mt-4 space-y-3">
              {fitBuckets.map(([bucket, detail, value]) => (
                <div key={bucket} className="rounded-2xl bg-surface-soft p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{bucket}</p>
                    <p className="font-extrabold text-success">{value}</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-[28px] border border-line p-6">
            <h3 className="text-lg font-bold">Savings certainty inputs</h3>
            <div className="mt-4 space-y-3">
              {certaintyRows.map(([label, detail]) => (
                <div key={label} className="rounded-2xl bg-surface-soft p-4">
                  <p className="font-bold">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Breakdown + tariff */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[28px] border border-line p-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Leaf className="w-5 h-5 text-success" /> Savings breakdown
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Electricity</span>
                <b className="text-success">+€{Math.round(costs.electricity * 0.625)}/mo</b>
              </li>
              <li className="flex justify-between">
                <span>Heating</span>
                <b className="text-success">
                  +€
                  {householdInputs.heatingType !== "Heat Pump"
                    ? Math.round(costs.heating * 0.196)
                    : 0}
                  /mo
                </b>
              </li>
              <li className="flex justify-between">
                <span>Mobility</span>
                <b className="text-success">
                  +€
                  {householdInputs.carType !== "EV" && householdInputs.carType !== "No Car"
                    ? Math.round(costs.mobility * 0.04)
                    : 0}
                  /mo
                </b>
              </li>
              <li className="flex justify-between border-t border-line pt-2 mt-2">
                <span className="font-bold">Total monthly saving</span>
                <b className="text-cloover text-lg">€{scenario.saving}/mo</b>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-[28px] border border-line p-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-cloover" /> Dynamic tariff
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              The Electricity lever includes solar self-consumption plus battery and dynamic tariff
              optimization. The system buys more electricity when prices are low and avoids
              expensive hours.
            </p>
            <div className="mt-4 rounded-xl bg-cloover-soft p-4">
              <p className="text-2xl font-extrabold text-cloover">€417.90/year</p>
              <p className="text-xs text-muted-foreground">
                via dynamic tariff optimization · 2,065 kWh shifted
              </p>
            </div>
          </div>
        </section>

        {/* AI advisor */}
        <section className="bg-white rounded-[28px] border border-line p-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-ink text-white grid place-items-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold">Energy Advisor</h3>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line text-ink">{advisorText}</p>
        </section>

        {/* Installer proposal */}
        <section className="bg-cloover text-white rounded-[28px] p-8">
          <p className="text-xs font-semibold text-cloover-soft uppercase tracking-wide">
            For your installer
          </p>
          <h3 className="text-2xl font-bold mt-1">Proposal copy</h3>
          <textarea
            readOnly
            value={installerText}
            className="mt-4 w-full min-h-[160px] rounded-2xl bg-white/5 border border-white/10 p-4 text-sm leading-relaxed text-white/90 outline-none"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="px-6 py-3 rounded-full bg-white text-ink font-semibold inline-flex items-center gap-2 hover:bg-cloover-soft cursor-pointer">
              <Send className="w-4 h-4" /> Send to installer
            </button>
            <button className="px-6 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 cursor-pointer">
              Copy text
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground pb-10">
          All numbers are estimates for demonstration. Final figures depend on installer survey and
          tariff details.
        </p>
      </main>
    </div>
  );
}
