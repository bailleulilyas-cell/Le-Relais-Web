"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RevealInit() {
  const pathname = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.visible)"));
    if (els.length === 0) return;
    const reveal = (el: Element) => el.classList.add("visible");

    // Fallback : pas d'IntersectionObserver → on affiche tout, point.
    if (typeof IntersectionObserver === "undefined") {
      els.forEach(reveal);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => obs.observe(el));

    // Filet de sécurité : si l'observateur ne déclenche pas (onglet en arrière-plan,
    // bug navigateur…), on révèle tout au bout de 1,2 s. Le contenu n'est JAMAIS bloqué.
    const failsafe = window.setTimeout(() => els.forEach(reveal), 1200);

    return () => {
      obs.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [pathname]);
  return null;
}
