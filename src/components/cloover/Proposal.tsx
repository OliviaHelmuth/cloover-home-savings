import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Send,
  Download,
  Sun,
  Coins,
  Battery,
  MapPin,
  Printer,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { ProgressSteps } from "./ProgressSteps";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import {
  MODULE_LABELS,
  type ModuleKey,
  type HouseholdInputs,
  getDynamicCosts,
  computeDynamicScenario,
  computeFinancialPlan,
  getBaselineModules,
} from "@/lib/cloover-data";

// Mirror the configurator's savings math so the numbers stay consistent.
function computeFiveYearSaving(
  active: Set<ModuleKey>,
  inputs: HouseholdInputs,
  term = 10,
): {
  fiveYear: number;
  annualSaving: number;
  monthlySaving: number;
  earlyYears: number;
  earlyExtra: number;
  monthlyEarlyExtra: number;
} {
  const baseline = getBaselineModules(inputs);
  const optional = Array.from(active).filter((m) => !baseline.has(m));
  const isCurrent = optional.length === 0;
  const scenario = computeDynamicScenario(active, inputs);
  const plan = computeFinancialPlan(active, inputs, term);
  return {
    fiveYear: isCurrent ? 0 : plan.fiveYearOperationalSaving,
    annualSaving: scenario.annualSaving,
    monthlySaving: scenario.saving,
    earlyYears: plan.earlyYears,
    earlyExtra: plan.earlyAnnualExtra,
    monthlyEarlyExtra: Math.round(plan.earlyAnnualExtra / 12),
  };
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

function buildCertaintyInputs(
  scenario: ReturnType<typeof computeDynamicScenario>,
  financialPlan: ReturnType<typeof computeFinancialPlan>,
  postalCode: string,
) {
  return [
    {
      icon: Sun,
      title: "Local irradiance",
      value: `${scenario.roof.location.specificYieldKwhPerKwp} kWh/kWp/yr`,
      detail: `Modeled solar yield for ${postalCode} using ${scenario.roof.location.orientation} roof orientation, ${scenario.roof.usableRoofAreaM2.toFixed(0)} m² usable roof area and the selected ${scenario.system.pvKwp.toFixed(1)} kWp system size.`,
    },
    {
      icon: Ruler,
      title: "Usable roof size",
      value: `${scenario.roof.usableRoofAreaM2.toFixed(0)} m² usable`,
      detail: `${scenario.roof.panelCountMax} panel roof cap modeled before installer checks for shading, dormers, chimneys and grid connection constraints.`,
    },
    {
      icon: Coins,
      title: "Subsidies & financing",
      value:
        financialPlan.subsidy > 0
          ? `€${financialPlan.subsidy.toLocaleString()} subsidy`
          : "0% VAT assumptions",
      detail: `The package is modeled at €${financialPlan.netCapex.toLocaleString()} after subsidy and financed over ${financialPlan.termYears} years at a labelled 5% APR assumption.`,
    },
    {
      icon: Battery,
      title: "Self-consumption ratio",
      value:
        scenario.system.selfConsumptionRatio > 0
          ? `${Math.round(scenario.system.selfConsumptionRatio * 100)}% home use`
          : "0% until PV is added",
      detail:
        "Self-consumed solar offsets the full retail electricity price. Exported electricity is valued at the lower feed-in tariff, so household fit matters.",
    },
  ];
}

const SOLARA_PHONE = "+49 800 765 272";
const SOLARA_EMAIL = "savings@solara.energy";

type CertaintyItem = ReturnType<typeof buildCertaintyInputs>[number];

function euro(value: number) {
  return `EUR ${Math.round(value).toLocaleString()}`;
}

function monthlyEuro(annualValue: number) {
  return euro(annualValue / 12);
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5,
) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

type TimelinePoint = {
  year: number;
  current: number;
  solara: number;
  cumulativeSaving: number;
};

function buildSpendingTimeline(
  currentMonthlySpend: number,
  monthlySaving: number,
  monthlyInstallment: number,
  termYears: number,
) {
  const modeledMonthlySpend = Math.max(currentMonthlySpend - monthlySaving, 0);
  const termMonths = termYears * 12;

  return [0, 1, 3, 5, 10, 15].map((year) => {
    const months = year * 12;
    const current = currentMonthlySpend * months;
    const loanMonths = Math.min(months, termMonths);
    const paidOffMonths = Math.max(months - termMonths, 0);
    const solara =
      (modeledMonthlySpend + monthlyInstallment) * loanMonths + modeledMonthlySpend * paidOffMonths;

    return {
      year,
      current: Math.round(current),
      solara: Math.round(solara),
      cumulativeSaving: Math.round(current - solara),
    };
  });
}

function SpendingOverTimeChart({
  currentMonthlySpend,
  modeledMonthlyBill,
  monthlyDuringFinancing,
  breakEvenYear,
  termYears,
}: {
  currentMonthlySpend: number;
  modeledMonthlyBill: number;
  monthlyDuringFinancing: number;
  breakEvenYear: number;
  termYears: number;
}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  const width = isMobile ? 520 : 900;
  const height = isMobile ? 460 : 360;
  const padding = isMobile
    ? { top: 28, right: 24, bottom: 40, left: 56 }
    : { top: 32, right: 38, bottom: 44, left: 70 };
  const maxYear = 15;
  const maxMonthlySpend = Math.max(
    currentMonthlySpend,
    monthlyDuringFinancing,
    modeledMonthlyBill,
    1,
  );
  const minMonthlySpend = Math.min(
    currentMonthlySpend,
    monthlyDuringFinancing,
    modeledMonthlyBill,
    0,
  );
  const yRange = Math.max(maxMonthlySpend - minMonthlySpend, 1);
  const topValue = maxMonthlySpend + yRange * 0.22;
  const bottomValue = Math.max(0, minMonthlySpend - yRange * 0.14);
  const x = (year: number) =>
    padding.left + (year / maxYear) * (width - padding.left - padding.right);
  const y = (value: number) =>
    height -
    padding.bottom -
    ((value - bottomValue) / (topValue - bottomValue)) * (height - padding.top - padding.bottom);
  const term = Math.min(Math.max(termYears, 0), maxYear);
  const currentY = y(currentMonthlySpend);
  const financedY = y(monthlyDuringFinancing);
  const afterY = y(modeledMonthlyBill);
  const currentPath = `M ${x(0)} ${currentY} L ${x(maxYear)} ${currentY}`;
  const solaraPath = `M ${x(0)} ${financedY} L ${x(term)} ${financedY} L ${x(term)} ${afterY} L ${x(maxYear)} ${afterY}`;
  const savingArea =
    modeledMonthlyBill < currentMonthlySpend
      ? `M ${x(term)} ${currentY} L ${x(maxYear)} ${currentY} L ${x(maxYear)} ${afterY} L ${x(term)} ${afterY} Z`
      : "";
  const earlyExtra = Math.max(monthlyDuringFinancing - currentMonthlySpend, 0);
  const longTermSaving = Math.max(currentMonthlySpend - modeledMonthlyBill, 0);
  const ticks = [0, 3, 5, 10, 15];

  return (
    <div className="overflow-hidden rounded-[26px] border border-line bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="text-base font-extrabold text-ink">Monthly spending over time</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The plan may cost more while the loan is active. After the {termYears}-year loan is paid
            off, the monthly bill drops and cumulative break-even is estimated around{" "}
            {breakEvenYear > 0 ? `year ${breakEvenYear}` : "your selected upgrade point"}.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-3 py-1.5 text-ink">
            <span className="h-2.5 w-2.5 rounded-full bg-ink" /> Current
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cloover-soft px-3 py-1.5 text-cloover">
            <span className="h-2.5 w-2.5 rounded-full bg-cloover" /> Solara
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Monthly spending comparison chart"
        className="h-auto w-full bg-gradient-to-b from-white to-cloover-soft/20"
      >
        {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
          const gridY = padding.top + ratio * (height - padding.top - padding.bottom);
          return (
            <line
              key={ratio}
              x1={padding.left}
              x2={width - padding.right}
              y1={gridY}
              y2={gridY}
              stroke="#E5ECF8"
              strokeWidth="1"
            />
          );
        })}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={x(tick)}
              x2={x(tick)}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="#F1F5FB"
              strokeWidth="1"
            />
            <text
              x={x(tick)}
              y={height - 15}
              textAnchor="middle"
              fontSize={isMobile ? 16 : 12}
              className="fill-muted-foreground font-semibold"
            >
              {tick}y
            </text>
          </g>
        ))}
        {savingArea && <path d={savingArea} fill="#1F6FEB" opacity="0.08" />}
        <path d={currentPath} fill="none" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
        <path
          d={solaraPath}
          fill="none"
          stroke="#1F6FEB"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={x(0)} cy={currentY} r="5" fill="#111827" />
        <circle cx={x(0)} cy={financedY} r="6" fill="#1F6FEB" />
        <circle cx={x(term)} cy={afterY} r="6" fill="#1F6FEB" />
        <circle cx={x(maxYear)} cy={afterY} r="6" fill="#1F6FEB" />
        <text x={padding.left} y={22} fontSize={isMobile ? 16 : 12} className="fill-muted-foreground font-semibold">
          monthly cost
        </text>
        <text x={x(0) + 10} y={currentY - 10} fontSize={isMobile ? 18 : 13} className="fill-ink font-bold">
          €{currentMonthlySpend.toLocaleString()}/mo today
        </text>
        <text x={x(0) + 10} y={financedY + 22} fontSize={isMobile ? 18 : 13} className="fill-cloover font-bold">
          €{monthlyDuringFinancing.toLocaleString()}/mo during loan
        </text>
        <text x={x(term) + 10} y={afterY - 12} fontSize={isMobile ? 18 : 13} className="fill-cloover font-bold">
          €{modeledMonthlyBill.toLocaleString()}/mo after loan
        </text>
      </svg>

      <div className="grid gap-3 border-t border-line bg-surface-soft/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <ChartStat
          label="During loan"
          value={
            earlyExtra > 0 ? `+€${Math.round(earlyExtra).toLocaleString()}/mo` : "Saves immediately"
          }
        />
        <ChartStat
          label="Loan paid off"
          value={termYears > 0 ? `After year ${termYears}` : "No loan"}
        />
        <ChartStat
          label="Then you save"
          value={`€${Math.round(longTermSaving).toLocaleString()}/mo lower`}
        />
        <ChartStat
          label="Cumulative break-even"
          value={breakEvenYear > 0 ? `Year ${breakEvenYear}` : "No upgrade"}
        />
      </div>
    </div>
  );
}

function ChartStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-extrabold text-ink">{value}</p>
    </div>
  );
}

function OutcomeTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-soft px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-extrabold leading-snug text-ink">{value}</p>
      {note && <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{note}</p>}
    </div>
  );
}

export function Proposal({
  householdInputs,
  active,
  financingTerm,
  onStepSelect,
}: {
  householdInputs: HouseholdInputs;
  active: Set<ModuleKey>;
  financingTerm: number;
  onStepSelect: (step: 1 | 2 | 3) => void;
}) {
  const costs = getDynamicCosts(householdInputs);
  const baseline = useMemo(() => getBaselineModules(householdInputs), [householdInputs]);
  const scenario = computeDynamicScenario(active, householdInputs);
  const financialPlan = computeFinancialPlan(active, householdInputs, financingTerm);
  const certaintyInputs = buildCertaintyInputs(scenario, financialPlan, householdInputs.postalCode);
  const main = useMemo(
    () => computeFiveYearSaving(active, householdInputs, financingTerm),
    [active, financingTerm, householdInputs],
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
        const c = computeFiveYearSaving(set, householdInputs, financingTerm);
        return { ...s, set, ...c };
      }),
    [baseline, financingTerm, householdInputs],
  );

  const recommended = computedScenarios.reduce(
    (best, cur) => (cur.fiveYear > best.fiveYear ? cur : best),
    computedScenarios[0],
  );

  const activeKey = computedScenarios.find(
    (s) => s.set.size === active.size && Array.from(s.set).every((m) => active.has(m)),
  );

  const activeLabels =
    Array.from(active)
      .map((m) => MODULE_LABELS[m])
      .join(" + ") || "Current setup";
  const timelinePoints = useMemo(
    () =>
      buildSpendingTimeline(
        costs.total,
        main.monthlySaving,
        financialPlan.monthlyInstallment,
        financialPlan.termYears,
      ),
    [costs.total, financialPlan.monthlyInstallment, financialPlan.termYears, main.monthlySaving],
  );
  const month60 = timelinePoints.find((point) => point.year === 5);
  const modeledMonthlyBill = Math.max(costs.total - main.monthlySaving, 0);
  const monthlyDuringFinancing = modeledMonthlyBill + financialPlan.monthlyInstallment;
  const monthlyDeltaDuringFinancing = monthlyDuringFinancing - costs.total;
  const reportChecks = [
    {
      icon: MapPin,
      title: "Address and household profile",
      value: `${householdInputs.postalCode} · ${householdInputs.householdSize} people`,
      detail: `${householdInputs.heatingType} heating, ${householdInputs.carType} mobility and €${costs.total.toLocaleString()}/mo current spend.`,
    },
    ...certaintyInputs,
  ];
  const handlePrintReport = () => window.print();

  const installerText = `Customer number: ${customerNumber}. Recommended package for ${householdInputs.street} ${householdInputs.streetNumber}, ${householdInputs.postalCode}: ${activeLabels}. Baseline (monthly): electricity €${costs.electricity.toLocaleString()}, heating €${costs.heating.toLocaleString()} (${householdInputs.heatingType}), mobility €${costs.mobility.toLocaleString()} (${householdInputs.carType}). Modeled saving after the loan is paid off: €${main.monthlySaving.toLocaleString()}/month, €${main.fiveYear.toLocaleString()} gross bill reduction over 60 months. Recommended scenario: ${recommended.label} (€${recommended.monthlySaving.toLocaleString()}/month after the loan). Next steps: call Solara at ${SOLARA_PHONE} or email ${SOLARA_EMAIL} with customer number ${customerNumber}. Final quote should validate local irradiance at ${householdInputs.postalCode}, usable roof size, BEG/KfW subsidies and self-consumption ratio.`;

  const handleDownloadPlan = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const blue = "#1F6FEB";
    const blueSoft = "#EEF3FF";
    const ink = "#111827";
    const muted = "#667085";
    const line = "#D8E0F0";

    const ensureSpace = (y: number, needed: number) => {
      if (y + needed <= pageHeight - margin) return y;
      doc.addPage();
      return margin;
    };

    const sectionTitle = (title: string, y: number) => {
      y = ensureSpace(y, 18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(ink);
      doc.text(title, margin, y);
      doc.setDrawColor(line);
      doc.line(margin, y + 3, pageWidth - margin, y + 3);
      return y + 10;
    };

    const bullet = (text: string, y: number) => {
      y = ensureSpace(y, 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(ink);
      doc.circle(margin + 1.5, y - 1.3, 0.9, "F");
      return addWrappedText(doc, text, margin + 6, y, pageWidth - margin * 2 - 6, 4.4) + 1;
    };

    doc.setFillColor(blue);
    doc.rect(0, 0, pageWidth, 48, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Solara", margin, 16);
    doc.setFontSize(23);
    doc.text("Personal home savings plan", margin, 29);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Customer number: ${customerNumber}`, margin, 39);
    doc.text(`Created: ${new Date().toLocaleDateString()}`, pageWidth - margin, 39, {
      align: "right",
    });

    let y = 58;
    doc.setFillColor(blueSoft);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 45, 5, 5, "F");
    doc.setTextColor(blue);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Estimated outcome", margin + 6, y + 9);
    doc.setFontSize(24);
    doc.text(`${euro(main.monthlySaving)}/month`, margin + 6, y + 23);
    doc.setFontSize(11);
    doc.text(`${euro(main.fiveYear)} gross bill reduction over 60 months`, margin + 6, y + 33);

    doc.setTextColor(ink);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Selected configuration", pageWidth - margin - 62, y + 10);
    doc.setFont("helvetica", "normal");
    addWrappedText(doc, activeLabels, pageWidth - margin - 62, y + 17, 56, 4);
    doc.setFont("helvetica", "bold");
    doc.text("Estimated installment", pageWidth - margin - 62, y + 30);
    doc.setFont("helvetica", "normal");
    doc.text(`${euro(financialPlan.monthlyInstallment)}/mo`, pageWidth - margin - 62, y + 37);

    y += 57;
    y = sectionTitle("Household baseline", y);
    const baselineRows = [
      `Address: ${householdInputs.street} ${householdInputs.streetNumber}, ${householdInputs.postalCode}`,
      `Household size: ${householdInputs.householdSize} people`,
      `Electricity: approx ${monthlyEuro(householdInputs.annualElectricitySpend)}/month (${householdInputs.yearlyEnergyConsumption.toLocaleString()} kWh/year)`,
      `Heating: ${householdInputs.heatingType}, approx ${monthlyEuro(householdInputs.annualHeatingSpend)}/month`,
      `Mobility: ${householdInputs.carType}, approx ${monthlyEuro(householdInputs.annualCarSpend)}/month`,
    ];
    baselineRows.forEach((row) => {
      y = bullet(row, y);
    });

    y = sectionTitle("Financing and timing", y + 3);
    [
      `Financed package after subsidy: ${euro(financialPlan.netCapex)} (${euro(financialPlan.grossCapex)} gross, ${euro(financialPlan.subsidy)} subsidy).`,
      `Monthly installment: ${euro(financialPlan.monthlyInstallment)} over ${financialPlan.termYears} years at a labelled 5% APR assumption.`,
      `Early years: the model estimates about ${euro(financialPlan.earlyAnnualExtra / 12)}/month extra for the first ${financialPlan.earlyYears} years because of the installment.`,
      `After the ${financialPlan.termYears}-year loan is paid off, the model estimates about ${euro(main.monthlySaving)}/month saved. Cumulative break-even estimate: year ${financialPlan.breakEvenYear}.`,
    ].forEach((row) => {
      y = bullet(row, y);
    });

    y = sectionTitle("Spending over time", y + 3);
    timelinePoints
      .filter((point) => point.year > 0)
      .forEach((point) => {
        const status =
          point.cumulativeSaving >= 0
            ? `${euro(point.cumulativeSaving)} ahead`
            : `${euro(Math.abs(point.cumulativeSaving))} extra`;
        y = bullet(
          `After ${point.year} year${point.year === 1 ? "" : "s"}: current path ${euro(point.current)}, Solara path ${euro(point.solara)} (${status}).`,
          y,
        );
      });

    y = sectionTitle("Scenario comparison", y + 3);
    computedScenarios.forEach((s) => {
      const tag =
        s.key === recommended.key
          ? " - recommended"
          : activeKey && s.key === activeKey.key
            ? " - your pick"
            : "";
      y = bullet(
        `${s.label}${tag}: ${euro(s.monthlySaving)}/month, ${euro(s.fiveYear)} gross bill reduction over 60 months`,
        y,
      );
    });

    y = sectionTitle("Package pricing", y + 3);
    if (scenario.capex.components.length > 0) {
      scenario.capex.components.forEach((item) => {
        y = bullet(`${item.label}: ${euro(item.afterSubsidy)} after subsidy. ${item.note}.`, y);
      });
    } else {
      y = bullet("Current setup: no new equipment selected.", y);
    }

    y = sectionTitle("Savings certainty", y + 3);
    certaintyInputs.forEach((item: CertaintyItem) => {
      y = bullet(`${item.title}: ${item.value}. ${item.detail}`, y);
    });

    y = sectionTitle("Model assumptions", y + 3);
    scenario.assumptions.forEach((item) => {
      y = bullet(item, y);
    });

    y = sectionTitle("Next steps", y + 3);
    [
      `Keep this customer number ready: ${customerNumber}.`,
      `Call Solara: ${SOLARA_PHONE}.`,
      `Email your savings plan to Solara: ${SOLARA_EMAIL}.`,
      "Ask a nearby installer to check feasibility, roof geometry, grid fit and final pricing.",
    ].forEach((row) => {
      y = bullet(row, y);
    });

    y = ensureSpace(y + 4, 30);
    doc.setFillColor(ink);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 27, 4, 4, "F");
    doc.setTextColor("#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Installer note", margin + 5, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    addWrappedText(doc, installerText, margin + 5, y + 15, pageWidth - margin * 2 - 10, 3.6);

    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      doc.setPage(page);
      doc.setTextColor(muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "All figures are estimates for demonstration. Final figures depend on installer survey and tariff details.",
        margin,
        pageHeight - 8,
      );
      doc.text(`${page}/${pages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    doc.save(`solara-savings-plan-${customerNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-surface-soft">
      <SiteHeader />
      <ProgressSteps activeStep={3} onStepSelect={onStepSelect} />

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Section 1 — Outcome + chart + report actions */}
        <section className="bg-white rounded-[30px] border border-line p-6 shadow-sm md:p-10">
          <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr] xl:items-center">
            <div>
              <p className="text-cloover font-semibold uppercase text-[11px] tracking-wide">
                Your personalised plan
              </p>
              <h1 className="mt-2 text-2xl font-extrabold leading-tight md:text-4xl">
                After the loan is paid off, this configuration saves about{" "}
                <span className="text-cloover">€{main.monthlySaving.toLocaleString()}/month</span>.
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Compared with your current monthly spend of{" "}
                <b className="text-ink">€{costs.total.toLocaleString()}</b>, the model estimates a
                bill of <b className="text-ink">€{modeledMonthlyBill.toLocaleString()}/month</b>{" "}
                once the system is running and the loan is no longer part of the monthly payment.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <OutcomeTile label="Configuration" value={activeLabels} />
                <OutcomeTile
                  label="While paying the loan"
                  value={`€${monthlyDuringFinancing.toLocaleString()}/mo`}
                  note={
                    monthlyDeltaDuringFinancing > 0
                      ? `About €${Math.round(monthlyDeltaDuringFinancing).toLocaleString()}/mo extra at first`
                      : `About €${Math.abs(Math.round(monthlyDeltaDuringFinancing)).toLocaleString()}/mo ahead from month one`
                  }
                />
                <OutcomeTile
                  label="After the loan is paid off"
                  value={`€${main.monthlySaving.toLocaleString()}/mo saved`}
                  note={
                    financialPlan.breakEvenYear > 0
                      ? `Starting from year ${financialPlan.termYears + 1} with this ${financialPlan.termYears}-year loan`
                      : "No upgrade selected"
                  }
                />
                <OutcomeTile
                  label="Over 60 months"
                  value={
                    month60 && month60.cumulativeSaving >= 0
                      ? `€${month60.cumulativeSaving.toLocaleString()} ahead`
                      : `€${Math.abs(month60?.cumulativeSaving ?? 0).toLocaleString()} extra`
                  }
                  note="Includes the modeled installment"
                />
                <OutcomeTile
                  label="Monthly installment"
                  value={`€${financialPlan.monthlyInstallment.toLocaleString()}/mo`}
                  note={`${financialPlan.termYears}-year loan selected`}
                />
                <OutcomeTile
                  label="Financed after subsidy"
                  value={`€${financialPlan.netCapex.toLocaleString()}`}
                  note={
                    financialPlan.subsidy > 0
                      ? `Includes €${financialPlan.subsidy.toLocaleString()} estimated subsidy`
                      : "No subsidy applied in this model"
                  }
                />
                <OutcomeTile
                  label="System size"
                  value={
                    scenario.system.pvKwp > 0
                      ? `${scenario.system.pvKwp.toFixed(1)} kWp`
                      : "No PV selected"
                  }
                  note={
                    scenario.system.panelCount > 0
                      ? `${scenario.system.panelCount} panels · ${scenario.system.batteryKwh || 0} kWh battery`
                      : `${scenario.roof.usableRoofAreaM2.toFixed(0)} m² roof estimate available`
                  }
                />
                <OutcomeTile
                  label="Cumulative break-even"
                  value={
                    financialPlan.breakEvenYear > 0
                      ? `Year ${financialPlan.breakEvenYear}`
                      : "No upgrade"
                  }
                  note="When cumulative Solara spend becomes lower than staying as-is"
                />
              </div>
            </div>

            <SpendingOverTimeChart
              currentMonthlySpend={costs.total}
              modeledMonthlyBill={modeledMonthlyBill}
              monthlyDuringFinancing={monthlyDuringFinancing}
              breakEvenYear={financialPlan.breakEvenYear}
              termYears={financialPlan.termYears}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-surface-soft p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-cloover">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-ink">What this report is based on</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    The saving is an approximate estimate, using the same checks shown while the
                    report was prepared.
                  </p>
                </div>
              </div>
              <p className="rounded-full bg-white px-3 py-1 text-xs font-bold text-cloover">
                {scenario.certainty}% savings certainty
              </p>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-5">
              {reportChecks.map((item) => (
                <div key={item.title} className="rounded-2xl bg-white p-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cloover-soft text-cloover">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-ink">{item.title}</p>
                      <p className="truncate text-[11px] font-bold text-cloover">{item.value}</p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-3 text-[11px] leading-4 text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-cloover/20 bg-cloover-soft p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-extrabold text-ink">Your savings report is ready</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Download it as a PDF, print it for a homeowner conversation, or send it to a
                  nearby installer for feasibility checks.
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
                  <Download className="w-4 h-4" /> Download report
                </button>
                <button
                  onClick={handlePrintReport}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-cloover/20 bg-white px-5 py-2.5 text-sm font-bold text-cloover hover:border-cloover/40"
                >
                  <Printer className="w-4 h-4" /> Print report
                </button>
                <a
                  href={`mailto:${SOLARA_EMAIL}?subject=Installer feasibility check ${customerNumber}&body=Hi Solara,%0A%0AI would like a nearby installer to check my savings plan and proposal feasibility.%0A%0ACustomer number: ${customerNumber}%0AAddress: ${householdInputs.street} ${householdInputs.streetNumber}, ${householdInputs.postalCode}%0A%0AThanks!`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-ink/90"
                >
                  <Send className="w-4 h-4" /> Send to installer
                </a>
              </div>
            </div>
          </div>
        </section>

        <p className="text-center text-[11px] text-muted-foreground pb-8">
          All numbers are estimates for demonstration. Final figures depend on installer survey and
          tariff details.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
