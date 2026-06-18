"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Fab from "@/components/Fab";

/**
 * Affiche le chrome public (navbar, footer, FAB) sur toutes les pages SAUF
 * l'espace client et l'admin, qui ont leur propre interface plein écran.
 * Le Footer (server component) est passé en prop pour rester rendu côté serveur.
 * Pas de bannière cookies : le site ne pose que des cookies strictement
 * nécessaires (session) — aucun consentement requis (cf. politique de confidentialité).
 */
export default function PublicChrome({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const bare = pathname.startsWith("/espace-client") || pathname.startsWith("/admin");

  if (bare) return <main id="contenu">{children}</main>;

  return (
    <>
      <Navbar />
      <main id="contenu">{children}</main>
      {footer}
      <Fab />
    </>
  );
}
