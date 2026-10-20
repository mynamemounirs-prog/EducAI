import {useEffect,useRef,useState} from 'react';
import {authService,authError} from '../services/auth';
import {emptyWorkspace,seedDemo} from './examples';
import {mergeWorkspaces,readWorkspace,type Workspace} from './model';

type Cache={workspace:Workspace;pending:boolean};
export function useWorkspace(mode:'demo'|'account',uid?:string){
 const key=mode==='demo'?'farabai-teacher-demo-v1':`farabai-teacher-user-${uid}`;
 const [workspace,setWorkspace]=useState<Workspace>(emptyWorkspace);const [ready,setReady]=useState(false);const [status,setStatus]=useState<'local'|'saving'|'cloud'|'error'>('local');const [error,setError]=useState('');
 const current=useRef(workspace);const generation=useRef(0);const revision=useRef(0);const queue=useRef(Promise.resolve());const corrupt=useRef(false);
 function cache(value:Workspace,pending:boolean){try{localStorage.setItem(key,JSON.stringify({workspace:value,pending}));return true}catch{setError('La sauvegarde sur cet appareil a échoué. Vérifiez l’espace disponible et les autorisations du navigateur.');setStatus('error');return false}}
 function enqueue(value:Workspace,epoch=generation.current,version=revision.current){
  if(mode!=='account'||!uid)return;setStatus('saving');
  queue.current=queue.current.catch(()=>{}).then(async()=>{
   if(epoch!==generation.current)return;
   try{const merged=await authService.saveTeacherWorkspace(uid,value);if(epoch===generation.current&&version===revision.current){current.current=merged;setWorkspace(merged);cache(merged,false);setError('');setStatus('cloud')}}
   catch(e){if(epoch===generation.current&&version===revision.current){setError('Travaux conservés uniquement sur cet appareil. '+authError(e));setStatus('local')}}
  });
 }
 useEffect(()=>{
  const epoch=++generation.current;revision.current=0;corrupt.current=false;setReady(false);setError('');setStatus('local');
  let stored:Cache|null=null;
  try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);stored={workspace:readWorkspace(parsed.workspace),pending:parsed.pending===true}}}catch(e){corrupt.current=true;setError(authError(e));setStatus('error')}
  const initial=stored?.workspace||(mode==='demo'?seedDemo():emptyWorkspace());current.current=initial;setWorkspace(initial);
  if(mode==='demo'){if(!stored&&!corrupt.current)cache(initial,false);setReady(true);return()=>{generation.current++}}
  if(!uid){setError('Connectez-vous pour ouvrir vos travaux.');setReady(true);return()=>{generation.current++}}
  setStatus('saving');
  void authService.loadTeacherWorkspace(uid).then(remote=>{
   if(epoch!==generation.current)return;
   const value=stored?.pending&&remote?mergeWorkspaces(stored.workspace,remote):stored?.pending?stored.workspace:remote||initial;
   corrupt.current=false;current.current=value;setWorkspace(value);cache(value,stored?.pending||false);setReady(true);
   if(stored?.pending)enqueue(value,epoch,0);else{setStatus('cloud');setError('')}
  }).catch(e=>{if(epoch===generation.current){setError('Le serveur est indisponible : les travaux restent sur cet appareil. '+authError(e));setStatus('local');setReady(true)}});
  return()=>{generation.current++};
 },[key]);
 function update(value:Workspace){
  if(corrupt.current){setError('La sauvegarde illisible est préservée. Réinitialisez explicitement la démonstration pour repartir.');return false}
  const next={...value,updatedAt:Date.now()};current.current=next;setWorkspace(next);const ok=cache(next,mode==='account');revision.current++;
  if(mode==='account')enqueue(next);else if(ok){setStatus('local');setError('')}
  return ok;
 }
 function reset(){if(mode!=='demo')return;corrupt.current=false;update(seedDemo())}
 return {workspace,ready,status,error,update,reset,sync:()=>enqueue(current.current)};
}
