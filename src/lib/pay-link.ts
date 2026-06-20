/**
 * Construit un lien de paiement Stripe rattaché à un client précis.
 *
 * - `prefilled_email` : pré-remplit l'email sur la page Stripe (confort).
 * - `client_reference_id` : identifiant interne du client, NON modifiable par
 *   le visiteur sur la page de paiement. C'est lui qui garantit que le paiement
 *   est attribué au bon compte, même si le client change l'email.
 *
 * Le webhook (`checkout.session.completed`) lit en priorité ce
 * `client_reference_id` pour retrouver le client, et retombe sur l'email sinon.
 */
export function buildPayLink(
  url: string | null | undefined,
  email: string | null | undefined,
  clientRef: number | string | null | undefined
): string {
  if (!url) return "";
  const params = new URLSearchParams();
  if (email) params.set("prefilled_email", email);
  if (clientRef) params.set("client_reference_id", String(clientRef));
  const qs = params.toString();
  if (!qs) return url;
  return url + (url.includes("?") ? "&" : "?") + qs;
}
