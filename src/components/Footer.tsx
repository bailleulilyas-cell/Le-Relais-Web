import Link from "next/link";

const WA =
  "https://wa.me/33695382157?text=Bonjour%2C%20je%20souhaite%20un%20devis%20pour%20mon%20site%20web.";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link href="/" className="footer-logo" aria-label="Le Relais Web — accueil">
              <img src="/logo.webp" alt="Le Relais Web" width={120} height={66} />
            </Link>
            <p className="footer-tag">
              Votre partenaire digital local. On crée des sites web rapides pour les commerçants
              d&apos;Ermont et du Val-d&apos;Oise.
            </p>
          </div>

          <div className="footer-col">
            <h4>Navigation</h4>
            <Link href="/">Accueil</Link>
            <Link href="/services">Services</Link>
            <Link href="/contact">Demander un devis</Link>
            <a href={WA} target="_blank" rel="noopener noreferrer">
              WhatsApp — par message
            </a>
          </div>

          <div className="footer-col">
            <h4>Informations</h4>
            <Link href="/cgv">Conditions générales</Link>
            <Link href="/politique-confidentialite">Confidentialité</Link>
            <Link href="/compte">Espace client</Link>
            <a
              href="https://annuaire-entreprises.data.gouv.fr/entreprise/101586428"
              target="_blank"
              rel="noopener noreferrer"
            >
              SIRET 101 586 428 00019
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Le Relais Web — Ermont, Val-d&apos;Oise</span>
          <span>Création site web Ermont · Val-d&apos;Oise · Île-de-France</span>
        </div>
      </div>
    </footer>
  );
}
