import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Battery,
  Car,
  CheckCircle2,
  Flame,
  Home,
  Leaf,
  LineChart,
  PiggyBank,
  PlugZap,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { HouseScene } from "@/components/cloover/HouseScene";
import { CloverLogo } from "@/components/cloover/Logo";
import type { ModuleKey } from "@/lib/cloover-data";

export const Route = createFileRoute("/presentation")({
  head: () => ({
    meta: [
      { title: "Solara Pitch Deck - Home Energy Savings Advisor" },
      {
        name: "description",
        content:
          "A hackathon presentation for Solara: one savings plan that helps more households adopt sustainable energy.",
      },
    ],
  }),
  component: PresentationRoute,
});

const fullHomeUpgrade = new Set<ModuleKey>(["solar", "battery", "heatpump", "ev"]);

const slides = [
  {
    eyebrow: "The problem",
    title: "Clean home energy is still sold backwards.",
    body: "Households are asked to buy equipment, financing and tariffs separately. That makes the decision feel risky, expensive and hard to understand.",
    points: [
      "Solar, batteries, heat pumps and EV charging are explained as separate products.",
      "Financing is shown before the customer understands the outcome.",
      "Savings claims often feel vague because they are not connected to household spend.",
    ],
    icon: Home,
  },
  {
    eyebrow: "The insight",
    title: "People do not buy panels. They buy a lower energy bill.",
    body: "Solara makes the North Star one number: how much the household can save per month after the upgrade and financing are considered.",
    points: [
      "Monthly electricity, heating and mobility costs become the starting point.",
      "The tool shows early installment impact honestly.",
      "The offer is framed as one savings plan, not a shopping cart.",
    ],
    icon: PiggyBank,
  },
  {
    eyebrow: "The solution",
    title: "One advisor. One configurator. One savings plan.",
    body: "A homeowner enters minimal details, configures the home visually, then receives a proposal they can share with a nearby installer.",
    points: [
      "Step 1: household inputs and monthly spend.",
      "Step 2: visual home configurator with solar, battery, heat pump and EV.",
      "Step 3: proposal, savings plan download and installer CTA.",
    ],
    icon: Sparkles,
  },
  {
    eyebrow: "Credibility",
    title: "The savings number is tied to household fit.",
    body: "The estimate starts with what the household already spends, then applies transparent reduction assumptions for each upgrade.",
    points: [
      "Solar only: 30% electricity cost reduction.",
      "Solar + battery: 69% electricity cost reduction.",
      "Heat pump: 34% oil or 15% gas heating reduction.",
      "EV: 75% mobility cost reduction.",
    ],
    icon: LineChart,
  },
  {
    eyebrow: "Adoption",
    title: "The best upsell is the one that increases confidence.",
    body: "Solara shows why a larger upgrade can make more sense long-term, while clearly explaining that the first years may cost more because of financing.",
    points: [
      "Savings certainty and household fit are visible status signals.",
      "The proposal includes customer number, phone, email and next steps.",
      "Nearby installers can validate feasibility and close the loop.",
    ],
    icon: ShieldCheck,
  },
  {
    eyebrow: "Impact",
    title: "More people choose sustainable energy when the path feels safe.",
    body: "The product turns a confusing energy transition into a guided financial decision: what changes, why it fits, and when the savings arrive.",
    points: [
      "Households see a clear route to lower long-term costs.",
      "Installers get proposal-ready context instead of cold leads.",
      "Startups can package climate technology around outcomes, not components.",
    ],
    icon: Leaf,
  },
];

const productSteps = [
  {
    title: "Tell us about your home",
    detail: "Address, heating, monthly electricity cost, car type and monthly mobility cost.",
    icon: Home,
  },
  {
    title: "Choose your upgrades",
    detail: "Add solar, battery, heat pump and EV to the visual configurator.",
    icon: PlugZap,
  },
  {
    title: "Download the savings plan",
    detail: "Share the plan with Solara or a nearby installer for feasibility checks.",
    icon: CheckCircle2,
  },
];

