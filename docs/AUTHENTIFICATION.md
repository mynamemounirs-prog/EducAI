# Activer les comptes Firebase de FarabAi

Firebase était déjà prévu dans le projet. Cette version réutilise son SDK officiel pour les comptes e-mail/mot de passe, les e-mails d’action, la session persistante et les profils Firestore. Google reste de côté.

## 1. Projet Firebase et fournisseur e-mail

1. Ouvrez https://console.firebase.google.com/ et créez ou sélectionnez votre projet.
2. Dans **Build → Authentication → Sign-in method**, activez **Email/Password** (pas besoin d’activer Google ni le lien de connexion sans mot de passe).
3. Dans **Project settings → General → Your apps**, ajoutez une application Web (`</>`), sans Firebase Hosting. Relevez les champs publics `apiKey`, `authDomain` et `projectId` de `firebaseConfig`.
4. Dans **Authentication → Settings → Authorized domains**, conservez le domaine Firebase et ajoutez `mynamemounirs-prog.github.io`. Pour vos essais locaux, ajoutez `localhost` et `127.0.0.1` si vous les utilisez. Saisissez des domaines, sans protocole ni chemin.

## 2. Variables publiques de compilation

| Variable | Valeur |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` de l’application Web |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` fourni par Firebase, par exemple `votre-projet.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` du même projet |
| `VITE_REQUIRE_EMAIL_VERIFICATION` | `true` (valeur par défaut) ou `false` si vous choisissez de ne pas exiger la confirmation |

Ces trois valeurs Firebase Web sont publiques et compilées dans le navigateur. N’utilisez jamais de compte de service, clé privée, clé Stripe secrète ou client secret OAuth côté client. Les mots de passe ne sont ni journalisés ni enregistrés par FarabAi ; seul le SDK Firebase les transmet à Firebase Authentication.

**Développement :** copiez `.env.example` vers `.env.local`, renseignez les valeurs et redémarrez `npm run dev`. `.env.local` est ignoré par Git.

**Production :** ouvrez https://github.com/mynamemounirs-prog/EducAI/settings/variables/actions et ajoutez les quatre **Repository variables** dans l’onglet Variables. Puis relancez **Actions → Deploy FarabAi to GitHub Pages → Run workflow → main**. Les changements de variables nécessitent une nouvelle compilation.

## 3. Profils protégés

1. Dans **Build → Firestore Database**, créez la base **`(default)`** en mode production.
2. Dans son onglet **Rules**, remplacez les règles par le contenu complet de `firestore.rules`, puis publiez-les. Alternative avec une CLI Firebase authentifiée sur votre machine : `npx firebase-tools@15.34.0 deploy --only firestore:rules --project VOTRE_PROJECT_ID`.
3. Chaque compte possède uniquement `/profiles/{uid}` : prénom, profil Enseignant/Étudiant/Pédagogue et horodatages. Le propriétaire est seul autorisé à lire et modifier son document. Les listes de profils et tout autre document sont refusés. Aucun champ de paiement ou d’abonnement ne peut être ajouté par le client.

Sans base ou règles correctes, un compte Firebase peut exister mais son profil ne pourra pas être chargé ou enregistré. L’application affiche alors une erreur et permet de compléter ou réessayer le profil, sans inventer une inscription réussie.

## 4. Liens de confirmation et réinitialisation

**Le plus simple : conservez les URL d’action par défaut de Firebase** pour les modèles de confirmation et de réinitialisation, généralement sur `https://VOTRE-PROJET.firebaseapp.com/__/auth/action`. Utilisez la valeur fournie par votre propre projet, pas un domaine inventé. Firebase affiche sa page sécurisée, puis propose le retour vers FarabAi à l’URL envoyée par le code. Le bouton « J’ai confirmé mon adresse » recharge ensuite la session dans FarabAi. Aucun domaine personnalisé d’expéditeur ni vérification DNS n’est nécessaire. Ne cherchez pas à prouver la propriété de `github.io`.

L’URL d’action et la personnalisation du domaine d’expéditeur sont deux réglages distincts. Si l’interface affiche « Custom domain verification in progress », revenez aux paramètres d’e-mail par défaut.

**Option avancée, facultative :** FarabAi possède aussi un gestionnaire d’e-mails sur sa page racine. Dans **Authentication → Templates**, personnalisez l’**Action URL** des modèles **Email address verification** et **Password reset** :

