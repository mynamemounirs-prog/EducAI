import {test,expect} from '@playwright/test';

test('profils et thème conservés, aucun accès privé simulé',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'Activer le thème clair'}).click();await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 for(const role of ['Enseignant','Étudiant','Pédagogue']){
  await page.locator('.role-card').filter({has:page.getByRole('heading',{name:role,exact:true})}).click();
  await expect(page.getByRole('combobox')).toHaveValue(role);await expect(page.getByRole('status')).toContainText('pas encore configuré');
  await expect(page.getByRole('button',{name:'Se connecter',exact:true}).last()).toBeEnabled();
  await expect(page.getByRole('button',{name:'Continuer en démonstration'})).toHaveCount(0);
  await page.keyboard.press('Escape');
 }
 expect(errors).toEqual([]);
});

test('offre Pro conservée et focus de fenêtre',async({page})=>{
 await page.goto('/');const trigger=page.getByRole('button',{name:'Tarifs',exact:true});await trigger.click();await expect(page.locator('.price-card')).toHaveCount(4);
 await page.locator('.price-card').filter({has:page.getByRole('heading',{name:'Pro',exact:true})}).getByRole('button').click();
 await expect(page.getByText('Offre Pro sélectionnée.',{exact:false})).toBeVisible();await page.getByRole('combobox').selectOption('Pédagogue');
 await page.keyboard.press('Escape');await expect(trigger).toBeFocused();await page.reload();
 await page.getByRole('button',{name:'Se connecter',exact:true}).click();await expect(page.getByRole('combobox')).toHaveValue('Pédagogue');await expect(page.getByText('Offre Pro sélectionnée.',{exact:false})).toBeVisible();
 const dialog=page.getByRole('dialog');for(let i=0;i<15;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBeTruthy()}
});

test('pages privées et liens e-mail inaccessibles sans service réel',async({page})=>{
 await page.goto('/?payment=success&plan=Pro#espace');await expect(page.getByRole('heading',{name:'Connexion requise'})).toBeVisible();
 await expect(page.getByRole('heading',{name:/Bienvenue dans votre espace/})).toHaveCount(0);await expect(page.getByText('abonnement actif',{exact:false})).toHaveCount(0);
 await page.goto('/?mode=resetPassword&oobCode=not-a-valid-code');await expect(page.getByRole('heading',{name:'Choisir un nouveau mot de passe'})).toBeVisible();await expect(page.getByRole('status')).toContainText('pas encore configuré');
 await page.getByRole('button',{name:'Retour à l’accueil'}).click();await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('button',{name:'Mot de passe oublié ?'}).click();await page.getByLabel('Adresse e-mail').fill('essai@example.test');await page.getByRole('button',{name:'Envoyer le lien de réinitialisation'}).click();await expect(page.getByRole('alert')).toContainText('pas encore configuré');
});

test('fenêtres longues mobiles : contenu défilant et fermeture toujours accessible',async({page})=>{
 await page.setViewportSize({width:360,height:540});await page.goto('/');await page.locator('.role-card').first().click();await page.getByRole('tab',{name:'Créer un compte'}).click();
 const body=page.locator('.modal-body');expect(await body.evaluate(el=>el.scrollHeight>el.clientHeight)).toBeTruthy();await body.evaluate(el=>{el.scrollTop=el.scrollHeight});
 await expect(page.getByRole('button',{name:'Fermer',exact:true})).toBeInViewport();await expect(page.getByRole('button',{name:'Créer mon compte'})).toBeInViewport();await page.getByRole('button',{name:'Fermer',exact:true}).click();
 await page.getByRole('button',{name:'Tarifs',exact:true}).click();await body.evaluate(el=>{el.scrollTop=el.scrollHeight});await expect(page.getByRole('button',{name:'Fermer',exact:true})).toBeInViewport();expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBeTruthy();await page.keyboard.press('Escape');
});

test('textes sans chevauchement et rendu dans les deux thèmes',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:width===1440?900:844});await page.goto('/');
  for(const theme of ['dark','light']){
   if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:/Activer le thème/}).click();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
   const speech=await page.locator('.robot-speech').boundingBox();const robot=await page.locator('.robot-stage .robot-wrap').boundingBox();
   expect(speech&&robot&&(speech.y+speech.height<=robot.y+1||speech.x>=robot.x+robot.width-1)).toBeTruthy();
   await page.screenshot({path:`test-results/home-${width}-${theme}.png`,fullPage:true});
   await page.getByRole('button',{name:'Tarifs',exact:true}).click();expect(await page.getByRole('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBeTruthy();await page.screenshot({path:`test-results/pricing-${width}-${theme}.png`});await page.keyboard.press('Escape');
  }
 }
});

test('robot articulé animé, réaction au clic et réduction des animations',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
 const robot=page.getByRole('button',{name:'Faire coucou à FarabAi'});
 const before=await page.locator('.robot-float').evaluate(el=>getComputedStyle(el).transform);
 await page.waitForTimeout(650);
 expect(await page.locator('.robot-float').evaluate(el=>getComputedStyle(el).transform)).not.toBe(before);
 await robot.click();await expect(robot).toHaveClass(/excited/);
 expect(await page.locator('.robot-wave-arm').evaluate(el=>getComputedStyle(el).animationDuration)).toBe('0.9s');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const selector of ['.robot-float','.robot-head','.robot-eyes','.robot-wave-arm'])expect(await page.locator(selector).evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});


test('inscription mobile : chaque blocage est expliqué et le message reste visible',async({page})=>{
 await page.setViewportSize({width:360,height:540});await page.goto('/');await page.locator('.role-card').first().click();await page.getByRole('tab',{name:'Créer un compte'}).click();
 const submit=page.getByRole('button',{name:'Créer mon compte'});const alert=page.getByRole('alert');
 await submit.click();await expect(alert).toContainText('prénom');await expect(alert).toBeFocused();await expect(alert).toBeInViewport();
 await page.getByLabel('Prénom',{exact:true}).fill('Camille');await page.getByLabel('Adresse e-mail').fill('adresse-invalide');await submit.click();await expect(alert).toContainText('e-mail valide');
 await page.getByLabel('Adresse e-mail').fill('camille@example.test');await page.getByLabel('Mot de passe',{exact:true}).fill('court');await submit.click();await expect(alert).toContainText('8 caractères');
 await page.getByLabel('Mot de passe',{exact:true}).fill('Test-only-password-18!');await page.getByLabel('Confirmer le mot de passe').fill('different-password-19!');await submit.click();await expect(alert).toContainText('ne correspondent pas');
 await page.getByLabel('Confirmer le mot de passe').fill('Test-only-password-18!');await submit.click();await expect(alert).toContainText('case d’acceptation');await expect(alert).toBeInViewport();
 await page.getByRole('checkbox').check();await submit.click();await expect(alert).toContainText('redéployée');await expect(alert).toBeFocused();
});
