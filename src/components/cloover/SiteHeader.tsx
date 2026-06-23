import { Menu } from "lucide-react";
import { useState } from "react";
import { CloverLogo } from "./Logo";

const NAV_ITEMS = [
  { label: "How it works", href: "/#how" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Savings", href: "/#savings" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-6">
        <a
          href="/"
          className="flex shrink-0 items-center rounded-full outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-cloover focus-visible:ring-offset-2"
          aria-label="Go to Solara landing page"
        >
          <CloverLogo />
        </a>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink/75 transition hover:bg-cloover-soft hover:text-cloover"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="tel:+498000000000"
            className="hidden rounded-full border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink/80 transition hover:border-cloover/40 hover:text-cloover md:inline-flex"
          >
            ☎ 0800 000 000
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-white px-5 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-ink/80 hover:bg-cloover-soft hover:text-cloover"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
