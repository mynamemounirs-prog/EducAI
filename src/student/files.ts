import type {Note} from './model';
export const MAX_FILE_BYTES=5*1024*1024;
export async function extractFile(file:File){
 const ext=file.name.split('.').pop()?.toLowerCase();if(!['pdf','txt'].includes(ext||'')||file.type&&!['application/pdf','text/plain'].includes(file.type))throw new Error('Format non pris en charge. Choisis un fichier PDF ou TXT.');
 if(!file.size)throw new Error('Ce fichier est vide.');if(file.size>MAX_FILE_BYTES)throw new Error('Le fichier dépasse la limite de 5 Mo.');
 if(ext==='txt'){const text=await file.text();if(text.includes('\0'))throw new Error('Ce fichier ne semble pas être un texte lisible.');if(!text.trim())throw new Error('Aucun texte lisible dans ce fichier.');if(text.length>200000)throw new Error('Le texte dépasse 200 000 caractères. Importe un document plus court.');return text}
 const bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw new Error('Le contenu du fichier n’est pas un PDF valide.');
 const pdfjs=await import('pdfjs-dist');const worker=await import('pdfjs-dist/build/pdf.worker.min.mjs?url');pdfjs.GlobalWorkerOptions.workerSrc=worker.default;
 const task=pdfjs.getDocument({data:bytes,useSystemFonts:true});
 try{const pdf=await task.promise;if(pdf.numPages>100)throw new Error('Ce PDF dépasse la limite de 100 pages.');const pages:string[]=[];let size=0;for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const content=await page.getTextContent();let text='';for(const item of content.items)if('str' in item)text+=item.str+(item.hasEOL?'\n':' ');pages.push(text.trim());size+=text.length;if(size>200000)throw new Error('Le texte dépasse 200 000 caractères. Importe un document plus court.')}const result=pages.join('\n\n');if(!result.trim())throw new Error('Ce PDF ne contient pas de texte extractible. Un PDF scanné nécessite un OCR, qui n’est pas connecté.');return result}finally{await task.destroy()}
}
export async function exportMemo(note:Note){
 const {jsPDF}=await import('jspdf');const pdf=new jsPDF();pdf.setFontSize(18);let y=22;
 for(const [i,paragraph] of [note.title,...note.text.split('\n')].entries()){pdf.setFontSize(i===0?18:11);const lines=pdf.splitTextToSize(paragraph||' ',174) as string[];for(const line of lines){if(y>275){pdf.addPage();y=20}pdf.text(line,18,y);y+=i===0?9:6}y+=2}
 pdf.save(note.title.replace(/[^\p{L}\p{N} -]/gu,'').slice(0,70)+'.pdf');
}
export function downloadSvg(svg:SVGSVGElement,title:string){const copy=svg.cloneNode(true) as SVGSVGElement;copy.setAttribute('xmlns','http://www.w3.org/2000/svg');const blob=new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=(title.replace(/[^\p{L}\p{N} -]/gu,'').slice(0,60)||'schema-mental')+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
