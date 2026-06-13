"use client";

import { useRef, useState } from "react";

const items = [
  {
    q: "Et si je suis nul en informatique ?",
    a: "C'est exactement pour ça qu'on est là. Vous faites votre métier, nous on fait le site. Vous n'avez aucun logiciel à apprendre, aucun mot de passe à retenir. Avec le Pack Présence, vous ne touchez à rien.",
  },
  {
    q: "400 €, ce n'est pas trop cher ?",
    a: "C'est le prix de deux mois de publicité sur les réseaux. Sauf que votre site, lui, travaille pour vous pendant des années — jour et nuit, sans qu'on le relance. Et il n'y a rien de caché : 400 € une fois, 25 € par mois, c'est tout.",
  },
  {
    q: "J'ai peur d'être bloqué avec vous.",
    a: "Sans engagement. Vous partez quand vous voulez, sans pénalité. Et le code de votre site vous appartient : vous pouvez le confier à n'importe qui. On garde nos clients parce qu'on est utiles, pas parce qu'ils sont coincés.",
  },
  {
    q: "Et si le résultat ne me plaît pas ?",
    a: "Garantie 30 jours. Si le site ne vous convient pas, on vous rembourse les 400 € de mise en service. Vous ne prenez aucun risque à essayer.",
  },
  {
    q: "C'est quoi la différence avec WordPress ou Wix ?",
    a: "Ces outils empilent des milliers de lignes inutiles : le site devient lent, et Google le pénalise. Nous, on écrit le site à la main, sans superflu. Résultat : il s'ouvre en moins d'une seconde, et vos clients ne partent pas avant qu'il s'affiche.",
  },
  {
    q: "Et si vous fermez boutique un jour ?",
    a: "Le code source de votre site vous appartient entièrement. Si un jour vous voulez le reprendre ou le confier à quelqu'un d'autre, c'est possible à tout moment. Vous n'êtes jamais dépendant de nous.",
  },
  {
    q: "En combien de temps mon site est-il prêt ?",
    a: "7 jours ouvrés pour un Pack Présence, une fois qu'on a vos informations et vos photos. Pour un Pack Pro avec espace d'administration, comptez deux à trois semaines, le temps de tout mettre en place et de vous former.",
  },
  {
    q: "Vous travaillez dans ma ville ?",
    a: "On est basés à Ermont et on se déplace dans tout le Val-d'Oise et l'Île-de-France : Argenteuil, Sannois, Eaubonne, Franconville, Enghien-les-Bains, Taverny… On connaît le tissu commercial local, et on préfère le contact en vrai.",
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const ansRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <span className="chev">+</span>
      </button>
      <div
        className="faq-a"
        ref={ansRef}
        style={{ maxHeight: open && ansRef.current ? ansRef.current.scrollHeight : 0 }}
      >
        <p>{a}</p>
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <div className="faq-wrap">
      {items.map((it) => (
        <Item key={it.q} q={it.q} a={it.a} />
      ))}
    </div>
  );
}
