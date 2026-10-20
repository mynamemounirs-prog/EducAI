import {BookOpen, GraduationCap, Shapes} from 'lucide-react';
export type Role = 'Enseignant' | 'Étudiant' | 'Pédagogue';
export type Plan = Role | 'Pro';
export const roles: {name:Role; description:string; icon:typeof BookOpen; label:string}[] = [
 {name:'Enseignant',description:'Créez vos cours, quiz et examens.',icon:BookOpen,label:'TRANSMETTRE'},
 {name:'Étudiant',description:'Apprenez, révisez et progressez.',icon:GraduationCap,label:'EXPLORER'},
 {name:'Pédagogue',description:'Imaginez et construisez des solutions éducatives.',icon:Shapes,label:'CONSTRUIRE'},
];
export const plans: {name:Plan;price:number;description:string;features:string[]}[] = [
 {name:'Étudiant',price:10,description:'Pour apprendre et réviser à votre rythme.',features:['Apprentissage et préparation aux examens','Fiches mémo à partir de vos cours','Résumés et cartes mentales','Explications pédagogiques']},
 {name:'Enseignant',price:20,description:'Pour préparer vos contenus pédagogiques.',features:['Cours, quiz et examens','Organisation par projets et niveaux','Formats PDF et présentation','Jeux interactifs et vidéos pédagogiques']},
 {name:'Pédagogue',price:20,description:'Pour concevoir des solutions éducatives.',features:['Applications et sites éducatifs','Préparation de projets SaaS','Structuration de vos besoins','Organisation des projets éducatifs']},
 {name:'Pro',price:50,description:'Pour enseigner, apprendre et construire.',features:['Les trois espaces réunis','Limites d’utilisation plus élevées','Fonctionnalités avancées','Un profil de départ à votre choix']},
];
