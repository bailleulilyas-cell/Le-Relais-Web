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

/** Tarifs (en centimes) — source unique de vérité. */
export const PRIX_MISE_EN_SERVICE = 40000; // 400 €
export const PRIX_ABONNEMENT_MENSUEL = 2500; // 25 €/mois
