"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminClientRow } from "@/lib/admin-data";

function badge(c: AdminClientRow) {
  if (c.nbDemandesNew > 0)
    return <span className="adm-badge dem">{c.nbDemandesNew}</span>;
  if (c.aProjet) return <span className="adm-badge actif">Actif</span>;
  if (c.paiementConfirme) return <span className="adm-badge paye">Payé</span>;
  return <span className="adm-badge prospect">Prospect</span>;
}

export default function AdminShell({
  clients,
  totalNew,
  children,
}: {
  clients: AdminClientRow[];
  totalNew: number;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();

  async function logout() {
    try {
      await fetch("/api/deconnexion", { method: "POST", credentials: "same-origin" });
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  }

  return (
    <div className="adm">
      <button className="adm-burger" onClick={() => setDrawer(true)} aria-label="Ouvrir le menu">
        <span />
        <span />
        <span />
      </button>
      {drawer && <div className="adm-backdrop" onClick={() => setDrawer(false)} />}

      <aside className={`adm-side${drawer ? " open" : ""}`}>
        <button className="adm-side-close" onClick={() => setDrawer(false)} aria-label="Fermer">
          ✕
        </button>
        <div className="adm-side-brand">
          <span className="adm-side-logo">LR</span>
          <div>
            <div className="adm-side-name">Le Relais Web</div>
            <div className="adm-side-loc">Administration</div>
          </div>
        </div>

        <Link
          href="/admin"
          className={`adm-side-dash${pathname === "/admin" ? " active" : ""}`}
          onClick={() => setDrawer(false)}
        >
          Tableau de bord
        </Link>

        <div className="adm-side-label">
          Clients ({clients.length})
          {totalNew > 0 && <span className="adm-side-notif">{totalNew} en attente</span>}
        </div>

        <div className="adm-side-list">
          {clients.length === 0 && <div className="adm-side-empty">Aucun client inscrit.</div>}
          {clients.map((c) => {
            const active = pathname === `/admin/clients/${c.id}`;
            return (
              <Link
                key={c.id}
                href={`/admin/clients/${c.id}`}
                className={`adm-side-client${active ? " active" : ""}${c.nbDemandesNew > 0 ? " has-dem" : ""}`}
                onClick={() => setDrawer(false)}
              >
                <span className="adm-side-av">{c.prenom.charAt(0).toUpperCase()}</span>
                <span className="adm-side-cinfo">
                  <span className="adm-side-cname">
                    {c.prenom} {c.nomFamille ?? ""}
                  </span>
                  <span className="adm-side-csub">{c.nomEnseigne || c.email}</span>
                </span>
                {badge(c)}
              </Link>
            );
          })}
        </div>

        <div className="adm-side-foot">
          <Link href="/" className="adm-side-back">
            ← Voir le site
          </Link>
          <button className="adm-side-logout" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="adm-main">{children}</div>
    </div>
  );
}
