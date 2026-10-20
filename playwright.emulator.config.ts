import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',testMatch:'**/*.emulator.spec.ts',workers:1,fullyParallel:false,timeout:45000,
 use:{baseURL:'http://127.0.0.1:5174',launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}},
 webServer:{command:'npm run dev -- --port 5174 --strictPort',url:'http://127.0.0.1:5174',reuseExistingServer:false,env:{
 VITE_FIREBASE_API_KEY:'demo-emulator-key',VITE_FIREBASE_AUTH_DOMAIN:'demo-farabai.firebaseapp.com',VITE_FIREBASE_PROJECT_ID:'demo-farabai',VITE_REQUIRE_EMAIL_VERIFICATION:'true',VITE_USE_FIREBASE_EMULATORS:'true',
 }},reporter:'list',
});