| Contexte | URL de l’application et URL d’action personnalisée |
|---|---|
| Production GitHub Pages | `https://mynamemounirs-prog.github.io/EducAI/` |
| Développement Vite | `http://localhost:5173/` (ou `http://127.0.0.1:5173/` si vous l’utilisez) |

Utilisez idéalement un projet Firebase de développement séparé : un modèle possède une URL d’action, pas une URL différente par navigateur. Le code envoie aussi l’URL racine courante comme `continueUrl`. Le domaine de cette URL doit être autorisé. FarabAi ne suit aucune URL de retour arbitraire fournie dans la query string.

Firebase ajoute automatiquement `mode=verifyEmail&oobCode=...` ou `mode=resetPassword&oobCode=...` à l’URL du modèle. N’inventez pas ces codes et n’enregistrez pas ces liens dans des logs. Le site reste sur sa racine pour être compatible avec GitHub Pages, sans route serveur supplémentaire.

L’inscription envoie un vrai e-mail lorsque le service est configuré et la confirmation requise. Un utilisateur non confirmé reste sur l’écran de vérification ; il peut renvoyer l’e-mail et recharger son état. Le choix d’offre est conservé sur le même navigateur. Le parcours « Mot de passe oublié ? » demande un vrai e-mail au service et utilise une réponse neutre pour ne pas révéler si une adresse possède un compte.

## 5. Session et contrôles

Le SDK Firebase conserve et renouvelle la session dans son stockage navigateur (IndexedDB, avec repli Firebase vers localStorage). FarabAi ne copie pas les jetons ni les mots de passe dans ses propres préférences. Les pages privées ne sont affichées qu’après restauration de la session, confirmation d’e-mail si exigée et chargement d’un profil valide. Les règles Firestore assurent la protection côté service ; le choix d’un rôle n’accorde aucun droit payant.

Vérifiez sur le vrai projet : inscription, réception de l’e-mail, confirmation, actualisation, déconnexion, reconnexion, récupération puis nouveau mot de passe, et impossibilité d’ouvrir `#espace` sans connexion. Les tests d’émulateurs ne démontrent pas la livraison des e-mails réels.

## Références officielles consultées

Le site documentaire Firebase était bloqué par le proxy de cet environnement. La référence JSDoc du SDK Firebase installé et les exemples officiels actualisés de Firebase ont été consultés :

- https://github.com/firebase/snippets-web/blob/master/auth-next/email.js
- https://github.com/firebase/snippets-web/blob/master/auth-next/manage.js
- https://github.com/firebase/snippets-web/blob/master/auth-next/auth-state-persistence.js
- https://github.com/firebase/snippets-web/blob/master/auth-next/custom-email-handler.js
- Référence du service : https://firebase.google.com/docs/auth/web/password-auth
- Règles : https://firebase.google.com/docs/firestore/security/rules-conditions


## Si le bouton d’inscription semble sans effet

Le formulaire affiche maintenant un message visible et met le focus sur ce message pour chaque champ invalide, mot de passe trop court, confirmation différente ou case des conditions non cochée. Sans configuration Firebase intégrée au build, un clic valide affiche explicitement l’erreur et la nécessité de redéployer, au lieu de laisser un bouton désactivé sans retour.

Si un compte est créé mais Firestore ne répond pas, le compte n’est pas recréé : l’écran de confirmation est affiché, l’e-mail est demandé indépendamment et un avertissement propose de finaliser le profil. Les lectures et écritures de profil ont une attente limitée ; une écriture non confirmée peut encore aboutir et ne doit pas être interprétée comme un échec définitif. Réessayez son chargement avant de recommencer.


## Vérifier la version réellement publiée

Le pied de page affiche `version` suivi des sept premiers caractères du commit compilé par GitHub Actions. Le fichier public `/EducAI/build-info.json` contient cette version, la date du build et uniquement trois indicateurs booléens de présence des variables Firebase. Il ne contient aucune valeur de configuration, aucun mot de passe ni jeton. Ces indicateurs ne prouvent pas que la configuration Firebase est valide, seulement qu’elle a été renseignée dans le build.

Si le site montre encore un bouton désactivé « Créer mon compte » sans « Veuillez patienter… », il peut s’agir d’un ancien build antérieur au correctif. Vérifiez le commit du dernier déploiement réussi, lancez **Run workflow** sur **main** (ne relancez pas un ancien run associé à un vieux commit), puis rechargez le site.
