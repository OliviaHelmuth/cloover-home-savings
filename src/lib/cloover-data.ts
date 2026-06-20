export type ModuleKey =
  | "solar"
  | "battery"
  | "heatpump"
  | "ev"
  | "boiler"
  | "electricheating"
  | "tariff";

export const MODULE_LABELS: Record<ModuleKey, string> = {
  solar: "Solar panels",
  battery: "Home battery",
  heatpump: "Heat pump",
  ev: "EV charger",
  boiler: "Heat pump boiler",
  electricheating: "Electric heating",
  tariff: "Dynamic tariff",
};

export const MODULE_SAVINGS: Record<ModuleKey, number> = {
  solar: 42,
  battery: 29,
  tariff: 35,
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

export const MAX_SAVING = 156;
export const CLOOVER_INSTALLMENT_BASE = 150;

export type Scenario = {
  modules: ModuleKey[];
  cloover: number;
  saving: number;
  fit: number;
};

export const SCENARIOS: Scenario[] = [
  { modules: [], cloover: 570, saving: 0, fit: 0 },
  { modules: ["solar"], cloover: 528, saving: 42, fit: 68 },
  { modules: ["solar", "battery"], cloover: 499, saving: 71, fit: 78 },
  { modules: ["solar", "battery", "tariff"], cloover: 464, saving: 106, fit: 85 },
  { modules: ["solar", "battery", "heatpump", "tariff"], cloover: 421, saving: 149, fit: 92 },
  { modules: ["solar", "battery", "heatpump", "ev", "tariff"], cloover: 414, saving: 156, fit: 89 },
];

export function computeScenario(active: Set<ModuleKey>) {
  // Try exact match
  const exact = SCENARIOS.find(
    (s) =>
      s.modules.length === active.size &&
      s.modules.every((m) => active.has(m)),
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
