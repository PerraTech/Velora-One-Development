import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { modules } from "@/lib/modules";
import { PortalShell } from "@/components/portal-shell";
import { ModuleDetail } from "@/components/module-detail";

export function generateStaticParams() { return modules.map(module => ({ slug: module.id })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: modules.find(module => module.id === slug)?.title ?? "Module niet gevonden" };
}
export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const module = modules.find(module => module.id === slug);
  if (!module) notFound();
  return <PortalShell><ModuleDetail module={module} /></PortalShell>;
}
