import {useEffect,useRef,useState} from 'react';
import {authService,authError} from '../services/auth';
import {emptyPedagogue,readPedagogue,mergePedagogue,type PedagogueWorkspace} from './model';
import {seedPedagogue} from './templates';


type Cache={workspace:PedagogueWorkspace;pending:boolean};
export function usePedagogueWorkspace(mode:'demo'|'account',uid?:string){
 const key=mode==='demo'?'farabai-pedagogue-demo-v1':`farabai-pedagogue-user-${uid}`;
 const [workspace,setPedagogueWorkspace]=useState<PedagogueWorkspace>(emptyPedagogue);const [ready,setReady]=useState(false);const [status,setStatus]=useState<'local'|'saving'|'cloud'|'error'>('local');const [error,setError]=useState('');
 const autosave=useRef<ReturnType<typeof setTimeout>|null>(null);const current=useRef(workspace);const generation=useRef(0);const revision=useRef(0);const queue=useRef(Promise.resolve());const corrupt=useRef(false);
 function cache(value:PedagogueWorkspace,pending:boolean){try{localStorage.setItem(key,JSON.stringify({workspace:value,pending}));return true}catch{setError('La sauvegarde sur cet appareil a échoué. Vérifiez l’espace disponible et les autorisations du navigateur.');setStatus('error');return false}}
 function enqueue(value:PedagogueWorkspace,epoch=generation.current,version=revision.current){
  if(mode!=='account'||!uid)return;setStatus('saving');
  queue.current=queue.current.catch(()=>{}).then(async()=>{
   if(epoch!==generation.current||version!==revision.current)return;
   try{const merged=await authService.savePedagogueWorkspace(uid,value);if(epoch===generation.current&&version===revision.current){current.current=merged;setPedagogueWorkspace(merged);cache(merged,false);setError('');setStatus('cloud')}}
   catch(e){if(epoch===generation.current&&version===revision.current){setError('Travaux conservés uniquement sur cet appareil. '+authError(e));setStatus('local')}}
  });
 }
 useEffect(()=>{
  const epoch=++generation.current;revision.current=0;corrupt.current=false;setReady(false);setError('');setStatus('local');
  let stored:Cache|null=null;
  try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);stored={workspace:readPedagogue(parsed.workspace),pending:parsed.pending===true}}}catch(e){corrupt.current=true;setError(authError(e));setStatus('error')}
  const initial=stored?.workspace||(mode==='demo'?seedPedagogue():emptyPedagogue());current.current=initial;setPedagogueWorkspace(initial);
  if(mode==='demo'){if(!stored&&!corrupt.current)cache(initial,false);setReady(true);return()=>{generation.current++}}
  if(!uid){setError('Connectez-vous pour ouvrir vos travaux.');setReady(true);return()=>{generation.current++}}
  setStatus('saving');
  void authService.loadPedagogueWorkspace(uid).then(remote=>{
   if(epoch!==generation.current)return;
   const value=stored?.pending&&remote?mergePedagogue(stored.workspace,remote):stored?.pending?stored.workspace:remote||initial;
   corrupt.current=false;current.current=value;setPedagogueWorkspace(value);cache(value,stored?.pending||false);setReady(true);
   if(stored?.pending)enqueue(value,epoch,0);else{setStatus('cloud');setError('')}
  }).catch(e=>{if(epoch===generation.current){setError('Le serveur est indisponible : les travaux restent sur cet appareil. '+authError(e));setStatus('local');setReady(true)}});
  return()=>{generation.current++;if(autosave.current)clearTimeout(autosave.current)};
 },[key]);
 function update(value:PedagogueWorkspace){
  if(corrupt.current){setError('La sauvegarde illisible est préservée. Réinitialisez explicitement la démonstration pour repartir.');return false}
  const next={...value,updatedAt:Date.now()};current.current=next;setPedagogueWorkspace(next);const ok=cache(next,mode==='account');revision.current++;
  if(mode==='account'){setStatus('saving');if(autosave.current)clearTimeout(autosave.current);const epoch=generation.current,version=revision.current;autosave.current=setTimeout(()=>enqueue(next,epoch,version),500)}else if(ok){setStatus('local');setError('')}
  return ok;
 }
 function reset(){if(mode!=='demo')return;corrupt.current=false;update(seedPedagogue())}
 return {workspace,ready,status,error,update,reset,sync:()=>{if(autosave.current)clearTimeout(autosave.current);enqueue(current.current)}};
}
