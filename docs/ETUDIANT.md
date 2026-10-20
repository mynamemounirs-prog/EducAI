# Tester l’espace Étudiant

Sur l’accueil général, clique sur **Tester l’espace étudiant**. Le lien `#etudiant-demo` ouvre directement cette démonstration. Aucun compte, carte bancaire ou abonnement n’est nécessaire, y compris pour une personne déjà connectée. Pour développer : `npm ci`, puis `npm run dev` ; Firebase n’est pas nécessaire à la démo.

L’interface suit la composition de l’image fournie : navigation latérale, recherche et compte, robot FarabAi existant animé, cinq modes, quatre raccourcis, cours récents et progression. Thèmes clair/sombre et menu mobile disponibles. Communauté affiche uniquement « bientôt disponible » ; aucun faux membre, message ou notification.

## Ce qui fonctionne

- **Mes cours** : coller un texte ou importer PDF/TXT, vérifier et modifier le texte extrait, choisir titre/matière/niveau, rechercher, ouvrir et supprimer avec confirmation. Extraction locale par PDF.js, sans OCR. Limites : 5 Mo, 100 pages PDF, 200 000 caractères. Les formats refusés et PDF sans texte sont signalés. Le contenu importé reste du texte, sans exécution HTML. Modifier seulement les métadonnées préserve les étapes ; modifier le texte reconstruit les étapes et remet la progression du cours à zéro.
- **Apprendre** : étapes avec objectif, explication, exemple, question et synthèse pour les exemples ; pour un cours personnel, lecture par paragraphes du texte fourni, sans prétendre l’analyser par IA. Étape précédente, validation explicite, sauvegarde et reprise depuis les cours récents.
- **Révision** : fiches, cartes retournables, choix À revoir/Compris enregistrés, quiz avec barème et correction. Une carte retournée ne devient pas automatiquement une notion comprise. Pour les textes personnels, rédaction de cartes manuelles et fiche à compléter ; aucune fausse génération automatique de quiz.
- **Exam** : cours, matière, niveau, sujet d’exemple, durée et chronomètre désactivable. Réponses et état de l’épreuve sont conservés. L’horloge continue après actualisation si active ; désactiver la suspend. À expiration, un message invite à remettre la copie, sans dévoiler automatiquement les réponses. Remise confirmée, score des QCM selon les points, corrigé indicatif et autoévaluation séparée pour la réponse ouverte. Les sujets ne sont pas des annales officielles.
- **Résoudre** : exemple de calcul d’un rendement, cinq étapes, indice, correction et raisonnement personnel. Le compteur augmente uniquement après confirmation explicite que l’exercice est terminé et vérifié. Les énoncés libres peuvent être enregistrés avec leur raisonnement, sans solution personnalisée fictive.
- **Explication** : exemples sur les cours de démonstration, style simple/détaillé/exemple, reformulation préparée, exemple concret et question de compréhension. Les réponses au contrôle sont sauvegardées avec le cours.
- **Ressources** : fiche mémo éditable avec notions, définitions, formules/méthodes, erreurs et questions, export PDF réel ; carte structurée en SVG avec branches modifiables, zoom, déplacement par défilement et alternative textuelle. Les raccourcis réutilisent ces ateliers. Pour un cours personnel, les extraits/structures viennent du texte fourni, puis sont à compléter manuellement.

## Exemples et progression

La démo contient trois cours explicitement identifiés : Énergie et développement durable, Introduction à l’IA et Systèmes embarqués. Leurs contenus, cartes, quiz et explications sont prédéfinis. **Charger un exemple** sélectionne un cours d’exemple disponible (ou en ajoute un si nécessaire) ; il ne transforme pas une demande libre en réponse IA. La résolution guidée utilise un exemple fixe de rendement énergétique clairement identifié.

Les compteurs commencent à zéro. Le pourcentage mesure les étapes déclarées terminées sur les étapes disponibles des cours commencés ; il ne mesure pas automatiquement la maîtrise. Les exercices vérifiés et copies remises sont comptés à partir des données enregistrées. Les cours récents reprennent l’étape sauvegardée. La recherche filtre réellement les textes de cours, ressources et exercices enregistrés.

## Sauvegarde et mise en production

La démo utilise uniquement `farabai-student-demo-v1`, distinct de l’espace Enseignant et des comptes. Réinitialiser demande confirmation et remplace uniquement cette démo par ses exemples à zéro. Effacer les données du navigateur efface les travaux locaux. Une capacité de stockage dépassée produit une erreur explicite ; une ancienne sauvegarde illisible est préservée jusqu’à réinitialisation explicite.

Un compte Étudiant confirmé ouvre **Ouvrir mon espace étudiant** depuis son espace personnel. Les données utilisent `studentWorkspaces/{uid}`, avec cache local propre à ce compte. La synchronisation regroupe les saisies ; en cas d’indisponibilité, l’interface indique **Enregistré sur cet appareil** et permet de réessayer. Le PDF original n’est pas stocké : seul le texte extrait et enregistré peut être synchronisé dans le compte Firebase. Une suppression du cache avant synchronisation peut perdre les modifications locales.

**Pour activer la sauvegarde serveur sur le site réel : Firebase → Firestore Database → Règles → remplacer par le contenu complet de [`firestore.rules`](../firestore.rules) → Publier.** GitHub Pages déploie le site, pas les règles Firebase. Ces règles préservent les profils et travaux enseignants, ajoutent les travaux étudiants privés et n’accordent aucun abonnement. Ne passez pas la base en accès public.

Les versions concurrentes d’un cours ou d’une ressource utilisent la date de dernière modification ; ce n’est pas un éditeur collaboratif. Les documents Firestore sont soumis à sa limite de taille. Un échec serveur conserve les données locales et affiche le statut correspondant.

Restent à connecter : service IA sécurisé côté serveur, correction fiable des réponses libres si souhaitée, OCR et communauté. Aucune clé secrète n’est exposée. Une future utilisation des documents par une IA devra informer l’utilisateur au moment de l’envoi. Google et l’activation des abonnements par webhook restent inchangés.
