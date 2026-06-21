import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { CloverLogo } from "./Logo";

type Props = {
  steps: string[];
  title: string;
  subtitle?: string;
  onDone: () => void;
  totalMs?: number;
};

export function LoadingTransition({ steps, title, subtitle, onDone, totalMs = 2400 }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const per = totalMs / steps.length;
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setCurrent(i + 1), per * (i + 1)));
    });
    timers.push(setTimeout(onDone, totalMs + 250));
    return () => timers.forEach(clearTimeout);
  }, [steps, totalMs, onDone]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloover-soft via-white to-surface-soft grid place-items-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8 animate-fade-in">
          <CloverLogo />
        </div>

        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-cloover/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-cloover/15 animate-pulse" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="w-20 h-20 rounded-full bg-cloover text-white grid place-items-center shadow-2xl shadow-cloover/40">
              <Loader2 className="w-9 h-9 animate-spin" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-ink animate-fade-in">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground animate-fade-in">{subtitle}</p>
        )}

        <ul className="mt-8 space-y-2.5 text-left">
          {steps.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li
                key={s}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
                  done
                    ? "bg-white border-cloover/30 opacity-100"
                    : active
                      ? "bg-white border-cloover shadow-sm shadow-cloover/10 scale-[1.02]"
                      : "bg-white/40 border-line opacity-60"
                }`}
              >
                <span className="w-5 h-5 grid place-items-center shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-cloover" />
                  ) : active ? (
                    <Loader2 className="w-4 h-4 text-cloover animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-line" />
                  )}
                </span>
                <span className={`text-sm ${done || active ? "text-ink font-semibold" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-[11px] text-muted-foreground">
          Estimates use your household inputs and average regional tariffs.
        </p>
      </div>
    </div>
  );
}
