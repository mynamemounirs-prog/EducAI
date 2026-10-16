import React, {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
export function Modal({title,children,onClose,wide=false}:{title:string;children:React.ReactNode;onClose:()=>void;wide?:boolean}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement; const d=ref.current!; d.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;d.close();previous?.focus()}},[]);
 function trapFocus(e:React.KeyboardEvent<HTMLDialogElement>){
 if(e.key!=='Tab')return;
 const elements=Array.from(ref.current!.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')).filter(el=>el.getClientRects().length>0);
 const first=elements[0],last=elements[elements.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
 }
 return <dialog onKeyDown={trapFocus} ref={ref} className={wide?'modal wide':'modal'} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}} aria-labelledby="modal-title"><div className="modal-inner"><button className="icon-button close" aria-label="Fermer" onClick={onClose}><X size={20}/></button><h2 id="modal-title">{title}</h2>{children}</div></dialog>
}
