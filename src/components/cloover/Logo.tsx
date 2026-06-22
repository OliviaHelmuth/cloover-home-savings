export function CloverLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        {/* Sun + roof + leaf */}
        <circle cx="16" cy="16" r="14" fill="#E3EFFF" />
        <path d="M16 7 V4 M6 16 H3 M26 16 H29 M9 9 L7 7 M23 9 L25 7" stroke="#1F6FEB" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 20 L16 11 L25 20 L25 25 L7 25 Z" fill="#1F6FEB" />
        <path d="M19 17 C21 15 24 15 26 14 C25 17 24 19 21 20 Z" fill="#2EA36B" />
        <rect x="14" y="19" width="4" height="6" fill="#F4FAFF" rx="1" />
      </svg>
      <span className="text-[22px] font-extrabold tracking-tight text-ink">Solara</span>
    </div>
  );
}
