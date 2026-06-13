import type { MetadataRoute } from "next";

const SITE = "https://www.lerelaisweb.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Zones privées et endpoints : jamais indexés
      disallow: ["/espace-client", "/admin", "/api/"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
