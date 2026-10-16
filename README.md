# FarabAi

Accueil et parcours d’entrée en React, TypeScript, Tailwind CSS et Vite.

## Lancer

```sh
npm ci
npm run dev
```

Le serveur écoute sur le port 5173. `npm run build` vérifie TypeScript et produit `dist/`. `npm run preview` sert la compilation.

## Parcours disponibles

Accueil adaptatif, avatar SVG/CSS autonome animé, thèmes sombre et clair mémorisés, trois profils, tarifs, formulaires avec validation, affichage du mot de passe, récupération simulée, fenêtres accessibles et espaces de démonstration. Seuls thème, profil et offre sont conservés localement.

Aucune authentification réelle, IA connectée ou facturation. Les formulaires ne stockent ni ne transmettent les identifiants. Le bouton « Continuer en démonstration » ouvre explicitement l’espace choisi. Les conditions et la confidentialité sont des documents provisoires. Les capacités des offres sont une feuille de route.

L’adaptateur `authService` dans `src/services/auth.ts` constitue le point de raccordement de la future authentification. Les composants `Logo`, `Avatar`, `Auth`, `Pricing` et `Modal` sont séparés dans `src/components/`.

## Vérifier

`npm test` exécute les parcours Playwright, avec Chromium à `/usr/bin/chromium` dans cet environnement. Pour un autre environnement, adaptez `executablePath` dans `playwright.config.ts` à votre navigateur ou utilisez les navigateurs Playwright.

## Publication GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` compile et déploie automatiquement chaque mise à jour de `main`. Dans GitHub, ouvrir **Settings → Pages → Build and deployment → Source**, choisir **GitHub Actions**. Si nécessaire, lancer ensuite **Actions → Deploy FarabAi to GitHub Pages → Run workflow**. L’adresse publique est affichée par le déploiement réussi. Aucun secret applicatif ni carte bancaire n’est nécessaire.
