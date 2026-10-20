import {test,expect,type APIRequestContext,type Page} from '@playwright/test';
const project='demo-farabai';const password='Test-only-Password-128!';
const checkout={Pro:'https://buy.stripe.com/8x200i22E1WgaeV4C167S0w',Enseignant:'https://buy.stripe.com/eVq14m5eQ6cwfzfgkJ67S0z',Pédagogue:'https://buy.stripe.com/eVq14m5eQ6cwfzfgkJ67S0z',Étudiant:'https://buy.stripe.com/eVq8wOdLmdEY3Qxc4t67S0y'};
function address(){return `local-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`}
async function code(request:APIRequestContext,email:string,type:string){
 const result=await request.get(`http://127.0.0.1:9099/emulator/v1/projects/${project}/oobCodes`);expect(result.ok()).toBeTruthy();
 const entries=(await result.json()).oobCodes||[];const match=entries.filter((entry:{email:string;requestType:string})=>entry.email===email&&entry.requestType===type).at(-1);expect(match).toBeTruthy();return match.oobCode as string;
}
async function register(page:Page,email:string,role='Enseignant'){
 await page.goto('/');await page.locator('.role-card').filter({has:page.getByRole('heading',{name:role,exact:true})}).click();await page.getByRole('tab',{name:'Créer un compte'}).click();
 await page.getByLabel('Prénom',{exact:true}).fill('Camille');await page.getByLabel('Adresse e-mail').fill(email);await page.getByLabel('Mot de passe',{exact:true}).fill(password);await page.getByLabel('Confirmer le mot de passe').fill(password);await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Créer mon compte'}).click();await expect(page.getByRole('dialog')).toHaveCount(0,{timeout:20000});await expect(page.getByRole('heading',{name:'Confirmez votre adresse e-mail'})).toBeVisible();
}
async function verify(page:Page,request:APIRequestContext,email:string){
 const action=await code(request,email,'VERIFY_EMAIL');await page.goto(`/?mode=verifyEmail&oobCode=${encodeURIComponent(action)}`);await page.getByRole('button',{name:'Valider mon adresse e-mail'}).click();await expect(page.getByText('Votre adresse e-mail est confirmée.',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Continuer vers mon espace'}).click();await expect(page.getByRole('heading',{name:/Bienvenue dans votre espace/})).toBeVisible();
}

test('inscription réelle dans les émulateurs, validation e-mail, persistance et déconnexion',async({page,request})=>{
 const email=address();await register(page,email,'Pédagogue');await page.reload();await expect(page.getByRole('dialog')).toHaveCount(0,{timeout:20000});await expect(page.getByRole('heading',{name:'Confirmez votre adresse e-mail'})).toBeVisible();
 await verify(page,request,email);await expect(page.getByRole('heading',{name:'Bienvenue dans votre espace Pédagogue'})).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'Bienvenue dans votre espace Pédagogue'})).toBeVisible();await expect(page.getByText('Bonjour Camille.',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'Se déconnecter',exact:true}).click();await expect(page.getByRole('heading',{name:'Qui êtes-vous ?'})).toBeVisible();await page.goto('/#espace');await expect(page.getByRole('heading',{name:'Votre espace personnel'})).toBeVisible();
 await page.locator('main').getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByLabel('Adresse e-mail').fill(email);await page.getByLabel('Mot de passe',{exact:true}).fill(password);await page.getByRole('dialog').getByRole('button',{name:'Se connecter',exact:true}).click();await expect(page.getByRole('heading',{name:'Bienvenue dans votre espace Pédagogue'})).toBeVisible();
 const local=await page.evaluate(()=>JSON.stringify(localStorage));expect(local).not.toContain(password);
});

