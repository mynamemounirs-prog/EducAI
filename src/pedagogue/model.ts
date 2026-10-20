import {uid} from '../teacher/model';
export type ProjectType='app'|'saas'|'website'|'system';
export type TemplateId='school'|'lms'|'parents'|'quiz';
export type Stage='idea'|'structure'|'prototype'|'export';
export type SectionId='summary'|'objectives'|'features'|'screens'|'journeys'|'data'|'acceptance'|'roadmap';
export type Action='read'|'create'|'update'|'delete';
export type Item={id:string;text:string;confirmed:boolean;priority:'mvp'|'later';source:'user'|'template'};
export type ProjectRole={id:string;name:string;description:string;screens:string;permissions:Record<Action,boolean>;confirmed:boolean;source:'user'|'template'};
export type PrototypeState={
 title:string;subtitle:string;accent:string;screen:string;
 pupils:{id:string;name:string;className:string;present:boolean}[];
 lessonsDone:string[];lesson:number;course:string;
 announcementFilter:string;selectedHomework:string;selectedEvent:string;
 quizAnswers:Record<string,string>;quizSubmitted:boolean;
};
export type Project={
 id:string;name:string;type:ProjectType;template:TemplateId;example:boolean;
 need:string;audience:string;problem:string;context:string;constraints:string;wishes:string;
 stage:Stage;ideaConfirmed:boolean;structurePrepared:boolean;sections:Record<SectionId,Item[]>;roles:ProjectRole[];architecture:Item[];
 prototype:PrototypeState;createdAt:number;updatedAt:number;
};
export type ResourceKind='spec'|'architecture'|'roles'|'prompt';
export type DesignResource={id:string;projectId:string;kind:ResourceKind;title:string;body:string;updatedAt:number};
export type PedagogueWorkspace={schemaVersion:1;projects:Project[];resources:DesignResource[];settings:{displayName:string;preferredType:ProjectType};deletedProjects:string[];deletedResources:string[];updatedAt:number};
export const typeNames:Record<ProjectType,string>={app:'Application éducative',saas:'SaaS éducatif',website:'Site web',system:'Système de gestion'};
export const templateNames:Record<TemplateId,string>={school:'École privée',lms:'LMS',parents:'Portail parents',quiz:'Application de quiz'};
export const sections:{id:SectionId;title:string}[]=[{id:'summary',title:'Résumé du projet'},{id:'objectives',title:'Objectifs'},{id:'features',title:'Fonctionnalités prioritaires'},{id:'screens',title:'Pages ou écrans'},{id:'journeys',title:'Parcours principaux'},{id:'data',title:'Données nécessaires'},{id:'acceptance',title:'Critères d’acceptation'},{id:'roadmap',title:'Étapes de réalisation'}];
export const stages:{id:Stage;title:string}[]=[{id:'idea',title:'Idée'},{id:'structure',title:'Structure'},{id:'prototype',title:'Prototype'},{id:'export',title:'Export'}];
export const actions:{id:Action;title:string}[]=[{id:'read',title:'Consulter'},{id:'create',title:'Créer'},{id:'update',title:'Modifier'},{id:'delete',title:'Supprimer'}];
export function item(text='',confirmed=false,source:Item['source']=confirmed?'user':'template'):Item{return {id:uid(),text,confirmed,priority:'mvp',source}}
export function newRole(name='Nouveau rôle',description='',screens='',admin=false):ProjectRole{return {id:uid(),name,description,screens,permissions:{read:true,create:admin,update:admin,delete:admin},confirmed:false,source:'user'}}
export function emptyPedagogue():PedagogueWorkspace{return {schemaVersion:1,projects:[],resources:[],settings:{displayName:'Pédagogue invité',preferredType:'app'},deletedProjects:[],deletedResources:[],updatedAt:Date.now()}}
export function emptySections():Project['sections']{return {summary:[],objectives:[],features:[],screens:[],journeys:[],data:[],acceptance:[],roadmap:[]}}
export function duplicateProject(project:Project):Project{
 const copy=structuredClone(project);return {...copy,id:uid(),name:copy.name+' — copie',example:false,sections:Object.fromEntries(sections.map(s=>[s.id,copy.sections[s.id].map(i=>({...i,id:uid()}))])) as Project['sections'],roles:copy.roles.map(r=>({...r,id:uid()})),architecture:copy.architecture.map(i=>({...i,id:uid()})),createdAt:Date.now(),updatedAt:Date.now()};
}
export function move<T>(values:T[],index:number,delta:number){const next=[...values],target=index+delta;if(target<0||target>=next.length)return values;[next[index],next[target]]=[next[target],next[index]];return next}
export function projectText(p:Project){return [p.name,p.need,p.audience,p.problem,p.context,p.constraints,p.wishes,typeNames[p.type],templateNames[p.template],...sections.flatMap(s=>p.sections[s.id].map(i=>i.text)),...p.roles.flatMap(r=>[r.name,r.description,r.screens]),...p.architecture.map(i=>i.text)].join(' ')}
export function readPedagogue(value:unknown):PedagogueWorkspace{
 const w=value as PedagogueWorkspace;
 if(!w||w.schemaVersion!==1||![w.projects,w.resources,w.deletedProjects,w.deletedResources].every(Array.isArray)||!w.settings||typeof w.settings.displayName!=='string'||!Object.hasOwn(typeNames,w.settings.preferredType)||!Number.isFinite(w.updatedAt))throw new Error('Cette sauvegarde de conception est illisible. Elle a été préservée.');
 for(const p of w.projects)if(!p||typeof p.id!=='string'||typeof p.name!=='string'||!Object.hasOwn(typeNames,p.type)||!Object.hasOwn(templateNames,p.template)||!stages.some(s=>s.id===p.stage)||!p.sections||!sections.every(s=>Array.isArray(p.sections[s.id]))||!Array.isArray(p.roles)||!Array.isArray(p.architecture)||!p.prototype||!Array.isArray(p.prototype.pupils)||!Array.isArray(p.prototype.lessonsDone)||!Number.isFinite(p.updatedAt))throw new Error('Un projet de conception est illisible.');
 for(const r of w.resources)if(!r||typeof r.id!=='string'||typeof r.projectId!=='string'||typeof r.body!=='string'||!Number.isFinite(r.updatedAt))throw new Error('Une ressource de conception est illisible.');
 return {schemaVersion:1,projects:w.projects,resources:w.resources,settings:w.settings,deletedProjects:w.deletedProjects,deletedResources:w.deletedResources,updatedAt:w.updatedAt};
}
export function mergePedagogue(a:PedagogueWorkspace,b:PedagogueWorkspace):PedagogueWorkspace{
 const deletedProjects=[...new Set([...a.deletedProjects,...b.deletedProjects])],deletedResources=[...new Set([...a.deletedResources,...b.deletedResources])];
 function merge<T extends {id:string;updatedAt:number}>(x:T[],y:T[],deleted:string[]){const m=new Map<string,T>();for(const v of [...y,...x])if(!deleted.includes(v.id)&&(!m.has(v.id)||v.updatedAt>=m.get(v.id)!.updatedAt))m.set(v.id,v);return [...m.values()]}
 return {schemaVersion:1,projects:merge(a.projects,b.projects,deletedProjects),resources:merge(a.resources,b.resources,deletedResources).filter(r=>!deletedProjects.includes(r.projectId)),settings:a.updatedAt>=b.updatedAt?a.settings:b.settings,deletedProjects,deletedResources,updatedAt:Math.max(a.updatedAt,b.updatedAt)};
}
