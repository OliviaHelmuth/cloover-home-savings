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

export type RoofType = "Hip" | "Flat" | "Gable" | "Pyramid" | "Shed";
export type RoofOrientation = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export const ROOF_ORIENTATION_FACTOR: Record<RoofOrientation, number> = {
  S: 1,
  SE: 0.96,
  SW: 0.96,
  E: 0.86,
  W: 0.86,
  NE: 0.7,
  NW: 0.7,
  N: 0.6,
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
  roofType: RoofType;
  roofOrientation: RoofOrientation;
  roofAngle: number;
  userRoofAreaM2?: number | null;
  freeEstimate?: FreeEnergyEstimate | null;
};

export type FreeEnergyEstimate = {
  source: "live" | "fallback";
  addressLabel: string;
  lat: number | null;
  lon: number | null;
  specificYieldKwhPerKwp: number;
  usableRoofAreaM2: number | null;
  roofSource: "osm_building" | "household_fallback";
  irradianceSource: "pvgis" | "fallback";
  attribution: string[];
  warnings: string[];
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
  roofType: "Gable",
  roofOrientation: "S",
  roofAngle: 30,
  userRoofAreaM2: null,
  freeEstimate: null,
};

export const PRICE_CATALOG = {
  panelWp: 440,
  panelAreaM2: 1.134 * 1.762,
  pvPerKwpSmall: 1450,
  pvPerKwpLarge: 1300,
  batteryPerKwh: 700,
  heatpumpFixed: 22000,
  wallboxFixed: 1200,
  evTransitionPackage: 18000,
  retailPerKwh: 0.37,
  feedInPerKwh: 0.0778,
  dynamicSpreadPerKwh: 0.12,
  oilPerLitre: 1.1,
  gasPerKwh: 0.115,
  petrolPerLitre: 1.85,
  dieselPerLitre: 1.75,
  homeChargePerKwh: 0.2,
  publicChargePerKwh: 0.45,
  financingApr: 0.05,
};

export const UPGRADE_SAVING_RATES = {
  solarOnly: 0.3,
  solarBattery: 0.69,
  heatpumpOil: 0.34,
  heatpumpGas: 0.15,
  mobilityEv: 0.75,
};

export type LocationProfile = {
  label: string;
  specificYieldKwhPerKwp: number;
  usableRoofAreaM2: number;
  orientation: "S" | "SE" | "SW" | "E" | "W";
  orientationFactor: number;
  gridFeePerKwh: number;
  neighborhoodCustomers: number;
};

const LOCATION_PROFILES: Record<string, LocationProfile> = {
  "10117": {
    label: "Berlin Mitte",
    specificYieldKwhPerKwp: 980,
    usableRoofAreaM2: 38,
    orientation: "S",
    orientationFactor: 1,
    gridFeePerKwh: 0,
    neighborhoodCustomers: 82,
  },
  "10119": {
    label: "Berlin Mitte",
    specificYieldKwhPerKwp: 972,
    usableRoofAreaM2: 34,
    orientation: "SE",
    orientationFactor: 0.95,
    gridFeePerKwh: 0.004,
    neighborhoodCustomers: 79,
  },
  "10435": {
    label: "Prenzlauer Berg",
    specificYieldKwhPerKwp: 988,
    usableRoofAreaM2: 42,
    orientation: "S",
    orientationFactor: 1,
    gridFeePerKwh: 0.003,
    neighborhoodCustomers: 86,
  },
  "10961": {
    label: "Kreuzberg",
    specificYieldKwhPerKwp: 965,
    usableRoofAreaM2: 32,
    orientation: "SW",
    orientationFactor: 0.95,
    gridFeePerKwh: 0.004,
    neighborhoodCustomers: 77,
  },
};

const DEFAULT_LOCATION_PROFILE: LocationProfile = {
  label: "Germany average",
  specificYieldKwhPerKwp: 950,
  usableRoofAreaM2: 36,
  orientation: "S",
  orientationFactor: 1,
  gridFeePerKwh: 0,
  neighborhoodCustomers: 74,
};

export type RoofEstimate = {
  location: LocationProfile;
  usableRoofAreaM2: number;
  panelCountMax: number;
  maxKwp: number;
};

export type CapexComponent = {
  key: ModuleKey;
  label: string;
  gross: number;
  subsidy: number;
  afterSubsidy: number;
  note: string;
};

export type FinancialPlan = {
  termYears: number;
  monthlyInstallment: number;
  annualInstallment: number;
  netCapex: number;
  grossCapex: number;
  subsidy: number;
  earlyYears: number;
  savingStartYear: number;
  earlyAnnualExtra: number;
  fiveYearOperationalSaving: number;
  estimatedNetFiveYear: number;
  breakEvenYear: number;
};

