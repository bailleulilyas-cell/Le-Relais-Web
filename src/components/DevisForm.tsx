"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const WA =
  "https://wa.me/33695382157?text=Bonjour%2C%20je%20souhaite%20un%20devis%20pour%20mon%20site%20web.";

export default function DevisForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [existsEmail, setExistsEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setExistsEmail(false);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const payload = {
      prenom: String(f.get("prenom") || ""),
      enseigne: String(f.get("enseigne") || ""),
      ville: String(f.get("ville") || ""),
      secteur: String(f.get("secteur") || ""),
      email: String(f.get("email") || ""),
      password: String(f.get("password") || ""),
      description: String(f.get("description") || ""),
    };
    try {
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.exists) setExistsEmail(true);
        setError(data.error || "Une erreur est survenue.");
        setBusy(false);
        return;
      }
      router.push("/espace-client");
      router.refresh();
    } catch {
      setError("Connexion impossible. Réessayez.");
      setBusy(false);
    }
  }

  return (
    <div className="form-wrap">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="prenom">Votre prénom</label>
            <input id="prenom" name="prenom" type="text" autoComplete="given-name" required placeholder="Ex : Karim" />
          </div>
          <div className="field">
            <label htmlFor="enseigne">Nom de votre commerce</label>
            <input id="enseigne" name="enseigne" type="text" autoComplete="organization" required placeholder="Ex : Boulangerie Martin" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="ville">Votre ville</label>
            <input id="ville" name="ville" type="text" required placeholder="Ex : Ermont" />
          </div>
          <div className="field">
            <label htmlFor="secteur">Votre activité</label>
            <select id="secteur" name="secteur" required defaultValue="">
              <option value="" disabled>Choisissez votre secteur</option>
              {secteurs.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="email">Votre email</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="vous@exemple.fr" />
        </div>
        <div className="field">
          <label htmlFor="password">Choisissez un mot de passe</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="Au moins 8 caractères" />
        </div>
        <div className="field">
          <label htmlFor="description">Votre projet en quelques mots</label>
          <textarea id="description" name="description" required placeholder="Vous avez déjà un site ? Que voulez-vous mettre en avant ? Avez-vous des photos, un logo ?" />
        </div>

        {error && (
          <p style={{ color: "#B91C1C", fontSize: ".88rem", fontWeight: 600, marginBottom: ".9rem" }}>
            {error}{" "}
            {existsEmail && (
              <Link href="/compte" style={{ color: "var(--color-accent)", fontWeight: 700 }}>
                Se connecter →
              </Link>
            )}
          </p>
        )}

        <button type="submit" className="form-submit" disabled={busy}>
          {busy ? "Création de votre espace…" : "Créer mon espace & envoyer ma demande →"}
        </button>
        <p className="form-reassure">
          <b>Réponse sous 24h</b> · Sans engagement · Votre espace client est créé aussitôt
        </p>
      </form>

      <div className="contact-aside">
        <span style={{ fontSize: ".88rem", color: "var(--color-ink-muted)" }}>
          Vous préférez par message&nbsp;?
        </span>
        <a href={WA} target="_blank" rel="noopener noreferrer" className="contact-wa">
          Écrivez-nous sur WhatsApp →
        </a>
        <span style={{ fontSize: ".85rem", color: "var(--color-ink-muted)" }}>
          Déjà client&nbsp;? <Link href="/compte" className="link-accent">Accéder à mon espace</Link>
        </span>
      </div>
    </div>
  );
}
