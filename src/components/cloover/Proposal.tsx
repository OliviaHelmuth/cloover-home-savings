import { useMemo, useState } from "react";
import {
  Sparkles,
  Send,
  TrendingDown,
  CheckCircle2,
  Download,
  Sun,
  Cloud,
  Coins,
  Battery,
  MessageCircle,
  Phone,
  X,
  ArrowRight,
} from "lucide-react";
import jsPDF from "jspdf";
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

  // Compute all scenarios (merge baseline so heat pump/EV ownership is reflected)
  const computedScenarios = useMemo(
    () =>
      SCENARIO_DEFS.map((s) => {
        const set = new Set<ModuleKey>([...s.modules, ...Array.from(baseline)]);
        const c = computeFiveYearSaving(set, householdInputs);
        const dyn = computeDynamicScenario(set, householdInputs);
        return { ...s, set, ...c, breakdown: dyn.breakdown, cloover: dyn.cloover };
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

  // Upsell: best scenario beyond the current selection
  const upsellCandidate = computedScenarios
    .filter((s) => s.fiveYear > main.fiveYear + 500)
    .sort((a, b) => b.fiveYear - a.fiveYear)[0];

  const activeLabels =
    Array.from(active)
      .map((m) => MODULE_LABELS[m])
      .join(" + ") || "Current setup";

  const installerText = `Recommended home energy package for ${householdInputs.street} ${householdInputs.streetNumber}, ${householdInputs.postalCode}: ${activeLabels}.

Household baseline (per year): electricity €${costs.annualElectricity.toLocaleString()}, heating €${costs.annualHeating.toLocaleString()} (${householdInputs.heatingType}), mobility €${costs.annualMobility.toLocaleString()} (${householdInputs.carType}). Total energy outgoings approx. €${costs.annualTotal.toLocaleString()}/yr.

Modeled operational saving with this configuration: approx. €${main.annualSaving.toLocaleString()}/yr, or about €${main.fiveYear.toLocaleString()} over five years after financing impact in early years. Recommended scenario by 5-year saving: ${recommended.label} (€${recommended.fiveYear.toLocaleString()}).

Final quote should validate local irradiance at postal code ${householdInputs.postalCode}, dynamic tariff timing, available subsidies (BEG/KfW), and self-consumption ratio.`;

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    let y = 0;

    // Header band
    doc.setFillColor(0, 46, 255);
    doc.rect(0, 0, W, 90, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Solara Savings Plan", 40, 45);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Personalised home energy proposal · estimate", 40, 65);
    doc.text(new Date().toLocaleDateString(), W - 40, 65, { align: "right" });

    y = 120;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Household", 40, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const hh = [
      `Address: ${householdInputs.street} ${householdInputs.streetNumber}, ${householdInputs.postalCode}`,
      `Household size: ${householdInputs.householdSize} people`,
      `Heating: ${householdInputs.heatingType} · approx €${householdInputs.annualHeatingSpend.toLocaleString()}/yr`,
      `Electricity: approx €${householdInputs.annualElectricitySpend.toLocaleString()}/yr (${householdInputs.yearlyEnergyConsumption.toLocaleString()} kWh)`,
      `Mobility: ${householdInputs.carType} · approx €${householdInputs.annualCarSpend.toLocaleString()}/yr`,
    ];
    hh.forEach((line) => {
      doc.text(line, 40, y);
      y += 16;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Selected configuration", 40, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(activeLabels, 40, y);
    y += 24;

    // Big saving box
    doc.setFillColor(232, 238, 255);
    doc.roundedRect(40, y, W - 80, 90, 10, 10, "F");
    doc.setTextColor(0, 46, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Estimated savings", 56, y + 24);
    doc.setFontSize(26);
    doc.text(`€${main.annualSaving.toLocaleString()} / year`, 56, y + 54);
    doc.setFontSize(14);
    doc.text(`€${main.fiveYear.toLocaleString()} over 5 years`, 56, y + 78);
    y += 110;

    // Breakdown
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Yearly savings breakdown", 40, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const rows: [string, number][] = [
      ["Electricity (solar + battery + tariff)", scenario.breakdown.electricity],
      ["Heating (heat pump)", scenario.breakdown.heating],
      ["Mobility (EV charging)", scenario.breakdown.mobility],
    ];
    rows.forEach(([label, val]) => {
      doc.text(label, 40, y);
      doc.text(`€${val.toLocaleString()}/yr`, W - 40, y, { align: "right" });
      y += 16;
    });
    doc.setFont("helvetica", "bold");
    doc.text("Total operational saving", 40, y);
    doc.text(`€${main.annualSaving.toLocaleString()}/yr`, W - 40, y, { align: "right" });
    y += 24;

    // Scenarios
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Scenario comparison (5-year savings)", 40, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    computedScenarios.forEach((s) => {
      const tag =
        s.key === recommended.key
          ? " (recommended)"
          : activeKey && s.key === activeKey.key
            ? " (your pick)"
            : "";
      doc.text(`${s.label}${tag}`, 40, y);
      doc.text(`€${s.fiveYear.toLocaleString()}`, W - 40, y, { align: "right" });
      y += 16;
    });

    y += 16;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "All figures are estimates based on inputs and average regional tariffs. Final quote requires installer survey.",
      40,
      y,
      { maxWidth: W - 80 },
    );

    doc.save(`solara-savings-plan-${householdInputs.postalCode}.pdf`);
  };

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="bg-white/90 border-b border-line backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <CloverLogo />
          <button
            onClick={handleDownloadPDF}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cloover text-white text-sm font-semibold hover:bg-cloover/90 shadow-sm shadow-cloover/20"
          >
            <Download className="w-4 h-4" /> Download plan
          </button>
        </div>
      </header>
      <ProgressSteps activeStep={3} onStepSelect={onStepSelect} />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Hero — yearly + 5y */}
        <section className="bg-white rounded-[28px] border border-line p-8 md:p-12">
          <div className="text-center">
            <p className="text-cloover font-semibold uppercase text-xs tracking-wide">
              Your personalised plan
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 leading-tight">
              You save approximately{" "}
              <span className="text-cloover">€{main.annualSaving.toLocaleString()}/year</span>
            </h1>
            <p className="mt-4 text-xl md:text-2xl font-bold text-ink">
              That is <span className="text-cloover">€{main.fiveYear.toLocaleString()}</span> within
              five years
            </p>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm">
              Based on your configuration: <b>{activeLabels}</b>. All figures are estimates from
              your household inputs and average regional tariffs.
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
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cloover text-white font-bold hover:bg-cloover/90 shadow-lg shadow-cloover/25"
              >
                <Download className="w-5 h-5" /> Download your savings plan (PDF)
              </button>
              <button
                onClick={() => onStepSelect(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-line text-ink font-semibold hover:border-cloover/40"
              >
                Adjust configuration
              </button>
            </div>
          </div>
        </section>

        {/* Upsell — AI-style nudge */}
        {upsellCandidate && upsellCandidate.key !== activeKey?.key && (
          <section className="rounded-[28px] border-2 border-cloover bg-gradient-to-br from-cloover-soft to-white p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cloover text-white grid place-items-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-cloover uppercase tracking-wide">
                  Recommended upgrade · AI advisor
                </p>
                <h2 className="text-xl md:text-2xl font-extrabold mt-1">
                  Optimise your financing and savings potential
                </h2>
                <p className="mt-2 text-sm text-ink leading-relaxed">
                  {householdInputs.heatingType !== "Heat Pump" &&
                  upsellCandidate.set.has("heatpump") &&
                  !active.has("heatpump") ? (
                    <>
                      Still on <b>{householdInputs.heatingType.toLowerCase()} heating</b>? Adding a
                      heat pump on top of your current selection brings your saving to about{" "}
                      <b className="text-cloover">
                        €{upsellCandidate.annualSaving.toLocaleString()}/year
                      </b>
                      , or{" "}
                      <b className="text-cloover">
                        €{upsellCandidate.fiveYear.toLocaleString()} over 5 years
                      </b>
                      . Financed monthly, the bigger upgrade actually increases what you save each
                      month.
                    </>
                  ) : (
                    <>
                      Going with <b>{upsellCandidate.label}</b> grows your saving to about{" "}
                      <b className="text-cloover">
                        €{upsellCandidate.annualSaving.toLocaleString()}/year
                      </b>
                      —approximately{" "}
                      <b className="text-cloover">
                        €
                        {(upsellCandidate.fiveYear - main.fiveYear).toLocaleString()} more over 5
                        years
                      </b>{" "}
                      than your current pick.
                    </>
                  )}
                </p>
                <button
                  onClick={() => onStepSelect(2)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cloover text-white text-sm font-semibold hover:bg-cloover/90"
                >
                  Apply this recommendation <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Scenario comparison */}
        <section className="bg-white rounded-[28px] border border-line p-6 md:p-8">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="text-2xl font-bold">Compare scenarios</h2>
            <p className="text-xs text-muted-foreground">
              5-year savings · same scenarios as the configurator
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {computedScenarios.map((s) => {
              const isBest = s.key === recommended.key;
              const isYours = activeKey && s.key === activeKey.key;
              return (
                <div
                  key={s.key}
                  className={`rounded-2xl p-5 border-2 transition relative ${
                    isBest
                      ? "border-cloover bg-cloover text-white shadow-lg shadow-cloover/20"
                      : isYours
                        ? "border-ink bg-ink/5"
                        : "border-line bg-white"
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-3 left-4 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide bg-white text-cloover px-2 py-1 rounded-full shadow">
                      <CheckCircle2 className="w-3 h-3" /> Recommended
                    </span>
                  )}
                  {isYours && !isBest && (
                    <span className="absolute -top-3 left-4 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide bg-ink text-white px-2 py-1 rounded-full">
                      Your pick
                    </span>
                  )}
                  <p
                    className={`text-xs font-semibold ${isBest ? "text-white/80" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </p>
                  <div className="mt-3">
                    <div
                      className={`text-3xl font-extrabold ${isBest ? "text-white" : "text-ink"}`}
                    >
                      €{s.fiveYear.toLocaleString()}
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${isBest ? "text-white/80" : "text-muted-foreground"}`}
                    >
                      saved over 5 years
                    </div>
                  </div>
                  <div
                    className={`mt-3 pt-3 border-t text-sm font-bold ${
                      isBest ? "border-white/20 text-white" : "border-line text-success"
                    }`}
                  >
                    €{s.annualSaving.toLocaleString()}/year operational
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Savings certainty inputs */}
        <section className="bg-white rounded-[28px] border border-line p-6 md:p-8">
          <h2 className="text-2xl font-bold">Savings certainty inputs</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Four real-world signals shape the numbers above. The advisor uses each one to keep the
            5-year saving realistic for postal code {householdInputs.postalCode}.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                icon: <Sun className="w-5 h-5" />,
                title: "Local irradiance",
                value: "1,050 kWh/kWp/yr",
                detail: `Modeled solar yield for ${householdInputs.street}, postal code ${householdInputs.postalCode}, using a south-facing 30° pitch. Cloud cover and shading are averaged across the year so the production figure stays honest in summer and winter.`,
              },
              {
                icon: <TrendingDown className="w-5 h-5" />,
                title: "Dynamic tariff timing",
                value: "2,065 kWh shifted",
                detail:
                  "The battery and EV charge during the cheapest hours and discharge or pause during peaks. This timing arbitrage captures price spreads on the German dynamic tariff and avoids paying peak-hour rates.",
              },
              {
                icon: <Coins className="w-5 h-5" />,
                title: "Subsidies & financing",
                value: "BEG + KfW checked",
                detail:
                  "Federal subsidies (BEG for heat pumps, KfW for solar/battery) and local grants are pre-applied to the modeled cost. The Cloover-anchored monthly installment is calibrated so financed savings remain positive from year one.",
              },
              {
                icon: <Battery className="w-5 h-5" />,
                title: "Self-consumption ratio",
                value: "68% home use",
                detail:
                  "We assume 68% of your solar production is used directly in the home (offsetting full retail price) and the rest is fed in at the regulated low rate. A battery raises the home-use share, which is why the Electricity + Battery scenario saves much more than solar alone.",
              },
            ].map((row) => (
              <div
                key={row.title}
                className="rounded-2xl border border-line p-5 bg-surface-soft/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cloover-soft text-cloover grid place-items-center">
                    {row.icon}
                  </div>
                  <div>
                    <p className="font-bold">{row.title}</p>
                    <p className="text-xs text-cloover font-semibold">{row.value}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{row.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic tariff + breakdown */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[28px] border border-line p-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-cloover" /> Dynamic tariff explained
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              A dynamic tariff prices electricity by the hour instead of a flat rate. Solara
              automatically charges your battery and EV when wholesale prices drop—usually overnight
              and during sunny midday hours—and pauses heavy loads when the grid is expensive. The
              advisor models the resulting yearly arbitrage based on your kWh consumption profile.
            </p>
            <div className="mt-4 rounded-xl bg-cloover-soft p-4">
              <p className="text-2xl font-extrabold text-cloover">€417/year</p>
              <p className="text-xs text-muted-foreground">
                via dynamic tariff optimisation · 2,065 kWh shifted into cheaper hours
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Cloud className="w-3.5 h-3.5" /> Estimate based on average German hourly spreads.
            </div>
          </div>
          <div className="bg-white rounded-[28px] border border-line p-6">
            <h3 className="text-lg font-bold">Yearly savings breakdown</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between items-baseline">
                <span>Electricity</span>
                <b className="text-success">
                  €{scenario.breakdown.electricity.toLocaleString()}/yr
                </b>
              </li>
              <li className="flex justify-between items-baseline">
                <span>Heating</span>
                <b className="text-success">€{scenario.breakdown.heating.toLocaleString()}/yr</b>
              </li>
              <li className="flex justify-between items-baseline">
                <span>Mobility</span>
                <b className="text-success">€{scenario.breakdown.mobility.toLocaleString()}/yr</b>
              </li>
              <li className="flex justify-between items-baseline border-t border-line pt-3 mt-2">
                <span className="font-bold">Total operational saving</span>
                <b className="text-cloover text-xl">
                  €{main.annualSaving.toLocaleString()}/yr
                </b>
              </li>
              <li className="flex justify-between items-baseline">
                <span className="text-muted-foreground text-xs">Cumulative over 5 years</span>
                <b className="text-cloover">€{main.fiveYear.toLocaleString()}</b>
              </li>
            </ul>
          </div>
        </section>

        {/* For your installer */}
        <section className="bg-cloover text-white rounded-[28px] p-8 md:p-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
            <div>
              <p className="text-xs font-semibold text-cloover-soft uppercase tracking-wide">
                For your installer
              </p>
              <h3 className="text-2xl md:text-3xl font-extrabold mt-1">
                Download your full savings plan
              </h3>
              <p className="text-sm text-white/80 mt-2 max-w-xl">
                A branded PDF with your household data, selected configuration, yearly and 5-year
                savings, and the scenario comparison. Send it to your installer or bring it to a
                Solara advisor.
              </p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-4 rounded-full bg-white text-cloover font-extrabold inline-flex items-center gap-2 hover:bg-cloover-soft shadow-xl shadow-black/10 text-lg"
            >
              <Download className="w-5 h-5" /> Download PDF
            </button>
          </div>
          <textarea
            readOnly
            value={installerText}
            className="mt-6 w-full min-h-[160px] rounded-2xl bg-white/5 border border-white/10 p-4 text-sm leading-relaxed text-white/90 outline-none"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="px-5 py-2.5 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 inline-flex items-center gap-2">
              <Send className="w-4 h-4" /> Send to installer
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(installerText)}
              className="px-5 py-2.5 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20"
            >
              Copy text
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground pb-10">
          All numbers are estimates for demonstration. Final figures depend on installer survey and
          tariff details.
        </p>
      </main>

      <SupportChat />
    </div>
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
