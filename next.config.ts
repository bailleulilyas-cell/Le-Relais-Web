import type { NextConfig } from "next";

// CSP statique — compatible avec la génération statique (les pages publiques sont
// prérendues, donc pas de nonce par requête possible). 'unsafe-inline' pour les
// scripts est le compromis standard d'un site statique Next ; toutes les autres
// directives restent strictes.
const dev = process.env.NODE_ENV !== "production";
const csp = [
  `default-src 'self'`,
  // 'unsafe-eval' uniquement en dev (HMR). En prod : 'self' + 'unsafe-inline'.
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self'`,
  `connect-src 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-src 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

// En-têtes de sécurité appliqués à toutes les routes.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Force HTTPS pendant 2 ans, sous-domaines inclus, éligible preload.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Empêche le navigateur de deviner le type MIME (anti drive-by).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Anti-clickjacking (en plus de frame-ancestors dans la CSP).
  { key: "X-Frame-Options", value: "DENY" },
  // Ne fuite pas l'URL complète vers les sites tiers.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Coupe l'accès aux API sensibles du navigateur.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Isolation d'origine (limite les attaques cross-origin type Spectre).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  // Ne pas révéler que le site tourne sous Next.js.
  poweredByHeader: false,
  // Permet l'upload d'un PDF de facture (base64) via les server actions admin.
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
