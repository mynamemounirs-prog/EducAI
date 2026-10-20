import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
async function demo(page:Page){await page.goto('/');await page.getByRole('button',{name:'Tester l’espace enseignant'}).click();await expect(page.getByRole('heading',{name:'Que souhaitez-vous créer aujourd’hui ?'})).toBeVisible()}
async function nav(page:Page,name:string){if(await page.getByRole('button',{name:'Ouvrir le menu enseignant'}).isVisible())await page.getByRole('button',{name:'Ouvrir le menu enseignant'}).click();await page.getByRole('navigation',{name:'Espace enseignant'}).getByRole('button',{name,exact:true}).click()}
async function example(page:Page,tool:string){await demo(page);await page.getByRole('button',{name:tool,exact:false}).first().click();await page.getByRole('button',{name:'Charger un exemple',exact:true}).click()}

test('démo gratuite et trois projets d’exemple, sans inscription ni paiement',async({page})=>{
 const external:string[]=[];page.on('request',r=>{if(r.url().includes('buy.stripe.com')||r.url().includes('identitytoolkit'))external.push(r.url())});
 await demo(page);await expect(page.locator('.teacher-mode-badge')).toHaveText('Démonstration');await expect(page.getByText('Bonjour Enseignant invité !')).toBeVisible();await expect(page.locator('.recent-projects .project-card')).toHaveCount(3);await expect(page.locator('.recent-projects .example-label')).toHaveCount(3);expect(external).toEqual([]);
 await page.reload();await expect(page.getByRole('heading',{name:'Que souhaitez-vous créer aujourd’hui ?'})).toBeVisible();await nav(page,'Ressources');await expect(page.locator('.resource-item')).toHaveCount(4);
});

test('cours éditable enregistré, retrouvé et persistant après actualisation',async({page})=>{
 await example(page,'Construire un cours');await page.getByLabel('Sujet',{exact:true}).fill('Cours personnalisé de Camille');await page.getByLabel('Synthèse',{exact:true}).fill('Une synthèse modifiée par l’enseignant, enregistrée localement.');await page.getByRole('button',{name:'Enregistrer le contenu',exact:true}).click();await expect(page.getByText('Contenu enregistré sur cet appareil.',{exact:true})).toBeVisible();
 await nav(page,'Ressources');await page.getByRole('button').filter({hasText:'Cours personnalisé de Camille'}).first().click();await expect(page.getByLabel('Synthèse',{exact:true})).toHaveValue('Une synthèse modifiée par l’enseignant, enregistrée localement.');
 await page.reload();await nav(page,'Ressources');await expect(page.locator('.resource-item').filter({hasText:'Cours personnalisé de Camille'})).toBeVisible();
});

test('quiz : aperçu, correction indicative des réponses ouvertes et jeu réel',async({page})=>{
 await example(page,'Créer un quiz');await page.getByRole('button',{name:'Aperçu',exact:true}).click();await page.getByLabel('Une suite d’instructions pour résoudre une tâche',{exact:true}).check();await page.getByRole('button',{name:'Afficher les corrections'}).click();await expect(page.getByText('Score des questions fermées : 1 / 3.',{exact:false})).toBeVisible();await expect(page.getByText('Corrigé indicatif — sans notation automatique',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'Éditer',exact:true}).click();await page.getByLabel('Format de sortie',{exact:true}).selectOption('game');await page.getByRole('button',{name:'Jouer au quiz'}).click();await expect(page.getByText('Le jeu accepte les QCM',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'Retour à l’édition'}).click();await page.getByRole('button',{name:'Supprimer la question 4'}).click();await page.getByRole('button',{name:'Jouer au quiz'}).click();
 for(const choice of ['Une suite d’instructions pour résoudre une tâche','Faux','Ne partager que les données nécessaires et autorisées']){await page.getByLabel(choice,{exact:true}).check();await page.getByRole('button',{name:/Question suivante|Voir mon score/}).click()}
 await expect(page.getByRole('heading',{name:'Partie terminée !'})).toBeVisible();await expect(page.getByText('Score : 3 / 3',{exact:true})).toBeVisible();
});

test('PDF réel lisible et PowerPoint structuré de plusieurs diapositives',async({page},testInfo)=>{
 await example(page,'Construire un cours');const pdfDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Exporter en PDF'}).click();const pdf=await pdfDownload;const pdfPath=testInfo.outputPath('cours.pdf');await pdf.saveAs(pdfPath);expect(readFileSync(pdfPath).subarray(0,5).toString()).toBe('%PDF-');const text=execFileSync('pdftotext',[pdfPath,'-'],{encoding:'utf8'});expect(text).toContain('Objectifs et');expect(text).toContain('Synthèse');expect(text).toContain('éolienne');
 await page.getByLabel('Format de sortie',{exact:true}).selectOption('ppt');const pptDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Exporter en PPT'}).click();const ppt=await pptDownload;expect(ppt.suggestedFilename()).toMatch(/\.pptx$/);const path=testInfo.outputPath('cours.pptx');await ppt.saveAs(path);expect(readFileSync(path).subarray(0,2).toString()).toBe('PK');const slides=execFileSync('python',['-c',"import zipfile,sys,re; z=zipfile.ZipFile(sys.argv[1]); names=[n for n in z.namelist() if re.match(r'ppt/slides/slide[0-9]+.xml$',n)]; print(len(names)); print(''.join(z.read(n).decode() for n in names))",path],{encoding:'utf8'});expect(Number(slides.split('\n')[0])).toBeGreaterThanOrEqual(8);expect(slides).toContain('Synthèse');
});

