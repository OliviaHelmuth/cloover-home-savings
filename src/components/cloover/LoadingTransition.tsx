import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { CloverLogo } from "./Logo";

type BackgroundCheck = {
  label: string;
  value: string;
  detail: string;
};

type Props = {
  steps: string[];
  title: string;
  subtitle?: string;
  checks?: BackgroundCheck[];
  onDone: () => void;
  totalMs?: number;
};

export function LoadingTransition({
  steps,
  title,
  subtitle,
  checks,
  onDone,
  totalMs = 3800,
}: Props) {
  const [current, setCurrent] = useState(0);
  const progress = Math.min(100, Math.round((current / steps.length) * 100));
  const visibleChecks =
    checks ??
    steps.map((step) => ({
      label: step,
      value: "In progress",
      detail: "This signal is used to make the estimate more household-specific.",
    }));

  useEffect(() => {
    const per = totalMs / steps.length;
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setCurrent(i + 1), per * (i + 1)));
    });
    timers.push(setTimeout(onDone, totalMs + 450));
    return () => timers.forEach(clearTimeout);
  }, [steps, totalMs, onDone]);

  return (
    <div className="min-h-screen bg-surface-soft px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
        <div className="flex items-center justify-between">
          <CloverLogo />
          <div className="hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-sm sm:flex">
            <ShieldCheck className="h-4 w-4 text-cloover" />
            Transparent estimate checks
          </div>
        </div>

        <main className="grid flex-1 items-center gap-5 py-8 lg:grid-cols-[0.78fr_1.22fr]">
          <section className="rounded-[28px] border border-line bg-white p-6 shadow-sm md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-cloover-soft px-3 py-1.5 text-xs font-bold text-cloover">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {progress}% complete
            </div>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight text-ink md:text-4xl">
              {title}
            </h2>
            {subtitle && <p className="mt-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>}

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-soft">
              <div
                className="h-full rounded-full bg-cloover transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <ul className="mt-5 space-y-2 text-left">
              {steps.map((s, i) => {
                const done = i < current;
                const active = i === current;
                return (
                  <li
                    key={s}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 transition-all duration-300 ${
                      done
                        ? "border-cloover/25 bg-cloover-soft/40"
                        : active
                          ? "border-cloover bg-white shadow-sm shadow-cloover/10"
                          : "border-line bg-white"
                    }`}
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center">
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-cloover" />
                      ) : active ? (
                        <Loader2 className="h-4 w-4 animate-spin text-cloover" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-line" />
                      )}
                    </span>
                    <span
                      className={`text-sm ${
                        done || active ? "font-semibold text-ink" : "text-muted-foreground"
                      }`}
                    >
                      {s}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-[28px] border border-line bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cloover-soft text-cloover">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-ink">What we check in the background</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  These checks are approximate, but they show exactly which inputs influence the
                  savings model before you see the next screen.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {visibleChecks.map((check, i) => {
                const done = i < current;
                const active = i === current;
                return (
                  <div
                    key={check.label}
                    className={`rounded-2xl border p-3 transition ${
                      done || active
                        ? "border-cloover/25 bg-cloover-soft/35"
                        : "border-line bg-surface-soft/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-ink">{check.label}</p>
                        <p className="mt-0.5 text-xs font-semibold text-cloover">{check.value}</p>
                      </div>
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-cloover" />
                      ) : active ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cloover" />
                      ) : (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-line" />
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{check.detail}</p>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 rounded-2xl bg-surface-soft px-3 py-2 text-[11px] leading-5 text-muted-foreground">
              Final prices still need installer validation for roof geometry, electrical connection,
              eligibility and tariff contract details.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
