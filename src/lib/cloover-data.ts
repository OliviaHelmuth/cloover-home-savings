export type ModuleKey =
  | "solar"
  | "battery"
  | "heatpump"
  | "ev"
  | "boiler"
  | "electricheating"
  | "tariff";

export const MODULE_LABELS: Record<ModuleKey, string> = {
  solar: "Electricity",
  battery: "Home battery",
  heatpump: "Heating",
  ev: "Mobility",
  boiler: "Heat pump boiler",
  electricheating: "Electric heating",
  tariff: "Dynamic tariff",
};

export const MODULE_SAVINGS: Record<ModuleKey, number> = {
  solar: 106,
  battery: 10,
  tariff: 0,
  heatpump: 43,
  ev: 7,
  boiler: 6,
  electricheating: 0,
};

export const CURRENT_COSTS = {
  electricity: 170,
  heating: 220,
  mobility: 180,
  total: 570,
};

export const MAX_SAVING = 166;
export const PLAN_INSTALLMENT_BASE = 150;

export type Scenario = {
  modules: ModuleKey[];
  cloover: number;
  saving: number;
  fit: number;
};

export const SCENARIOS: Scenario[] = [
  { modules: [], cloover: 570, saving: 0, fit: 0 },
  { modules: ["solar"], cloover: 464, saving: 106, fit: 85 },
  { modules: ["solar", "battery"], cloover: 454, saving: 116, fit: 88 },
  { modules: ["solar", "battery", "heatpump"], cloover: 411, saving: 159, fit: 94 },
  { modules: ["solar", "battery", "heatpump", "ev"], cloover: 404, saving: 166, fit: 92 },
];

export function computeScenario(active: Set<ModuleKey>) {
  // Try exact match
  const exact = SCENARIOS.find(
    (s) => s.modules.length === active.size && s.modules.every((m) => active.has(m)),
  );
  if (exact) return exact;

  // Approximate
  let saving = 0;
  active.forEach((m) => (saving += MODULE_SAVINGS[m]));
  saving = Math.min(saving, MAX_SAVING);
  const cloover = Math.max(CURRENT_COSTS.total - saving, 380);
  const fit = Math.min(90, 40 + active.size * 12);
  return { modules: Array.from(active), cloover, saving, fit };
}

export const TARIFF_MONTHLY = [
  { month: "Jan", saving: 38.88 },
  { month: "Feb", saving: 37.21 },
  { month: "Mar", saving: 39.0 },
  { month: "Apr", saving: 36.66 },
  { month: "May", saving: 30.6 },
  { month: "Jun", saving: 28.34 },
  { month: "Jul", saving: 27.75 },
  { month: "Aug", saving: 29.4 },
  { month: "Sep", saving: 33.6 },
  { month: "Oct", saving: 38.54 },
  { month: "Nov", saving: 39.68 },
  { month: "Dec", saving: 37.24 },
];

export type OnboardingData = {
  address: string;
  roofDrawn: boolean;
  roofType: string;
  orientation: string;
  angle: string;
  people: number;
  hotWater: string;
  heating: string;
  ev: boolean;
  yearlyKwh: number;
  pricePerKwh: number;
};

export const DEFAULT_ONBOARDING: OnboardingData = {
  address: "Berlin, Germany",
  roofDrawn: false,
  roofType: "Gable roof",
  orientation: "South",
  angle: "30°",
  people: 3,
  hotWater: "Oil, gas, wood, district heat",
  heating: "Oil, gas, wood, district heat",
  ev: false,
  yearlyKwh: 7399,
  pricePerKwh: 0.4,
};

export type HouseholdInputs = {
  street: string;
  streetNumber: string;
  postalCode: string;
  heatingType: string;
  annualHeatingSpend: number;
  annualElectricitySpend: number;
  annualCarSpend: number;
  carType: string;
  householdSize: number;
  yearlyEnergyConsumption: number;
};

