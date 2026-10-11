# Rapport d'optimisation — glamour-nails.fr (12 octobre 2026)

Travail réalisé sur la branche `seo`, un commit par thème, puis fusionné dans `main`.
Aucun texte, prix, chiffre ou promesse n'a été modifié. Design et mise en page inchangés, sauf les ajustements d'accessibilité listés plus bas.

## 1. Modifications par thème

**Images**
- Toutes les photos converties en WebP (qualité 80, puis réduite si besoin) : **aucune image > 150 Ko**. Le dossier `assets/google` (10 Mo) est remplacé par `assets/realisations` (7 Mo, dont 5 Mo de vidéos inchangées).
- Redimensionnées à la taille d'affichage : réalisations en 480 px et 800 px avec `srcset`/`sizes` ; accueil en 800/1200/1624 px ; piles de prestations en 840 px max.
- Renommées avec des mots descriptifs : `ongles-glamour-nails-aix-XX.webp`, `manucure-ongles-glamour-nails-N.webp`, `beaute-des-pieds-…`, `extension-de-cils-…`, `salon-glamour-nails-accueil-…`. Toutes les références mises à jour, les anciens fichiers supprimés (originaux conservés dans `image/originaux/`, non servis).
- `width` et `height` sur chaque `<img>` et `<video>` (plus de décalage au chargement) ; `loading="lazy"` et `decoding="async"` partout sauf l'image d'accueil (`fetchpriority="high"` + `<link rel="preload">` avec `imagesrcset`).
- Vignettes vidéo et fonds de section chargés seulement à l'approche (plus de 200 Ko économisés au chargement initial).
- Favicons : `favicon.ico`, `apple-touch-icon.png` 180×180, `icon-192/512.png`, `site.webmanifest`. Le logo fourni est une image matricielle : pas de version SVG possible sans le fichier source (voir TODO).
- Image de partage `image/partage-glamour-nails.jpg` 1200×630, recadrée depuis la photo d'accueil.

**Textes** — aucun changement de sens. Relecture faite : pas de faute trouvée ; énumérations déjà en listes ; pas de « cliquez ici ». Mot-clé principal : voir § 3.

**Balises**
- `<title>` : « Glamour Nails · Onglerie à Aix-en-Provence | Manucure, cils » (59 caractères).
- Meta description (152 caractères) reprenant l'appel à l'action déjà présent : « Réservation en ligne 24h/24 sur Planity ».
- Un seul H1, hiérarchie H2 → H3 sans saut vérifiée ; balisage `header/nav/main/section/footer`, `lang="fr"`.
- Canonical, Open Graph complété (image 1200×630, dimensions, alt, site_name), Twitter Card `summary_large_image`, `meta robots`.
- JSON-LD : `NailSalon` (déjà présent, complété avec le lien Google et une `ReserveAction` vers Planity) + `FAQPage` généré à partir des 5 questions existantes, texte identique.

