import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/guides";

const SITE = "https://www.lerelaisweb.com";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return {
    title: `${g.titre} | Le Relais Web`,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: {
      type: "article",
      locale: "fr_FR",
      url: `${SITE}/guides/${g.slug}`,
      title: g.titre,
      description: g.description,
      images: ["/lerelaisweb_logo.png"],
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.titre,
    description: g.description,
    datePublished: g.date,
    dateModified: g.date,
    author: { "@type": "Organization", name: "Le Relais Web" },
    publisher: {
      "@type": "Organization",
      name: "Le Relais Web",
      logo: { "@type": "ImageObject", url: `${SITE}/lerelaisweb_logo.png` },
    },
    mainEntityOfPage: `${SITE}/guides/${g.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <article className="section">
        <div className="container">
          <div className="guide-body">
            <p className="guide-meta">
              <Link href="/guides" className="link-accent">Guides</Link> · {g.lecture} de lecture
            </p>
            <h1 className="ville-h1">{g.titre}</h1>
            <p className="ville-lead">{g.description}</p>
            <div dangerouslySetInnerHTML={{ __html: g.html }} />
            <div className="guide-cta">
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.3rem", color: "var(--color-ink)", marginBottom: ".5rem" }}>
                On s&apos;occupe de votre site, vous gardez votre métier.
              </h3>
              <p style={{ marginBottom: "1.2rem" }}>
                Devis gratuit, réponse sous 24h, livré en 7 jours. Sans engagement.
              </p>
              <Link href="/contact" className="btn-primary">Demander mon devis gratuit →</Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