export function getBaselineModules(
  inputs: Pick<HouseholdInputs, "heatingType" | "carType">,
): Set<ModuleKey> {
  const baseline = new Set<ModuleKey>();
  if (inputs.heatingType === "Heat Pump") {
    baseline.add("heatpump");
  }
  if (inputs.carType === "EV") {
    baseline.add("ev");
  }
  return baseline;
}

export const DEFAULT_HOUSEHOLD_INPUTS: HouseholdInputs = {
  street: "Friedrichstraße",
  streetNumber: "12",
  postalCode: "10117",
  heatingType: "Gas",
  annualHeatingSpend: 2640,
  annualElectricitySpend: 1860,
  annualCarSpend: 2160,
  carType: "Petrol/Diesel",
  householdSize: 3,
  yearlyEnergyConsumption: 4500,
};

export const UPGRADE_SAVING_RATES = {
  solarOnly: 0.3,
  solarBattery: 0.69,
  heatpumpOil: 0.34,
  heatpumpGas: 0.15,
  mobilityEv: 0.75,
};

export const HOUSEHOLD_FIT = {
  solar: "82% of customers were happy with the same solar configuration in your neighborhood.",
  battery:
    "76% of customers were happy with the same solar and battery configuration in your neighborhood.",
  heatpump:
    "79% of customers were happy with the same heat pump configuration in your neighborhood.",
  ev: "74% of customers were happy with the same electric vehicle configuration in your neighborhood.",
} satisfies Partial<Record<ModuleKey, string>>;

export function getDynamicCosts(inputs: HouseholdInputs) {
  const annualElectricity = inputs.annualElectricitySpend;
  const annualHeating = inputs.heatingType === "Heat Pump" ? 0 : inputs.annualHeatingSpend;
  const annualMobility = inputs.carType === "No Car" ? 0 : inputs.annualCarSpend;
  const annualTotal = annualElectricity + annualHeating + annualMobility;

  const electricity = Math.round(annualElectricity / 12);
  const heating = Math.round(annualHeating / 12);
  const mobility = Math.round(annualMobility / 12);
  const total = electricity + heating + mobility;
  return {
    electricity,
    heating,
    mobility,
    total,
    annualElectricity,
    annualHeating,
    annualMobility,
    annualTotal,
  };
}

export function computeDynamicScenario(active: Set<ModuleKey>, inputs: HouseholdInputs) {
  const costs = getDynamicCosts(inputs);

  let annualSaving = 0;
  const breakdown = {
    electricity: 0,
    heating: 0,
    mobility: 0,
  };

  if (active.has("solar")) {
    const electricityRate = active.has("battery")
      ? UPGRADE_SAVING_RATES.solarBattery
      : UPGRADE_SAVING_RATES.solarOnly;
    breakdown.electricity += Math.round(costs.annualElectricity * electricityRate);
  }
  if (active.has("heatpump") && inputs.heatingType !== "Heat Pump") {
    const heatingRate =
      inputs.heatingType === "Oil"
        ? UPGRADE_SAVING_RATES.heatpumpOil
        : UPGRADE_SAVING_RATES.heatpumpGas;
    breakdown.heating += Math.round(costs.annualHeating * heatingRate);
  }
  if (active.has("ev") && inputs.carType !== "EV" && inputs.carType !== "No Car") {
    breakdown.mobility += Math.round(costs.annualMobility * UPGRADE_SAVING_RATES.mobilityEv);
  }
  if (active.has("tariff")) {
    breakdown.electricity += Math.round(costs.annualElectricity * 0.08);
  }

  annualSaving = breakdown.electricity + breakdown.heating + breakdown.mobility;
  const saving = Math.round(annualSaving / 12);
  const cloover = Math.max(costs.total - saving, 150);
  const fit = Math.min(100, Math.max(30, 40 + active.size * 12 + inputs.householdSize * 5));

  return {
    modules: Array.from(active),
    cloover,
    saving,
    annualSaving,
    breakdown,
    fit,
  };
}
