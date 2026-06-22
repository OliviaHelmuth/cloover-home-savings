import { ShieldCheck, Award, Leaf, Lock, Star } from "lucide-react";
import { CloverLogo } from "./Logo";

const COLUMNS = [
  {
    title: "Solutions",
    links: ["Solar panels", "Battery storage", "Heat pumps", "EV charging", "Smart tariff"],
  },
  {
    title: "Company",
    links: ["About Solara", "Press & news", "Careers", "Partners", "Sustainability"],
  },
  {
    title: "Support",
    links: ["FAQ", "Help center", "Installation guide", "Warranty", "Contact us"],
  },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "TÜV audited" },
  { icon: Award, label: "BAFA certified" },
  { icon: Leaf, label: "EU Green Deal" },
  { icon: Lock, label: "GDPR secure" },
];

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line bg-surface-soft text-ink">
      {/* Trust strip */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6">
          <div className="flex items-center gap-2 text-sm font-bold">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-sunshine text-sunshine" />
              ))}
            </div>
            <span>4.8 / 5 · 12,400+ German homes</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-extrabold uppercase tracking-wider text-cloover">
              {col.title}
            </p>
            <ul className="mt-3 space-y-2 text-sm font-medium text-ink/80">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-cloover">
                    {link}
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
