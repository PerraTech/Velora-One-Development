import Image from "next/image";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login-form";
import { Footer } from "@/components/ui";

export default function LoginPage() {
  return <div className="login-page">
    <div className="login-background"><Image src="/images/wall-panel-concept.jpeg" alt="" fill priority sizes="100vw" /></div><div className="login-overlay" />
    <header className="login-top"><span>THE FUTURE OF PREMIUM SERVICE</span><span className="environment-label"><span /> DEVELOPMENT</span></header>
    <main id="main-content" className="login-main"><section className="login-panel" aria-labelledby="login-heading"><Brand /><div className="gold-divider" /><p className="eyebrow">WELCOME TO THE ECOSYSTEM</p><h1 id="login-heading">VELORA <span>CONNECT</span></h1><LoginForm /></section><p className="login-tagline">Exceptional hospitality. Connected.</p></main>
    <Footer />
  </div>;
}

