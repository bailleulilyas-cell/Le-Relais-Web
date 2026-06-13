import type { MetadataRoute } from "next";

const SITE = "https://www.lerelaisweb.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Pages publiques uniquement (espace client / admin = privés, non indexés)
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/realisations", priority: 0.9, changeFrequency: "monthly" },
    { path: "/devis", priority: 0.9, changeFrequency: "monthly" },
    { path: "/equipe", priority: 0.7, changeFrequency: "monthly" },
    { path: "/compte", priority: 0.5, changeFrequency: "yearly" },
    { path: "/cgv", priority: 0.3, changeFrequency: "yearly" },
    { path: "/politique-confidentialite", priority: 0.3, changeFrequency: "yearly" },
  ];

  return pages.map((p) => ({
    url: `${SITE}${p.path}`,
    lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
