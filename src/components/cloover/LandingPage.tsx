import { ArrowRight, Sparkles, MapPin, Users, Gauge, Flame, Car } from "lucide-react";
import { type ModuleKey, type HouseholdInputs } from "@/lib/cloover-data";
import { CloverLogo } from "./Logo";
import { ProgressSteps } from "./ProgressSteps";

type Props = {
  inputs: HouseholdInputs;
  onInputsChange: (inputs: HouseholdInputs) => void;
  onCalculate: (active: Set<ModuleKey>) => void;
  onStepSelect: (step: 1 | 2 | 3, active: Set<ModuleKey>) => void;
};

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
  { street: "Boxhagener Straße", streetNumber: "76", postalCode: "10245", label: "Friedrichshain" },
];

const HOUSEHOLD_ESTIMATES: Record<
  number,
  Pick<
    HouseholdInputs,
    "yearlyEnergyConsumption" | "monthlyElectricitySpend" | "monthlyHeatingSpend"
  >
> = {
  1: { yearlyEnergyConsumption: 2200, monthlyElectricitySpend: 75, monthlyHeatingSpend: 125 },
  2: { yearlyEnergyConsumption: 3200, monthlyElectricitySpend: 110, monthlyHeatingSpend: 170 },
  3: { yearlyEnergyConsumption: 4500, monthlyElectricitySpend: 155, monthlyHeatingSpend: 220 },
  4: { yearlyEnergyConsumption: 5800, monthlyElectricitySpend: 200, monthlyHeatingSpend: 265 },
};

