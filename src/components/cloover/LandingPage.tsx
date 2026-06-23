import { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  Gauge,
  Flame,
  Car,
  ChevronDown,
  Ruler,
  Home,
  Compass,
  Pencil,
  Check,
} from "lucide-react";
import {
  getBaselineModules,
  getRoofEstimate,
  type ModuleKey,
  type HouseholdInputs,
  type RoofType,
  type RoofOrientation,
} from "@/lib/cloover-data";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { LandingSections } from "./LandingSections";
import { RoofMapModal } from "./RoofMapModal";

type Props = {
  inputs: HouseholdInputs;
  onInputsChange: (inputs: HouseholdInputs) => void;
  onCalculate: (active: Set<ModuleKey>) => void;
};

const ROOF_TYPES: { key: RoofType; label: string }[] = [
  { key: "Hip", label: "Hip roof" },
  { key: "Flat", label: "Flat roof" },
  { key: "Gable", label: "Gable roof" },
  { key: "Pyramid", label: "Pyramid roof" },
  { key: "Shed", label: "Shed roof" },
];

const ROOF_ORIENTATIONS: { key: RoofOrientation; label: string }[] = [
  { key: "N", label: "North" },
  { key: "NE", label: "North-East" },
  { key: "E", label: "East" },
  { key: "SE", label: "South-East" },
  { key: "S", label: "South" },
  { key: "SW", label: "South-West" },
  { key: "W", label: "West" },
  { key: "NW", label: "North-West" },
];

const ROOF_ANGLE_PRESETS = [0, 15, 30, 45];

const ADDRESS_SUGGESTIONS = [
  { street: "Friedrichstraße", streetNumber: "12", postalCode: "10117", label: "Berlin Mitte" },
  { street: "Torstraße", streetNumber: "64", postalCode: "10119", label: "Berlin Mitte" },
  { street: "Kastanienallee", streetNumber: "21", postalCode: "10435", label: "Prenzlauer Berg" },
  { street: "Bergmannstraße", streetNumber: "92", postalCode: "10961", label: "Kreuzberg" },
  {
    street: "Schönhauser Allee",
    streetNumber: "148",
    postalCode: "10435",
    label: "Prenzlauer Berg",
  },
];

const HOUSEHOLD_ESTIMATES: Record<
  number,
  Pick<HouseholdInputs, "yearlyEnergyConsumption" | "annualElectricitySpend" | "annualHeatingSpend">
> = {
  1: { yearlyEnergyConsumption: 2200, annualElectricitySpend: 900, annualHeatingSpend: 1500 },
  2: { yearlyEnergyConsumption: 3200, annualElectricitySpend: 1320, annualHeatingSpend: 2040 },
  3: { yearlyEnergyConsumption: 4500, annualElectricitySpend: 1860, annualHeatingSpend: 2640 },
  4: { yearlyEnergyConsumption: 5800, annualElectricitySpend: 2400, annualHeatingSpend: 3180 },
};

function getAnnualCarEstimate(carType: string) {
  if (carType === "Petrol/Diesel") return 2160;
  if (carType === "Hybrid") return 1440;
  if (carType === "EV") return 720;
  return 0;
}

function monthlyValue(annualValue: number) {
  return Math.round(annualValue / 12);
}

function annualValue(monthlyValue: number) {
  return Math.round(monthlyValue * 12);
}

const HERO_ASSETS = {
  house: "/cloover-assets/house-cloover.png",
  solar: "/cloover-assets/solar-cloover.png",
  battery: "/cloover-assets/battery-cloover.png",
  heatPump: "/cloover-assets/heat-pump-cloover.png",
  car: "/cloover-assets/car-cloover.png",
};

