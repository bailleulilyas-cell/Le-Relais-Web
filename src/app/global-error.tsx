"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          background: "#F6F1E7",
          color: "#14243B",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: "1.6rem", marginBottom: ".6rem" }}>Une erreur est survenue.</h1>
          <p style={{ color: "#5C6470", marginBottom: "1.4rem", lineHeight: 1.6 }}>
            Le site rencontre un problème. Réessayez dans un instant.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#0B6E4F",
              color: "#fff",
              border: "none",
              padding: ".8rem 1.5rem",
              borderRadius: 11,
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