export function LandingPage({ inputs, onInputsChange, onCalculate, onStepSelect }: Props) {
  const activeModules = new Set<ModuleKey>(["solar"]);
  if (inputs.heatingType !== "Heat Pump") {
    activeModules.add("heatpump");
  }
  if (inputs.carType !== "EV" && inputs.carType !== "No Car") {
    activeModules.add("ev");
  }

  const handleCalculateClick = () => {
    onCalculate(activeModules);
  };

  const updateStreet = (street: string) => {
    const suggestion = ADDRESS_SUGGESTIONS.find((address) => address.street === street);
    onInputsChange({
      ...inputs,
      street,
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
      yearlyEnergyConsumption: estimate.yearlyEnergyConsumption,
      monthlyElectricitySpend: estimate.monthlyElectricitySpend,
      monthlyHeatingSpend: inputs.heatingType === "Heat Pump" ? 0 : estimate.monthlyHeatingSpend,
    });
  };

  const updateHeatingType = (heatingType: string) => {
    const estimate = HOUSEHOLD_ESTIMATES[inputs.householdSize] ?? HOUSEHOLD_ESTIMATES[3];
    onInputsChange({
      ...inputs,
      heatingType,
      monthlyHeatingSpend: heatingType === "Heat Pump" ? 0 : estimate.monthlyHeatingSpend,
    });
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6">
          <CloverLogo />
        </div>
      </header>
      <ProgressSteps activeStep={1} onStepSelect={(step) => onStepSelect(step, activeModules)} />

      <main>
        <section className="mx-auto grid min-h-[calc(100svh-73px)] max-w-7xl items-center gap-8 px-5 py-6 md:px-6 lg:h-[calc(100vh-73px)] lg:min-h-0 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.98] md:text-6xl xl:text-7xl">
              Green energy isn't just cleaner.
              <span className="mt-3 block text-cloover">It's cheaper in the long run.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground xl:text-xl xl:leading-9">
              The right combination of technologies can save you more than any single upgrade would. We’ll find the setup that works best for your home.
            </p>
          </div>

          <div>
            {/* Household inputs calculator */}
            <div className="space-y-4 rounded-[26px] border border-line bg-white p-5 shadow-2xl md:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cloover" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-cloover">
                      Savings calculator
                    </p>
                    <h2 className="text-lg font-extrabold text-ink">Tell us about your home</h2>
                  </div>
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-ink/80 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-cloover" />
                  Address details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Street
                    </label>
                    <input
                      type="text"
                      value={inputs.street}
                      onChange={(e) => updateStreet(e.target.value)}
                      placeholder="e.g. Friedrichstraße"
                      list="home-address-suggestions"
                      autoComplete="street-address"
                      className="material-field w-full px-3 py-2.5 text-sm outline-none"
                    />
                    <datalist id="home-address-suggestions">
                      {ADDRESS_SUGGESTIONS.map((address) => (
                        <option
                          key={`${address.street}-${address.postalCode}`}
                          value={address.street}
                          label={`${address.street} ${address.streetNumber}, ${address.postalCode} ${address.label}`}
                        />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Number
                    </label>
                    <input
                      type="text"
                      value={inputs.streetNumber}
                      onChange={(e) => onInputsChange({ ...inputs, streetNumber: e.target.value })}
                      placeholder="e.g. 12"
                      autoComplete="address-line2"
                      className="material-field w-full px-3 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Postal code
                    </label>
                    <input
                      type="text"
                      value={inputs.postalCode}
                      onChange={(e) => onInputsChange({ ...inputs, postalCode: e.target.value })}
                      placeholder="e.g. 10117"
                      autoComplete="postal-code"
                      className="material-field w-full px-3 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Energy & Spends */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-ink/80 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-cloover" />
                  Energy & Spend
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Heating type
                    </label>
                    <select
                      value={inputs.heatingType}
                      onChange={(e) => updateHeatingType(e.target.value)}
                      className="material-field w-full px-3 py-2.5 text-sm outline-none appearance-none"
                    >
                      <option value="Gas">Gas</option>
                      <option value="Oil">Oil</option>
                      <option value="Heat Pump">Electric Heat Pump</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Monthly Heating Spend (€)
                    </label>
                    <input
                      type="number"
                      value={inputs.monthlyHeatingSpend}
                      onChange={(e) =>
                        onInputsChange({ ...inputs, monthlyHeatingSpend: Number(e.target.value) })
                      }
                      className="material-field w-full px-3 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Monthly Elec Spend (€)
                    </label>
                    <input
                      type="number"
                      value={inputs.monthlyElectricitySpend}
                      onChange={(e) =>
                        onInputsChange({
                          ...inputs,
                          monthlyElectricitySpend: Number(e.target.value),
                        })
                      }
                      className="material-field w-full px-3 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Household & Mobility */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-ink/80 flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-cloover" />
                  Household & Mobility
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-start">
                  <div>
                    <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                      Car type
                    </label>
                    <select
                      value={inputs.carType}
                      onChange={(e) => onInputsChange({ ...inputs, carType: e.target.value })}
                      className="material-field w-full px-3 py-2.5 text-sm outline-none appearance-none"
                    >
                      <option value="Petrol/Diesel">Petrol/Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="EV">Electric Vehicle (EV)</option>
                      <option value="No Car">No Car</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-2xl bg-surface-soft px-3 py-2">
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

                    <div className="rounded-2xl bg-surface-soft px-3 py-2">
                      <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground mb-1">
                        <span className="flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5" /> Yearly energy consumption
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-cloover px-6 py-3 font-bold text-white transition hover:bg-cloover/90 shadow-lg shadow-cloover/20 cursor-pointer"
              >
                Calculate my best savings plan <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 text-sm text-muted-foreground md:grid-cols-[1.1fr_1fr_1fr_1fr] md:px-6">
          <div>
            <p className="font-extrabold text-ink">Credible savings, not guesswork.</p>
            <p className="mt-1 text-xs leading-5">
              Estimates combine household spend, financing, tariff shifting and system fit before
              recommending a package.
            </p>
          </div>
          <TrustItem label="Savings certainty" value="Irradiance, tariff, subsidies" />
          <TrustItem label="Household fit" value="Electricity, heating, mobility" />
          <TrustItem label="Proposal-ready" value="One monthly outcome" />
        </div>
      </footer>
    </div>
  );
}

function TrustItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-soft px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-cloover">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
