import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";

const SITE = "https://www.lerelaisweb.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  type Entry = {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  };

  // Pages publiques principales (espace client / admin = privés, non indexés)
  const pages: Entry[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.9, changeFrequency: "monthly" },
    { path: "/guides", priority: 0.6, changeFrequency: "monthly" },
    { path: "/cgv", priority: 0.3, changeFrequency: "yearly" },
    { path: "/politique-confidentialite", priority: 0.3, changeFrequency: "yearly" },
  ];

  // Guides / blog
  for (const g of GUIDES) {
    pages.push({ path: `/guides/${g.slug}`, priority: 0.6, changeFrequency: "yearly" });
  }

  // Démos (portfolio statique servi depuis /public/demos)
  const demos = ["demo-boulangerie.html", "demo-coiffeur.html", "demo-kebab.html"];
  for (const d of demos) {
    pages.push({ path: `/demos/${d}`, priority: 0.5, changeFrequency: "yearly" });
  }

  return pages.map((p) => ({
    url: `${SITE}${p.path}`,
    lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
