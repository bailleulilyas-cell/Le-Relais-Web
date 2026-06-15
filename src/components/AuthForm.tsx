"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: f.get("email"), password: f.get("password") }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Identifiants incorrects.");
        setBusy(false);
        return;
      }
      router.push(data.role === "admin" ? "/admin" : "/espace-client");
      router.refresh();
    } catch {
      setError("Connexion impossible. Réessayez.");
      setBusy(false);
    }
  };

  return (
    <div className="form-wrap">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Adresse email</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="vous@exemple.fr" />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
          />
        </div>

        {error && (
          <p style={{ color: "#B91C1C", fontSize: ".88rem", marginBottom: "1rem", fontWeight: 600 }}>
            {error}
          </p>
        )}

        <button type="submit" className="form-submit" disabled={busy}>
          {busy ? "Connexion…" : "Me connecter →"}
        </button>
        <p className="form-reassure">
          <Link href="/mot-de-passe-oublie" className="link-accent">
            Mot de passe oublié&nbsp;?
          </Link>
        </p>
      </form>

      <div className="contact-aside">
        <span style={{ fontSize: ".9rem", color: "var(--color-ink-muted)" }}>
          Pas encore client&nbsp;?
        </span>
        <Link href="/contact" className="contact-wa">
          Demander mon devis gratuit →
        </Link>
        <span style={{ fontSize: ".82rem", color: "var(--color-ink-muted)" }}>
          Votre espace est créé automatiquement avec votre demande.
        </span>
      </div>
    </div>
  );
}
