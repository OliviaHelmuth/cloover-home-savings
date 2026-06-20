import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Onboarding } from "@/components/cloover/Onboarding";
import { Configurator } from "@/components/cloover/Configurator";
import { Proposal } from "@/components/cloover/Proposal";
import { DEFAULT_ONBOARDING, type OnboardingData } from "@/lib/cloover-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cloover — Interactive Energy Savings Advisor" },
      { name: "description", content: "See how much you save every month with a Cloover home energy upgrade." },
      { property: "og:title", content: "Cloover — Interactive Energy Savings Advisor" },
      { property: "og:description", content: "Configure solar, battery, heat pump, EV and dynamic tariff. Watch your monthly savings update live." },
    ],
  }),
  component: Index,
});

type Stage = "onboarding" | "configurator" | "proposal";

function Index() {
  const [stage, setStage] = useState<Stage>("onboarding");
  const [data, setData] = useState<OnboardingData>(DEFAULT_ONBOARDING);

  return (
    <>
      {stage === "configurator" && <Configurator onboarding={data} onReview={() => setStage("proposal")} />}
      {stage === "proposal" && <Proposal onBack={() => setStage("configurator")} />}
      {stage === "onboarding" && (
        <Onboarding
          onComplete={(d) => {
            setData(d);
            setStage("configurator");
          }}
        />
      )}
    </>
  );
}
