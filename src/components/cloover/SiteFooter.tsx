import {
  ShieldCheck,
  Award,
  Leaf,
  Lock,
  Star,
  BadgeCheck,
  PiggyBank,
  HeartHandshake,
  Headphones,
  FileCheck2,
} from "lucide-react";
import { CloverLogo } from "./Logo";

const COLUMNS = [
  {
    title: "Solutions",
    links: [
      { label: "Solar panels", href: "/#solutions" },
      { label: "Battery storage", href: "/#solutions" },
      { label: "Heat pumps", href: "/#solutions" },
      { label: "EV charging", href: "/#solutions" },
      { label: "Smart tariff", href: "/#solutions" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Customer savings", href: "/#savings" },
      { label: "Reviews", href: "/#reviews" },
      { label: "Press & news", href: "/#reviews" },
      { label: "Careers", href: "/#how" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Help center", href: "/#faq" },
      { label: "Installation guide", href: "/#how" },
      { label: "Warranty & guarantees", href: "/#trust" },
      { label: "Contact us", href: "/#faq" },
    ],
  },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "TÜV audited" },
  { icon: Award, label: "BAFA certified" },
  { icon: Leaf, label: "EU Green Deal" },
  { icon: Lock, label: "GDPR secure" },
  { icon: BadgeCheck, label: "ISO 27001 (in audit)" },
  { icon: FileCheck2, label: "Master installer network" },
];

const GUARANTEES = [
  { icon: PiggyBank, title: "Savings guarantee", text: "If your year-one savings fall short, we credit the difference." },
  { icon: HeartHandshake, title: "25-year warranty", text: "Panels and inverter covered by full manufacturer warranty." },
  { icon: Headphones, title: "Local support", text: "German-speaking team, monitoring 24/7, response under 4h." },
];

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line bg-surface-soft text-ink">
      {/* Guarantees / trust strip */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-3 md:px-6">
          {GUARANTEES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cloover-soft text-cloover">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-ink">{title}</p>
                <p className="text-xs leading-5 text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6">
          <div className="flex items-center gap-2 text-sm font-bold">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-sunshine text-sunshine" />
              ))}
            </div>
            <span>4.8 / 5 · 12,400+ German homes installed</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-soft px-3 py-1.5 text-xs font-bold text-ink/80"
              >
                <Icon className="h-3.5 w-3.5 text-cloover" /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Press / partner ribbon */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground md:px-6">
          <span className="text-ink/60">As featured in</span>
          <span>Handelsblatt</span>
          <span>Süddeutsche</span>
          <span>WirtschaftsWoche</span>
          <span>Manager Magazin</span>
          <span>tagesschau</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:px-6">
        <div>
          <CloverLogo />
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Solara helps German homeowners go solar with one transparent monthly plan — financing,
            installation and savings, included.
          </p>
          <p className="mt-4 text-xs font-semibold text-ink/70">
            Solara GmbH · Friedrichstraße 12 · 10117 Berlin
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            HRB 123456 · USt-IdNr DE123456789
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-extrabold uppercase tracking-wider text-cloover">
              {col.title}
            </p>
            <ul className="mt-3 space-y-2 text-sm font-medium text-ink/80">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-cloover">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-muted-foreground md:px-6">
          <p>© {new Date().getFullYear()} Solara GmbH — All savings figures are estimates.</p>
          <div className="flex gap-4 font-semibold">
            <a href="#" className="hover:text-cloover">Imprint</a>
            <a href="#" className="hover:text-cloover">Privacy</a>
            <a href="#" className="hover:text-cloover">Terms</a>
            <a href="#" className="hover:text-cloover">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
