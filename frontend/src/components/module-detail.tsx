import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PortalModule } from "@/lib/modules";
import { getImplementedPreviewPath } from "@/lib/preview-routes";
import { BackLink, StatusBadge } from "@/components/ui";
import { ModuleGallery } from "@/components/module-gallery";
import { TabletSimulator } from "@/components/velora-one/tablet-simulator";

export function ModuleDetail({ module }: { module: PortalModule }) {
  const Icon = module.icon;
  const previewPath = getImplementedPreviewPath(module);
  return <><BackLink /><section className="development-panel" aria-labelledby="module-title">
    <div className="development-copy">
      <p className="eyebrow"><Icon size={17} aria-hidden="true" />{module.category}</p>
      <StatusBadge status={module.status} />
      <h1 id="module-title">{module.title}</h1>
      <p className="development-intro">{module.description}</p>
      <div className="module-features"><h2>Beoogde functies</h2><ul>{module.features.map(feature => <li key={feature}>{feature}</li>)}</ul></div>
      <dl className="module-metadata"><div><dt>Module-ID</dt><dd>{module.id}</dd></div><div><dt>Referentiebeelden</dt><dd>{module.images.length}</dd></div></dl>
      {module.id === "velora-one" && previewPath ? <TabletSimulator /> : previewPath && <Link className="module-preview-link" href={previewPath}>Open frontend <ArrowUpRight size={16} aria-hidden="true" /></Link>}
      <p className="development-note">{previewPath ? "Interactieve frontendpreview · Gesimuleerde gegevens, geen actieve koppelingen." : "Conceptreferenties · Geen werkende frontend of actieve koppelingen."}</p>
    </div>
    <ModuleGallery images={module.images} title={module.title} />
  </section></>;
}
