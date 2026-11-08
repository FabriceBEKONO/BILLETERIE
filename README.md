# Billetterie sur mesure (paiement confirmé à la main)

Fonctionnement : le client réserve sur le site, paie par Mobile Money, vous confirmez le paiement dans la page admin, ses billets (QR codes) s'affichent, et à l'entrée un téléphone scanne chaque QR. Aucun compte d'agrégateur de paiement n'est nécessaire.

## 1. Personnaliser (5 min)
Ouvrez `config/event.mjs` et changez : nom, date, lieu, titulaire et numéros MTN / Orange, catégories et prix en FCFA. Aucun autre fichier à modifier. Si la date change, ne changez que cette ligne.

## 2. Mettre les fichiers sur GitHub
1. Créez un compte gratuit sur github.com, puis un nouveau dépôt (repository) nommé `billetterie`.
2. Dans le dépôt, « Add file » puis « Upload files ». Glissez TOUT le contenu du dossier décompressé (les dossiers `public`, `config`, `netlify` et les fichiers `package.json`, `netlify.toml`), puis « Commit changes ».
3. Vérifiez que le dossier `netlify/functions` contient bien `api.mjs` et `staff.mjs`.

## 3. Relier à Netlify
1. Sur Netlify : « Add new project » puis « Import an existing project », choisissez GitHub et le dépôt `billetterie`.
2. Netlify lit `netlify.toml` tout seul : cliquez sur « Deploy ». Le déploiement par glisser-déposer ne marche pas pour les Functions, d'où GitHub.
3. Quand c'est en ligne, notez l'adresse du site (`xxx.netlify.app`).

## 4. Définir les deux clés secrètes
Dans Netlify, ouvrez les réglages du projet puis « Environment variables » (le nom du menu peut varier). Créez :
- `ADMIN_KEY` : longue phrase aléatoire (20 caractères ou plus), pour vous seul.
- `SCAN_KEY` : une autre clé, à donner aux agents d'entrée.
Puis relancez un déploiement (« Trigger deploy ») pour que les clés soient prises en compte.

## 5. Tester AVANT l'événement
1. Ouvrez le site, réservez un billet avec un faux nom (« TEST »).
2. Allez sur `/staff.html`, entrez `ADMIN_KEY`, cliquez « Paiement reçu ».
3. Rouvrez le lien de la commande : le QR apparaît.
4. Sur un autre téléphone, ouvrez `/scan.html`, entrez `SCAN_KEY`, « Démarrer la caméra », scannez : « VALIDE ». Rescannez : « REFUSÉ : Déjà utilisé ».
Les commandes de test restent dans la liste admin : appelez-les « TEST » pour les repérer.

## 6. Le jour J
- Chaque agent ouvre `/scan.html` sur son téléphone (HTTPS obligatoire pour la caméra, Netlify le fournit).
- Prévoyez une liste papier de secours et des téléphones chargés.
- Ne redéployez plus la dernière semaine (quota Netlify gratuit : 300 crédits/mois, 15 crédits par déploiement en production).

## Limites connues
- Vous vérifiez chaque paiement à la main : comparez référence, nom et montant avec le SMS Mobile Money reçu.
- Pas d'envoi automatique de billets par SMS ou e-mail : copiez le lien « Voir les billets » depuis la page admin.
- Pas de limite de tentatives sur les clés : choisissez-les longues.
- Paiement automatique (Notch Pay, etc.) non inclus : on pourra l'ajouter plus tard sans refaire le reste.

## Sources
- Netlify Blobs : docs.netlify.com/build/data-and-storage/netlify-blobs
- Déploiement des Functions (Git ou CLI) : docs.netlify.com/functions/deploy
- Crédits du plan gratuit : netlify.com/changelog/netlify-pricing-update-introducing-credit-based-plans
- Librairie de scan et exigence HTTPS : github.com/mebjas/html5-qrcode
