import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { PortalShell } from "@/components/portal-shell";
import { ModuleCard } from "@/components/module-card";
import { modules } from "@/lib/modules";

export const metadata: Metadata = { title: "Development Hub" };
export default function PortalPage() {
  return <PortalShell><div className="portal-breadcrumb">VELORA CONNECT <span>/</span> Development Hub</div>
    <section className="hub-brand-hero" aria-label="VELORA Hospitality Technology"><Brand /></section>
    <section id="modules" className="modules-section" aria-labelledby="modules-title"><div className="section-heading"><div><p className="eyebrow">MODULES</p><h1 id="modules-title">Development Hub</h1></div><span>Software & connected hardware</span></div><div className="module-grid">{modules.map((module, index) => <ModuleCard key={module.id} module={module} index={index} />)}</div></section>
  </PortalShell>;
}

