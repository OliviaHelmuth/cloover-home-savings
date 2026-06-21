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
  type ModuleKey,
  type HouseholdInputs,
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
  const [householdInputs, setHouseholdInputs] = useState<HouseholdInputs>(DEFAULT_HOUSEHOLD_INPUTS);
  const [activeModules, setActiveModules] = useState<Set<ModuleKey>>(
    getBaselineModules(DEFAULT_HOUSEHOLD_INPUTS),
  );

  const goTo = (nextStep: Stage) => {
    void navigate({ to: "/", search: { step: nextStep } });
  };

  const handleCalculate = (active: Set<ModuleKey>) => {
    setActiveModules(active);
    goTo("loading-configurator");
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
          title="Building your interactive house"
          subtitle="Crunching your inputs into a live savings model"
          steps={[
            `Geo-locating roof at ${householdInputs.postalCode}`,
            "Modeling solar irradiance & self-consumption",
            "Matching dynamic tariff hours",
            "Calibrating financing & subsidies",
          ]}
          onDone={() => goTo("configurator")}
        />
      )}
      {step === "configurator" && (
        <Configurator
          householdInputs={householdInputs}
          active={activeModules}
          onActiveChange={setActiveModules}
          onReview={() => goTo("loading-proposal")}
          onStepSelect={handleStepSelect}
        />
      )}
      {step === "loading-proposal" && (
        <LoadingTransition
          title="Compiling your savings plan"
          subtitle="Comparing scenarios and picking the strongest upgrade path"
          steps={[
            "Running 5 financing scenarios",
            "Scoring 5-year savings for each",
            "Checking BEG & KfW subsidies",
            "Generating advisor recommendation",
          ]}
          onDone={() => goTo("proposal")}
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
          onComplete={() => {
            goTo("loading-configurator");
          }}
        />
      )}
    </>
  );
}