const levers = [
  { label: "Solar", icon: Sun, text: "Turns roof production into a clear electricity saving." },
  { label: "Battery", icon: Battery, text: "Stores solar and cheap tariff energy for later use." },
  { label: "Heat pump", icon: Flame, text: "Moves oil or gas heating toward cleaner electricity." },
  { label: "EV", icon: Car, text: "Swaps fuel spend for home charging and off-peak power." },
];

function PresentationRoute() {
  return (
    <div className="min-h-screen bg-surface-soft text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-6">
          <CloverLogo />
          <div className="flex items-center gap-2">
            <Link
              to="/"
              search={{ step: "landing" }}
              className="hidden rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-cloover/40 sm:inline-flex"
            >
              Open demo
            </Link>
            <Link
              to="/"
              search={{ step: "proposal" }}
              className="inline-flex items-center gap-2 rounded-full bg-cloover px-4 py-2 text-sm font-bold text-white hover:bg-cloover/90"
            >
              Final proposal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 md:px-6">
        <section className="grid min-h-[calc(100svh-96px)] items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="inline-flex rounded-full bg-cloover-soft px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-cloover">
              4 minute hackathon pitch
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-extrabold leading-[0.95] md:text-7xl">
              Make sustainable energy feel financially obvious.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Solara helps households move from interest to action by turning solar, battery, heat
              pump, EV charging, tariff and financing into one savings plan.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#slides"
                className="inline-flex items-center gap-2 rounded-full bg-cloover px-5 py-3 font-bold text-white shadow-lg shadow-cloover/20 hover:bg-cloover/90"
              >
                Start presentation <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/"
                search={{ step: "landing" }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-line px-5 py-3 font-bold text-ink hover:border-cloover/40"
              >
                Try the product
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-white p-3 shadow-2xl">
            <div className="overflow-hidden rounded-[22px] bg-surface-soft">
              <HouseScene active={fullHomeUpgrade} />
            </div>
          </div>
        </section>

        <section className="grid gap-3 py-4 md:grid-cols-3">
          {productSteps.map((step, index) => (
            <div key={step.title} className="rounded-[20px] border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-cloover text-white">
                  {index + 1}
                </div>
                <step.icon className="h-5 w-5 text-cloover" />
              </div>
              <h2 className="mt-4 text-lg font-extrabold">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
            </div>
          ))}
        </section>

        <section id="slides" className="space-y-5 py-6">
          {slides.map((slide, index) => (
            <article
              key={slide.title}
              className="grid min-h-[72svh] scroll-mt-24 items-center gap-8 rounded-[28px] border border-line bg-white p-6 md:p-10 lg:grid-cols-[0.8fr_1.2fr]"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cloover-soft text-cloover">
                    <slide.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-cloover">
                      Slide {index + 1}
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground">{slide.eyebrow}</p>
                  </div>
                </div>
                <h2 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl">
                  {slide.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">{slide.body}</p>
              </div>
              <div className="rounded-[22px] bg-surface-soft p-4 md:p-6">
                <ul className="space-y-3">
                  {slide.points.map((point) => (
                    <li key={point} className="flex gap-3 rounded-2xl bg-white p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cloover" />
                      <span className="text-sm font-semibold leading-6 text-ink">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[28px] border border-line bg-white p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-cloover">
                The product levers
              </p>
              <h2 className="mt-3 text-4xl font-extrabold leading-tight">
                Every upgrade is framed as a concrete saving.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The presentation story stays simple: each technology reduces a household cost bucket
                they already understand.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {levers.map((lever) => (
                <div key={lever.label} className="rounded-2xl bg-surface-soft p-5">
                  <lever.icon className="h-7 w-7 text-cloover" />
                  <h3 className="mt-4 font-extrabold">{lever.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{lever.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="my-6 rounded-[28px] bg-cloover p-8 text-white md:p-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-wide text-white/70">
              Closing line
            </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">
              The green future needs a better checkout.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/80">
              Solara makes sustainable energy easier to trust, easier to finance and easier to
              install. That is how more households move from curiosity to commitment.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                search={{ step: "landing" }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-ink hover:bg-cloover-soft"
              >
                Open live demo <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://solara-home-savings.lovable.app/?step=landing"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-bold text-white hover:bg-white/20"
              >
                Lovable link
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
