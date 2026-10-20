import type {Role} from '../data';
import type {StudentWorkspace} from '../student/model';
import type {Workspace} from '../teacher/model';

export type Account={uid:string;email:string;firstName:string;emailVerified:boolean;role:Role|null;profileError?:string};
export const authConfigured=Boolean(import.meta.env.VITE_FIREBASE_API_KEY&&import.meta.env.VITE_FIREBASE_AUTH_DOMAIN&&import.meta.env.VITE_FIREBASE_PROJECT_ID);
export const requireEmailVerification=import.meta.env.VITE_REQUIRE_EMAIL_VERIFICATION!=='false';
export const CONFIG_MESSAGE='Le service de connexion n’est pas encore configuré. La création de compte, la connexion et les e-mails seront disponibles après son activation.';
export function authError(error:unknown):string{
 const code=(error as {code?:string})?.code;
 const messages:Record<string,string>={
 'auth/invalid-email':'Cette adresse e-mail n’est pas valide.',
 'auth/invalid-credential':'L’adresse e-mail ou le mot de passe est incorrect.',
 'auth/wrong-password':'L’adresse e-mail ou le mot de passe est incorrect.',
 'auth/user-not-found':'L’adresse e-mail ou le mot de passe est incorrect.',
 'auth/email-already-in-use':'Un compte utilise déjà cette adresse. Connectez-vous ou réinitialisez votre mot de passe.',
 'auth/weak-password':'Ce mot de passe ne respecte pas la politique de sécurité du service. Utilisez au moins 8 caractères et renforcez-le.',
 'auth/password-does-not-meet-requirements':'Le mot de passe ne respecte pas les exigences de sécurité configurées pour ce service.',
 'auth/too-many-requests':'Trop de tentatives. Patientez quelques minutes avant de réessayer.',
 'auth/network-request-failed':'La connexion au service a échoué. Vérifiez votre accès Internet puis réessayez.',
 'auth/user-disabled':'Ce compte est désactivé. Contactez l’administrateur.',
 'auth/operation-not-allowed':'La connexion par e-mail doit être activée dans Firebase Authentication.',
 'auth/unauthorized-continue-uri':'L’adresse de retour doit être autorisée dans Firebase Authentication.',
 'auth/invalid-continue-uri':'L’adresse de retour du service est incorrecte.',
 'auth/invalid-api-key':'La configuration du service de connexion est incorrecte.',
 'auth/configuration-not-found':'Firebase Authentication n’est pas activé pour ce projet. Activez le fournisseur Adresse e-mail/Mot de passe dans Firebase.',
 'auth/app-not-authorized':'La clé Firebase n’autorise pas ce site. Vérifiez sa configuration et ses restrictions de domaine.',
 'not-found':'La base de profils est introuvable. La base Firestore (default) doit être créée dans le même projet Firebase.',
 'auth/expired-action-code':'Ce lien a expiré. Demandez un nouvel e-mail.',
 'auth/invalid-action-code':'Ce lien est invalide ou a déjà été utilisé. Demandez un nouvel e-mail.',
 'permission-denied':'L’accès au profil est refusé. Les règles Firestore doivent autoriser uniquement le propriétaire du profil.',
 'unavailable':'Le service de profils est momentanément inaccessible. Vérifiez votre connexion puis réessayez.',
 };
 if(code&&messages[code])return messages[code];
 return error instanceof Error&&!code?error.message:'Le service n’a pas pu terminer cette opération. Veuillez réessayer.';
}
async function backend(){if(!authConfigured)throw new Error(CONFIG_MESSAGE);return import('./firebaseClient')}
export const authService={
 observe(onChange:(account:Account|null)=>void,onError:(message:string)=>void){
  let disposed=false;let unsubscribe:(()=>void)|undefined;
  if(!authConfigured){onChange(null);return()=>{}}
  void backend().then(client=>{if(!disposed)unsubscribe=client.observe(onChange,onError)}).catch(error=>{if(!disposed)onError(authError(error))});
  return()=>{disposed=true;unsubscribe?.()};
 },
 async loadStudentWorkspace(uid:string){return (await backend()).loadStudentWorkspace(uid)},
 async saveStudentWorkspace(uid:string,value:StudentWorkspace){return (await backend()).saveStudentWorkspace(uid,value)},
 async loadTeacherWorkspace(uid:string){return (await backend()).loadTeacherWorkspace(uid)},
 async saveTeacherWorkspace(uid:string,value:Workspace){return (await backend()).saveTeacherWorkspace(uid,value)},
 async signUp(firstName:string,email:string,password:string,role:Role){return (await backend()).signUp(firstName,email,password,role)},
 async signIn(email:string,password:string,role:Role|null){return (await backend()).signIn(email,password,role)},
 async signOut(){if(authConfigured)await (await backend()).logOut()},
 async saveProfile(firstName:string,role:Role){return (await backend()).saveProfile(firstName,role)},
 async refresh(){return (await backend()).refresh()},
 async resendVerification(){return (await backend()).resendVerification()},
 async requestReset(email:string){return (await backend()).requestReset(email)},
 async checkAction(mode:string,code:string){return (await backend()).checkAction(mode,code)},
 async completeAction(mode:string,code:string,password?:string){return (await backend()).completeAction(mode,code,password)},
};
