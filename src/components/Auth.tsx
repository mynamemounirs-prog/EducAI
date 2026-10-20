import {useRef,useState,type FormEvent} from 'react';
import {LockKeyhole} from 'lucide-react';
import {roles,type Role,type Plan} from '../data';
import {authService,authConfigured,authError,CONFIG_MESSAGE,type Account} from '../services/auth';
import {PasswordField} from './PasswordField';
export type AuthTab='login'|'signup'|'reset';
export function Auth({role,plan,onRole,onSuccess,onLegal,initialTab='login'}:{role:Role|null;plan:Plan|null;onRole:(r:Role)=>void;onSuccess:(account:Account,notice:string)=>void;onLegal:(s:string)=>void;initialTab?:AuthTab}){
 const [tab,setTab]=useState<AuthTab>(initialTab);const [error,setError]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const lock=useRef(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(lock.current)return;setError('');setMessage('');const form=e.currentTarget;const data=new FormData(form);
  if(!authConfigured){setError(CONFIG_MESSAGE);return}
  const firstName=String(data.get('firstname')||'').trim();const password=String(data.get('password')||'');
  if(tab==='signup'&&(!firstName||!role)){setError('Renseignez votre prénom et choisissez un profil.');return}
  if(tab==='signup'&&password!==data.get('confirm')){setError('Les mots de passe ne correspondent pas.');return}
  lock.current=true;setBusy(true);
  try{
   const email=String(data.get('email')||'').trim();
   if(tab==='reset'){await authService.requestReset(email);setMessage('Si un compte correspond à cette adresse, un e-mail de réinitialisation vous sera envoyé. Consultez aussi vos courriers indésirables.');form.reset()}
   else{const result=tab==='signup'?await authService.signUp(firstName,email,password,role!):await authService.signIn(email,password,role);form.reset();onSuccess(result.account,result.notice)}
  }catch(error){setError(authError(error))}finally{lock.current=false;setBusy(false)}
 }
 function changeTab(value:AuthTab){if(busy)return;setTab(value);setError('');setMessage('')}
 return <><p className="modal-subtitle">Votre compte, votre espace d’apprentissage.</p>{!authConfigured&&<p className="service-notice" role="status"><LockKeyhole size={18}/><span>{CONFIG_MESSAGE} Aucun compte ne sera simulé.</span></p>}
 <label className="field">Votre profil<select value={role||''} disabled={busy} onChange={e=>onRole(e.target.value as Role)}><option value="">{tab==='signup'?'Choisissez votre profil':'Profil du compte ou votre choix'}</option>{roles.map(r=><option key={r.name}>{r.name}</option>)}</select></label>
 {plan&&<p className="selected-plan">Offre {plan} sélectionnée. Après connexion, vous pourrez continuer vers Stripe.</p>}
 <div className="tabs" role="tablist" aria-label="Authentification"><button role="tab" aria-selected={tab!=='signup'} disabled={busy} onClick={()=>changeTab('login')}>Se connecter</button><button role="tab" aria-selected={tab==='signup'} disabled={busy} onClick={()=>changeTab('signup')}>Créer un compte</button></div>
 <form key={tab} onSubmit={submit} className="auth-form" aria-busy={busy}>
 <fieldset disabled={busy}>
 {tab==='reset'&&<p className="form-intro">Recevez un lien pour choisir un nouveau mot de passe.</p>}
 {tab==='signup'&&<label className="field">Prénom<input name="firstname" autoComplete="given-name" required maxLength={80} placeholder="Votre prénom"/></label>}
 <label className="field">Adresse e-mail<input name="email" type="email" autoComplete="email" required placeholder="vous@exemple.fr"/></label>
 {tab!=='reset'&&<><PasswordField autoComplete={tab==='login'?'current-password':'new-password'}/>{tab==='signup'?<><PasswordField label="Confirmer le mot de passe" name="confirm" autoComplete="new-password"/><label className="consent"><input type="checkbox" required/><span>J’accepte les <button type="button" onClick={()=>onLegal('Conditions d’utilisation')}>conditions d’utilisation</button> et la <button type="button" onClick={()=>onLegal('Politique de confidentialité')}>politique de confidentialité</button>.</span></label></>:<button type="button" className="text-button forgot" onClick={()=>changeTab('reset')}>Mot de passe oublié ?</button>}</>}
 </fieldset>
 {error&&<p className="error" role="alert">{error}</p>}{message&&<p className="form-message" role="status">{message}</p>}
 <button className="primary" disabled={busy||!authConfigured}>{busy?'Veuillez patienter…':tab==='signup'?'Créer mon compte':tab==='reset'?'Envoyer le lien de réinitialisation':'Se connecter'}</button>
 {tab==='reset'&&<button type="button" className="text-button back-to-login" disabled={busy} onClick={()=>changeTab('login')}>Retour à la connexion</button>}
 </form><p className="privacy-note">Vos identifiants et votre session sont gérés par Firebase. Aucun paiement n’est effectué ici.</p></>
}