export function LandingPage({ inputs, onInputsChange, onCalculate }: Props) {
  const activeModules = getBaselineModules(inputs);
  const roofEstimate = getRoofEstimate(inputs);
  const [mapOpen, setMapOpen] = useState(false);

  const scrollToCalculator = () => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCalculateClick = () => {
    onCalculate(activeModules);
  };

  const updateRoofArea = (areaM2: number) => {
    onInputsChange({ ...inputs, userRoofAreaM2: areaM2, freeEstimate: null });
  };

  const updateStreet = (street: string) => {
    const suggestion = ADDRESS_SUGGESTIONS.find((address) => address.street === street);
    onInputsChange({
      ...inputs,
      street,
      freeEstimate: null,
      ...(suggestion
        ? {
            streetNumber: suggestion.streetNumber,
            postalCode: suggestion.postalCode,
          }
        : {}),
    });
  };

  const updateHouseholdSize = (householdSize: number) => {
    const estimate = HOUSEHOLD_ESTIMATES[householdSize] ?? HOUSEHOLD_ESTIMATES[3];
    onInputsChange({
      ...inputs,
      householdSize,
      freeEstimate: null,
      yearlyEnergyConsumption: estimate.yearlyEnergyConsumption,
      annualElectricitySpend: estimate.annualElectricitySpend,
      annualHeatingSpend: inputs.heatingType === "Heat Pump" ? 0 : estimate.annualHeatingSpend,
    });
  };

  const updateHeatingType = (heatingType: string) => {
    const estimate = HOUSEHOLD_ESTIMATES[inputs.householdSize] ?? HOUSEHOLD_ESTIMATES[3];
    onInputsChange({
      ...inputs,
      heatingType,
      annualHeatingSpend: heatingType === "Heat Pump" ? 0 : estimate.annualHeatingSpend,
    });
  };

  const updateCarType = (carType: string) => {
    onInputsChange({
      ...inputs,
      carType,
      annualCarSpend: getAnnualCarEstimate(carType),
    });
  };

  return (
    <div className="min-h-screen bg-surface text-ink premium-bg">
      <SiteHeader />

      <main>
        <section className="mx-auto grid min-h-[calc(100svh-70px)] max-w-7xl items-center gap-10 px-5 py-10 md:px-6 lg:h-[calc(100svh-70px)] lg:min-h-[620px] lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cloover/20 bg-white px-3 py-1.5 text-xs font-extrabold text-cloover shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              One home upgrade. One monthly outcome.
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[0.98] md:text-5xl xl:text-6xl">
              Green energy isn't just cleaner.
              <br />
              It's cheaper in the long run.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground xl:text-lg xl:leading-8">
              Solara compares your current electricity, heating and mobility costs with a financed
              package of solar, battery, heat pump and EV charging. The number we put front and
              center is simple: how much lower your monthly household costs become after the loan is
              paid off.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Start with a few home details, then play with the configurator to see how each upgrade
              changes the offer, the loan period and your long-term savings.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={scrollToCalculator}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cloover px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-cloover/25 transition hover:-translate-y-0.5 hover:bg-cloover/90"
              >
                Calculate my savings <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#how"
                className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3 text-sm font-extrabold text-ink transition hover:border-cloover/40 hover:text-cloover"
              >
                How it works
              </a>
            </div>

            <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
              <HeroStat label="Inputs" value="90 sec" />
              <HeroStat label="Modeled upgrades" value="4" />
              <HeroStat label="Installer-ready" value="PDF" />
            </div>
          </div>

          <HeroEnergyPreview />
        </section>

        <section id="calculator" className="border-t border-line bg-white/70 px-5 py-14 md:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-wider text-cloover">
                Start here
              </p>
              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Tell us about your home.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                We use these details to estimate roof size, current monthly spend and which upgrade
                combination should save the most over time.
              </p>
            </div>

            {/* Household inputs calculator */}
            <div className="space-y-4 rounded-[28px] border border-line bg-white p-5 shadow-2xl md:p-7">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cloover" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-cloover">
                      Savings calculator
                    </p>
                    <h3 className="text-xl font-extrabold text-ink">
                      Your current household profile
                    </h3>
                  </div>
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-ink/80 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-cloover" />
                  Address details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Street
                    </label>
                    <div className="relative">
                      <select
                        value={inputs.street}
                        onChange={(e) => updateStreet(e.target.value)}
                        className="material-field w-full appearance-none px-3 py-2 pr-9 text-sm outline-none"
                        autoComplete="street-address"
                      >
                        {ADDRESS_SUGGESTIONS.map((address) => (
                          <option
                            key={`${address.street}-${address.postalCode}`}
                            value={address.street}
                          >
                            {address.street} {address.streetNumber}, {address.postalCode} ·{" "}
                            {address.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Number
                    </label>
                    <input
                      type="text"
                      value={inputs.streetNumber}
                      onChange={(e) =>
                        onInputsChange({
                          ...inputs,
                          streetNumber: e.target.value,
                          freeEstimate: null,
                        })
                      }
                      placeholder="e.g. 12"
                      autoComplete="address-line2"
                      className="material-field w-full px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Postal code
                    </label>
                    <input
                      type="text"
                      value={inputs.postalCode}
                      onChange={(e) =>
                        onInputsChange({
                          ...inputs,
                          postalCode: e.target.value,
                          freeEstimate: null,
                        })
                      }
                      placeholder="e.g. 10117"
                      autoComplete="postal-code"
                      className="material-field w-full px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-cloover/15 bg-cloover-soft/70 px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white text-cloover">
                        <Ruler className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-ink">Usable roof size</p>
                        <p className="text-[11px] leading-4 text-muted-foreground">
                          For the full setup, customers will draw the usable roof area on an
                          OpenStreetMap view.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-cloover">
                      Est. {roofEstimate.usableRoofAreaM2.toFixed(0)} m² ·{" "}
                      {roofEstimate.panelCountMax} panels
                    </div>
                  </div>
                </div>
              </div>

              {/* Energy & Spends */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-ink/80 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-cloover" />
                  Energy & Spend
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Heating type
                    </label>
                    <div className="relative">
                      <select
                        value={inputs.heatingType}
                        onChange={(e) => updateHeatingType(e.target.value)}
                        className="material-field w-full appearance-none px-3 py-2 pr-9 text-sm outline-none"
                      >
                        <option value="Gas">Gas heating</option>
                        <option value="Oil">Oil heating</option>
                        <option value="Heat Pump">Electric heat pump</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Monthly heating cost (€)
                    </label>
                    <input
                      type="number"
                      value={monthlyValue(inputs.annualHeatingSpend)}
                      onChange={(e) =>
                        onInputsChange({
                          ...inputs,
                          annualHeatingSpend: annualValue(Number(e.target.value)),
                        })
                      }
                      className="material-field w-full px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Monthly electricity cost (€)
                    </label>
                    <input
                      type="number"
                      value={monthlyValue(inputs.annualElectricitySpend)}
                      onChange={(e) =>
                        onInputsChange({
                          ...inputs,
                          annualElectricitySpend: annualValue(Number(e.target.value)),
                        })
                      }
                      className="material-field w-full px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Household & Mobility */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-ink/80 flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-cloover" />
                  Household & Mobility
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-start">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Car type
                    </label>
                    <div className="relative">
                      <select
                        value={inputs.carType}
                        onChange={(e) => updateCarType(e.target.value)}
                        className="material-field w-full appearance-none px-3 py-2 pr-9 text-sm outline-none"
                      >
                        <option value="Petrol/Diesel">Petrol or diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="EV">Electric vehicle</option>
                        <option value="No Car">No car</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <label className="mt-2 block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Monthly car cost (€)
                    </label>
                    <input
                      type="number"
                      value={monthlyValue(inputs.annualCarSpend)}
                      onChange={(e) =>
                        onInputsChange({
                          ...inputs,
                          annualCarSpend: annualValue(Number(e.target.value)),
                        })
                      }
                      className="material-field w-full px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-2xl bg-surface-soft px-3 py-1.5">
                      <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground mb-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> Household Size
                        </span>
                        <span className="text-cloover font-extrabold">
                          {inputs.householdSize} {inputs.householdSize === 1 ? "person" : "people"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="1"
                        value={inputs.householdSize}
                        onChange={(e) => updateHouseholdSize(Number(e.target.value))}
                        className="w-full accent-cloover"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-surface-soft px-3 py-1.5">
                      <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground mb-1">
                        <span className="flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5" /> Electricity usage
                        </span>
                        <span className="text-cloover font-extrabold">
                          {inputs.yearlyEnergyConsumption.toLocaleString()} kWh
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="10000"
                        step="100"
                        value={inputs.yearlyEnergyConsumption}
                        onChange={(e) =>
                          onInputsChange({
                            ...inputs,
                            yearlyEnergyConsumption: Number(e.target.value),
                          })
                        }
                        className="w-full accent-cloover"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                        <span>1,000 kWh</span>
                        <span>5,500 kWh</span>
                        <span>10,000 kWh</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCalculateClick}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-cloover px-6 py-2.5 font-bold text-white transition hover:bg-cloover/90 shadow-lg shadow-cloover/20 cursor-pointer"
              >
                Calculate my best savings plan <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <LandingSections />
      <SiteFooter />
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

function HeroEnergyPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      <div className="absolute -left-4 top-12 hidden rounded-full bg-white px-4 py-2 text-xs font-extrabold text-cloover shadow-xl shadow-cloover/10 md:block z-10">
        Live savings preview
      </div>

      <div className="relative overflow-hidden rounded-[34px] border border-line bg-gradient-to-br from-cloover-soft via-white to-surface-soft p-5 shadow-2xl md:p-8">
        <div className="absolute right-8 top-8 rounded-2xl bg-white px-4 py-2 text-right shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            After loan
          </p>
          <p className="text-2xl font-extrabold text-cloover">€275/mo saved</p>
        </div>

        <div className="relative min-h-[430px]">
          <img
            src={HERO_ASSETS.solar}
            alt="Cute solar panels"
            className="cute-float-slow absolute left-0 top-0 w-36 drop-shadow-xl md:w-44"
          />
          <img
            src={HERO_ASSETS.house}
            alt="Cute home energy setup"
            className="cute-house-bob absolute left-1/2 top-20 w-[78%] max-w-[500px] -translate-x-1/2 drop-shadow-2xl"
          />
          <img
            src={HERO_ASSETS.battery}
            alt="Cute home battery"
            className="absolute right-6 top-48 w-20 drop-shadow-xl md:w-24"
          />
          <img
            src={HERO_ASSETS.heatPump}
            alt="Cute heat pump"
            className="absolute bottom-8 left-0 w-28 drop-shadow-xl md:w-36"
          />
          <img
            src={HERO_ASSETS.car}
            alt="Cute electric vehicle"
            className="absolute bottom-0 right-0 w-40 drop-shadow-xl md:w-52"
          />

          <svg
            viewBox="0 0 620 420"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path
              d="M126 120 C190 168 226 220 302 250"
              fill="none"
              stroke="#7CFF30"
              strokeLinecap="round"
              strokeWidth="6"
              className="cute-flow"
            />
            <path
              d="M500 238 C448 242 408 252 354 270"
              fill="none"
              stroke="#7CFF30"
              strokeLinecap="round"
              strokeWidth="6"
              className="cute-flow"
            />
            <path
              d="M114 356 C176 340 236 310 300 278"
              fill="none"
              stroke="#7CFF30"
              strokeLinecap="round"
              strokeWidth="6"
              className="cute-flow"
            />
            <path
              d="M508 342 C452 322 402 300 342 278"
              fill="none"
              stroke="#7CFF30"
              strokeLinecap="round"
              strokeWidth="6"
              className="cute-flow"
            />
          </svg>
        </div>

        <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
          <HeroMiniMetric label="Roof estimate" value="38 m² usable" />
          <HeroMiniMetric label="Loan paid off" value="Year 8-12" />
          <HeroMiniMetric label="Proposal" value="Installer-ready" />
        </div>
      </div>
    </div>
  );
}

function HeroMiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-ink">{value}</p>
    </div>
  );
}
