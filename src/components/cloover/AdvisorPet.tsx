import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronDown, Loader2, Send, Sparkles, Volume2, VolumeX, X } from "lucide-react";

type Message = {
  role: "advisor" | "user";
  text: string;
};

type Props = {
  onStart: () => void;
};

const starterMessages: Message[] = [
  {
    role: "advisor",
    text: "Hi, I'm your Solara advisor. Tell me what you pay for electricity, heating, or petrol and I'll point you to the strongest upgrade path.",
  },
  {
    role: "advisor",
    text: "Quick read: start with Electricity, then add Heating if you still use oil or gas, and Mobility if petrol spend is meaningful.",
  },
];

const quickPrompts = [
  "I heat with oil and pay €220/month",
  "I have a petrol car",
  "How does financing work?",
  "What subsidies are included?",
];

function buildAdvice(input: string) {
  const text = input.toLowerCase();
  const mentionsOilOrGas = /oil|gas|heating|heat|boiler/.test(text);
  const mentionsCar = /petrol|diesel|car|ev|charger|mobility/.test(text);
  const mentionsSolarOnly = /solar only|only solar|pv only|just solar/.test(text);
  const mentionsBattery = /battery|storage|tariff|dynamic/.test(text);
  const mentionsFinancing = /finance|financing|loan|installment|monthly|payment/.test(text);
  const mentionsSubsidy = /subsidy|subsidies|grant|bafa|kfw|förder/.test(text);
  const mentionsAccuracy = /accurate|accuracy|real|estimate|guarantee|roof|shade/.test(text);
  const euroMatch = text.match(/€?\s?(\d{2,4})/);
  const spend = euroMatch ? Number(euroMatch[1]) : null;

  if (mentionsOilOrGas) {
    const qualifier = spend ? ` Against roughly €${spend}/month of heating spend,` : "";
    return `${qualifier} I’d add the Heating lever next. The heat pump converts high fuel spend into electricity that the Electricity lever can partly cover and optimize. I’d validate it with local irradiance, subsidy eligibility, and self-consumption ratio, then keep the offer anchored to the monthly saving.`;
  }

  if (mentionsCar) {
    return "Mobility is the EV lever: add the car and charger when petrol spend can be replaced by cheap off-peak charging. In the demo this adds a smaller €7/month now, but it future-proofs the package.";
  }

  if (mentionsSolarOnly) {
    return "Electricity is the first lever: add the roof solar package, then model self-consumption, battery shifting, and dynamic tariff value together. If the home still uses oil or gas, Heating is the next strongest add.";
  }

  if (mentionsBattery) {
    return "Battery and dynamic tariff are part of the Electricity lever now. The customer toggles roof solar, while the advisor explains that the savings come from self-consumption plus cheap-hour charging and expensive-hour avoidance.";
  }

  if (mentionsFinancing) {
    return "The plan is modeled as one monthly payment: hardware, installation, monitoring, warranty, and financing. The proposal separates the loan years from the paid-off years so the long-run saving is easy to see.";
  }

  if (mentionsSubsidy) {
    return "Solara pre-checks common German incentives like BAFA, KfW, and local programs. The installer survey confirms eligibility before the final offer, so the estimate stays helpful without pretending it is already binding.";
  }

  if (mentionsAccuracy) {
    return "The estimate is strongest after address, roof size, heating type, and mobility spend are filled in. The installer then validates roof shading, grid connection, subsidy eligibility, and final tariff assumptions.";
  }

  return "I'd compare three levers: Electricity, Heating, and Mobility. Then I'd score savings certainty through local irradiance, dynamic tariff value, subsidies, and self-consumption ratio, and score household fit against electricity, heating, and mobility spend.";
}

function playCuteSound(kind: "open" | "send" | "reply") {
  if (typeof window === "undefined") return;

  try {
    const AudioCtor =
      window.AudioContext ??
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return;

    const context = new AudioCtor();
    const notes = kind === "open" ? [660, 880] : kind === "send" ? [520, 620] : [740, 980, 880];

    notes.forEach((frequency, index) => {
      const start = context.currentTime + index * 0.055;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.035, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.14);
    });
  } catch {
    // Browser audio can be unavailable in private or restricted contexts.
  }
}

