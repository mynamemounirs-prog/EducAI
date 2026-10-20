export const levels=['Collège','Lycée','BTS / Supérieur'] as const;
export type Level=typeof levels[number];
export type Tool='course'|'quiz'|'exam'|'research';
export type Format='pdf'|'ppt'|'video'|'game';
export const toolNames:Record<Tool,string>={course:'Cours',quiz:'Quiz',exam:'Examen',research:'Recherche'};
export const classes:Record<Level,string[]>={'Collège':['6e','5e','4e','3e'],'Lycée':['Seconde','Première','Terminale'],'BTS / Supérieur':['BTS 1','BTS 2','Licence','Master']};
export type Section={id:string;title:string;text:string};
export type Question={id:string;prompt:string;type:'mcq'|'boolean'|'open';options:string[];answer:string;explanation:string};
export type Exercise={id:string;title:string;prompt:string;correction:string;points:number};
export type Source={id:string;title:string;url:string};
export type Scene={id:string;title:string;narration:string;onScreen:string;seconds:number};
export type Project={id:string;title:string;subject:string;level:Level;className:string;description:string;cover:'energy'|'ai'|'embedded'|'plain';isExample:boolean;createdAt:number;updatedAt:number};
export type Resource={id:string;projectId:string;kind:Tool;title:string;subject:string;level:Level;className:string;duration:number;objectives:string;count:number;questionType:'mcq'|'boolean'|'open'|'mixed';difficulty:string;total:number;sections:Section[];questions:Question[];exercises:Exercise[];notes:string;sources:Source[];storyboard:Scene[];isExample:boolean;createdAt:number;updatedAt:number};
export type Workspace={schemaVersion:1;projects:Project[];resources:Resource[];settings:{displayName:string;level:Level;className:string;subject:string;format:Format};deletedProjects:string[];deletedResources:string[];updatedAt:number};
export const uid=()=>crypto.randomUUID();
export function blankResource(kind:Tool,w:Workspace):Resource{return {id:uid(),projectId:w.projects[0]?.id||'',kind,title:'',subject:w.settings.subject,level:w.settings.level,className:w.settings.className,duration:60,objectives:'',count:4,questionType:'mixed',difficulty:'Intermédiaire',total:20,sections:[],questions:[],exercises:[],notes:'',sources:[],storyboard:[],isExample:false,createdAt:Date.now(),updatedAt:Date.now()}}
export function newProject(title:string,subject:string,level:Level,className=''):Project{return {id:uid(),title,subject,level,className,description:'',cover:'plain',isExample:false,createdAt:Date.now(),updatedAt:Date.now()}}
export function resourceText(r:Resource){return [r.title,r.subject,r.level,r.notes,r.objectives,...r.sections.flatMap(s=>[s.title,s.text]),...r.questions.map(q=>q.prompt),...r.exercises.flatMap(e=>[e.title,e.prompt]),...r.sources.map(s=>s.title)].join(' ')}
export const searchable=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
export const dateLabel=(date:number)=>new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);
export function validQuestion(q:Question){return !!q.prompt.trim()&&(q.type==='open'||(q.options.length>=2&&q.options.every(v=>v.trim())&&new Set(q.options.map(v=>v.trim())).size===q.options.length&&q.options.includes(q.answer)))}
export function pointsValid(r:Resource){return r.exercises.length>0&&r.total>0&&r.exercises.every(e=>Number.isFinite(e.points)&&e.points>=0)&&Math.round(r.exercises.reduce((n,e)=>n+e.points,0)*100)===Math.round(r.total*100)}
export function distributePoints(total:number,weights:number[]){if(!weights.length)return [];const cents=Math.round(total*100),sum=weights.reduce((a,b)=>a+b,0);const raw=weights.map(w=>cents*(sum?w:1)/(sum||weights.length));const values=raw.map(Math.floor);const remaining=cents-values.reduce((a,b)=>a+b,0);const order=raw.map((v,i)=>({i,remainder:v-values[i]})).sort((a,b)=>b.remainder-a.remainder);for(let i=0;i<remaining;i++)values[order[i%order.length].i]++;return values.map(v=>v/100)}
export function readWorkspace(value:unknown):Workspace{
 const w=value as Workspace;
 if(!w||w.schemaVersion!==1||!Array.isArray(w.projects)||!Array.isArray(w.resources)||!w.settings||!levels.includes(w.settings.level)||!['pdf','ppt','video','game'].includes(w.settings.format)||!Array.isArray(w.deletedProjects)||!Array.isArray(w.deletedResources)||!Number.isFinite(w.updatedAt))throw new Error('Le format de cette sauvegarde n’est pas reconnu. Vos données n’ont pas été remplacées.');
 for(const p of w.projects)if(typeof p.id!=='string'||typeof p.title!=='string'||!levels.includes(p.level)||!Number.isFinite(p.updatedAt))throw new Error('Un projet de la sauvegarde est invalide.');
 for(const r of w.resources)if(typeof r.id!=='string'||typeof r.title!=='string'||!['course','quiz','exam','research'].includes(r.kind)||!levels.includes(r.level)||![r.sections,r.questions,r.exercises,r.sources,r.storyboard].every(Array.isArray)||!Number.isFinite(r.updatedAt))throw new Error('Une ressource de la sauvegarde est invalide.');
 return {schemaVersion:1,projects:w.projects,resources:w.resources,settings:w.settings,deletedProjects:w.deletedProjects,deletedResources:w.deletedResources,updatedAt:w.updatedAt};
}
export function mergeWorkspaces(local:Workspace,remote:Workspace):Workspace{
 const deletedProjects=[...new Set([...local.deletedProjects,...remote.deletedProjects])];const deletedResources=[...new Set([...local.deletedResources,...remote.deletedResources])];
 function merge<T extends {id:string;updatedAt:number}>(a:T[],b:T[],deleted:string[]){const map=new Map<string,T>();for(const item of [...b,...a])if(!deleted.includes(item.id)&&(!map.has(item.id)||item.updatedAt>=map.get(item.id)!.updatedAt))map.set(item.id,item);return [...map.values()]}
 const projects=merge(local.projects,remote.projects,deletedProjects);const resources=merge(local.resources,remote.resources,deletedResources).filter(r=>!deletedProjects.includes(r.projectId));
 return {schemaVersion:1,projects,resources,settings:local.updatedAt>=remote.updatedAt?local.settings:remote.settings,deletedProjects,deletedResources,updatedAt:Math.max(local.updatedAt,remote.updatedAt)};
}