export type DynamicScenario = {
  modules: ModuleKey[];
  cloover: number;
  saving: number;
  annualSaving: number;
  breakdown: {
    electricity: number;
    heating: number;
    mobility: number;
  };
  fit: number;
  certainty: number;
  roof: RoofEstimate;
  system: {
    pvKwp: number;
    panelCount: number;
    batteryKwh: number;
    heatpumpSubsidyRate: number;
    selfConsumptionRatio: number;
    annualSolarKwh: number;
  };
  capex: {
    gross: number;
    subsidy: number;
    afterSubsidy: number;
    components: CapexComponent[];
  };
  assumptions: string[];
};

export const HOUSEHOLD_FIT = {
  solar: "82% of customers were happy with the same solar configuration in your neighborhood.",
  battery:
    "76% of customers were happy with the same solar and battery configuration in your neighborhood.",
  heatpump:
    "79% of customers were happy with the same heat pump configuration in your neighborhood.",
  ev: "74% of customers were happy with the same electric vehicle configuration in your neighborhood.",
} satisfies Partial<Record<ModuleKey, string>>;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToHalf(value: number) {
  return Math.ceil(value * 2) / 2;
}

function annuity(principal: number, annualRate: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

function getDataSourceAssumptions(inputs: HouseholdInputs) {
  if (!inputs.freeEstimate) {
    return ["Solar and roof source: built-in regional demo profile"];
  }

  return [
    `Solar source: ${inputs.freeEstimate.irradianceSource === "pvgis" ? "PVGIS live estimate" : "regional fallback estimate"}`,
    `Roof source: ${inputs.freeEstimate.roofSource === "osm_building" ? "OpenStreetMap building footprint" : "household-size fallback"}`,
  ];
}

export function getLocationProfile(inputs: Pick<HouseholdInputs, "postalCode" | "freeEstimate">) {
  const localProfile = LOCATION_PROFILES[inputs.postalCode] ?? DEFAULT_LOCATION_PROFILE;
  if (inputs.freeEstimate) {
    return {
      label: inputs.freeEstimate.addressLabel || localProfile.label,
      specificYieldKwhPerKwp: inputs.freeEstimate.specificYieldKwhPerKwp,
      usableRoofAreaM2: inputs.freeEstimate.usableRoofAreaM2 ?? localProfile.usableRoofAreaM2,
      orientation: localProfile.orientation,
      orientationFactor: localProfile.orientationFactor,
      gridFeePerKwh: localProfile.gridFeePerKwh,
      neighborhoodCustomers: localProfile.neighborhoodCustomers,
    } satisfies LocationProfile;
  }
  return localProfile;
}

export function getRoofEstimate(inputs: HouseholdInputs): RoofEstimate {
  const location = getLocationProfile(inputs);
  const householdAdjustment = (inputs.householdSize - 3) * 3;
  const usableRoofAreaM2 = inputs.freeEstimate?.usableRoofAreaM2
    ? clamp(inputs.freeEstimate.usableRoofAreaM2, 20, 72)
    : clamp(location.usableRoofAreaM2 + householdAdjustment, 24, 58);
  const panelCountMax = Math.floor(usableRoofAreaM2 / PRICE_CATALOG.panelAreaM2);
  const maxKwp = (panelCountMax * PRICE_CATALOG.panelWp) / 1000;

  return {
    location,
    usableRoofAreaM2,
    panelCountMax,
    maxKwp,
  };
}

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

function estimateHeatPumpElectricityKwh(inputs: HouseholdInputs) {
  if (inputs.heatingType === "Heat Pump" || inputs.annualHeatingSpend <= 0) return 0;

  if (inputs.heatingType === "Oil") {
    const litres = inputs.annualHeatingSpend / PRICE_CATALOG.oilPerLitre;
    const thermalKwh = litres * 10 * 0.88;
    return thermalKwh / 3.4;
  }

  const gasKwh = inputs.annualHeatingSpend / PRICE_CATALOG.gasPerKwh;
  return (gasKwh * 0.9) / 3.4;
}

function estimateEvElectricityKwh(inputs: HouseholdInputs) {
  if (inputs.carType === "EV" || inputs.carType === "No Car" || inputs.annualCarSpend <= 0) {
    return 0;
  }

  const pricePerLitre =
    inputs.carType === "Hybrid" ? PRICE_CATALOG.petrolPerLitre : PRICE_CATALOG.dieselPerLitre;
  const litres = inputs.annualCarSpend / pricePerLitre;
  const kmYear = (litres / (inputs.carType === "Hybrid" ? 4.8 : 6.5)) * 100;
  return (kmYear / 100) * 18;
}

function recommendPvKwp(active: Set<ModuleKey>, inputs: HouseholdInputs, roof: RoofEstimate) {
  if (!active.has("solar")) return 0;

  const hpLoad = active.has("heatpump") ? estimateHeatPumpElectricityKwh(inputs) : 0;
  const evLoad = active.has("ev") ? estimateEvElectricityKwh(inputs) : 0;
  const targetDemand = inputs.yearlyEnergyConsumption + hpLoad + evLoad;
  const rawKwp =
    (targetDemand * 0.8) / (roof.location.specificYieldKwhPerKwp * roof.location.orientationFactor);

  return clamp(roundToHalf(rawKwp), Math.min(3, roof.maxKwp), roof.maxKwp);
}

function recommendBatteryKwh(active: Set<ModuleKey>, inputs: HouseholdInputs) {
  if (!active.has("solar") || !active.has("battery")) return 0;
  const hpLoad = active.has("heatpump") ? estimateHeatPumpElectricityKwh(inputs) : 0;
  const meterDemand = inputs.yearlyEnergyConsumption + hpLoad;
  return clamp(Math.round(meterDemand / 1000), 5, 10);
}

function getHeatpumpSubsidyRate(inputs: HouseholdInputs) {
  if (inputs.heatingType === "Oil") return 0.5;
  if (inputs.heatingType === "Gas") return 0.35;
  return 0;
}

export function computeDynamicScenario(active: Set<ModuleKey>, inputs: HouseholdInputs) {
  const costs = getDynamicCosts(inputs);
  const roof = getRoofEstimate(inputs);
  const pvKwp = recommendPvKwp(active, inputs, roof);
  const panelCount = pvKwp > 0 ? Math.ceil((pvKwp * 1000) / PRICE_CATALOG.panelWp) : 0;
  const batteryKwh = recommendBatteryKwh(active, inputs);
  const effectiveYield = roof.location.specificYieldKwhPerKwp * roof.location.orientationFactor;
  const annualSolarKwh = Math.round(pvKwp * effectiveYield);
  const selfConsumptionRatio = active.has("battery") ? 0.68 : active.has("solar") ? 0.34 : 0;

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
    const selfConsumedKwh = Math.min(
      annualSolarKwh * selfConsumptionRatio,
      inputs.yearlyEnergyConsumption,
    );
    const exportedKwh = Math.max(annualSolarKwh - selfConsumedKwh, 0);
    const physicalValue =
      selfConsumedKwh * (PRICE_CATALOG.retailPerKwh + roof.location.gridFeePerKwh) +
      exportedKwh * PRICE_CATALOG.feedInPerKwh +
      (batteryKwh > 0 ? batteryKwh * 300 * 0.9 * PRICE_CATALOG.dynamicSpreadPerKwh : 0);
    breakdown.electricity += Math.round(
      Math.min(costs.annualElectricity * electricityRate, physicalValue),
    );
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

  const capexComponents: CapexComponent[] = [];
  if (pvKwp > 0) {
    const pvRate = pvKwp > 10 ? PRICE_CATALOG.pvPerKwpLarge : PRICE_CATALOG.pvPerKwpSmall;
    const gross = Math.round(pvKwp * pvRate);
    capexComponents.push({
      key: "solar",
      label: `${pvKwp.toFixed(1)} kWp solar · ${panelCount} panels`,
      gross,
      subsidy: 0,
      afterSubsidy: gross,
      note: `${roof.usableRoofAreaM2.toFixed(0)} m² usable roof, ${roof.location.orientation} orientation`,
    });
  }
  if (batteryKwh > 0) {
    const gross = Math.round(batteryKwh * PRICE_CATALOG.batteryPerKwh);
    capexComponents.push({
      key: "battery",
      label: `${batteryKwh} kWh home battery`,
      gross,
      subsidy: 0,
      afterSubsidy: gross,
      note: "Sized from yearly meter demand and heat-pump load",
    });
  }
  if (active.has("heatpump") && inputs.heatingType !== "Heat Pump") {
    const gross = PRICE_CATALOG.heatpumpFixed;
    const subsidy = Math.round(gross * getHeatpumpSubsidyRate(inputs));
    capexComponents.push({
      key: "heatpump",
      label: "Air-source heat pump",
      gross,
      subsidy,
      afterSubsidy: gross - subsidy,
      note: `${Math.round(getHeatpumpSubsidyRate(inputs) * 100)}% estimated subsidy for ${inputs.heatingType.toLowerCase()} replacement`,
    });
  }
  if (active.has("ev") && inputs.carType !== "EV" && inputs.carType !== "No Car") {
    const gross = PRICE_CATALOG.evTransitionPackage + PRICE_CATALOG.wallboxFixed;
    capexComponents.push({
      key: "ev",
      label: "EV transition package + wallbox",
      gross,
      subsidy: 0,
      afterSubsidy: gross,
      note: "Includes home charging setup and a financed mobility transition allowance",
    });
  }

  const grossCapex = capexComponents.reduce((sum, item) => sum + item.gross, 0);
  const subsidy = capexComponents.reduce((sum, item) => sum + item.subsidy, 0);
  const afterSubsidy = capexComponents.reduce((sum, item) => sum + item.afterSubsidy, 0);
  const fit =
    active.size === 0
      ? 0
      : Math.min(100, Math.max(30, 42 + active.size * 10 + inputs.householdSize * 4));
  const certainty =
    active.size === 0
      ? 0
      : Math.min(
          96,
          68 +
            (roof.location.specificYieldKwhPerKwp > 970 ? 6 : 2) +
            (active.has("battery") ? 6 : 0) +
            (subsidy > 0 ? 5 : 0) +
            (selfConsumptionRatio > 0.6 ? 5 : 0) +
            active.size * 2,
        );

  return {
    modules: Array.from(active),
    cloover,
    saving,
    annualSaving,
    breakdown,
    fit,
    certainty,
    roof,
    system: {
      pvKwp,
      panelCount,
      batteryKwh,
      heatpumpSubsidyRate: getHeatpumpSubsidyRate(inputs),
      selfConsumptionRatio,
      annualSolarKwh,
    },
    capex: {
      gross: grossCapex,
      subsidy,
      afterSubsidy,
      components: capexComponents,
    },
    assumptions: [
      `${roof.location.label}: ${roof.location.specificYieldKwhPerKwp} kWh/kWp yearly solar yield`,
      `${roof.usableRoofAreaM2.toFixed(0)} m² usable roof area, ${roof.panelCountMax} panel roof cap`,
      `Retail electricity €${(PRICE_CATALOG.retailPerKwh + roof.location.gridFeePerKwh).toFixed(3)}/kWh, feed-in €${PRICE_CATALOG.feedInPerKwh}/kWh`,
      `Dynamic tariff spread €${PRICE_CATALOG.dynamicSpreadPerKwh}/kWh used for battery shifting`,
      ...getDataSourceAssumptions(inputs),
    ],
  };
}

export function computeFinancialPlan(
  active: Set<ModuleKey>,
  inputs: HouseholdInputs,
  termYears = 10,
): FinancialPlan {
  const scenario = computeDynamicScenario(active, inputs);
  const costs = getDynamicCosts(inputs);
  const selected = scenario.capex.afterSubsidy > 0;
  const termMonths = termYears * 12;
  const monthlyInstallment = Math.round(
    annuity(scenario.capex.afterSubsidy, PRICE_CATALOG.financingApr, termMonths),
  );
  const annualInstallment = monthlyInstallment * 12;
  const modeledMonthlyBill = Math.max(costs.total - scenario.saving, 0);
  const breakEvenMonth =
    selected && scenario.saving > 0
      ? Array.from({ length: (termYears + 25) * 12 }, (_, index) => index + 1).find((month) => {
          const currentPath = costs.total * month;
          const financedMonths = Math.min(month, termMonths);
          const paidOffMonths = Math.max(month - termMonths, 0);
          const solaraPath =
            (modeledMonthlyBill + monthlyInstallment) * financedMonths +
            modeledMonthlyBill * paidOffMonths;
          return solaraPath <= currentPath;
        })
      : undefined;
  const breakEvenYear = selected
    ? breakEvenMonth
      ? Math.ceil(breakEvenMonth / 12)
      : termYears + 25
    : 0;
  const hasEarlyPressure = selected && monthlyInstallment > scenario.saving;
  const earlyYears = hasEarlyPressure ? clamp(Math.min(breakEvenYear - 1, termYears), 1, 3) : 0;
  const earlyAnnualExtra = selected
    ? Math.max(0, Math.round(Math.max(monthlyInstallment - scenario.saving, 0) * 12))
    : 0;
  const estimatedNetFiveYear = selected
    ? Math.round(scenario.annualSaving * (5 - earlyYears) - earlyAnnualExtra * earlyYears)
    : 0;

  return {
    termYears,
    monthlyInstallment,
    annualInstallment,
    netCapex: scenario.capex.afterSubsidy,
    grossCapex: scenario.capex.gross,
    subsidy: scenario.capex.subsidy,
    earlyYears,
    savingStartYear: selected ? earlyYears + 1 : 0,
    earlyAnnualExtra,
    fiveYearOperationalSaving: selected ? Math.round(scenario.annualSaving * 5) : 0,
    estimatedNetFiveYear,
    breakEvenYear,
  };
}

export function getRecommendedFinancingTerm(active: Set<ModuleKey>, inputs: HouseholdInputs) {
  const scenario = computeDynamicScenario(active, inputs);
  const financedAmount = scenario.capex.afterSubsidy;

  if (financedAmount <= 0) return 0;
  if (financedAmount <= 7000) return 5;
  if (financedAmount <= 12000) return 8;
  if (financedAmount <= 20000) return 10;
  if (financedAmount <= 30000) return 12;
  return 15;
}