export function AdvisorPet({ onStart }: Props) {
  const [open, setOpen] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const latestAdvisorText = useMemo(
    () => [...messages].reverse().find((message) => message.role === "advisor")?.text,
    [messages],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, open]);

  useEffect(
    () => () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    },
    [],
  );

  const playSound = (kind: "open" | "send" | "reply") => {
    if (soundOn) playCuteSound(kind);
  };

  const toggleOpen = () => {
    setOpen((value) => {
      const next = !value;
      if (next) playSound("open");
      return next;
    });
  };

  const sendPrompt = (value: string) => {
    const clean = value.trim();
    if (!clean || thinking) return;

    playSound("send");
    setMessages((current) => [...current, { role: "user", text: clean }]);
    setInput("");
    setOpen(true);
    setThinking(true);

    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setMessages((current) => [...current, { role: "advisor", text: buildAdvice(clean) }]);
      setThinking(false);
      playSound("reply");
    }, 650);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    sendPrompt(input);
  };

  return (
    <div className="fixed bottom-24 right-3 z-50 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2.5 md:bottom-4 md:right-4 md:max-w-[calc(100vw-2rem)] md:gap-3">
      {open && (
        <section className="chat-panel-smooth flex max-h-[calc(100svh-8rem)] w-[min(410px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[20px] border border-line bg-white shadow-2xl md:max-h-[calc(100svh-6rem)] md:rounded-[24px]">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line bg-gradient-to-r from-white to-cloover-soft/70 px-3 py-2.5 md:px-4 md:py-3">
            <div className="flex items-center gap-3">
              <div className="relative grid h-10 w-10 place-items-center rounded-full bg-ink text-white shadow-lg shadow-ink/15">
                <Bot className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-success" />
              </div>
              <div>
                <p className="text-sm font-extrabold">Solara advisor</p>
                <p className="text-xs text-muted-foreground">
                  {thinking ? "Thinking through your numbers..." : "Savings, financing, subsidies"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSoundOn((value) => !value)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-white hover:text-ink"
                aria-label={soundOn ? "Turn advisor sounds off" : "Turn advisor sounds on"}
              >
                {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-white hover:text-ink"
                aria-label="Close advisor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="max-h-[360px] space-y-3 overflow-y-auto bg-surface-soft p-4"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-ink text-white"
                      : "border border-line bg-white text-ink"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1 rounded-2xl border border-line bg-white px-4 py-3 text-sm text-muted-foreground">
                  <span className="typing-dot" />
                  <span className="typing-dot [animation-delay:120ms]" />
                  <span className="typing-dot [animation-delay:240ms]" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendPrompt(prompt)}
                  disabled={thinking}
                  className="rounded-full bg-cloover-soft px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-cloover"
                placeholder={
                  thinking ? "One moment..." : "e.g. gas heating, €180 electricity, petrol car"
                }
                disabled={thinking}
              />
              <button
                type="submit"
                disabled={thinking}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send advisor message"
              >
                {thinking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                playSound("open");
                onStart();
              }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-ink/90"
            >
              Open configurator <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {!open && latestAdvisorText && (
        <button
          type="button"
          onClick={toggleOpen}
          className="hidden max-w-[300px] rounded-2xl border border-line bg-white px-4 py-3 text-left text-sm leading-5 text-ink shadow-xl transition hover:-translate-y-0.5 hover:border-cloover md:block"
        >
          <span className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-cloover">
            <Sparkles className="h-3.5 w-3.5" />
            Advisor hint
          </span>
          {latestAdvisorText}
        </button>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className="advisor-launch flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white shadow-2xl transition hover:scale-105 hover:bg-ink/90"
        aria-label={open ? "Collapse energy advisor" : "Open energy advisor"}
      >
        {open ? <ChevronDown className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
      </button>
    </div>
  );
}
