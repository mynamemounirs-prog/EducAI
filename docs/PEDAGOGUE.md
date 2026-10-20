# Tester l’espace Pédagogue

Sur l’accueil général, cliquez sur **Tester l’espace pédagogue**, ou utilisez le fragment `#pedagogue-demo`. Aucun compte, paiement ou carte bancaire n’est nécessaire, y compris pour une personne déjà connectée. Pour développer : `npm ci`, puis `npm run dev`. Firebase n’est pas nécessaire pour la démo.

L’accueil reprend la composition de la référence fournie : navigation à gauche, recherche et compte en haut, avatar FarabAi commun animé, quatre cartes de création, quatre templates, projets récents et assistant. Les éléments sont de vrais composants HTML. Les deux thèmes et le menu mobile sont disponibles. La communauté annonce uniquement « Bientôt disponible » ; aucun échange ni notification n’est simulé.

## Parcours de conception

Les quatre cartes ouvrent le même atelier, avec le type correspondant : application éducative, SaaS éducatif, site web ou système de gestion. Les exemples et suggestions dépendent du type et du modèle choisi. Pour un site web, la structure propose notamment accueil public, présentation, catalogue et contact.

1. **Idée** : nom, besoin, public et problème à résoudre ; contexte, contraintes et fonctionnalités souhaitées dans les options avancées. Le brouillon peut être sauvegardé incomplet. Les champs indispensables sont vérifiés avant de poursuivre.
2. **Structure** : résumé, objectifs, profils, fonctionnalités, écrans, parcours, données, critères d’acceptation et étapes de réalisation. Ajouter, modifier, supprimer et déplacer les éléments ; classer les fonctionnalités en indispensables/première version ou à développer ensuite. Chaque élément distingue décision validée, suggestion prédéfinie et élément personnel restant à valider. Les rôles disposent de descriptions, d’écrans accessibles et d’une grille consulter/créer/modifier/supprimer. Cette grille est un document de conception, pas une permission réelle du serveur.
3. **Prototype** : modèle interactif interne, titre et texte principal modifiables, accent, aperçu ordinateur/mobile. Les interactions sont enregistrées avec le projet. La réinitialisation et le changement de modèle demandent confirmation. Changer de modèle conserve la structure pour révision. Les écrans du prototype restent ceux du modèle, indépendamment des futurs écrans décrits dans le cahier des charges.
4. **Export** : cahier des charges Markdown, PDF réel, projet JSON structuré et prompt Codex reprenant les choix réels. Les exports distinguent décisions et éléments à valider. Si la copie automatique est indisponible, le prompt reste sélectionnable pour une copie manuelle. Enregistrer un livrable dans Ressources conserve une version modifiable et téléchargeable.

Les brouillons sont sauvegardés par l’action explicite d’enregistrement et les changements d’étape. Les interactions du prototype sont sauvegardées à chaque action. Quitter un éditeur modifié sans enregistrer demande confirmation, y compris depuis le menu mobile ou une recherche.

## Quatre modèles interactifs

- **École privée** : tableau de bord calculé à partir des fiches fictives, recherche, ajout et modification d’une fiche, classes, présence.
- **LMS** : catalogue, détail, navigation entre les leçons, validation explicite d’une leçon et progression calculée.
- **Portail parents** : enfant fictif, devoirs consultables, annonces filtrées, événements consultables. Aucune messagerie ni notification réelle.
- **Application de quiz** : questions à choix, score réel (un point par bonne réponse), correction, explications et nouvelle partie.

Prévisualiser un modèle ne crée pas de projet. **Créer un projet avec ce modèle** crée un projet indépendant en conservant la personnalisation de l’aperçu. Utilisez exclusivement des identités et informations fictives dans ces prototypes. Aucun code fourni par l’utilisateur n’est exécuté : les textes sont affichés par React dans des composants contrôlés.

## Projets, assistants et documents

La démo démarre avec trois projets identifiés comme exemples : Gestion école privée, Plateforme de cours et Application de devoirs. Les compteurs de documents démarrent à zéro ; ils reflètent uniquement les versions réellement enregistrées. Les dates sont celles des données sauvegardées.

Ouvrir un projet reprend son étape ; renommer, dupliquer et supprimer sont disponibles dans son menu. Une duplication copie aussi les documents et les données du prototype sans partager d’objet modifiable. La suppression confirmée retire le projet et ses ressources.

Les assistants demandent un projet existant ou permettent d’en créer un. Ils ouvrent le cahier des charges, la proposition d’architecture ou les rôles pour complétion. L’architecture propose React/TypeScript/Vite et Firebase déjà présents, puis décrit les services serveur, fichiers et intégrations éventuelles à construire. La recherche filtre les vrais projets, templates et documents ; les assistants sont aussi retrouvables dans Tous. Un filtre limite à Projets, Templates ou Ressources.

Un document de Ressources est une version enregistrée : sa modification ne change pas automatiquement le projet. Préparez une nouvelle version dans l’atelier pour reprendre les derniers choix. Le prompt Codex et les exports directs de l’atelier utilisent les données courantes du projet.

## Persistance et mise en ligne

La démonstration utilise `farabai-pedagogue-demo-v1`, isolé des deux autres espaces et des comptes. Réinitialiser demande confirmation et ne touche que cette démonstration. Une limite de stockage atteinte affiche une erreur ; une sauvegarde illisible est préservée jusqu’à une réinitialisation explicite.

Un compte Pédagogue confirmé ouvre **Ouvrir mon espace pédagogue** depuis son espace personnel. Ses projets utilisent `pedagogueWorkspaces/{uid}`, avec un cache local propre à son compte. Les modifications sont regroupées avant synchronisation ; un serveur indisponible laisse le statut **Enregistré sur cet appareil**, avec possibilité de réessayer. Ne supprimez pas le cache avant synchronisation si vous souhaitez conserver ces modifications.

**À faire dans le projet Firebase réel : Firestore Database → Règles → remplacer par le contenu complet de [`firestore.rules`](../firestore.rules) → Publier.** Le déploiement GitHub Pages ne publie pas les règles Firebase. Ces règles préservent profils et espaces précédents, ajoutent les travaux Pédagogue privés et refusent la liste globale et les faux droits payants. Ne passez pas la base en accès public.

Les documents Firestore restent soumis à sa limite de taille. Les suppressions sont conservées comme marqueurs lors des fusions ; les modifications simultanées d’un même projet utilisent la dernière date de modification, sans fusion collaborative des champs.

## Limites et suite

Aucun service IA n’est connecté. `src/pedagogue/designService.ts` assemble localement les réponses et les suggestions documentaires ; cette couche peut accueillir ultérieurement un service IA sécurisé côté serveur. Les prototypes restent des modèles, sans génération de code sur mesure, serveur métier, envoi de messages ou application complète en production.

Restent à construire pour une future application : services métier, permissions réelles, gestion éventuelle des établissements, stockage de fichiers, intégrations vérifiées, tests métier et déploiement choisi par l’utilisateur. Aucun prototype n’est publié automatiquement. La mise à jour de FarabAi sur GitHub est distincte et a été expressément autorisée par l’utilisateur.
