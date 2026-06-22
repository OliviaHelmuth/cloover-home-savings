import {
  Sun,
  BatteryCharging,
  Flame,
  Car,
  MapPin,
  Calculator,
  Wrench,
  PiggyBank,
  Star,
  ShieldCheck,
  Leaf,
  Award,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const HOW_STEPS = [
  {
    icon: MapPin,
    title: "1. Tell us about your home",
    text: "Share your address, household size and current energy spend. Takes 90 seconds.",
  },
  {
    icon: Calculator,
    title: "2. See your live savings",
    text: "Drag solar, battery, heat pump and EV onto your house — savings update instantly.",
  },
  {
    icon: Wrench,
    title: "3. Local installer handles the rest",
    text: "A certified Solara partner near you confirms the plan and installs in 2–6 weeks.",
  },
  {
    icon: PiggyBank,
    title: "4. Pay one fixed monthly bill",
    text: "Financing, hardware, install, monitoring and warranty — all in one number.",
  },
];

const SOLUTIONS = [
  {
    icon: Sun,
    title: "Solar panels",
    text: "Premium German-engineered modules. 25-year output guarantee.",
    saving: "~€95/mo",
  },
  {
    icon: BatteryCharging,
    title: "Home battery",
    text: "Store daytime sun, use it at night. Up to 80% self-consumption.",
    saving: "~€45/mo",
  },
  {
    icon: Flame,
    title: "Heat pump",
    text: "Replace gas or oil with clean electric heat. BAFA subsidy included.",
    saving: "~€140/mo",
  },
  {
    icon: Car,
    title: "EV charging",
    text: "Charge from your own roof for ~3 ct/kWh. Smart wallbox included.",
    saving: "~€110/mo",
  },
];

const SAVINGS_EXAMPLES = [
  { type: "Single-family home, 4 people", before: 380, after: 95 },
  { type: "Semi-detached, gas heating", before: 295, after: 70 },
  { type: "Home + EV, 5 people", before: 510, after: 130 },
];

const REVIEWS = [
  {
    name: "Familie Becker",
    city: "Hamburg",
    text: "From quote to a running solar + battery system in five weeks. Bill dropped from €310 to €88 in the first month.",
  },
  {
    name: "Markus W.",
    city: "Munich",
    text: "I compared three providers. Solara was the only one who showed me the math live. No pressure, no surprises.",
  },
  {
    name: "Sandra & Tim",
    city: "Cologne",
    text: "The heat pump retrofit was painless. Installer team was on time, friendly, and explained everything.",
  },
];

const FAQS = [
  {
    q: "How accurate is the savings estimate?",
    a: "Estimates use your real address, roof orientation, household size and current spend, combined with local irradiance and German tariff data. The final number is confirmed during the installer's on-site survey, typically within ±10%.",
  },
  {
    q: "Do I need to pay anything upfront?",
    a: "No. The standard Solara plan rolls hardware, installation, monitoring and warranty into one fixed monthly payment. You can also pay cash and lower your monthly cost further.",
  },
  {
    q: "What subsidies are included?",
    a: "We automatically check BAFA, KfW and regional programs for heat pumps, batteries and EV chargers, and apply eligible amounts to your offer before you sign.",
  },
  {
    q: "Who installs the system?",
    a: "A certified local master installer from our network. All installers are vetted, insured and bonded. You get the same fixed price wherever you are in Germany.",
  },
  {
    q: "What if my savings are lower than promised?",
    a: "Our written savings guarantee means we credit the difference if your year-one savings fall short of the plan we issued you. Subject to standard household-usage assumptions.",
  },
  {
    q: "Is my data safe?",
    a: "All data is encrypted in transit and at rest, hosted in the EU, and processed in line with the GDPR. We never sell personal data to third parties.",
  },
];

export function LandingSections() {
  return (
    <>
      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-wider text-cloover">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
              Four steps from curious to powered by the sun
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              No phone tag, no high-pressure sales visits. Configure your plan online and we take
              care of the rest.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-surface-soft p-5 transition hover:-translate-y-0.5 hover:border-cloover/40 hover:bg-cloover-soft/40"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-cloover shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-base font-extrabold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="border-t border-line bg-surface-soft">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-cloover">
                Solutions
              </p>
              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
                Four upgrades. One monthly bill.
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Pick everything or just what fits today. You can always add the next upgrade later.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS.map(({ icon: Icon, title, text, saving }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cloover-soft text-cloover">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-lg font-extrabold">{title}</p>
                <p className="mt-1 flex-1 text-sm leading-6 text-muted-foreground">{text}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--sage-soft)] px-3 py-1.5 text-xs font-extrabold text-[color:var(--sage)]">
                  <Leaf className="h-3.5 w-3.5" /> Typical {saving}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAVINGS */}
      <section id="savings" className="border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-cloover">
                Real customer savings
              </p>
              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
                Lower bills from month one — guaranteed in writing.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                Solara homes typically cut their monthly energy spend by 65–80%. Average payback for
                a full setup is 7–9 years; the system runs for 25+.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Stat number="12,400+" label="Homes powered" />
                <Stat number="€2,840" label="Avg. yearly saving" />
                <Stat number="98%" label="Would recommend" />
              </div>
            </div>
            <div className="space-y-3">
              {SAVINGS_EXAMPLES.map((s) => (
                <div
                  key={s.type}
                  className="rounded-2xl border border-line bg-surface-soft p-5"
                >
                  <p className="text-sm font-bold text-ink">{s.type}</p>
                  <div className="mt-3 flex items-end gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        Before
                      </p>
                      <p className="text-2xl font-extrabold text-ink/60 line-through">
                        €{s.before}/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-cloover">
                        With Solara
                      </p>
                      <p className="text-3xl font-extrabold text-cloover">€{s.after}/mo</p>
                    </div>
                    <div className="ml-auto rounded-full bg-[color:var(--sage-soft)] px-3 py-1.5 text-xs font-extrabold text-[color:var(--sage)]">
                      −{Math.round((1 - s.after / s.before) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" className="border-t border-line bg-surface-soft">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-wider text-cloover">
              Why customers trust Solara
            </p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
              Built on certifications, not marketing claims
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TrustCard
              icon={ShieldCheck}
              title="TÜV audited model"
              text="Our savings model is reviewed by an independent third party every quarter."
            />
            <TrustCard
              icon={Award}
              title="BAFA-listed installers"
              text="Every Solara installation is performed by a state-listed master craftsperson."
            />
            <TrustCard
              icon={PiggyBank}
              title="Written savings guarantee"
              text="If year-one savings fall short of the plan, we credit you the difference."
            />
            <TrustCard
              icon={Leaf}
              title="EU Green Deal aligned"
              text="Components meet European sustainability and recyclability standards."
            />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="border-t border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-cloover">
                Reviews
              </p>
              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
                4.8 out of 5 from 12,400+ German homes
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-sunshine text-sunshine" />
                ))}
              </div>
              <span className="text-ink/80">Trustpilot · Google · ProvenExpert</span>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="flex flex-col rounded-2xl border border-line bg-surface-soft p-5"
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-sunshine text-sunshine" />
                  ))}
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-ink">“{r.text}”</p>
                <p className="mt-4 text-xs font-extrabold text-ink">
                  {r.name} · <span className="text-muted-foreground">{r.city}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-line bg-surface-soft">
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-6">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-wider text-cloover">
              Frequently asked
            </p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Your questions, answered</h2>
          </div>
          <div className="mt-8 space-y-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3">
      <p className="text-2xl font-extrabold text-cloover">{number}</p>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

function TrustCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cloover-soft text-cloover">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-base font-extrabold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-line bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-extrabold text-ink md:text-base">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-cloover transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="px-5 pb-4 text-sm leading-6 text-muted-foreground">{a}</p>
      )}
    </div>
  );
}
