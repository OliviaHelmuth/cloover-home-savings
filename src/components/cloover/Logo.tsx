export function CloverLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
        <path d="M2 11 L11 2 L14 5 L8 11 L14 17 L11 20 Z" fill="#E8754F" />
        <path d="M14 11 L23 2 L26 5 L20 11 L26 17 L23 20 Z" fill="#E8754F" />
      </svg>
      <span className="text-[22px] font-bold tracking-tight text-ink">Solara</span>
    </div>
  );
}
