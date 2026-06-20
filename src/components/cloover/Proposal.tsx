import { ArrowLeft, Sparkles, Send, Leaf, TrendingDown, CheckCircle2 } from "lucide-react";
import { CloverLogo } from "./Logo";
import { SCENARIOS, MODULE_LABELS, type ModuleKey } from "@/lib/cloover-data";

const ADVISOR_TEXT = `Your strongest option is solar + battery + heat pump with a dynamic tariff. Your current electricity, oil heating, and petrol costs are estimated at €570 per month. With Cloover, your new monthly cost including financing is estimated at €421, so you save €149 per month during financing and about €387 per month after financing ends.

The heat pump is the biggest lever because you currently heat with oil. Solar alone helps, but the heat pump moves heating spend into electricity that can be partly supplied by your own solar and optimized through the battery and dynamic tariff.`;

const INSTALLER_TEXT = `Recommended Cloover package: solar + battery + heat pump with dynamic tariff. Based on the household's current electricity, oil heating, and mobility spend, current energy-related outgoings are estimated at €570/month. The Cloover package is estimated at €421/month including financing, creating an estimated monthly saving of €149 during financing and €387 after financing ends. The package also avoids about 4.1 tonnes of CO₂ per year.`;

export function Proposal({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="bg-white border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <CloverLogo />
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-cloover">
            <ArrowLeft className="w-4 h-4" /> Back to configurator
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <section className="bg-white rounded-[28px] border border-line p-8 md:p-12 text-center">
          <p className="text-cloover font-semibold uppercase text-xs tracking-wide">Recommended package</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-3">
            You save <span className="text-cloover">€149/month</span> with Cloover
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Solar + battery + heat pump with a dynamic tariff. All figures are estimates based on your inputs.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {(["solar", "battery", "heatpump", "tariff"] as ModuleKey[]).map((m) => (
              <span key={m} className="px-3 py-1.5 rounded-full bg-cloover-soft text-cloover text-sm font-semibold">
                {MODULE_LABELS[m]}
              </span>
            ))}
          </div>
        </section>

        {/* Cloover effect visual */}
        <section className="bg-white rounded-[28px] border border-line p-8">
          <h2 className="text-2xl md:text-3xl font-bold">The Cloover effect: customers benefit from month 1</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            You pay a monthly Cloover rate, but your old energy bill drops by more than the rate costs. That's why you benefit from the first month.
          </p>

          <div className="mt-8 grid md:grid-cols-[140px_1fr_140px] gap-6 items-end">
            {/* Without */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-2">Without Cloover</div>
              <div className="w-full h-48 bg-line rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold">€200</span>
              </div>
            </div>

            {/* Middle composition */}
            <div className="relative bg-cloover-soft rounded-2xl p-6">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cloover text-white text-sm font-bold px-3 py-1 rounded-full">
                -€60
              </div>
              <div className="grid grid-cols-3 gap-4 items-end h-48 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-ink mb-1">Cloover rate</span>
                  <div className="w-full h-full bg-white border border-cloover/20 rounded-xl flex items-end justify-center pb-3">
                    <span className="font-bold text-ink">€150</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-ink mb-1">New electricity</span>
                  <div className="w-full h-1/3 bg-line rounded-xl flex items-end justify-center pb-2">
                    <span className="font-bold text-ink">€30</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-ink mb-1">Feed-in credit</span>
                  <div className="w-full h-1/3 bg-cloover/30 rounded-xl flex items-end justify-center pb-2">
                    <span className="font-bold text-cloover">-€40</span>
                  </div>
                </div>
              </div>
            </div>

            {/* With */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-2">With Cloover</div>
              <div className="w-full h-32 bg-cloover rounded-2xl flex items-center justify-center text-white">
                <span className="text-2xl font-bold">€140</span>
              </div>
              <div className="mt-3 text-success font-bold text-sm">€60/mo saved from month 1</div>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-line p-5">
              <p className="text-xs uppercase font-semibold text-muted-foreground">During financing</p>
              <p className="text-xl font-bold mt-1">€60/month saved <span className="text-muted-foreground text-sm font-normal">(simple example)</span></p>
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
              const isBest = s.saving === 149;
              return (
                <div
                  key={i}
                  className={`rounded-2xl p-4 border-2 ${
                    isBest ? "border-cloover bg-cloover-soft" : "border-line bg-white"
                  }`}
                >
                  <div className="text-xs text-muted-foreground">
                    {s.modules.length === 0 ? "Current setup" : s.modules.map((m) => MODULE_LABELS[m]).join(" + ")}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold">€{s.saving}</span>
                    <span className="text-xs text-muted-foreground">/mo saved</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Cloover cost €{s.cloover}/mo · Fit {s.fit}/100</div>
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

        {/* Breakdown + tariff */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[28px] border border-line p-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><Leaf className="w-5 h-5 text-success" /> Savings breakdown</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between"><span>Solar</span><b className="text-success">+€42/mo</b></li>
              <li className="flex justify-between"><span>Battery</span><b className="text-success">+€29/mo</b></li>
              <li className="flex justify-between"><span>Heat pump</span><b className="text-success">+€43/mo</b></li>
              <li className="flex justify-between"><span>Dynamic tariff</span><b className="text-success">+€35/mo</b></li>
              <li className="flex justify-between border-t border-line pt-2 mt-2"><span className="font-bold">Total monthly saving</span><b className="text-cloover text-lg">€149/mo</b></li>
            </ul>
          </div>
          <div className="bg-white rounded-[28px] border border-line p-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><TrendingDown className="w-5 h-5 text-cloover" /> Dynamic tariff</h3>
            <p className="text-sm text-muted-foreground mt-2">
              A fixed tariff charges roughly the same price every hour. A dynamic tariff changes by hour. Cloover uses your battery, heat pump, and EV charger to buy more electricity when prices are low.
            </p>
            <div className="mt-4 rounded-xl bg-cloover-soft p-4">
              <p className="text-2xl font-extrabold text-cloover">€417.90/year</p>
              <p className="text-xs text-muted-foreground">via dynamic tariff optimization · 2,065 kWh shifted</p>
            </div>
          </div>
        </section>

        {/* AI advisor */}
        <section className="bg-white rounded-[28px] border border-line p-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-cloover text-white grid place-items-center"><Sparkles className="w-4 h-4" /></div>
            <h3 className="text-lg font-bold">Cloover Advisor</h3>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line text-ink">{ADVISOR_TEXT}</p>
        </section>

        {/* Installer proposal */}
        <section className="bg-ink text-white rounded-[28px] p-8">
          <p className="text-xs font-semibold text-cloover-soft uppercase tracking-wide">For your installer</p>
          <h3 className="text-2xl font-bold mt-1">Proposal copy</h3>
          <textarea
            readOnly
            value={INSTALLER_TEXT}
            className="mt-4 w-full min-h-[160px] rounded-2xl bg-white/5 border border-white/10 p-4 text-sm leading-relaxed text-white/90 outline-none"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="px-6 py-3 rounded-full bg-cloover text-white font-semibold inline-flex items-center gap-2 hover:bg-cloover/90">
              <Send className="w-4 h-4" /> Send to installer
            </button>
            <button className="px-6 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20">
              Copy text
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground pb-10">
          All numbers are estimates for demonstration. Final figures depend on installer survey and tariff details.
        </p>
      </main>
    </div>
  );
}
