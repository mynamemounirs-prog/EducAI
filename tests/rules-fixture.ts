// Loaded by the dev server only for emulator tests; never imported into the app build.
import {getApp} from 'firebase/app';
import {doc,getDoc,getDocs,collection,setDoc,getFirestore,serverTimestamp} from 'firebase/firestore';
export async function readProfile(uid:string){return (await getDoc(doc(getFirestore(getApp()),'profiles',uid))).data()}
export async function listProfiles(){return getDocs(collection(getFirestore(getApp()),'profiles'))}
export async function forgeAccess(uid:string){return setDoc(doc(getFirestore(getApp()),'profiles',uid),{subscription:'active'},{merge:true})}

export async function writeOtherProfile(uid:string){return setDoc(doc(getFirestore(getApp()),'profiles',uid),{firstName:'Autre utilisateur',role:'Étudiant',createdAt:serverTimestamp(),updatedAt:serverTimestamp()})}
export async function readWorkspace(uid:string){return (await getDoc(doc(getFirestore(getApp()),'teacherWorkspaces',uid))).data()}
export async function writeWorkspace(uid:string,extra={}){return setDoc(doc(getFirestore(getApp()),'teacherWorkspaces',uid),{schemaVersion:1,projects:[],resources:[],settings:{},deletedProjects:[],deletedResources:[],updatedAt:Date.now(),serverUpdatedAt:serverTimestamp(),...extra})}
