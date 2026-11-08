import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TabletApp } from "@/components/velora-one/tablet-app";

export const metadata: Metadata = { title: "VELORA ONE Tablet Preview" };

export default function VeloraOnePreviewPage() {
  return <main id="main-content" className="one-preview-page"><div className="one-preview-toolbar"><Link href="/portal/velora-one"><ArrowLeft size={16} aria-hidden="true" />Terug naar VELORA ONE</Link><span>Frontendpreview · Lokale demosessie</span></div><TabletApp /></main>;
}
