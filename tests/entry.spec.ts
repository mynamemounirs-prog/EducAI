import {test,expect} from '@playwright/test';
test('accueil, thèmes persistants et trois parcours de profil',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'Activer le thème clair'}).click();await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 for(const role of ['Enseignant','Étudiant','Pédagogue']){
  await page.locator('.role-card').filter({has:page.getByRole('heading',{name:role,exact:true})}).click();
  await expect(page.getByRole('combobox')).toHaveValue(role);await page.getByRole('button',{name:'Continuer en démonstration'}).click();await expect(page.getByRole('heading',{name:`Bienvenue dans votre espace ${role}`})).toBeVisible();
  await page.getByRole('button',{name:'Changer de profil'}).click();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Retour à l’accueil'}).click();
 }
 expect(errors).toEqual([]);
});
test('formulaires, validation et documents provisoires',async({page})=>{
 await page.goto('/');await page.locator('.role-card').first().click();await page.getByRole('tab',{name:'Créer un compte'}).click();
 await page.getByLabel('Prénom', {exact:true}).fill('Camille');await page.getByLabel('Adresse e-mail').fill('camille@example.fr');await page.getByLabel('Mot de passe',{exact:true}).fill('Test12345');await page.getByLabel('Confirmer le mot de passe').fill('Different123');await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Créer mon compte',exact:true}).click();await expect(page.getByRole('alert')).toContainText('ne correspondent pas');
 await page.getByLabel('Confirmer le mot de passe').fill('Test12345');await page.getByRole('button',{name:'Afficher le mot de passe'}).click();await expect(page.getByLabel('Mot de passe',{exact:true})).toHaveAttribute('type','text');
 await page.getByRole('button',{name:'Créer mon compte',exact:true}).click();await expect(page.getByRole('status')).toContainText('Aucun compte réel');
 await page.getByRole('button',{name:'conditions d’utilisation',exact:true}).click();await expect(page.getByText('Page provisoire — en cours de rédaction.')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(1);
 await page.getByRole('tab',{name:'Se connecter',exact:true}).click();await page.getByRole('button',{name:'Mot de passe oublié ?'}).click();await page.getByLabel('Adresse e-mail').fill('camille@example.fr');await page.getByRole('button',{name:'Tester la récupération'}).click();await expect(page.getByRole('status')).toContainText('aucun e-mail');
 const stored=await page.evaluate(()=>JSON.stringify(localStorage));expect(stored).not.toContain('Test12345');expect(stored).not.toContain('camille@');
});
test('tarifs et profil Pro, fermeture et focus',async({page})=>{
 await page.goto('/');const trigger=page.getByRole('button',{name:'Tarifs',exact:true});await trigger.click();await expect(page.locator('.price-card')).toHaveCount(4);
 await page.locator('.price-card').filter({has:page.getByRole('heading',{name:'Pro',exact:true})}).getByRole('button').click();await expect(page.getByText('Offre Pro sélectionnée · Paiement bientôt disponible')).toBeVisible();await expect(page.getByRole('button',{name:'Continuer en démonstration'})).toBeDisabled();await page.getByRole('combobox').selectOption('Étudiant');await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 await trigger.click();await expect(page.locator('.recommended')).toContainText('Étudiant');await page.keyboard.press('Escape');
 await page.reload();await page.getByRole('button',{name:'Se connecter',exact:true}).click();await expect(page.getByRole('combobox')).toHaveValue('Étudiant');await expect(page.getByText('Offre Pro sélectionnée · Paiement bientôt disponible')).toBeVisible();
 const dialog=page.getByRole('dialog');for(let i=0;i<15;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBeTruthy()}
});
test('rendu ordinateur et mobile dans les deux thèmes',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===1440?900:844});await page.goto('/');
  for(const theme of ['dark','light']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:/Activer le thème/}).click();
   await expect(page.locator('.role-card')).toHaveCount(3);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
   if(width===1440)expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight)).toBeTruthy();
   await page.screenshot({path:`test-results/home-${width}-${theme}.png`,fullPage:true});
   await page.getByRole('button',{name:'Tarifs',exact:true}).click();expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBeTruthy();await page.keyboard.press('Escape');
  }
 }
});
