"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  const validToken = /^[0-9a-f]{64}$/.test(token);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setState("loading");
    try {
      const r = await fetch("/api/reset/confirme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const d = await r.json();
      if (d.ok) {
        setState("done");
        setTimeout(() => router.push("/compte"), 2200);
      } else {
        setError(d.error || "Erreur, réessayez.");
        setState("idle");
      }
    } catch {
      setError("Erreur réseau, réessayez.");
      setState("idle");
    }
  }

  if (!validToken) {
    return (
      <div className="form-card" style={{ marginTop: "1.5rem" }}>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          Ce lien est invalide ou incomplet. Refaites une demande de réinitialisation.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/mot-de-passe-oublie" style={{ color: "var(--emerald)", fontWeight: 700 }}>
            Demander un nouveau lien →
          </Link>
        </p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="form-card" style={{ marginTop: "1.5rem" }}>
        <div className="form-ok">
          Mot de passe modifié&nbsp;! Redirection vers la connexion…
        </div>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit} style={{ marginTop: "1.5rem" }}>
      <div className="field">
        <label htmlFor="password">Nouveau mot de passe</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Au moins 8 caractères"
        />
      </div>
      <div className="field">
        <label htmlFor="confirm">Confirmer le mot de passe</label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Retapez le mot de passe"
        />
      </div>
      {error && <p style={{ color: "#B91C1C", fontSize: ".85rem", fontWeight: 600, marginBottom: ".8rem" }}>{error}</p>}
      <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={state === "loading"}>
        {state === "loading" ? "Enregistrement…" : "Valider mon nouveau mot de passe"}
      </button>
    </form>
  );
}
