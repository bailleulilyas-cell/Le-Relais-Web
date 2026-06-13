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
  title: "Création Site Web Artisan Ermont & Val-d'Oise | Le Relais Web",
  description:
    "On crée et on gère votre site web à Ermont et dans le Val-d'Oise. Rapide, trouvé sur Google, livré en 7 jours. Vous gardez votre métier, on s'occupe du reste.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.lerelaisweb.com/",
    title: "Création Site Web Artisan Ermont & Val-d'Oise | Le Relais Web",
    description:
      "On crée et on gère votre site web. Rapide, trouvé sur Google, livré en 7 jours. On s'occupe de tout.",
    images: ["/logo.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Création Site Web Artisan Ermont & Val-d'Oise | Le Relais Web",
    description:
      "On crée et on gère votre site web. Rapide, trouvé sur Google, livré en 7 jours. On s'occupe de tout.",
  },
  icons: { icon: "/logo.webp" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body>
        <PublicChrome footer={<Footer />}>{children}</PublicChrome>
        <RevealInit />
      </body>
    </html>
  );
}
