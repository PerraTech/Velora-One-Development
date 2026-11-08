import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { moduleStatuses, type ModuleStatus } from "@/lib/modules";

export function StatusBadge({ status }: { status: ModuleStatus }) {
  return <span className="status-badge" data-status={status}><span />{moduleStatuses[status]}</span>;
}
export function BackLink() {
  return <Link href="/portal" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Terug naar Development Hub</Link>;
}
export function Footer() {
  return <footer className="site-footer"><span>© {new Date().getFullYear()} VELORA</span><span>Luxury. Innovation. Excellence.</span><span>v0.1</span></footer>;
}

