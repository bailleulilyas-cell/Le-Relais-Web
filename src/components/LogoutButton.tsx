"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    await fetch("/api/deconnexion", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <button className="btn-secondary" onClick={logout} disabled={busy} style={{ cursor: "pointer" }}>
      {busy ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
