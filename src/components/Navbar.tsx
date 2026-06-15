"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav-inner">
        <Link href="/" className="nav-logo" aria-label="Le Relais Web — accueil">
          <img src="/logo.webp" alt="Le Relais Web" width={84} height={46} />
        </Link>
        <nav className="nav-links" aria-label="Navigation principale">
          <Link href="/services" className={pathname === "/services" ? "active" : undefined}>
            Services
          </Link>
          <Link href="/contact" className="btn-outline-accent">
            Demander un devis
          </Link>
        </nav>
        {/* Mobile : bouton devis uniquement (Services accessible via la page et le footer) */}
        <Link href="/contact" className="btn-outline-accent nav-cta-mobile">
          Devis
        </Link>
      </div>
    </header>
  );
}
