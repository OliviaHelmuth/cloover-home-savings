import { FormEvent, useMemo, useState } from "react";
import { Bot, ChevronDown, Send, Sparkles, X } from "lucide-react";

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
    text: "Hi, I’m your energy advisor. Tell me what you pay for electricity, heating, or petrol and I’ll point you to the strongest upgrade path.",
  },
  {
    role: "advisor",
    text: "Quick read: start with Electricity, then add Heating if you still use oil or gas, and Mobility if petrol spend is meaningful.",
  },
];

const quickPrompts = [
  "I heat with oil and pay €220/month",
  "I have a petrol car",
  "Is solar only enough?",
];

function buildAdvice(input: string) {
  const text = input.toLowerCase();
  const mentionsOilOrGas = /oil|gas|heating|heat|boiler/.test(text);
  const mentionsCar = /petrol|diesel|car|ev|charger|mobility/.test(text);
  const mentionsSolarOnly = /solar only|only solar|pv only|just solar/.test(text);
  const mentionsBattery = /battery|storage|tariff|dynamic/.test(text);
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

  return "I’d compare three levers: Electricity, Heating, and Mobility. Then I’d score savings certainty through local irradiance, dynamic tariff value, subsidies, and self-consumption ratio, and score household fit against electricity, heating, and mobility spend.";
}

export function AdvisorPet({ onStart }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [input, setInput] = useState("");

  const latestAdvisorText = useMemo(
    () => [...messages].reverse().find((message) => message.role === "advisor")?.text,
    [messages],
  );

  const sendPrompt = (value: string) => {
    const clean = value.trim();
    if (!clean) return;

    setMessages((current) => [
      ...current,
      { role: "user", text: clean },
      { role: "advisor", text: buildAdvice(clean) },
    ]);
    setInput("");
    setOpen(true);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    sendPrompt(input);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
      {open && (
        <section className="w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-line bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
                <Bot className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-success" />
              </div>
              <div>
                <p className="text-sm font-extrabold">Energy Advisor</p>
                <p className="text-xs text-muted-foreground">Upsell and savings guide</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-surface-soft hover:text-ink"
              aria-label="Close advisor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto bg-surface-soft p-4">
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
          </div>

          <div className="border-t border-line bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendPrompt(prompt)}
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
                placeholder="e.g. gas heating, €180 electricity, petrol car"
              />
              <button
                type="submit"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:bg-ink/90"
                aria-label="Send advisor message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <button
              type="button"
              onClick={onStart}
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
          onClick={() => setOpen(true)}
          className="hidden max-w-[300px] rounded-2xl border border-line bg-white px-4 py-3 text-left text-sm leading-5 text-ink shadow-xl transition hover:border-cloover md:block"
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
        onClick={() => setOpen((value) => !value)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white shadow-2xl transition hover:scale-105 hover:bg-ink/90"
        aria-label={open ? "Collapse energy advisor" : "Open energy advisor"}
      >
        {open ? <ChevronDown className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
      </button>
    </div>
  );
}
