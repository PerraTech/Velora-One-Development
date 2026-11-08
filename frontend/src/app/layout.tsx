import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: { default: "VELORA CONNECT | Interne omgeving", template: "%s | VELORA CONNECT" }, description: "Het interne development portaal voor het VELORA hospitality ecosysteem. Interactieve demo.", robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body><a className="skip-link" href="#main-content">Naar de inhoud</a>{children}</body></html>;
}

