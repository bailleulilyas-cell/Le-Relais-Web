import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import PublicChrome from "@/components/PublicChrome";
import RevealInit from "@/components/RevealInit";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lerelaisweb.com"),
  title: "Création site web sur-mesure — Ermont, Val-d'Oise | Le Relais Web",
  description:
    "Vitrine ou site avec back-office : code sur-mesure, 100/100 sur Google, livré en 7 jours. Pour artisans, commerçants et associations — Val-d'Oise.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.lerelaisweb.com/",
    title: "Création site web sur-mesure — Ermont, Val-d'Oise | Le Relais Web",
    description:
      "Code sur-mesure, 100/100 sur Google, livré en 7 jours. On s'occupe de tout.",
    images: ["/lerelaisweb_logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Création site web sur-mesure — Ermont, Val-d'Oise | Le Relais Web",
    description:
      "Code sur-mesure, 100/100 sur Google, livré en 7 jours. On s'occupe de tout.",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body>
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <PublicChrome footer={<Footer />}>{children}</PublicChrome>
        <RevealInit />
      </body>
    </html>
  );
}
