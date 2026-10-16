import {BookOpen, GraduationCap, Shapes} from 'lucide-react';
export type Role = 'Enseignant' | 'Étudiant' | 'Pédagogue';
export type Plan = Role | 'Pro';
export const roles: {name:Role; description:string; icon:typeof BookOpen; label:string}[] = [
 {name:'Enseignant',description:'Créez vos cours, quiz et examens.',icon:BookOpen,label:'TRANSMETTRE'},
 {name:'Étudiant',description:'Apprenez, révisez et progressez.',icon:GraduationCap,label:'EXPLORER'},
 {name:'Pédagogue',description:'Imaginez et construisez des solutions éducatives.',icon:Shapes,label:'CONSTRUIRE'},
];
export const plans: {name:Plan;price:number;features:string[]}[] = [
 {name:'Étudiant',price:10,features:['Modes apprendre, révision, examen et résolution.','Fiches mémo à partir de cours importés.','Résumés et cartes mentales.','Explications pédagogiques.']},
 {name:'Enseignant',price:20,features:['Création de cours, quiz et examens.','Organisation par projets et niveaux.','Formats PDF et présentation.','Préparation de jeux interactifs et de vidéos pédagogiques.']},
 {name:'Pédagogue',price:20,features:['Conception d’applications et de sites éducatifs.','Préparation de projets SaaS et de systèmes de gestion.','Aide à la structuration des besoins.','Organisation des projets éducatifs.']},
 {name:'Pro',price:50,features:['Accès aux trois profils.','Limites d’utilisation plus élevées.','Accès aux fonctionnalités avancées.','Pour les utilisateurs qui enseignent, apprennent et construisent.']},
];
