import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PortalModule } from "@/lib/modules";
import { StatusBadge } from "@/components/ui";

export function ModuleCard({ module, index }: { module: PortalModule; index: number }) {
  const Icon = module.icon;
  return <Link className="module-card group" href={`/portal/${module.id}`}>
    <div className="card-image"><Image src={module.images[0].src} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" /><span className="card-number">0{index + 1}</span><span className="card-launch"><ArrowUpRight size={19} aria-hidden="true" /></span></div>
    <div className="card-content"><div className="card-category"><Icon size={16} aria-hidden="true" />{module.category}</div><h3>{module.title}</h3><p>{module.description}</p><div className="card-bottom"><StatusBadge status={module.status} /><span>Module bekijken <ArrowUpRight size={14} aria-hidden="true" /></span></div></div>
  </Link>;
}

