import {ProfileChoices} from './components/ProfileChoices';
import {useState,useEffect} from 'react';
import {ArrowRight,Sun,Moon,Sparkles,ChevronDown,ArrowLeft} from 'lucide-react';
import {roles,plans,type Role,type Plan} from './data';
import {Logo} from './components/Logo';
import {Avatar} from './components/Avatar';
import {Modal} from './components/Modal';
import {Auth} from './components/Auth';
import {Pricing} from './components/Pricing';
function read(key:string){try{return localStorage.getItem(key)}catch{return null}}
function save(key:string,value:string){try{localStorage.setItem(key,value)}catch{/* Browsing without persistence remains supported. */}}
export default function App(){
 const [theme,setTheme]=useState(()=>read('farabai-theme')==='light'?'light':'dark');const [role,setRole]=useState<Role|null>(()=>{const r=read('farabai-role');return roles.some(x=>x.name===r)?r as Role:null});const [plan,setPlan]=useState<Plan|null>(()=>{const p=read('farabai-plan');return plans.some(x=>x.name===p)?p as Plan:null});const [modal,setModal]=useState<'auth'|'pricing'|null>(null);const [legal,setLegal]=useState<string|null>(null);const [entered,setEntered]=useState(false);const [hovered,setHovered]=useState(false);
 useEffect(()=>{document.documentElement.dataset.theme=theme;save('farabai-theme',theme)},[theme]);
 function selectRole(r:Role){setRole(r);save('farabai-role',r)}
 function choosePlan(p:Plan){setPlan(p);save('farabai-plan',p);if(p!=='Pro')selectRole(p);setModal('auth')}
 return <div className="app"><header><button className="brand-button" aria-label="FarabAi — Accueil" onClick={()=>{setEntered(false);setModal(null)}}><Logo/></button><nav aria-label="Navigation principale"><button className="nav-pricing" onClick={()=>setModal('pricing')}>Tarifs</button><span className="nav-divider"/><button className="icon-button theme-toggle" aria-label={theme==='dark'?'Activer le thème clair':'Activer le thème sombre'} onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button><button className="login-button" onClick={()=>setModal('auth')}>Se connecter <ArrowRight size={15}/></button></nav></header>
 <main>{!entered?<div className="home"><div className="eyebrow"><span/> L’INTELLIGENCE AU SERVICE DE VOTRE POTENTIEL</div><Avatar active={hovered}/><div className="welcome"><h1>Bonjour, moi c’est <span>FarabAi</span> <span className="wave">👋</span></h1><p>Quel rôle choisis-tu aujourd’hui ?</p></div><ProfileChoices onHover={setHovered} onSelect={r=>{selectRole(r);setModal('auth')}}/><p className="companion"><Sparkles size={14}/> Un compagnon IA pour apprendre, enseigner et créer.</p></div>:<div className="space"><span className="badge">ESPACE DE DÉMONSTRATION</span><Avatar active/><h1>Bienvenue dans votre espace <span>{role}</span></h1><p>Votre prochain chapitre commence ici.<br/>Cet espace sera développé à la prochaine étape.</p>{plan&&<p className="selected-plan">Offre {plan} · Paiement bientôt disponible</p>}<div className="space-actions"><button className="primary" onClick={()=>setModal('auth')}>Changer de profil <ChevronDown size={16}/></button><button className="secondary" onClick={()=>setEntered(false)}><ArrowLeft size={16}/> Retour à l’accueil</button></div></div>}</main>
 <footer><span>© {new Date().getFullYear()} FarabAi</span><span className="footer-center">Le savoir ouvre des possibles<span className="gold-dot">✦</span></span><div><button onClick={()=>setLegal('Confidentialité')}>Confidentialité</button><span>·</span><button onClick={()=>setLegal('Conditions d’utilisation')}>Conditions</button></div></footer>
 {modal&&<Modal title={modal==='pricing'?'Investissez dans votre potentiel.':'Votre aventure commence ici.'} onClose={()=>setModal(null)} wide={modal==='pricing'}>{modal==='pricing'?<Pricing role={role} onChoose={choosePlan}/>:<Auth role={role} plan={plan} onRole={selectRole} onEnter={()=>{if(role){setEntered(true);setModal(null)}}} onLegal={setLegal}/>}</Modal>}
 {legal&&<Modal title={legal} onClose={()=>setLegal(null)}><p className="legal-copy">Page provisoire — en cours de rédaction.</p><p className="legal-copy">FarabAi est actuellement une démonstration sans authentification réelle, service IA connecté ni paiement. Seuls votre thème, votre profil et votre offre sont conservés dans votre navigateur. Les mots de passe ne sont ni stockés ni transmis. Les conditions définitives seront disponibles avant l’ouverture du service.</p><button className="secondary full" onClick={()=>setLegal(null)}>Revenir au parcours</button></Modal>}
 </div>
}
