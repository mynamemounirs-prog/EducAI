// Replace this adapter with a real authentication provider when the backend is available.
export const authService = { async submitDemoForm(){await new Promise(resolve=>setTimeout(resolve,450));return {message:'Formulaire vérifié. Aucun compte réel n’a été créé et aucune connexion n’a été effectuée. Utilisez « Continuer en démonstration ».'}} };
