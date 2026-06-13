"use client";

import { useState } from "react";
import { faqItems } from "@/lib/faq-data";

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <span className="chev">+</span>
      </button>
      <div className="faq-a">
        <p>{a}</p>
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <div className="faq-wrap">
      {faqItems.map((it) => (
        <Item key={it.q} q={it.q} a={it.a} />
      ))}
    </div>
  );
}