test('examen : barème cohérent et PDF séparant le sujet du corrigé',async({page},testInfo)=>{
 await example(page,'Générer un examen');await page.getByLabel('Note totale',{exact:true}).fill('30');await page.getByRole('button',{name:'Corrigé enseignant et barème',exact:true}).click();await expect(page.getByText('Total du barème : 30 / 30 points',{exact:true})).toBeVisible();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Exporter en PDF'}).click();const path=testInfo.outputPath('examen.pdf');await (await download).saveAs(path);const text=execFileSync('pdftotext',[path,'-'],{encoding:'utf8'});expect(text).toContain('Sujet élève');expect(text).toContain('Corrigé enseignant et barème');expect(text.indexOf('\f',text.indexOf('Sujet élève'))).toBeLessThan(text.indexOf('Corrigé enseignant et barème'));
 await page.getByLabel('Points attribués').first().fill('1');await page.getByRole('button',{name:'Exporter en PDF'}).click();await expect(page.getByRole('alert')).toContainText('barème');
});

test('recherche et storyboard : sources manuelles, sauvegarde et vidéo honnête',async({page})=>{
 await example(page,'Faire une recherche');await expect(page.getByText('Recherche Internet non connectée.',{exact:false})).toBeVisible();await page.getByLabel('Titre de la source',{exact:true}).fill('Documentation consultée');await page.getByLabel('URL de la source',{exact:true}).fill('https://example.org/documentation');await page.getByRole('button',{name:'Ajouter la source'}).click();await expect(page.getByRole('link',{name:'Documentation consultée'})).toHaveAttribute('href','https://example.org/documentation');
 await page.getByLabel('Format de sortie',{exact:true}).selectOption('video');await page.getByRole('button',{name:'Préparer le storyboard'}).click();await expect(page.getByRole('heading',{name:'Storyboard',exact:true})).toBeVisible();await expect(page.getByText('Le storyboard est éditable',{exact:false})).toContainText('pas encore connectés');await page.getByLabel('Narration',{exact:true}).first().fill('Narration rédigée par Camille.');await page.getByRole('button',{name:'Enregistrer le contenu'}).click();await nav(page,'Ressources');await expect(page.locator('.resource-item')).toHaveCount(5);
});

test('projets : création, modification, recherche, suppression et réinitialisation confirmée',async({page})=>{
 await demo(page);await nav(page,'Projets');await page.getByRole('button',{name:'Nouveau projet',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.getByLabel('Nom du projet').fill('Atelier océan');await dialog.getByLabel('Matière du projet').fill('Biologie');await dialog.getByRole('button',{name:'Créer le projet',exact:true}).click();await expect(page.locator('.project-card')).toHaveCount(4);
 await page.getByLabel('Actions pour Atelier océan').click();await page.getByRole('button',{name:'Renommer / modifier'}).last().click();await dialog.getByLabel('Nom du projet').fill('Atelier océans');await dialog.getByRole('button',{name:'Enregistrer les modifications'}).click();await page.getByLabel('Rechercher dans mes travaux').fill('océans');await expect(page.locator('.project-card')).toHaveCount(1);await page.getByRole('button',{name:'Effacer la recherche'}).click();await page.getByLabel('Actions pour Atelier océans').click();await page.locator('.project-card').filter({hasText:'Atelier océans'}).getByRole('button',{name:'Supprimer',exact:true}).click();await dialog.getByRole('button',{name:'Annuler'}).click();await expect(page.locator('.project-card')).toHaveCount(4);await page.locator('.project-card').filter({hasText:'Atelier océans'}).getByRole('button',{name:'Supprimer',exact:true}).click();await dialog.getByRole('button',{name:'Supprimer le projet',exact:true}).click();await expect(page.locator('.project-card')).toHaveCount(3);
 await page.getByRole('button',{name:'Réinitialiser la démo',exact:true}).click();await dialog.getByRole('button',{name:'Réinitialiser la démo',exact:true}).click();await nav(page,'Projets');await expect(page.locator('.project-card')).toHaveCount(3);
});

test('préférences et filtres de niveaux persistants, sortie protégée des brouillons',async({page})=>{
 await demo(page);await nav(page,'Paramètres');await page.getByLabel('Nom d’affichage en démonstration').fill('Alex');await page.getByRole('button',{name:'Enregistrer les préférences'}).click();await nav(page,'Accueil');await expect(page.getByText('Bonjour Alex !')).toBeVisible();await page.reload();await expect(page.getByText('Bonjour Alex !')).toBeVisible();
 await nav(page,'Niveaux');await page.getByRole('button',{name:'Collège',exact:true}).click();await nav(page,'Projets');await expect(page.locator('.project-card')).toHaveCount(1);await nav(page,'Ressources');await expect(page.locator('.resource-item')).toHaveCount(1);await page.getByRole('button',{name:'Effacer les filtres'}).click();await expect(page.locator('.resource-item')).toHaveCount(4);
 await nav(page,'Accueil');await page.getByRole('button',{name:'Construire un cours',exact:false}).click();await page.getByLabel('Sujet',{exact:true}).fill('Brouillon non enregistré');await nav(page,'Projets');await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Annuler',exact:true}).click();await expect(page.getByLabel('Sujet',{exact:true})).toHaveValue('Brouillon non enregistré');
});

test('affichage responsive clair et sombre et navigation mobile au clavier',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await demo(page);
 for(const width of [1440,768,390,320]){await page.setViewportSize({width,height:900});for(let i=0;i<2;i++){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();await page.getByRole('button',{name:/Activer le thème/}).click()}}
 await page.getByRole('button',{name:'Ouvrir le menu enseignant'}).click();await expect(page.getByRole('navigation',{name:'Espace enseignant'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Ouvrir le menu enseignant'})).toBeFocused();await nav(page,'Projets');await expect(page.getByRole('heading',{name:'Mes projets',exact:true})).toBeVisible();expect(errors).toEqual([]);
});
