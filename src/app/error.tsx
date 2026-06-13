"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Trace côté client pour diagnostic (pas de détail exposé à l'utilisateur).
    console.error(error);
  }, [error]);

  return (
    <div className="page-hero">
      <div className="container" style={{ textAlign: "center", maxWidth: 620 }}>
        <span className="eyebrow" style={{ justifyContent: "center" }}>
          Oups
        </span>
        <h1>Une erreur est survenue.</h1>
        <p>
          Quelque chose n&apos;a pas fonctionné de notre côté. Réessayez — et si ça persiste,
          écrivez-nous, on règle ça vite.
        </p>
        <div className="cta-group" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          <button className="btn-primary" onClick={reset}>
            Réessayer
          </button>
          <a
            href="https://wa.me/33695382157?text=Bonjour%2C%20j%27ai%20rencontr%C3%A9%20une%20erreur%20sur%20le%20site."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Nous écrire sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
