import {writeFile} from 'node:fs/promises';
import {loadEnv} from 'vite';

// Public support metadata only. Never write configuration values or credentials.
const env=loadEnv('production',process.cwd(),'VITE_');
const names=['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID'];
const info={
 version:env.VITE_BUILD_ID?.slice(0,7)||'locale',
 builtAt:new Date().toISOString(),
 firebaseVariablesPresent:Object.fromEntries(names.map(name=>[name,Boolean(env[name]?.trim())])),
};
await writeFile(new URL('../dist/build-info.json',import.meta.url),JSON.stringify(info,null,2)+'\n');
