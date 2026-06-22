import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LandingPage } from "@/components/cloover/LandingPage";
import { Onboarding } from "@/components/cloover/Onboarding";
import { Configurator } from "@/components/cloover/Configurator";
import { Proposal } from "@/components/cloover/Proposal";
import { LoadingTransition } from "@/components/cloover/LoadingTransition";
import {
  DEFAULT_HOUSEHOLD_INPUTS,
  getBaselineModules,
  getRoofEstimate,
  type ModuleKey,
  type HouseholdInputs,
  type FreeEnergyEstimate,
} from "@/lib/cloover-data";

type Stage =
  | "landing"
  | "onboarding"
  | "loading-configurator"
  | "configurator"
  | "loading-proposal"
  | "proposal";

type HomeSearch = {
  step?: Stage;
};

function isStage(value: unknown): value is Stage {
  return (
    value === "landing" ||
    value === "onboarding" ||
    value === "loading-configurator" ||
    value === "configurator" ||
    value === "loading-proposal" ||
    value === "proposal"
  );
}

async function fetchFreeEnergyEstimate(
  inputs: HouseholdInputs,
): Promise<FreeEnergyEstimate | null> {
  const params = new URLSearchParams({
    street: inputs.street,
    streetNumber: inputs.streetNumber,
    postalCode: inputs.postalCode,
    householdSize: String(inputs.householdSize),
  });

  try {
    const response = await fetch(`/api/free-energy-estimate?${params.toString()}`);
    if (!response.ok) return null;
    return (await response.json()) as FreeEnergyEstimate;
  } catch (error) {
    console.warn("Free energy estimate unavailable", error);
    return null;
  }
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    step: isStage(search.step) ? search.step : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Solara — Interactive Energy Savings Advisor" },
      {
        name: "description",
        content: "See how much you save every month with a full home energy upgrade.",
      },
      { property: "og:title", content: "Solara — Interactive Energy Savings Advisor" },
      {
        property: "og:description",
        content:
          "Configure solar, battery, heat pump and EV upgrades from your household spend and usable roof size. Watch your monthly savings update live.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const search = Route.useSearch();
  const step = search.step ?? "landing";
  const navigate = Route.useNavigate();
  const [householdInputs, setHouseholdInputs] = useState<HouseholdInputs>(DEFAULT_HOUSEHOLD_INPUTS);
  const [activeModules, setActiveModules] = useState<Set<ModuleKey>>(
    getBaselineModules(DEFAULT_HOUSEHOLD_INPUTS),
  );
  const financingTerm = 10;
  const roofEstimate = getRoofEstimate(householdInputs);

  const goTo = (nextStep: Stage) => {
    void navigate({ to: "/", search: { step: nextStep } });
  };

  const handleCalculate = (active: Set<ModuleKey>) => {
    setActiveModules(active);
    goTo("loading-configurator");
    void fetchFreeEnergyEstimate(householdInputs).then((freeEstimate) => {
      if (!freeEstimate) return;
      setHouseholdInputs((previous) => ({ ...previous, freeEstimate }));
    });
  };

  const handleStepSelect = (nextStep: 1 | 2 | 3, active = activeModules) => {
    if (nextStep === 1) {
      goTo("landing");
      return;
    }
    setActiveModules(active);
    goTo(nextStep === 2 ? "configurator" : "proposal");
  };

  return (
    <>
      {step === "landing" && (
        <LandingPage
          inputs={householdInputs}
          onInputsChange={setHouseholdInputs}
          onCalculate={handleCalculate}
          onStepSelect={handleStepSelect}
        />
      )}
      {step === "loading-configurator" && (
        <LoadingTransition
          title="Preparing your home model"
          subtitle="We use your address and household inputs to make the configurator feel specific to your home."
          steps={[
            "Locating your address",
            "Estimating roof and solar potential",
            "Estimating usable roof size",
            "Preparing upgrade options",
          ]}
          checks={[
            {
              label: "Address and roof lookup",
              value: `${householdInputs.street} ${householdInputs.streetNumber}, ${householdInputs.postalCode}`,
              detail:
                "We estimate roof capacity from your address, household size and available open data when it is reachable.",
            },
            {
              label: "Local sunlight estimate",
              value: "Irradiance and self-consumption",
              detail:
                "Solar output depends on location, roof size and how much energy your household can use directly.",
            },
            {
              label: "Usable roof size",
              value: `${roofEstimate.usableRoofAreaM2.toFixed(0)} m² · ${roofEstimate.panelCountMax} panel cap`,
              detail:
                "For the full version, this will come from an OpenStreetMap roof drawing tool where the customer marks the usable roof area.",
            },
            {
              label: "Current household fit",
              value: `${householdInputs.householdSize} people · ${householdInputs.heatingType} · ${householdInputs.carType}`,
              detail:
                "Your current electricity, heating and mobility spend decides which upgrade can actually replace expensive energy.",
            },
          ]}
          onDone={() => goTo("configurator")}
        />
      )}
      {step === "configurator" && (
        <Configurator
          householdInputs={householdInputs}
          active={activeModules}
          onActiveChange={setActiveModules}
          financingTerm={financingTerm}
          onReview={() => goTo("loading-proposal")}
          onStepSelect={handleStepSelect}
        />
      )}
      {step === "loading-proposal" && (
        <LoadingTransition
          title="Preparing your savings report"
          subtitle="We compare your selected setup with staying as-is, including the loan period and long-term savings."
          steps={[
            "Comparing monthly costs",
            "Calculating loan impact",
            "Estimating break-even",
            "Preparing installer handoff",
          ]}
          checks={[
            {
              label: "Current vs. upgraded monthly spend",
              value: "Electricity, heating and mobility",
              detail:
                "We compare the selected upgrades against the household costs you entered in step 1.",
            },
            {
              label: "Loan term and installment",
              value: `${financingTerm}-year loan selected`,
              detail:
                "The report separates the monthly cost while the loan is active from the saving after the loan is paid off.",
            },
            {
              label: "Cumulative break-even",
              value: "Month-by-month cashflow",
              detail:
                "Break-even means the total Solara path becomes lower than staying with the current setup.",
            },
            {
              label: "Subsidy and feasibility notes",
              value: "Approximate until installer check",
              detail:
                "The final proposal still needs roof, grid, subsidy and tariff validation before a binding quote.",
            },
          ]}
          totalMs={4600}
          onDone={() => goTo("proposal")}
        />
      )}
      {step === "proposal" && (
        <Proposal
          householdInputs={householdInputs}
          active={activeModules}
          financingTerm={financingTerm}
          onStepSelect={handleStepSelect}
        />
      )}
      {step === "onboarding" && (
        <Onboarding
          onComplete={() => {
            goTo("loading-configurator");
          }}
        />
      )}
    </>
  );
}
