import type {Resource,Section,Scene} from './model';
import {toolNames,uid,pointsValid} from './model';
const clean=(s:string)=>s.replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—→]/g,'-').replace(/œ/g,'oe').replace(/\u00a0/g,' ');
export function documentGroups(r:Resource):{title:string;sections:Section[]}[]{
 if(r.kind==='course')return [{title:r.title,sections:r.sections}];
 if(r.kind==='quiz')return [{title:r.title,sections:r.questions.map((q,i)=>({id:q.id,title:`Question ${i+1}`,text:[q.prompt,...q.options.map((v,j)=>`${j+1}. ${v}`)].join('\n')}))},{title:'Corrigé du quiz',sections:r.questions.map((q,i)=>({id:q.id,title:`Question ${i+1}${q.type==='open'?' - corrigé indicatif':''}`,text:`${q.answer}\n${q.explanation}`}))}];
 if(r.kind==='exam')return [{title:'Sujet élève',sections:r.exercises.map(e=>({id:e.id,title:`${e.title} - ${e.points} points`,text:e.prompt}))},{title:'Corrigé enseignant et barème',sections:[...r.exercises.map(e=>({id:e.id,title:`${e.title} - ${e.points} points`,text:e.correction})),{id:'total',title:'Total du barème',text:`${r.total} points`}]}];
 return [{title:r.title,sections:[{id:'notes',title:'Notes de recherche',text:r.notes},{id:'sources',title:'Sources ajoutées par l’utilisateur',text:r.sources.length?r.sources.map(s=>`${s.title}\n${s.url}`).join('\n\n'):'Aucune source ajoutée. Recherche Internet non connectée.'}]}];
}
function fileName(r:Resource){return (r.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9-]+/g,'-').slice(0,70)||'farabai')}
function check(r:Resource){if(!r.title.trim())throw new Error('Donnez un titre au contenu.');if(r.kind==='exam'&&!pointsValid(r))throw new Error('Le barème doit correspondre à la note totale avant l’export.');if(!documentGroups(r).some(g=>g.sections.some(s=>s.text.trim())))throw new Error('Chargez un exemple ou rédigez un contenu avant l’export.')}
export async function exportPDF(r:Resource){
 check(r);const {jsPDF}=await import('jspdf');const pdf=new jsPDF();let y=22;
 function page(){pdf.addPage();y=22}
 function text(value:string,size=11,bold=false){
  pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);pdf.setTextColor(bold?'#49315f':'#282332');
  const lines=pdf.splitTextToSize(clean(value)||' ',174) as string[];
  for(const line of lines){if(y>275)page();pdf.text(line,18,y);y+=size*.48+1}y+=4;
 }
 text(`FarabAi - ${toolNames[r.kind]}`,12,true);text(r.title,20,true);text(`${r.subject} | ${r.level} ${r.className} | ${r.duration} min`,10);if(r.isExample)text('Exemple de démonstration - contenu modifiable',9);
 documentGroups(r).forEach((g,i)=>{if(i)page();text(g.title,16,true);for(const s of g.sections){if(y>253)page();text(s.title,13,true);text(s.text)}});
 const count=pdf.getNumberOfPages();for(let i=1;i<=count;i++){pdf.setPage(i);pdf.setFontSize(9);pdf.setTextColor('#6c6179');pdf.text(`FarabAi | ${i} / ${count}`,18,289)}pdf.save(`${fileName(r)}.pdf`);
}
function chunks(text:string,max=620){const words=text.split(/\s+/);const out:string[]=[];let block='';for(const word of words){if(block.length+word.length>max){out.push(block);block=''}block+=(block?' ':'')+word}if(block)out.push(block);return out.length?out:['']}
export async function exportPPT(r:Resource){
 check(r);const {default:PptxGenJS}=await import('pptxgenjs');const ppt=new PptxGenJS();ppt.layout='LAYOUT_WIDE';ppt.author='FarabAi';ppt.subject=r.subject;ppt.title=r.title;ppt.theme={headFontFace:'Aptos',bodyFontFace:'Aptos'};
 function slide(title:string,body:string,cover=false){const s=ppt.addSlide();s.background={color:'11121E'};s.addText('FarabAi',{x:.55,y:.3,w:3,h:.35,color:'D6B775',fontSize:14});s.addText(title,{x:.65,y:cover?2:1.05,w:12,h:cover?1.4:1.1,fontFace:'Aptos',color:'F6F1FC',fontSize:cover?32:25,bold:true,breakLine:false});s.addText(body,{x:.7,y:cover?3.65:2.35,w:11.8,h:cover?2:4.45,fontFace:'Aptos',color:'CDC1E1',fontSize:cover?19:19,breakLine:false,margin:0,paraSpaceAfter:12});s.addText(`${r.level} · ${r.subject}${r.isExample?' · Exemple de démonstration':''}`,{x:.65,y:7,w:11.8,h:.2,fontSize:10,color:'AFA1BE'});}
 slide(r.title,`${toolNames[r.kind]}\n${r.level} ${r.className}\n${r.objectives}`,true);
 for(const group of documentGroups(r)){if(r.kind==='exam'||r.kind==='quiz')slide(group.title,r.title,true);for(const section of group.sections)chunks(section.text).forEach((part,i)=>slide(`${section.title}${i?' (suite)':''}`,part))}
 await ppt.writeFile({fileName:`${fileName(r)}.pptx`});
}
export function createStoryboard(r:Resource):Scene[]{return documentGroups(r)[0].sections.slice(0,8).map(s=>({id:uid(),title:s.title,narration:s.text,onScreen:s.title,seconds:30}))}
