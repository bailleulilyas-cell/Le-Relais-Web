import Stripe from "stripe";

/**
 * Client Stripe (lazy singleton).
 * Lit STRIPE_SECRET_KEY depuis l'environnement — jamais en dur dans le code.
 * Renvoie null si la clé n'est pas configurée (l'appelant gère l'erreur proprement).
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  return _stripe;
}

export const STRIPE_WEBHOOK_SECRET = () => process.env.STRIPE_WEBHOOK_SECRET ?? "";

/** URL absolue de l'app (pour les redirections Stripe success/cancel). */
export function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

/** Tarifs (en centimes) — source unique de vérité.
 *  Pack Présence par défaut. TODO Phase Stripe : paramétrer par pack
 *  (Pro = 120000 mise en service + 4000/mois). */
export const PRIX_MISE_EN_SERVICE = 55000; // 550 €
export const PRIX_ABONNEMENT_MENSUEL = 2500; // 25 €/mois
export const PRIX_PRO_MISE_EN_SERVICE = 120000; // 1 200 €
export const PRIX_PRO_ABONNEMENT_MENSUEL = 4000; // 40 €/mois

/** Liens de paiement Stripe (Payment Links), par pack et par phase.
 *  Phase 1 = mise en service (au début) · Phase 2 = abonnement (après « terminé »). */
export const STRIPE_LINKS = {
  presence: {
    creation: "https://buy.stripe.com/bJedRa2rfeIFf4G2za1VK02",
    abonnement: "https://buy.stripe.com/8x29AUgi56c9aOq4Hi1VK03",
  },
  pro: {
    creation: "https://buy.stripe.com/6oU28se9X2ZX09M7Tu1VK04",
    abonnement: "https://buy.stripe.com/8x2fZic1P4412hUehS1VK05",
  },
} as const;
