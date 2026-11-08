"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import { Brand } from "@/components/brand";
import { Footer } from "@/components/ui";
import { signOutMock } from "@/lib/mock-login";

export function PortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  function logout() {
    signOutMock();
    router.replace("/login");
  }

  return <div className="portal-shell">
    <header className="site-header"><Brand compact /><nav aria-label="Hoofdnavigatie"><Link href="/portal" className="nav-current"><LayoutGrid size={15} aria-hidden="true" /> Development hub</Link></nav><div className="portal-account"><button type="button" onClick={logout} className="exit-link">Uitloggen <ArrowUpRight size={15} aria-hidden="true" /></button></div></header>
    <main id="main-content" className="portal-main">{children}</main>
    <Footer />
  </div>;
}

