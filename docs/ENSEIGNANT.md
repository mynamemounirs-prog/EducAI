# Espace enseignant

Sur l’accueil, cliquez sur **Tester l’espace enseignant**. Aucun compte, abonnement ou paiement n’est nécessaire. Le lien `#enseignant-demo` ouvre aussi cette vue directement. Pour développer : `npm ci`, puis `npm run dev` ; Firebase n’est pas nécessaire à la démo.

La composition reprend la référence fournie : navigation à gauche, recherche et compte en haut, avatar existant animé avec chapeau, quatre cartes, formats, projets et niveaux. Tous les contrôles sont de vrais éléments HTML. Le thème clair, le menu mobile et la réduction des animations sont pris en charge.

## Parcours disponibles

- Cours : sept sections modifiables ; quiz : questions, options, correction et aperçu ; examen : sujet élève, corrigé et barème ; recherche : notes et sources ajoutées manuellement avec titre et URL.
- **Charger un exemple** utilise un contenu pédagogique prédéfini, indépendant du sujet libre. **Commencer un brouillon vide** permet une rédaction manuelle. Aucun appel IA ou recherche Internet n’est effectué.
- Enregistrer dans un projet, retrouver et modifier dans Ressources. Projets : création, ouverture, modification, suppression confirmée. Supprimer un projet supprime ses ressources. Compteurs et dates viennent des données sauvegardées.
- La recherche parcourt les contenus enregistrés ; son filtre limite aux projets ou aux ressources. Niveaux et classes filtrent les deux bibliothèques. La matière filtre les projets.
- PDF et PowerPoint sont des fichiers réels produits localement. Le PDF d’examen sépare sujet et corrigé. Un barème incohérent bloque l’export jusqu’à correction. Le format choisi est conservé.
- Vidéo prépare un storyboard éditable (scènes, narration, texte, durée). Le rendu vidéo et la synthèse vocale ne sont pas connectés.
- Jeu interactif fonctionne avec des QCM/vrai-faux valides, progression, correction et score. Les réponses ouvertes disposent d’un corrigé indicatif dans l’aperçu ; elles ne sont pas notées automatiquement et ne sont pas compatibles avec le jeu.

## Données et comptes

La démonstration utilise uniquement `farabai-teacher-demo-v1` dans le stockage local, y compris pour une personne connectée. Elle démarre avec trois projets explicitement identifiés comme exemples et quatre ressources. **Réinitialiser la démo** demande confirmation et ne touche jamais aux travaux du compte. Effacer les données du navigateur efface la démonstration.

Un enseignant connecté, avec profil et adresse vérifiés selon la configuration existante, ouvre **Ouvrir mon espace enseignant** depuis son compte. Ses travaux sont enregistrés dans `teacherWorkspaces/{uid}`, avec accès réservé au propriétaire, et un cache local distinct par utilisateur. Les suppressions sont conservées comme marqueurs pour éviter de faire réapparaître les éléments lors d’une synchronisation. Les conflits entre versions d’un même contenu utilisent la dernière date de modification ; ce n’est pas un éditeur collaboratif simultané.

**À mettre à jour dans le projet Firebase réel :** ouvrez **Firestore Database → Règles**, remplacez par le contenu complet de [`firestore.rules`](../firestore.rules), puis **Publier**. Ces règles conservent la protection des profils et ajoutent celle des travaux enseignants. Le déploiement GitHub Pages ne publie pas les règles Firebase. Ne passez pas la base en accès public.

Tant que les nouvelles règles ne sont pas publiées, ou si le serveur est indisponible, l’interface indique explicitement **Travaux sur cet appareil uniquement** et permet de réessayer la synchronisation. La suppression des données du navigateur avant synchronisation peut perdre ces modifications. Aucun champ du workspace ni de la démo n’accorde un abonnement.

Pour la suite, brancher un service IA côté serveur avec secrets hors navigateur ; les exemples sont isolés dans `src/teacher/examples.ts`. Brancher séparément un service de recherche documentée et un moteur de rendu vidéo. Aucun de ces services n’est simulé comme actif.
