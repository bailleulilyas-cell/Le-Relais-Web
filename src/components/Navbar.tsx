"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Concept" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/equipe", label: "À propos" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div
        className={`drawer-backdrop${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className={`mobile-drawer${open ? " is-open" : ""}`}>
        <div className="mob-header">
          <div className="mob-brand">
            <img src="/logo.webp" alt="Le Relais Web" width={42} height={42} />
            <div>
              <div className="mob-brand-name">Le Relais Web</div>
              <div className="mob-loc">Ermont · Val-d&apos;Oise</div>
            </div>
          </div>
          <button className="close-btn" aria-label="Fermer le menu" onClick={() => setOpen(false)}>
            &#x2715;
          </button>
        </div>
        <div className="mob-sep" />
        <nav className="mob-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="/compte" onClick={() => setOpen(false)}>
            Se connecter
          </a>
        </nav>
        <div className="mob-sep" />
        <div className="mob-bottom">
          <a href="/devis" className="mob-cta-btn" onClick={() => setOpen(false)}>
            Demander un devis
          </a>
          <p className="mob-cta-sub">Réponse sous 24h · Par message WhatsApp</p>
        </div>
      </div>

      <div className="nav-top-border" />
      <header className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="container nav-wrapper">
          <a href="/" className="brand-logo">
            <img src="/logo.webp" alt="Le Relais Web" width={40} height={40} />
            <span className="brand-txt">
              <span className="brand-name">Le Relais Web</span>
              <span className="brand-loc">Ermont · Val-d&apos;Oise</span>
            </span>
          </a>
          <nav className="nav-desktop">
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={pathname === l.href ? "active" : undefined}>
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/compte" className="btn-ghost">
                  Se connecter
                </a>
              </li>
              <li>
                <a href="/devis" className="btn-nav">
                  Demander un devis
                </a>
              </li>
            </ul>
          </nav>
          <div className="nav-mobile">
            <a href="/devis" className="btn-nav-m">
              Devis
            </a>
            <button
              className={`burger${open ? " is-open" : ""}`}
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
