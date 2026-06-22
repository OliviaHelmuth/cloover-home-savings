export function CloverLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        {/* Cute sun + house mark */}
        <circle cx="16" cy="16" r="14" fill="#FFC857" />
        <path d="M7 19 L16 10 L25 19 L25 24 L7 24 Z" fill="#1F6FEB" />
        <rect x="14" y="18" width="4" height="6" fill="#FFF8EE" rx="1" />
        <path d="M16 7 V4 M6 16 H3 M26 16 H29 M9 9 L7 7 M23 9 L25 7" stroke="#1F6FEB" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-[22px] font-extrabold tracking-tight text-ink">Solara</span>
    </div>
  );
}
