"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Fab from "@/components/Fab";
import CookieBar from "@/components/CookieBar";

/**
 * Affiche le chrome public (navbar, footer, FAB, bandeau cookies) sur toutes les
 * pages SAUF l'espace client et l'admin, qui ont leur propre interface plein écran.
 * Le Footer (server component) est passé en prop pour rester rendu côté serveur.
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
      <CookieBar />
    </>
  );
}
