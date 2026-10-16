export const googleConfigured=Boolean(import.meta.env.VITE_FIREBASE_API_KEY&&import.meta.env.VITE_FIREBASE_AUTH_DOMAIN&&import.meta.env.VITE_FIREBASE_PROJECT_ID);
export const authService = {
 async submitDemoForm(){await new Promise(resolve=>setTimeout(resolve,450));return {message:'Formulaire vérifié. Aucun compte réel n’a été créé et aucune connexion n’a été effectuée. Utilisez « Continuer en démonstration ».'}},
 async signInGoogle(){
  if(!googleConfigured)throw new Error('La connexion Google sera disponible après son activation par FarabAi. Vous pouvez continuer en démonstration.');
  try{return await (await import('./googleAuth')).signInGoogle()}
  catch(error){
   const code=(error as {code?:string}).code;
   if(code==='auth/popup-closed-by-user'||code==='auth/cancelled-popup-request')throw new Error('Connexion Google annulée. Vous pouvez réessayer.');
   if(code==='auth/popup-blocked')throw new Error('La fenêtre Google a été bloquée. Autorisez les fenêtres contextuelles pour ce site, puis réessayez.');
   if(code==='auth/unauthorized-domain')throw new Error('Ce domaine doit être autorisé dans la configuration Firebase de FarabAi.');
   if(code==='auth/operation-not-allowed')throw new Error('La connexion Google doit être activée dans Firebase Authentication.');
   throw new Error('Connexion Google indisponible. Vérifiez votre connexion ou réessayez plus tard.');
  }
 },
 async signOutGoogle(){if(googleConfigured)await (await import('./googleAuth')).signOutGoogle()},
};
