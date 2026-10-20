import {useState,useEffect,useRef} from 'react';
import {ArrowRight,Sun,Moon,Sparkles} from 'lucide-react';
import {roles,plans,type Role,type Plan} from './data';
import {authService,authConfigured,authError,requireEmailVerification,type Account} from './services/auth';
import {CHECKOUT_URLS} from './config/payments';
import {ProfileChoices} from './components/ProfileChoices';
import {Logo} from './components/Logo';
import {Avatar} from './components/Avatar';
import {Modal} from './components/Modal';
import {Auth,type AuthTab} from './components/Auth';
import {Pricing} from './components/Pricing';
import {EmailAction} from './components/EmailAction';
import {AccountSpace,ProfileEditor} from './components/AccountSpace';
function read(key:string){try{return localStorage.getItem(key)}catch{return null}}
function save(key:string,value:string|null){try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}catch{/* Browsing without local preferences remains supported. */}}
function storedRole(){const value=read('farabai-role');return roles.some(r=>r.name===value)?value as Role:null}
function storedPlan(key:string){const value=read(key);return plans.some(p=>p.name===value)?value as Plan:null}
export default function App(){
 const [theme,setTheme]=useState(()=>read('farabai-theme')==='light'?'light':'dark');
 const [role,setRole]=useState<Role|null>(storedRole);const [plan,setPlan]=useState<Plan|null>(()=>storedPlan('farabai-plan'));const [pending,setPending]=useState<Plan|null>(()=>storedPlan('farabai-checkout'));
 const [modal,setModal]=useState<'auth'|'pricing'|'profile'|null>(null);const [authTab,setAuthTab]=useState<AuthTab>('login');const [legal,setLegal]=useState<string|null>(null);const [hovered,setHovered]=useState(false);
 const [account,setAccount]=useState<Account|null>(null);const [loading,setLoading]=useState(authConfigured);const [serviceError,setServiceError]=useState('');const [notice,setNotice]=useState('');const [paying,setPaying]=useState(false);const paymentLock=useRef(false);
 const [view,setView]=useState<'home'|'account'>(()=>window.location.hash==='#espace'?'account':'home');
 const [action,setAction]=useState(()=>{const query=new URLSearchParams(window.location.search);return query.has('mode')?{mode:query.get('mode')||'',code:query.get('oobCode')||''}:null});
 function navigate(next:'home'|'account'){setView(next);window.history.replaceState(null,'',window.location.pathname+window.location.search+(next==='account'?'#espace':''))}
 function selectRole(value:Role){setRole(value);save('farabai-role',value)}
 function acceptAccount(value:Account|null){setAccount(value);setLoading(false);setServiceError('');if(value?.role)selectRole(value.role)}
 useEffect(()=>{document.documentElement.dataset.theme=theme;save('farabai-theme',theme)},[theme]);
 useEffect(()=>authService.observe(value=>{setAccount(value);setLoading(false);if(value?.role)selectRole(value.role);if(value&&!action)navigate('account')},message=>{setServiceError(message);setLoading(false)}),[]);
 useEffect(()=>{const change=()=>setView(window.location.hash==='#espace'?'account':'home');window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 function openAuth(tab:AuthTab='login'){setAuthTab(tab);setModal('auth')}
 function finishAction(value:Account|null){setAction(null);window.history.replaceState(null,'',window.location.pathname);if(value){acceptAccount(value);navigate('account')}else navigate('home')}
 async function choosePlan(value:Plan){
  if(paymentLock.current)return;setPlan(value);save('farabai-plan',value);setPending(value);save('farabai-checkout',value);
  const selectedRole=value==='Pro'?role:value;if(value!=='Pro')selectRole(value);
  if(!account){openAuth();return}
  if(!account.role||account.profileError){setModal(null);navigate('account');return}
  paymentLock.current=true;setPaying(true);setServiceError('');
  try{if(selectedRole&&selectedRole!==account.role)acceptAccount(await authService.saveProfile(account.firstName,selectedRole));if(requireEmailVerification&&!account.emailVerified){setModal(null);navigate('account')}else window.location.assign(CHECKOUT_URLS[value])}catch(error){setServiceError(authError(error))}finally{paymentLock.current=false;setPaying(false)}
 }
 async function logOut(){await authService.signOut();setAccount(null);setNotice('');setModal(null);navigate('home')}
 return <div className="app"><header><button className="brand-button" aria-label="FarabAi — Accueil" onClick={()=>{navigate('home');setModal(null)}}><Logo/></button><nav aria-label="Navigation principale"><button className="nav-pricing" onClick={()=>setModal('pricing')}>Tarifs</button><span className="nav-divider"/><button className="icon-button theme-toggle" aria-label={theme==='dark'?'Activer le thème clair':'Activer le thème sombre'} onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button><button className="login-button" disabled={loading} onClick={()=>account?navigate('account'):openAuth()}>{account?'Mon espace':'Se connecter'} <ArrowRight size={15}/></button></nav></header>
 <main>{action?<EmailAction mode={action.mode} code={action.code} onDone={finishAction} onLogin={()=>openAuth()} onReset={()=>{finishAction(null);openAuth('reset')}}/>:view==='account'?<AccountSpace account={account} loading={loading} error={serviceError} notice={notice} pending={pending} preferredRole={role} onAccount={acceptAccount} onLogin={()=>openAuth()} onHome={()=>navigate('home')} onProfile={()=>setModal('profile')} onSignOut={logOut} onCancelPayment={()=>{setPending(null);save('farabai-checkout',null)}}/>:<div className="home cinematic-home"><aside className="robot-stage"><p className="stage-motto">Apprendre.<br/>Transmettre.<br/><span>Avancer ensemble.</span></p><div className="robot-speech">Bonjour !<br/>Moi, c’est <strong>FarabAi.</strong><span>Et vous, qui êtes-vous ?</span></div><Avatar active={hovered}/></aside><section className="welcome-panel" aria-labelledby="welcome-title"><div className="eyebrow">BIENVENUE SUR</div><div className="hero-wordmark">Farab<span>Ai</span></div><div className="hero-rule"/><div className="welcome"><h1 id="welcome-title">Qui <span>êtes-vous ?</span></h1><p>Choisissez votre profil pour une expérience personnalisée<br className="desktop-break"/> et adaptée à vos envies.</p></div><ProfileChoices disabled={loading} onHover={setHovered} onSelect={value=>{selectRole(value);if(account){setModal('profile')}else openAuth()}}/><p className="companion"><Sparkles size={14}/> Un compagnon IA pour apprendre, enseigner et créer.</p></section></div>}</main>
 <footer><span>© {new Date().getFullYear()} FarabAi</span><span className="footer-center">L’éducation augmentée par l’IA <span className="gold-dot">✦</span></span><div><button onClick={()=>setLegal('Confidentialité')}>Confidentialité</button><span>·</span><button onClick={()=>setLegal('Conditions d’utilisation')}>Conditions</button></div></footer>
 {modal&&<Modal title={modal==='pricing'?'À chaque ambition, son offre.':modal==='profile'?'Votre profil FarabAi':'Votre aventure commence ici.'} onClose={()=>{if(!paying)setModal(null)}} wide={modal==='pricing'}>{modal==='pricing'?<><Pricing role={role} onChoose={value=>void choosePlan(value)} busy={paying||loading}/>{serviceError&&<p className="error" role="alert">{serviceError}</p>}</>:modal==='profile'&&account?<ProfileEditor key={role} account={{...account,role:role||account.role}} onSaved={value=>{acceptAccount(value);setModal(null);navigate('account')}} onCancel={()=>setModal(null)}/>:<Auth key={authTab} initialTab={authTab} role={role} plan={pending||plan} onRole={selectRole} onSuccess={(value,message)=>{acceptAccount(value);setNotice(message);setModal(null);navigate('account')}} onLegal={setLegal}/>}</Modal>}
 {legal&&<Modal title={legal} onClose={()=>setLegal(null)}><p className="legal-copy">Page provisoire — en cours de rédaction.</p><p className="legal-copy">Firebase Authentication gère les comptes et la session persistante. Votre prénom et votre profil sont enregistrés dans un document Firestore accessible uniquement à votre compte. Les préférences de thème, profil et offre sont conservées dans votre navigateur. Aucun mot de passe n’est enregistré par FarabAi. Le paiement se déroule sur Stripe, qui reçoit les informations que vous saisissez sur sa page. L’activation automatique des droits après paiement n’est pas encore raccordée ; les outils pédagogiques sont en développement. Les documents juridiques définitifs doivent être finalisés avant l’ouverture commerciale.</p><button className="secondary full" onClick={()=>setLegal(null)}>Revenir au parcours</button></Modal>}
 </div>
}
