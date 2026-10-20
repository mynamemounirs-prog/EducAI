# Paiements et limites actuelles

La configuration unique `src/config/payments.ts` contient exactement les quatre liens Stripe fournis. Enseignant et Pédagogue conservent leur identité et leur profil distincts malgré leur lien commun.

- Utilisateur connecté, e-mail confirmé si exigé et profil chargé : « Choisir cette offre » ouvre Stripe dans le même onglet. Le changement de profil correspondant à l’offre est enregistré avant la navigation.
- Utilisateur non connecté : l’offre et le profil sont conservés comme préférences locales. Après authentification effective et confirmation éventuelle, le compte affiche le bouton explicite « Continuer vers le paiement ».
- Un choix Pro laisse choisir le profil de départ ; un compte existant conserve son profil de départ.
- Le retour depuis Stripe, les paramètres d’URL et les choix locaux n’activent aucun abonnement. Les tests interceptent les navigations Stripe : aucun paiement réel n’est effectué.

## À raccorder côté serveur

L’activation automatique des droits après paiement reste à raccorder via des webhooks Stripe vérifiés. Un serveur devra vérifier la signature avec un secret de webhook gardé côté serveur, traiter les événements de manière idempotente, relier de façon fiable le client Stripe au compte Firebase et suivre aussi les échecs, résiliations et changements d’abonnement. Aucun champ d’abonnement n’est modifiable par les clients Firestore. Ne pas déduire un droit d’un simple e-mail ou d’un paramètre de retour.

Les outils pédagogiques sont en développement et les textes juridiques provisoires doivent être finalisés avant l’ouverture commerciale. Cette version propose les liens de paiement demandés sans afficher « abonnement actif ».
