"use client";

import { useState } from "react";

const secteurs = [
  "Boulangerie / Pâtisserie",
  "Coiffeur / Barbier / Esthétique",
  "Restaurant / Kebab / Pizzeria",
  "Plombier / Électricien / Artisan",
  "Fleuriste / Commerce de détail",
  "Boucherie / Primeur / Alimentation",
  "Association / Club",
  "Autre",
];

export default function DevisForm() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const enseigne = String(f.get("enseigne") || "");
    const ville = String(f.get("ville") || "");
    const secteur = String(f.get("secteur") || "");
    const email = String(f.get("email") || "");
    const desc = String(f.get("description") || "");
    const txt =
      `Bonjour, je souhaite un devis pour mon site web.%0A%0A` +
      `Enseigne : ${enseigne}%0A` +
      `Ville : ${ville}%0A` +
      `Secteur : ${secteur}%0A` +
      `Email : ${email}%0A%0A` +
      `Mon projet : ${desc}`;
    window.open(`https://wa.me/33695382157?text=${encodeURIComponent(decodeURIComponent(txt))}`, "_blank", "noopener");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="form-wrap">
        <div className="form-ok">
          Votre message est prêt sur WhatsApp — il ne reste plus qu&apos;à l&apos;envoyer.
          <br />
          On vous répond sous 24h, par message. Merci&nbsp;!
        </div>
      </div>
    );
  }

  return (
    <div className="form-wrap">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="enseigne">Nom de votre commerce</label>
            <input id="enseigne" name="enseigne" type="text" autoComplete="organization" required placeholder="Ex : Boulangerie Martin" />
          </div>
          <div className="field">
            <label htmlFor="ville">Votre ville</label>
            <input id="ville" name="ville" type="text" required placeholder="Ex : Ermont" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="secteur">Votre activité</label>
          <select id="secteur" name="secteur" required defaultValue="">
            <option value="" disabled>
              Choisissez votre secteur
            </option>
            {secteurs.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="email">Votre email</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="vous@exemple.fr" />
        </div>
        <div className="field">
          <label htmlFor="description">Votre projet en quelques mots</label>
          <textarea id="description" name="description" required placeholder="Vous avez déjà un site ? Que voulez-vous mettre en avant ? Avez-vous des photos, un logo ?" />
        </div>
        <button type="submit" className="form-submit">
          Envoyer ma demande →
        </button>
        <p className="form-reassure">
          <b>Réponse sous 24h</b> · Sans engagement · Zéro spam · Votre message part sur WhatsApp
        </p>
      </form>
    </div>
  );
}
