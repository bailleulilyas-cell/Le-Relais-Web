# Déploiement — Le Relais Web (Next.js → Vercel)

Guide pas-à-pas pour mettre le site en ligne sur `www.lerelaisweb.com`.
L'ancien site PHP reste en ligne sur Hostinger **jusqu'à la bascule DNS finale** (étape 5) — aucune coupure.

---

## 0. Avant de commencer — secrets à régénérer

> ⚠️ La clé Stripe `sk_live` actuelle a été exposée. **Avant la prod** :
> 1. dashboard.stripe.com → Développeurs → Clés API → **« Roll »** la clé secrète live, copier la nouvelle.
> 2. Idéalement changer le mot de passe MySQL Hostinger (hPanel → Bases de données).

Préparer ces valeurs (on les colle dans Vercel à l'étape 2, **jamais dans le code**) :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | `mysql://u430582688_ilyas:MOTDEPASSE@srv1787.hstgr.io:3306/u430582688_LRW_users` |
| `SESSION_SECRET` | valeur aléatoire — générer avec `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `STRIPE_SECRET_KEY` | la **nouvelle** clé `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (obtenu à l'étape 4) |
| `APP_URL` | `https://www.lerelaisweb.com` |
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `noreply@lerelaisweb.com` |
| `SMTP_PASS` | mot de passe du compte email (hPanel > Emails) |
| `SMTP_FROM` | `Le Relais Web <noreply@lerelaisweb.com>` |

> 💡 Sans `SMTP_PASS`, le site fonctionne mais n'envoie aucun email (bienvenue,
> réinitialisation de mot de passe, notification de devis sont alors désactivés proprement).

---

## 1. Mettre le code sur GitHub

Vercel déploie depuis un dépôt Git.

```bash
# depuis le dossier lerelaisweb-next
git add -A
git commit -m "Site Next.js prêt pour la production"
# créer un dépôt vide sur github.com (privé), puis :
git remote add origin https://github.com/TON-COMPTE/lerelaisweb.git
git push -u origin master
```

---

## 2. Créer le projet Vercel

1. vercel.com → **Add New → Project** → importer le dépôt GitHub.
2. Framework détecté automatiquement : **Next.js** (ne rien changer).
3. **Environment Variables** : ajouter **toutes** les variables du tableau de l'étape 0
   (pour les 3 environnements : Production, Preview, Development).
   > Pour le **premier test Stripe**, mets d'abord les clés de **test** (`sk_test_...` +
   > `whsec_...` du endpoint de test). Une fois le paiement validé, tu remplaces par les clés **live**.
4. **Deploy**. Au bout d'~1 min, le site est accessible sur une URL `*.vercel.app`.
5. Tester cette URL : page d'accueil, `/compte` (connexion), `/admin` (avec le compte admin).

> Le plan **Hobby est interdit pour un usage commercial** → passer le compte/projet en **Vercel Pro** (~20 €/mois).

---

## 3. Brancher le domaine `lerelaisweb.com`

1. Projet Vercel → **Settings → Domains** → ajouter `www.lerelaisweb.com` **et** `lerelaisweb.com`.
2. Vercel affiche les enregistrements DNS à créer. Chez le registrar du domaine
   (ou Hostinger → DNS si le domaine y est géré) :
   - `www` → **CNAME** vers `cname.vercel-dns.com`
   - `@` (racine) → **A** vers l'IP indiquée par Vercel (souvent `76.76.21.21`)
3. Configurer la racine pour rediriger vers `www` (Vercel le propose en un clic).
4. Attendre la propagation DNS (quelques minutes à quelques heures). Vercel émet le HTTPS (Let's Encrypt) automatiquement.

> 💡 Tant que le DNS pointe encore vers Hostinger, l'ancien site PHP reste servi. La bascule est instantanée une fois le DNS changé.

---

## 4. Configurer le webhook Stripe

1. dashboard.stripe.com → **Développeurs → Webhooks → Ajouter un endpoint**.
2. URL : `https://www.lerelaisweb.com/api/stripe/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copier le **secret de signature** (`whsec_...`) → le mettre dans la variable
   `STRIPE_WEBHOOK_SECRET` sur Vercel, puis **redéployer** (Vercel → Deployments → Redeploy).

---

## 5. Factures PDF

Les factures PDF téléchargeables dans l'espace client sont **générées par le site**
(`/api/facture/[id]`, avec SIRET + « TVA non applicable, art. 293 B du CGI ») — elles
fonctionnent dès qu'une facture existe, sans dépendre de Stripe.

Optionnel — pour que les **emails de reçu envoyés par Stripe** soient eux aussi propres :
dashboard.stripe.com → **Paramètres → Facturation → Modèle de facture** : renseigner nom,
adresse Ermont (95120), **SIRET 101 586 428 00019** et la mention TVA.

Les factures (mise en service + chaque mensualité) sont créées **automatiquement** par le
webhook à chaque paiement, et téléchargeables depuis l'espace client et l'admin.

---

## 6. Checklist post-déploiement

- [ ] Page d'accueil + toutes les pages publiques s'affichent sur `www.lerelaisweb.com`
- [ ] HTTPS actif (cadenas), `lerelaisweb.com` redirige vers `www`
- [ ] Inscription → connexion → espace client fonctionnent
- [ ] Connexion admin (`/admin`) → tableau de bord + gestion client
- [ ] **Changer le mot de passe du compte admin de test** (`admin@lerelaisweb.com`)
- [ ] Paiement test bout-en-bout avec une carte test Stripe (`4242 4242 4242 4242`)
      avant de communiquer le site → vérifier que la facture PDF remonte dans l'espace client
- [ ] `sitemap.xml` et `robots.txt` accessibles (`/sitemap.xml`, `/robots.txt`)
- [ ] Soumettre le sitemap dans Google Search Console
- [ ] Une demande de devis crée bien un compte + l'envoie en notification (vérifier `SMTP_PASS`)
- [ ] Brancher la tarification par pack au checkout (550€ Présence / 1 200€ Pro) avant d'encaisser du réel

---

## Notes techniques

- **Région Vercel** : `cdg1` (Paris) — fixée dans `vercel.json` pour minimiser la latence
  vers la BDD MySQL Hostinger (Europe).
- **Connexions MySQL** : pool `mysql2` en singleton lazy. Trafic faible → OK. Si pics de
  trafic plus tard, envisager un pooler (PlanetScale, ou Hostinger avec limite de connexions relevée).
- **`proxy.ts`** (ex-middleware Next 16) protège `/espace-client` et `/admin` — actif sur Vercel.
- L'ancien PHP Hostinger peut être archivé une fois la bascule validée (garder une sauvegarde).
