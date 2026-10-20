import {withDeadline} from './deadline';
import {getApp,getApps,initializeApp} from 'firebase/app';
import {initializeAuth,indexedDBLocalPersistence,browserLocalPersistence,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,updateProfile,sendEmailVerification,sendPasswordResetEmail,verifyPasswordResetCode,confirmPasswordReset,checkActionCode,applyActionCode,reload,connectAuthEmulator,type User} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,getDoc,setDoc,serverTimestamp} from 'firebase/firestore';
import {roles,type Role} from '../data';
import {authError,requireEmailVerification,type Account} from './auth';

const app=getApps().length?getApp():initializeApp({apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID});
// Only the Firebase SDK manages credentials/session persistence; passwords never leave its API.
const auth=initializeAuth(app,{persistence:[indexedDBLocalPersistence,browserLocalPersistence]});
auth.languageCode='fr';
const db=getFirestore(app);
// Emulators are opt-in, loopback-only and unavailable in production builds.
if(import.meta.env.DEV&&import.meta.env.VITE_USE_FIREBASE_EMULATORS==='true'){
 if(!['localhost','127.0.0.1','[::1]'].includes(window.location.hostname))throw new Error('Les émulateurs ne sont disponibles que sur la machine locale.');
 connectAuthEmulator(auth,'http://127.0.0.1:9099');
 connectFirestoreEmulator(db,'127.0.0.1',8080);
}
const appUrl=()=>new URL('.',window.location.href).href;
let profileRevision=0;
async function session(user:User|null):Promise<Account|null>{
 if(!user)return null;
 const account:Account={uid:user.uid,email:user.email||'',emailVerified:user.emailVerified,firstName:user.displayName||'',role:null};
 try{
  const snapshot=await withDeadline(getDoc(doc(db,'profiles',user.uid)),'La connexion au compte fonctionne, mais le service de profils ne répond pas. Réessayez le chargement de votre profil.');
  if(snapshot.exists()){
   const data=snapshot.data();
   if(typeof data.firstName==='string'&&roles.some(r=>r.name===data.role))return {...account,firstName:data.firstName,role:data.role as Role};
   return {...account,profileError:'Votre profil doit être complété avant de continuer.'};
  }
  return account;
 }catch(error){return {...account,profileError:authError(error)}}
}
export function observe(onChange:(account:Account|null)=>void,onError:(message:string)=>void){
 let generation=0;
 const stop=onAuthStateChanged(auth,user=>{const version=++generation;const revision=profileRevision;void session(user).then(value=>{if(version===generation&&revision===profileRevision)onChange(value)}).catch(error=>{if(version===generation)onError(authError(error))})},error=>onError(authError(error)));
 return()=>{generation++;stop()};
}
export async function saveProfile(firstName:string,role:Role){
 const user=auth.currentUser;if(!user)throw new Error('Connectez-vous pour enregistrer votre profil.');
 const name=firstName.trim();if(!name||name.length>80||!roles.some(r=>r.name===role))throw new Error('Vérifiez votre prénom et votre profil.');
 const ref=doc(db,'profiles',user.uid);const existing=await withDeadline(getDoc(ref),'Le service de profils ne répond pas. Vérifiez la création de la base Firestore et sa connexion, puis réessayez.');
 await withDeadline(setDoc(ref,{firstName:name,role,updatedAt:serverTimestamp(),...(!existing.exists()?{createdAt:serverTimestamp()}:{})},{merge:true}),'L’enregistrement du profil n’a pas été confirmé. Il peut encore aboutir : réessayez d’abord son chargement.');
 profileRevision++;
 return {uid:user.uid,email:user.email||'',firstName:name,emailVerified:user.emailVerified,role};
}
export async function signUp(firstName:string,email:string,password:string,role:Role){
 const result=await createUserWithEmailAndPassword(auth,email.trim(),password);
 // Account creation is already effective. A Firestore outage must not prevent
 // requesting the verification email or suggest recreating this same account.
 const [profile,verification]=await Promise.allSettled([
  saveProfile(firstName,role),
  requireEmailVerification?withDeadline(sendEmailVerification(result.user,{url:appUrl()}),'L’envoi de l’e-mail n’a pas été confirmé. Il peut encore arriver ; vous pouvez aussi demander un nouvel envoi.'):Promise.resolve(),
  withDeadline(updateProfile(result.user,{displayName:firstName.trim()}),'Mise à jour du prénom non confirmée.'),
 ]);
 const notices:string[]=[];
 const user=result.user;
 const account:Account=profile.status==='fulfilled'?profile.value:{uid:user.uid,email:user.email||'',firstName:firstName.trim(),emailVerified:user.emailVerified,role:null,profileError:authError(profile.reason)};
 if(profile.status==='rejected')notices.push('Votre compte a bien été créé, mais votre profil reste à finaliser. '+authError(profile.reason));
 if(verification.status==='rejected')notices.push('Votre compte existe. '+authError(verification.reason));
 return {account,notice:notices.join(' ')};
}
export async function signIn(email:string,password:string,role:Role|null){
 const result=await signInWithEmailAndPassword(auth,email.trim(),password);
 let account=(await session(result.user))!;
 if(role&&account.role&&role!==account.role)account=await saveProfile(account.firstName,role);
 return {account,notice:''};
}
export async function logOut(){await signOut(auth)}
export async function refresh(){if(auth.currentUser){await reload(auth.currentUser);await auth.currentUser.getIdToken(true)}return session(auth.currentUser)}
export async function resendVerification(){if(!auth.currentUser)throw new Error('Connectez-vous pour demander un nouvel e-mail.');await sendEmailVerification(auth.currentUser,{url:appUrl()})}
export async function requestReset(email:string){await sendPasswordResetEmail(auth,email.trim(),{url:appUrl()})}
export async function checkAction(mode:string,code:string){
 if(!code)throw new Error('Le lien ne contient pas de code de validation.');
 if(mode==='resetPassword')return verifyPasswordResetCode(auth,code);
 if(mode==='verifyEmail'){const info=await checkActionCode(auth,code);if(info.operation!=='VERIFY_EMAIL')throw new Error('Ce lien ne correspond pas à une confirmation d’e-mail.');return info.data.email||''}
 throw new Error('Ce type de lien n’est pas pris en charge.');
}
export async function completeAction(mode:string,code:string,password?:string){
 if(mode==='resetPassword'){
  if(!password||password.length<8)throw new Error('Utilisez au moins 8 caractères.');
  await confirmPasswordReset(auth,code,password);await signOut(auth);return null;
 }
 if(mode==='verifyEmail'){await applyActionCode(auth,code);return refresh()}
 throw new Error('Ce type de lien n’est pas pris en charge.');
}
