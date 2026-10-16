# Activer la connexion et l’inscription Google

L’interface utilise le SDK officiel Firebase Authentication. Un premier accès Google crée une identité Firebase ; les suivants reconnectent cette identité. Les outils pédagogiques restent en démonstration. Aucun compte Google n’est simulé. Aucun secret serveur n’est nécessaire dans l’application.

1. Ouvrez https://console.firebase.google.com/ et créez un projet (Google Analytics facultatif).
2. Dans **Build → Authentication**, cliquez sur **Get started**, puis **Sign-in method → Google**. Activez Google, choisissez l’adresse d’assistance demandée et enregistrez. Si Google demande de configurer l’écran de consentement OAuth, faites-le dans le projet Google Cloud associé ; en mode test, ajoutez vos utilisateurs test autorisés.
3. Dans **Authentication → Settings → Authorized domains**, ajoutez `mynamemounirs-prog.github.io` (sans `https://` ni `/EducAI/`). Pour les essais locaux, ajoutez `localhost` séparément si nécessaire. Conservez le domaine Firebase déjà présent.
4. Dans **Project settings → General → Your apps**, ajoutez une application **Web** (`</>`), nommez-la FarabAi. Firebase Hosting n’est pas nécessaire : le site reste sur GitHub Pages. Dans la configuration publique `firebaseConfig`, relevez `apiKey`, `authDomain` et `projectId`.
5. Dans https://github.com/mynamemounirs-prog/EducAI/settings/variables/actions, créez trois **Repository variables** (onglet Variables, pas des secrets serveur) :

   | Nom GitHub | Champ Firebase |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` |

   Cette configuration Firebase est publique et intégrée au navigateur ; ne renseignez jamais de clé privée, fichier de compte de service ou client secret OAuth. Si vous imposez des restrictions de clé API, autorisez les API Firebase Authentication requises et le référent du site.
6. Dans **Actions → Deploy FarabAi to GitHub Pages**, cliquez sur **Run workflow → main**. Il faut un nouveau build pour intégrer les variables ; recharger le site seul ne suffit pas.
7. Après le déploiement, choisissez un profil, acceptez les conditions affichées, puis cliquez sur **Continuer avec Google**. Autorisez la fenêtre contextuelle, choisissez un compte et vérifiez le badge **CONNECTÉ AVEC GOOGLE**. Testez aussi **Se déconnecter de Google**. Les connexions réelles sont visibles dans **Firebase Authentication → Users**.

## En local

Créez `.env.local` (ignoré par Git) avec les trois mêmes noms `VITE_FIREBASE_*`, puis redémarrez Vite. Pour GitHub Pages, utilisez les variables GitHub ci-dessus, pas ce fichier local.

## Limites et confidentialité

Sans les trois valeurs, le bouton Google est masqué et le parcours de démonstration reste accessible sans configuration. Le formulaire e-mail reste une démonstration. La session Google est uniquement en mémoire, jamais dans localStorage : un rechargement exige une nouvelle connexion. Il n’existe pas encore de stockage des contenus éducatifs ou d’autorisation d’accès à des ressources privées. Avant l’ouverture commerciale, finalisez les conditions et la politique de confidentialité, et définissez les règles d’accès de tout futur stockage Firebase.