test('mot de passe oublié et lien de réinitialisation consommé par Firebase',async({page,request})=>{
 const email=address();await register(page,email);await verify(page,request,email);await page.getByRole('button',{name:'Se déconnecter',exact:true}).click();
 await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('button',{name:'Mot de passe oublié ?'}).click();await page.getByLabel('Adresse e-mail').fill(email);await page.getByRole('button',{name:'Envoyer le lien de réinitialisation'}).click();await expect(page.getByText('Si un compte correspond',{exact:false})).toBeVisible();
 const action=await code(request,email,'PASSWORD_RESET');await page.goto(`/?mode=resetPassword&oobCode=${encodeURIComponent(action)}`);const next='New-test-Password-129!';await page.getByLabel('Nouveau mot de passe',{exact:true}).fill(next);await page.getByLabel('Confirmer le mot de passe').fill(next);await page.getByRole('button',{name:'Enregistrer le nouveau mot de passe'}).click();await expect(page.getByText('Votre mot de passe a été modifié.',{exact:false})).toBeVisible();
 await page.locator('main').getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByLabel('Adresse e-mail').fill(email);await page.getByLabel('Mot de passe',{exact:true}).fill(password);await page.getByRole('dialog').getByRole('button',{name:'Se connecter',exact:true}).click();await expect(page.getByRole('alert')).toContainText('incorrect');
 await page.getByLabel('Mot de passe',{exact:true}).fill(next);await page.getByRole('dialog').getByRole('button',{name:'Se connecter',exact:true}).click();await expect(page.getByRole('heading',{name:'Bienvenue dans votre espace Enseignant'})).toBeVisible();
 await page.goto(`/?mode=resetPassword&oobCode=${encodeURIComponent(action)}`);await expect(page.getByRole('alert')).toContainText('invalide');
});

test('offre conservée pendant confirmation, liens Stripe exacts et absence de droits locaux',async({page,request})=>{
 const email=address();await page.goto('/');await page.getByRole('button',{name:'Tarifs',exact:true}).click();await page.locator('.price-card').filter({has:page.getByRole('heading',{name:'Pro',exact:true})}).getByRole('button').click();
 await page.getByRole('combobox').selectOption('Étudiant');await page.getByRole('tab',{name:'Créer un compte'}).click();await page.getByLabel('Prénom',{exact:true}).fill('Camille');await page.getByLabel('Adresse e-mail').fill(email);await page.getByLabel('Mot de passe',{exact:true}).fill(password);await page.getByLabel('Confirmer le mot de passe').fill(password);await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Créer mon compte'}).click();await expect(page.getByRole('dialog')).toHaveCount(0,{timeout:20000});await expect(page.getByRole('heading',{name:'Confirmez votre adresse e-mail'})).toBeVisible();
 await page.reload();await verify(page,request,email);await expect(page.getByRole('link',{name:'Continuer vers le paiement'})).toHaveAttribute('href',checkout.Pro);await expect(page.getByText('abonnement actif',{exact:false})).toHaveCount(0);
 // Intercept Stripe navigation: no external checkout request and no payment is made.
 await page.route('https://buy.stripe.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<p>Destination Stripe interceptée pour le test local.</p>'}));
 for(const [plan,url] of Object.entries(checkout)){
  await page.goto('/');await page.getByRole('button',{name:'Tarifs',exact:true}).click();await page.locator('.price-card').filter({has:page.getByRole('heading',{name:plan,exact:true})}).getByRole('button').click();await expect(page).toHaveURL(url);await page.goto('/#espace');await expect(page.getByRole('heading',{name:`Bienvenue dans votre espace ${plan==='Pro'?'Étudiant':plan}`})).toBeVisible();
 }
 await page.goto('/?payment=success&subscription=active#espace');await expect(page.getByText('abonnement actif',{exact:false})).toHaveCount(0);await expect(page.getByRole('heading',{name:'Bienvenue dans votre espace Étudiant'})).toBeVisible();
});

test('règles Firestore : lecture propriétaire seule et impossibilité de fabriquer des droits payants',async({page,request})=>{
 const email=address();await register(page,email);await verify(page,request,email);
 const result=await request.post('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-emulator-key',{data:{email:address(),password,returnSecureToken:true}});expect(result.ok()).toBeTruthy();const otherUid=(await result.json()).localId;
 const outcomes=await page.evaluate(async(otherUid)=>{
  const fixture=await import('/tests/rules-fixture.ts');
  const sdk=await import('/node_modules/.vite/deps/firebase_auth.js');
  const uid=sdk.getAuth().currentUser.uid;const own=await fixture.readProfile(uid);
  async function denied(action:()=>Promise<unknown>){try{await action();return false}catch(error){return (error as {code:string}).code==='permission-denied'}}
  return {ownRole:own.role,other:await denied(()=>fixture.readProfile(otherUid)),list:await denied(()=>fixture.listProfiles()),otherWrite:await denied(()=>fixture.writeOtherProfile(otherUid)),forged:await denied(()=>fixture.forgeAccess(uid))};
 },otherUid);
 expect(outcomes).toEqual({ownRole:'Enseignant',other:true,list:true,otherWrite:true,forged:true});
});


