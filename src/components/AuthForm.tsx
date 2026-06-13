"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const switchTab = (t: "login" | "register") => {
    setTab(t);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const endpoint = tab === "login" ? "/api/connexion" : "/api/inscription";
    const payload =
      tab === "login"
        ? { email: f.get("email"), password: f.get("password") }
        : {
            prenom: f.get("prenom"),
            enseigne: f.get("enseigne"),
            email: f.get("email"),
            password: f.get("password"),
          };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Une erreur est survenue.");
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
      <div className="auth-tabs">
        <button
          className={`auth-tab${tab === "login" ? " active" : ""}`}
          onClick={() => switchTab("login")}
          type="button"
        >
          Se connecter
        </button>
        <button
          className={`auth-tab${tab === "register" ? " active" : ""}`}
          onClick={() => switchTab("register")}
          type="button"
        >
          Créer mon espace
        </button>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {tab === "register" && (
          <div className="field-row">
            <div className="field">
              <label htmlFor="prenom">Prénom</label>
              <input id="prenom" name="prenom" type="text" autoComplete="given-name" required />
            </div>
            <div className="field">
              <label htmlFor="enseigne">Nom de l&apos;enseigne</label>
              <input id="enseigne" name="enseigne" type="text" autoComplete="organization" required />
            </div>
          </div>
        )}
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
            autoComplete={tab === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
          />
        </div>

        {error && (
          <p style={{ color: "var(--danger, #b42318)", fontSize: ".85rem", marginBottom: "1rem", fontWeight: 600 }}>
            {error}
          </p>
        )}

        <button type="submit" className="form-submit" disabled={busy}>
          {busy ? "Un instant…" : tab === "login" ? "Me connecter →" : "Créer mon espace gratuit →"}
        </button>
        <p className="form-reassure">
          {tab === "login" ? (
            <>
              <Link href="/mot-de-passe-oublie" style={{ color: "var(--emerald)", fontWeight: 700 }}>
                Mot de passe oublié&nbsp;?
              </Link>
            </>
          ) : (
            <>
              Gratuit · Sans engagement · <b>Vos données restent privées</b>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
