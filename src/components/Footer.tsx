const WA =
  "https://wa.me/33695382157?text=Bonjour%2C%20je%20souhaite%20un%20devis%20pour%20mon%20site%20web.";

export default function Footer() {
  return (
    <>
      <div className="footer-sep" />
      <footer className="main-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src="/logo.webp" alt="Le Relais Web" width={32} height={32} />
              <span className="footer-brand-name">Le Relais Web</span>
            </div>
            <p className="footer-desc">Agence web locale — Ermont, Val-d&apos;Oise</p>
            <p className="footer-siret">SIRET 101 586 428 00019</p>
          </div>
          <div className="footer-right">
            <a href="/realisations">Réalisations</a>
            <a href="/devis">Devis gratuit</a>
            <a href="/cgv">CGV</a>
            <a href="/politique-confidentialite">Confidentialité</a>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="footer-wa">
              Nous écrire sur WhatsApp — message uniquement
            </a>
          </div>
        </div>
        <p className="footer-copy">
          © 2026 Le Relais Web · SIRET 101 586 428 00019 · Fait avec soin à Ermont
        </p>
        <p className="footer-seo">
          Création site web Ermont · Agence web Val-d&apos;Oise · Site internet artisan
          Île-de-France · Argenteuil · Sannois · Eaubonne · Franconville
        </p>
      </footer>
    </>
  );
}
