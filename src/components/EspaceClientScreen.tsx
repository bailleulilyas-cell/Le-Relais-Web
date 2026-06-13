"use client";

import { useEffect, useRef, useState } from "react";

const kpis = [
  { val: "99", lbl: "Score Google", sub: "↑ Excellent" },
  { val: "12 j", lbl: "Prochain paiement", sub: "25 € / mois" },
  { val: "142 ms", lbl: "Temps de réponse", sub: "↑ Rapide" },
  { val: "8", lbl: "Interventions", sub: "Ce trimestre" },
];

export default function EspaceClientScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setProgress(75), 250);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="ec-screen reveal" ref={ref}>
      <div className="ec-top">
        <span className="ec-top-t">Mon tableau de bord</span>
        <span className="ec-pill">
          <span className="dot" />
          En ligne
        </span>
      </div>
      <div className="ec-kpis">
        {kpis.map((k) => (
          <div className="ec-kpi" key={k.lbl}>
            <div className="val">{k.val}</div>
            <div className="lbl">{k.lbl}</div>
            <div className="sub">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="ec-prog-lbl">
        <span>Avancement global</span>
        <span style={{ color: "var(--signal)" }}>{progress} %</span>
      </div>
      <div className="ec-prog-bar">
        <div className="ec-prog-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