**Accessibilité**
- `alt` présent sur toutes les images (descriptif sur les photos, vide sur les décoratives) ; `aria-label` sur tous les boutons sans texte ; lien « Aller au contenu », focus visible, `prefers-reduced-motion` respecté (déjà en place).
- **Contraste** : le vert d'accent (#1f7a52) sur fond noir ne faisait que 3,7:1. Sur les sections sombres (prestations, réalisations), les sur-titres et liens utilisent maintenant le vert clair déjà présent dans la charte (#8fd9b3, ≈ 11:1). Aucun autre changement de couleur.
- **Zones cliquables ≥ 44 px** : padding invisible ajouté sur les liens du menu, du pied de page, les liens « → » et le lien Planity, sans modifier l'espacement visible.
- Attributs `aria-label` interdits sur des `<p>` (ajoutés par l'animation des textes) supprimés ; les piles de photos passent en `role="group"`.
- Lighthouse accessibilité : **96 → 100**.

**SEO technique**
- `robots.txt` (tout autorisé sauf `/deploy/` et `/image/originaux/`, ligne `Sitemap`), `sitemap.xml` avec les 4 pages indexables et leur `lastmod`.
- Page `404.html` dans le style du site ; Nginx renvoie bien un code 404 (`error_page 404 /404.html`). Sur GitHub Pages, `404.html` est reconnu automatiquement.
- Nginx : `www.` → `glamour-nails.fr` en 301, HTTP → HTTPS ajouté par Certbot, dossiers techniques bloqués, en-têtes de sécurité.
- Aucun `noindex` résiduel, aucun lien interne cassé (vérifié : 117 images, 4 pages, 0 erreur).

**Vitesse**
- Polices Cormorant Garamond et Figtree **auto-hébergées** en WOFF2 (fontes variables, sous-ensemble latin, 3 fichiers / 97 Ko au lieu de Google Fonts), `font-display: swap`, preload des deux principales.
- GSAP et Lenis servis localement au lieu du CDN jsDelivr ; tous les scripts en `defer` ; les deux principaux en `preload`.
- CSS et JS **minifiés** (`css/style.min.css` 44 Ko, `js/main.min.js` 20 Ko) via `./build.sh` (esbuild). Les sources restent dans `css/style.css` et `js/main.js` ; lancer `./build.sh` après chaque modification.
- Plus **aucune requête vers un domaine tiers** au chargement (le module Planity se charge seulement quand on arrive dessus).
- Écran de chargement raccourci (0,7 s mini au lieu de 1,3 s ; sécurité 2,5 s au lieu de 4 s) : le contenu apparaît plus tôt, rendu identique.
- Nginx : gzip, cache 30 j (CSS/JS) et 1 an (images, polices, vidéos), HTTP/2 à activer après Certbot (voir `deploy/glamour-nails.fr.conf`).

**Pages légales et RGPD**
- `mentions-legales.html`, `confidentialite.html`, `cgu.html` créées dans le style du site, reliées dans le pied de page et le sitemap. Seules les informations connues sont écrites ; le reste est marqué `[À COMPLÉTER : …]` (liste au § 3).
- Pas de formulaire ni de traceur sur le site : pas de bandeau cookies nécessaire. Point d'attention : le module Planity intégré charge des scripts tiers (dont un pixel Meta côté Planity) dès qu'il s'affiche. Signalé dans la politique de confidentialité ; voir § 3 pour l'option « clic pour charger ».

**Mention Acco-lab** — « Fait par Acco-lab » ajouté dans le pied de page de toutes les pages (lien vers https://acco-lab.fr), dans le style des autres liens.

## 2. Tableau par page

| URL | Mots | Meta title | Meta description | H1 |
|---|---|---|---|---|
| `/` | 2 817 | Glamour Nails · Onglerie à Aix-en-Provence \| Manucure, cils (59) | Onglerie et bien-être à Aix-en-Provence : manucure, semi-permanent, gel, beauté des pieds et extension de cils. Réservation en ligne 24h/24 sur Planity. (152) | Belles jusqu'au bout des ongles. |
| `/mentions-legales.html` | ≈ 190 | Mentions légales · Glamour Nails Aix-en-Provence | Mentions légales du site glamour-nails.fr : éditeur, directeur de publication, hébergeur… | Mentions légales |
| `/confidentialite.html` | ≈ 330 | Politique de confidentialité · Glamour Nails | Politique de confidentialité de glamour-nails.fr : données traitées, services tiers… | Politique de confidentialité |
| `/cgu.html` | ≈ 260 | Conditions générales d'utilisation · Glamour Nails | Conditions générales d'utilisation du site glamour-nails.fr… | Conditions générales d'utilisation |

Les pages légales font moins de 800 mots : c'est normal pour ce type de page, elles n'ont pas été rallongées.

## 3. TODO et propositions non appliquées

**Informations manquantes (balisées `[À COMPLÉTER]` dans les pages)**
- Mentions légales : forme juridique, numéro SIRET, nom du directeur ou de la directrice de publication, hébergeur (nom, adresse, téléphone).
- Confidentialité : durée de conservation des journaux serveur, nom du ou de la responsable du traitement.
- CGU : politique d'annulation du salon.
- Liens Instagram, TikTok et Facebook : pointent encore vers les pages d'accueil des réseaux (adresses des comptes à fournir).
- Adresse e-mail `contact@glamour-nails.fr` : à confirmer (elle apparaît dans le site et les données structurées).
- Logo : fournir le fichier source (SVG, AI ou PDF) pour un favicon vectoriel et un logo net en grand.

**Reformulations proposées (non appliquées, le sens des textes n'a pas été touché)**
- Le mot-clé principal « manucure Aix-en-Provence » n'est pas dans le H1 (« Belles jusqu'au bout des ongles. »), il n'est que dans le paragraphe suivant. Proposition : garder la phrase et ajouter la localisation en italique, par ex. « Belles jusqu'au bout des ongles, *à Aix-en-Provence*. »
- Le sous-titre « Onglerie & bien-être · Aix-en-Provence » pourrait devenir « Onglerie & manucure · Aix-en-Provence » pour placer le mot « manucure » plus haut.

**RGPD — module Planity**
- Option conforme au sens strict : n'afficher le module qu'après un clic sur un bouton « Afficher la réservation Planity » (rien ne se charge avant). Non appliqué pour ne pas changer l'expérience sans votre accord.

**Vitesse**
- Lighthouse mobile reste sous l'objectif de 90 (voir § 4). Les deux leviers restants modifient le rendu : supprimer l'écran de chargement (le contenu apparaîtrait ≈ 1 s plus tôt sur mobile) et alléger la page d'accueil (les 60 cartes d'avis du mur 3D et les 31 réalisations pèsent 126 Ko de HTML).
- Le CLS « ordinateur » de 0,13 est dû à l'animation d'entrée du texte d'accueil, qui se joue sous l'écran de chargement (invisible pour le visiteur) ; sur mobile il est de 0,007.

## 4. Scores Lighthouse (avant = version GitHub Pages du 2 octobre, après = version actuelle en local)

| | Perf. | Accessibilité | Bonnes pratiques | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| Ordinateur avant | 89 | 96 | 100 | 100 | 1,4 s | 0,043 |
| **Ordinateur après** | **90** | **100** | **100** | **100** | **1,0 s** | 0,137* |
| Mobile avant | 69 | 96 | 100 | 100 | 5,1 s | 0,09 |
| **Mobile après** | **79** | **100** | **100** | **100** | **4,1 s** | **0,007** |

\* voir § 3. Les mesures « après » sont faites sur un serveur local sans gzip ni HTTP/2 : en production sur Nginx, le HTML passera d'environ 126 Ko à 25 Ko, ce qui améliorera encore le mobile.

## 5. À faire à la main

1. Sur le VPS : `cd /var/www/glamour-nails.fr && git pull`, recopier `deploy/glamour-nails.fr.conf` (il contient maintenant la redirection www et la page 404), `nginx -t && systemctl reload nginx`, puis après Certbot ajouter `http2 on;` au bloc 443.
2. Google Search Console : ajouter la propriété `glamour-nails.fr`, soumettre `https://glamour-nails.fr/sitemap.xml`, demander l'indexation de la page d'accueil.
3. Compléter les `[À COMPLÉTER]` des pages légales et confirmer l'e-mail de contact.
4. Fiche Google Business : indiquer `https://glamour-nails.fr` comme site web (cohérence avec le JSON-LD).
