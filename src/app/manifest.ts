import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Le Relais Web — Création de sites web à Ermont",
    short_name: "Le Relais Web",
    description:
      "Création de sites web rapides pour artisans, commerçants et associations en Val-d'Oise.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F7F4",
    theme_color: "#2563EB",
    lang: "fr-FR",
    icons: [
      { src: "/logo-relais.webp", sizes: "any", type: "image/webp", purpose: "any" },
    ],
  };
}
