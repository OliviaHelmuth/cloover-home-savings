type StepNumber = 1 | 2 | 3;

const STEPS: { number: StepNumber; label: string; description: string }[] = [
  { number: 1, label: "Inputs", description: "Home details" },
  { number: 2, label: "Configuration", description: "Choose upgrades" },
  { number: 3, label: "Final proposal", description: "Review outcome" },
];

export function ProgressSteps({
  activeStep,
  onStepSelect,
}: {
  activeStep: StepNumber;
  onStepSelect?: (step: StepNumber) => void;
}) {
  return (
    <div className="border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 py-2.5 md:px-6 md:py-3">
        <div className="grid grid-cols-3 items-stretch gap-1.5 md:gap-3">
          {STEPS.map((step, index) => {
            const isActive = step.number === activeStep;
            const isDone = step.number < activeStep;
            return (
              <button
                key={step.number}
                onClick={() => onStepSelect?.(step.number)}
                className={`relative flex min-w-0 items-center gap-1.5 rounded-xl border px-2 py-1.5 text-left transition md:gap-2 md:rounded-2xl md:px-3 md:py-2 ${
                  isActive
                    ? "border-cloover bg-cloover-soft shadow-sm"
                    : "border-line bg-white hover:border-cloover/40 hover:bg-cloover-soft/40"
                } ${onStepSelect ? "cursor-pointer" : "cursor-default"}`}
                type="button"
              >
                {index > 0 && (
                  <div
                    className={`absolute right-[calc(100%+0.4rem)] top-1/2 hidden h-0.5 w-3 -translate-y-1/2 md:block ${
                      isDone || isActive ? "bg-cloover" : "bg-line"
                    }`}
                  />
                )}
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold md:h-8 md:w-8 md:text-sm ${
                    isDone || isActive
                      ? "bg-cloover text-white"
                      : "bg-surface-soft text-muted-foreground"
                  }`}
                >
                  {step.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`hidden truncate text-[11px] font-bold uppercase tracking-wide md:block ${
                      isActive ? "text-cloover" : "text-muted-foreground"
                    }`}
                  >
                    Step {step.number}
                  </span>
                  <span className="block truncate text-[12px] font-extrabold leading-tight text-ink md:text-sm">
                    {step.label}
                  </span>
                  <span className="hidden truncate text-xs text-muted-foreground sm:block">
                    {step.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
