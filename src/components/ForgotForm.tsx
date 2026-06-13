"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const r = await fetch("/api/reset/demande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      setMessage(d.message || "Demande envoyée.");
      setState("done");
    } catch {
      setMessage("Demande envoyée. Vérifiez vos emails (et vos spams).");
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <div className="form-card" style={{ marginTop: "1.5rem" }}>
        <div className="form-ok">{message}</div>
        <p style={{ marginTop: "1rem", fontSize: ".88rem" }}>
          <Link href="/compte" style={{ color: "var(--emerald)", fontWeight: 700 }}>
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit} style={{ marginTop: "1.5rem" }}>
      <div className="field">
        <label htmlFor="email">Votre email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.fr"
        />
      </div>
      <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={state === "loading"}>
        {state === "loading" ? "Envoi…" : "Envoyer le lien"}
      </button>
      <p style={{ marginTop: "1rem", fontSize: ".88rem", textAlign: "center" }}>
        <Link href="/compte" style={{ color: "var(--muted)", fontWeight: 600 }}>
          ← Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
