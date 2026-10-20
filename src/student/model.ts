import {uid,type Level} from '../teacher/model';
export type Mode='learn'|'revise'|'exam'|'solve'|'explain';
export type Step={title:string;text:string};
export type Card={id:string;question:string;answer:string};
export type Question={id:string;prompt:string;options:string[];answer:string;explanation:string;points:number};
export type Course={id:string;title:string;subject:string;level:Level;text:string;example:boolean;steps:Step[];cards:Card[];quiz:Question[];memo:string;completed:number[];position:number;review:Record<string,'review'|'understood'>;quizAnswers:Record<string,string>;quizSubmitted:boolean;lastActivity:number;updatedAt:number};
export type Note={id:string;courseId:string;kind:'memo'|'map';title:string;text:string;branches:{id:string;title:string;children:string}[];updatedAt:number};
export type Attempt={id:string;courseId:string;title:string;subject:string;level:Level;questions:Question[];openPrompt:string;openCorrection:string;answers:Record<string,string>;openAnswer:string;selfAssessment:string;duration:number;timer:boolean;deadline:number;remaining:number;submittedAt:number;updatedAt:number};
export type ExerciseWork={id:string;courseId:string;prompt:string;answer:string;step:number;hint:boolean;correction:boolean;completedAt:number;updatedAt:number;example:boolean};
export type StudentWorkspace={schemaVersion:1;courses:Course[];notes:Note[];attempts:Attempt[];exercises:ExerciseWork[];settings:{displayName:string;level:Level;subject:string};deletedCourses:string[];deletedNotes:string[];updatedAt:number};
export function emptyStudent():StudentWorkspace{return {schemaVersion:1,courses:[],notes:[],attempts:[],exercises:[],settings:{displayName:'Étudiant invité',level:'Lycée',subject:'Sciences'},deletedCourses:[],deletedNotes:[],updatedAt:Date.now()}}
export function fromText(title:string,subject:string,level:Level,text:string):Course{
 const paragraphs=text.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);const steps=paragraphs.map((text,i)=>({title:`Lecture · partie ${i+1}`,text}));
 return {id:uid(),title,subject,level,text,example:false,steps,cards:[],quiz:[],memo:'',completed:[],position:0,review:{},quizAnswers:{},quizSubmitted:false,lastActivity:0,updatedAt:Date.now()};
}
export function touch(c:Course):Course{return {...c,lastActivity:Date.now(),updatedAt:Date.now()}}
export function completion(c:Course){return c.steps.length?Math.round(c.completed.length/c.steps.length*100):0}
export function statistics(w:StudentWorkspace){const started=w.courses.filter(c=>c.lastActivity>0);const total=started.reduce((n,c)=>n+c.steps.length,0),done=started.reduce((n,c)=>n+c.completed.length,0);return {started:started.length,done,total,percent:total?Math.round(done/total*100):0,exercises:w.exercises.filter(e=>e.completedAt>0).length,exams:w.attempts.filter(a=>a.submittedAt>0).length}}
export function readStudent(value:unknown):StudentWorkspace{
 const w=value as StudentWorkspace;if(!w||w.schemaVersion!==1||![w.courses,w.notes,w.attempts,w.exercises,w.deletedCourses,w.deletedNotes].every(Array.isArray)||!w.settings||typeof w.settings.displayName!=='string'||!Number.isFinite(w.updatedAt))throw new Error('Cette sauvegarde étudiante est illisible. Elle a été préservée.');
 for(const c of w.courses)if(typeof c.id!=='string'||typeof c.text!=='string'||!Array.isArray(c.steps)||!Array.isArray(c.completed)||!Array.isArray(c.cards)||!Array.isArray(c.quiz))throw new Error('Un cours enregistré est illisible.');
 return {schemaVersion:1,courses:w.courses,notes:w.notes,attempts:w.attempts,exercises:w.exercises,settings:w.settings,deletedCourses:w.deletedCourses,deletedNotes:w.deletedNotes,updatedAt:w.updatedAt};
}
export function mergeStudent(a:StudentWorkspace,b:StudentWorkspace):StudentWorkspace{
 const deletedCourses=[...new Set([...a.deletedCourses,...b.deletedCourses])],deletedNotes=[...new Set([...a.deletedNotes,...b.deletedNotes])];
 function merge<T extends {id:string;updatedAt:number}>(x:T[],y:T[],deleted:string[]=[]){const map=new Map<string,T>();for(const item of [...y,...x])if(!deleted.includes(item.id)&&(!map.has(item.id)||item.updatedAt>=map.get(item.id)!.updatedAt))map.set(item.id,item);return [...map.values()]}
 return {schemaVersion:1,courses:merge(a.courses,b.courses,deletedCourses),notes:merge(a.notes,b.notes,deletedNotes).filter(n=>!deletedCourses.includes(n.courseId)),attempts:merge(a.attempts,b.attempts).filter(n=>!deletedCourses.includes(n.courseId)),exercises:merge(a.exercises,b.exercises).filter(n=>!deletedCourses.includes(n.courseId)),settings:a.updatedAt>=b.updatedAt?a.settings:b.settings,deletedCourses,deletedNotes,updatedAt:Math.max(a.updatedAt,b.updatedAt)};
}
