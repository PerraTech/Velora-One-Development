import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/portal" className={compact ? "brand brand-compact" : "brand"} aria-label="VELORA — naar het portaal">
    <svg viewBox="0 0 62 48" fill="none" aria-hidden="true"><path d="M3 3h14l25 33-8 11L3 3Z" fill="currentColor"/><path d="M23 3h13l9 12-7 10L23 3Zm23 0h14L46 22l-7-9 7-10Z" fill="currentColor"/></svg>
    <span><span className="brand-name">VELORA</span><span className="brand-caption">HOSPITALITY TECHNOLOGY</span></span>
  </Link>;
}

