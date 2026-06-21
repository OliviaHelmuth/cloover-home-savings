import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LandingPage } from "@/components/cloover/LandingPage";
import { Onboarding } from "@/components/cloover/Onboarding";
import { Configurator } from "@/components/cloover/Configurator";
import { Proposal } from "@/components/cloover/Proposal";
import {
  DEFAULT_ONBOARDING,
  DEFAULT_HOUSEHOLD_INPUTS,
  type ModuleKey,
  type OnboardingData,
  type HouseholdInputs,
} from "@/lib/cloover-data";

type Stage = "landing" | "onboarding" | "configurator" | "proposal";

type HomeSearch = {
  step?: Stage;
};

function isStage(value: unknown): value is Stage {
  return (
    value === "landing" ||
    value === "onboarding" ||
    value === "configurator" ||
    value === "proposal"
  );
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
          "Configure solar, battery, heat pump, EV and dynamic tariff. Watch your monthly savings update live.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const search = Route.useSearch();
  const step = search.step ?? "landing";
  const navigate = Route.useNavigate();
  const [data, setData] = useState<OnboardingData>(DEFAULT_ONBOARDING);
  const [householdInputs, setHouseholdInputs] = useState<HouseholdInputs>(DEFAULT_HOUSEHOLD_INPUTS);
  const [activeModules, setActiveModules] = useState<Set<ModuleKey>>(
    new Set<ModuleKey>(["solar", "heatpump", "ev"]),
  );

  const goTo = (nextStep: Stage) => {
    void navigate({ to: "/", search: { step: nextStep } });
  };

  const handleCalculate = (active: Set<ModuleKey>) => {
    setActiveModules(active);
    goTo("configurator");
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
      {step === "configurator" && (
        <Configurator
          householdInputs={householdInputs}
          active={activeModules}
          onActiveChange={setActiveModules}
          onReview={() => goTo("proposal")}
          onStepSelect={handleStepSelect}
        />
      )}
      {step === "proposal" && (
        <Proposal
          householdInputs={householdInputs}
          active={activeModules}
          onStepSelect={handleStepSelect}
        />
      )}
      {step === "onboarding" && (
        <Onboarding
          onComplete={(d) => {
            setData(d);
            goTo("configurator");
          }}
        />
      )}
    </>
  );
}
