import nodemailer from "nodemailer";

/**
 * Envoi d'emails transactionnels via SMTP (Hostinger).
 * Variables d'env : SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.
 * Si non configuré → ne plante pas : log + renvoie false (dégradation propre).
 */

let transporter: nodemailer.Transporter | null = null;
let configured: boolean | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (configured === false) return null;
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    configured = false;
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass },
  });
  configured = true;
  return transporter;
}

export function mailFrom(): string {
  return process.env.SMTP_FROM ?? "Le Relais Web <noreply@lerelaisweb.com>";
}

/** Boîte personnelle d'Ilyas — reçoit TOUTES les notifications internes. */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "bailleulilyas@gmail.com";
/** Boîte de l'agence — reçoit en plus les devis et demandes de modification. */
export const PROJET_EMAIL = process.env.TEAM_EMAIL ?? "contact@lerelaisweb.com";

/**
 * Notifie l'équipe d'un événement interne.
 * Tout part vers ADMIN_EMAIL ; `alsoProjet` ajoute la boîte de l'agence
 * (contact@lerelaisweb.com) — réservé aux nouveaux devis et demandes de modification.
 */
export async function notifyAdmin(opts: {
  subject: string;
  html: string;
  alsoProjet?: boolean;
  replyTo?: string;
}): Promise<boolean> {
  const to = opts.alsoProjet ? `${ADMIN_EMAIL}, ${PROJET_EMAIL}` : ADMIN_EMAIL;
  return sendMail({ to, subject: opts.subject, html: opts.html, replyTo: opts.replyTo });
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.warn(`[mail] SMTP non configuré — email non envoyé à ${opts.to} (« ${opts.subject} »)`);
    return false;
  }
  try {
    await t.sendMail({
      from: mailFrom(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    return true;
  } catch (e) {
    console.error("[mail] échec d'envoi:", e);
    return false;
  }
}

/** Gabarit HTML simple et cohérent avec l'identité (crème + émeraude). */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#F6F1E7;font-family:Arial,Helvetica,sans-serif;color:#14243B;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="font-family:Georgia,serif;font-weight:bold;font-size:20px;color:#0B6E4F;margin-bottom:4px;">Le Relais Web</div>
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#0B6E4F;margin-bottom:24px;">Ermont · Val-d'Oise</div>
    <div style="background:#fff;border:1px solid #e6e0d4;border-radius:14px;padding:24px;">
      <h1 style="font-family:Georgia,serif;font-size:20px;margin:0 0 14px;color:#14243B;">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="font-size:12px;color:#9b958a;margin-top:20px;text-align:center;">Le Relais Web — Thierry Bailleul · SIRET 101 586 428 00019<br>contact@lerelaisweb.com</p>
  </div></body></html>`;
}
