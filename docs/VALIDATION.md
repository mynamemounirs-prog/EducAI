# Validation dans l’environnement de développement

Les tests d’interface fonctionnent sans projet Firebase configuré. Les tests d’intégration utilisent le SDK Firebase et de véritables émulateurs officiels, pas une authentification simulée dans l’interface. Les comptes et mots de passe de test sont exclusivement locaux. Les navigations vers Stripe sont interceptées avant tout accès externe.

## Réseau de cet environnement

Le proxy refuse le domaine du téléchargement par défaut de l’émulateur Firestore (`storage.googleapis.com`). L’émulateur a donc été lancé depuis la distribution officielle **Google Cloud SDK**, accessible via `dl.google.com`, avec son archive vérifiée contre le SHA-256 de son manifeste officiel. La version Cloud SDK 1.22.0 n’a pas le même empaquetage que le JAR Firebase CLI 1.22.0 : elle n’a pas été substituée dans le cache de Firebase CLI et aucun checksum attendu par Firebase n’a été modifié.

Lancement utilisé ici :

```sh
java -Duser.language=en -cp /tmp/farabai-cloudsdk-firestore.jar \
  com.google.cloud.datastore.emulator.firestore.CloudFirestore \
  --host 127.0.0.1 --port 8080 --rules /workspace/EducAI/firestore.rules \
  --project_id demo-farabai --single_project_mode true

/tmp/farabai-firebase-tools/node_modules/.bin/firebase emulators:exec \
  --project demo-farabai --only auth \
  'npx playwright test --config playwright.emulator.config.ts'
```

Ces chemins `/tmp` sont propres à cette machine. Pour une installation standard avec accès réseau aux émulateurs Firebase, utilisez simplement `npm run test:auth:local` : la CLI officielle télécharge et contrôle ses propres binaires.

Cela valide le parcours SDK et les règles locales, mais pas la configuration de votre projet Firebase réel, la livraison d’e-mails réels ou les paiements Stripe. Voir `AUTHENTIFICATION.md` pour les étapes de mise en production.

## Résultats de cette révision

- `npm run build` : TypeScript et compilation réussis. Avertissement Vite non bloquant sur la taille du module Firebase, chargé à la demande.
- `npm test` : 16 tests réussis, y compris les thèmes et les formats 1440, 768, 390 et 320 pixels, les fenêtres courtes de 540 pixels de haut, les messages de validation visibles et le respect de la réduction des animations.
- Suite Firebase locale : 7 tests réussis avec les vrais SDK et émulateurs Auth/Firestore, couvrant inscription, confirmation d’e-mail, connexion, déconnexion, session après actualisation, réinitialisation (et rejet du lien déjà consommé), protection des pages et profils, refus d’écriture des droits payants, offre conservée, quatre URL Stripe exactes et prévention des doubles inscriptions et création d’un compte avec demande de confirmation malgré une panne Firestore.
- Les trois variables de production Firebase sont absentes de l’environnement. Le service de production, la livraison des vrais e-mails et les règles de la vraie base restent à configurer et à vérifier. Aucun paiement réel ni webhook de production n’a été exécuté.

## Espace enseignant

Les nouveaux tests couvrent la démo sans compte ni paiement, ses exemples explicitement étiquetés, les quatre outils, la modification et la persistance après rechargement, les projets (création, renommage, suppression et réinitialisation confirmées), la recherche, les niveaux, les préférences et la protection des brouillons non enregistrés. Vérification des deux thèmes et de l’absence de débordement à 1440, 768, 390 et 320 pixels ; menu mobile ouvert/fermé au clavier. Captures contrôlées sur ordinateur sombre et mobile clair.

Les téléchargements sont contrôlés : signature PDF, contenu extrait avec `pdftotext`, séparation sujet/corrigé de l’examen, archive OOXML PowerPoint et présence de plusieurs diapositives. Le jeu vérifie les trois réponses fermées et leur score ; les réponses ouvertes conservent un corrigé indicatif. Le storyboard et les sources manuelles sont édités puis enregistrés.

Le septième test Firebase crée un enseignant dans les vrais émulateurs, sauvegarde un projet et un cours, supprime uniquement son cache local, puis retrouve les données depuis Firestore. Il vérifie l’isolation de la démo même connecté, ainsi que le refus de lecture/écriture du workspace d’un autre utilisateur et le refus de fabrication de droits payants. Les nouvelles règles `teacherWorkspaces` ont été validées localement ; elles doivent être publiées séparément sur le projet Firebase réel.

Les tests d’export utilisent `pdftotext` (Poppler) et Python pour inspecter les fichiers ; ces outils sont présents dans cet environnement. Le rendu des fichiers dans Microsoft PowerPoint n’a pas été contrôlé manuellement. Les sauvegardes sont des documents Firestore soumis à sa limite de taille ; l’interface signale les erreurs serveur et conserve la copie locale.
