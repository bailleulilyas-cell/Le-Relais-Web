"use client";

import { useEffect, useState } from "react";

export default function CookieBar() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("ck")) setHidden(false);
  }, []);

  const choose = (v: "y" | "n") => {
    localStorage.setItem("ck", v);
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div className="ck-bar">
      <p className="ck-text">
        Ce site utilise des cookies (Google Fonts, Stripe).{" "}
        <a href="/politique-confidentialite">En savoir plus</a>.
      </p>
      <div className="ck-btns">
        <button className="ck-no" onClick={() => choose("n")}>
          Refuser
        </button>
        <button className="ck-yes" onClick={() => choose("y")}>
          Accepter ✓
        </button>
      </div>
    </div>
  );
}