test('confirmation du mot de passe et prévention des doubles inscriptions',async({page})=>{
 let creations=0;page.on('request',request=>{if(request.url().includes('/accounts:signUp'))creations++});
 await page.goto('/');await page.locator('.role-card').first().click();await page.getByRole('tab',{name:'Créer un compte'}).click();
 await page.getByLabel('Prénom',{exact:true}).fill('Camille');await page.getByLabel('Adresse e-mail').fill(address());await page.getByLabel('Mot de passe',{exact:true}).fill(password);await page.getByLabel('Confirmer le mot de passe').fill('Different-Password-123!');await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Créer mon compte'}).click();await expect(page.getByRole('alert')).toContainText('ne correspondent pas');expect(creations).toBe(0);
 await page.getByLabel('Confirmer le mot de passe').fill(password);await page.getByRole('button',{name:'Afficher le mot de passe',exact:true}).click();await expect(page.getByLabel('Mot de passe',{exact:true})).toHaveAttribute('type','text');
 await page.locator('.auth-form').evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))});
 await expect(page.getByRole('dialog')).toHaveCount(0,{timeout:20000});await expect(page.getByRole('heading',{name:'Confirmez votre adresse e-mail'})).toBeVisible();expect(creations).toBe(1);
});


test('un profil indisponible ne bloque ni le compte réel ni l’e-mail de confirmation',async({page,request})=>{
 const email=address();
 // Block only Firestore. The real Auth emulator still creates and verifies identities.
 await page.route('**/google.firestore.v1.Firestore/**',route=>route.abort());
 await register(page,email);
 await expect(page.getByText('Votre compte a bien été créé, mais votre profil reste à finaliser.',{exact:false})).toBeVisible();
 expect(await code(request,email,'VERIFY_EMAIL')).toBeTruthy();
 await expect(page.getByRole('button',{name:'Se déconnecter',exact:true})).toBeEnabled();
});

test('espace enseignant : sauvegarde réelle du compte et isolation de la démonstration',async({page,request})=>{
 const email=address();await register(page,email);await verify(page,request,email);await page.getByRole('button',{name:'Ouvrir mon espace enseignant'}).click();await expect(page.getByText('Bonjour Camille !')).toBeVisible();await expect(page.locator('.workspace-status')).toContainText('synchronisés');await expect(page.locator('.project-card')).toHaveCount(0);
 await page.getByRole('button',{name:'Créer un projet',exact:true}).click();await page.getByLabel('Nom du projet').fill('Projet privé de Camille');await page.getByRole('dialog').getByRole('button',{name:'Créer le projet',exact:true}).click();await expect(page.locator('.workspace-status')).toContainText('synchronisés');
 await page.getByRole('button',{name:'Construire un cours',exact:false}).click();await page.getByRole('button',{name:'Charger un exemple',exact:true}).click();await page.getByRole('button',{name:'Enregistrer le contenu',exact:true}).click();await expect(page.locator('.workspace-status')).toContainText('synchronisés');
 await page.evaluate(()=>{Object.keys(localStorage).filter(k=>k.startsWith('farabai-teacher-user-')).forEach(k=>localStorage.removeItem(k))});await page.reload();await expect(page.locator('.workspace-status')).toContainText('synchronisés');await expect(page.locator('.project-card').filter({hasText:'Projet privé de Camille'})).toBeVisible();
 await page.getByRole('button',{name:'Accueil général',exact:true}).click();await page.getByRole('button',{name:'Tester l’espace enseignant'}).click();await expect(page.locator('.teacher-mode-badge')).toHaveText('Démonstration');await expect(page.getByText('Bonjour Enseignant invité !')).toBeVisible();await expect(page.locator('.project-card')).toHaveCount(3);await expect(page.getByText('Projet privé de Camille',{exact:true})).toHaveCount(0);
 const outcomes=await page.evaluate(async()=>{const f=await import('/tests/rules-fixture.ts');const sdk=await import('/node_modules/.vite/deps/firebase_auth.js');const uid=sdk.getAuth().currentUser.uid;const own=await f.readWorkspace(uid);async function denied(action:()=>Promise<unknown>){try{await action();return false}catch(e){return (e as {code:string}).code==='permission-denied'}}return {projects:own.projects.length,resources:own.resources.length,otherRead:await denied(()=>f.readWorkspace('other-user')),otherWrite:await denied(()=>f.writeWorkspace('other-user')),paid:await denied(()=>f.writeWorkspace(uid,{subscription:'active'}))}});
 expect(outcomes).toEqual({projects:1,resources:1,otherRead:true,otherWrite:true,paid:true});
});
