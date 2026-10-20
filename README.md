# FarabAi

Plateforme éducative React, TypeScript, Tailwind et Vite, avec identité violet/or, décor local et avatar SVG animé.

## Lancer

```sh
npm ci
cp .env.example .env.local
# Renseignez la configuration publique Firebase dans .env.local.
npm run dev
```

Le serveur utilise le port 5173. Sans configuration Firebase, l’accueil et les tarifs restent accessibles mais le service de compte est explicitement indisponible. Aucun compte ni e-mail n’est simulé. `npm run build` vérifie TypeScript et produit `dist/` ; `npm run preview` sert la compilation.

## Fonctionnalités

- Accueil adaptatif, avatar articulé, thèmes sombre/clair et préférences locales non sensibles.
- Authentification Firebase e-mail/mot de passe : inscription, prénom et profil Firestore protégé, connexion, session persistante, déconnexion, confirmation d’e-mail, mot de passe oublié et page de réinitialisation.
- Pages privées protégées par session, confirmation éventuelle et profil valide ; règles d’accès côté Firestore.
- Quatre offres et liens Stripe centralisés ; offre conservée pendant l’authentification. Aucun paiement ni retour d’URL n’accorde automatiquement des droits.
- Fenêtres à contenu défilant avec en-tête et fermeture accessibles, navigation clavier et réduction des animations respectée.

L’espace enseignant est accessible gratuitement via **Tester l’espace enseignant** sur l’accueil, sans compte ni paiement. Il comprend projets, ressources, quatre ateliers éditables, exports PDF/PPTX, quiz jouable et storyboard. La démo conserve ses données dans ce navigateur, séparément des comptes. Voir le [guide enseignant](docs/ENSEIGNANT.md).

Google reste de côté. L’IA, la recherche Internet et le rendu vidéo restent à connecter. L’activation automatique des abonnements doit être raccordée via des webhooks vérifiés côté serveur. Les documents juridiques restent provisoires.

## Configuration et déploiement

- [Comptes Firebase, profils protégés et URL des e-mails](docs/AUTHENTIFICATION.md)
- [Paiements Stripe et droits à raccorder](docs/PAIEMENTS.md)
- [Validation effectuée et émulateurs dans cet environnement](docs/VALIDATION.md)

GitHub Pages déploie chaque mise à jour de `main`. Dans GitHub, **Settings → Pages → Source → GitHub Actions** doit être activé. Les variables Firebase publiques doivent être ajoutées aux Repository variables GitHub Actions ; redéployez après modification.

## Tests

`npm test` vérifie les états non configurés, les accès privés, les préférences, le focus, les fenêtres longues, l’absence de chevauchement sur ordinateur/tablette/mobile dans les deux thèmes, et les animations.

`npm run test:auth:local` utilise Firebase CLI 15.34.0, Java 21+ et les émulateurs officiels Auth/Firestore sur les ports 9099/8080, puis Vite sur 5174. Ces tests créent uniquement des comptes locaux, consomment les codes d’e-mails de l’émulateur, vérifient session, inscription, connexion, déconnexion, réinitialisation, choix d’offre, liens Stripe interceptés et règles Firestore. Ils ne prouvent pas l’envoi d’e-mails ni le fonctionnement de votre projet de production. Aucun paiement réel n’est exécuté. La configuration de test utilise `demo-farabai` et ne peut pas se connecter aux services de production.

Playwright attend Chromium à `/usr/bin/chromium` dans cet environnement. Adaptez `executablePath` dans les deux configurations Playwright pour votre propre navigateur si nécessaire. Les binaires d’émulateurs officiels nécessitent un accès réseau à leur distribution pour le premier téléchargement.
