import {useEffect,useId,useRef,useState} from 'react';

/** The robot stays vector-based: eyes, head, body and hand move independently. */
export function Avatar({active=false,small=false}:{active?:boolean;small?:boolean}){
 const id=useId().replace(/:/g,'');const ref=useRef<HTMLButtonElement>(null);const [greeting,setGreeting]=useState(false);
 useEffect(()=>{const timer=window.setTimeout(()=>setGreeting(false),2200);return()=>clearTimeout(timer)},[greeting]);
 useEffect(()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const look=(e:PointerEvent)=>{if(reduced.matches||!ref.current)return;const r=ref.current.getBoundingClientRect();const x=Math.max(-1,Math.min(1,(e.clientX-r.x-r.width/2)/450));const y=Math.max(-1,Math.min(1,(e.clientY-r.y-r.height/2)/450));ref.current.style.setProperty('--look-x',`${x*7}px`);ref.current.style.setProperty('--look-y',`${y*5}px`)};
  window.addEventListener('pointermove',look);return()=>window.removeEventListener('pointermove',look);
 },[]);
 return <button ref={ref} type="button" className={`avatar-wrap robot-wrap ${small?'small':''} ${active||greeting?'excited':''}`} aria-label="Faire coucou à FarabAi" onClick={()=>setGreeting(true)}><svg className="robot-svg" viewBox="0 0 400 480" fill="none" aria-hidden="true">
 <defs>
 <linearGradient id={`${id}-shell`} x1="80" y1="60" x2="310" y2="340" gradientUnits="userSpaceOnUse"><stop stopColor="#fff2de"/><stop offset=".2" stopColor="#d9cbf6"/><stop offset=".45" stopColor="#8275ae"/><stop offset=".66" stopColor="#f5dcc2"/><stop offset="1" stopColor="#69518c"/></linearGradient>
 <linearGradient id={`${id}-gold`} x1="75" y1="100" x2="310" y2="320" gradientUnits="userSpaceOnUse"><stop stopColor="#fff5cf"/><stop offset=".32" stopColor="#b57a44"/><stop offset=".62" stopColor="#ffe6a7"/><stop offset="1" stopColor="#9a6346"/></linearGradient>
 <linearGradient id={`${id}-visor`} x1="130" y1="100" x2="260" y2="235" gradientUnits="userSpaceOnUse"><stop stopColor="#251d3c"/><stop offset=".45" stopColor="#090b18"/><stop offset="1" stopColor="#171029"/></linearGradient>
 <radialGradient id={`${id}-body`} cx=".3" cy=".2" r=".9"><stop stopColor="#f5eaff"/><stop offset=".5" stopColor="#a89acb"/><stop offset="1" stopColor="#504665"/></radialGradient>
 <filter id={`${id}-glow`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4"/></filter>
 <radialGradient id={`${id}-halo`}><stop stopColor="#aa67ff" stopOpacity=".25"/><stop offset="1" stopColor="#8b55dc" stopOpacity="0"/></radialGradient>
 </defs>
 <ellipse cx="192" cy="240" rx="194" ry="207" fill={`url(#${id}-halo)`}/>
 <ellipse className="robot-shadow" cx="195" cy="447" rx="95" ry="14" fill="#080610" opacity=".65"/>
 <g className="robot-float">
 <g className="robot-body">
 <path d="M167 250h57v38h-57z" fill="#292135" stroke={`url(#${id}-gold)`} strokeWidth="4"/>
 <path d="M135 291c17-23 103-24 122 0l17 88c-28 37-116 43-150 0z" fill={`url(#${id}-body)`} stroke={`url(#${id}-shell)`} strokeWidth="3"/>
 <path d="M144 319c18 14 27 60 17 78M244 318c-12 15-20 56-11 77" stroke="#5b4c74" strokeWidth="2"/>
 <ellipse cx="196" cy="339" rx="24" ry="28" fill="#242033" stroke={`url(#${id}-gold)`} strokeWidth="3"/>
 <path d="m195 317 6 15 13 7-13 5-6 17-5-17-13-5 13-7z" fill={`url(#${id}-gold)`}/>
 <path d="M151 401v22c1 15 31 18 34 2l1-17M213 408l1 18c4 14 33 12 35-2v-24" fill={`url(#${id}-shell)`} stroke="#8979a7" strokeWidth="2"/>
 <ellipse cx="162" cy="433" rx="29" ry="12" fill={`url(#${id}-shell)`}/><ellipse cx="239" cy="433" rx="29" ry="12" fill={`url(#${id}-shell)`}/>
 <g className="robot-rest-arm"><ellipse cx="132" cy="304" rx="24" ry="29" transform="rotate(25 132 304)" fill="#24202f" stroke={`url(#${id}-gold)`} strokeWidth="3"/><path d="M112 309c-10 21-8 51 5 66l24-13-3-50" fill={`url(#${id}-shell)`} stroke="#bba6d0" strokeWidth="2"/><path d="M116 369c-8 17-2 30 11 30 12-2 18-19 12-30" fill={`url(#${id}-shell)`}/></g>
 <g className="robot-wave-arm"><ellipse cx="259" cy="305" rx="22" ry="28" transform="rotate(-30 259 305)" fill="#24202f" stroke={`url(#${id}-gold)`} strokeWidth="3"/><path d="M260 297c13-3 24 1 30 13l19 37-25 13-28-37" fill={`url(#${id}-shell)`} stroke="#c3addc" strokeWidth="2"/><circle cx="298" cy="348" r="14" fill="#24202f" stroke={`url(#${id}-gold)`} strokeWidth="3"/><path d="M296 347c10 2 24-8 30-21l15 10c-2 24-14 41-35 41-13-1-20-15-10-30" fill={`url(#${id}-shell)`} stroke="#bba6d0" strokeWidth="2"/>
 <g className="robot-hand"><path d="M323 332c-5-8-7-16-3-19 5-4 9 3 13 7l-2-25c0-9 10-10 12-1l3 22 5-26c2-8 11-5 10 3l-3 27 9-16c5-8 13-2 8 6l-11 23c-7 16-21 21-33 13z" fill={`url(#${id}-shell)`} stroke={`url(#${id}-gold)`} strokeWidth="2"/><path d="m339 322 5 13m8-15 2 13" stroke="#78618e" strokeWidth="2" strokeLinecap="round"/></g></g>
 </g>
 <g className="robot-head">
 <path d="M111 94c23-47 124-62 167-14" stroke={`url(#${id}-gold)`} strokeWidth="4"/><path d="M109 83c21-37 111-63 167-19" stroke="#d4a5fc" strokeOpacity=".5"/>
 <rect x="77" y="126" width="40" height="103" rx="20" transform="rotate(-8 77 126)" fill={`url(#${id}-gold)`}/><rect x="84" y="139" width="24" height="76" rx="12" fill="#382a45" stroke="#efd09f" strokeWidth="3"/>
 <rect x="279" y="115" width="34" height="102" rx="17" transform="rotate(8 279 115)" fill={`url(#${id}-gold)`}/>
 <path d="M105 110c10-48 166-67 184-7 9 28 16 85-1 116-21 40-133 57-168 19-25-26-24-92-15-128z" fill={`url(#${id}-shell)`} stroke="#dfc3f5" strokeWidth="3"/>
 <path d="M121 120c15-32 137-47 153-8 10 25 12 68-1 89-17 29-111 44-139 17-18-18-25-73-13-98z" fill={`url(#${id}-visor)`} stroke="#9d75ca" strokeWidth="3"/>
 <path d="M133 124c16-12 49-24 77-23" stroke="#fcf2ff" strokeOpacity=".2" strokeWidth="6" strokeLinecap="round"/>
 <g className="robot-face"><g className="robot-eyes"><path d="M150 173c2-22 28-25 34-5M222 165c2-22 28-25 34-5" stroke="#bd7bff" strokeWidth="12" strokeLinecap="round" filter={`url(#${id}-glow)`}/><path d="M150 173c2-22 28-25 34-5M222 165c2-22 28-25 34-5" stroke="#ead0ff" strokeWidth="6" strokeLinecap="round"/></g><path d="M187 197q17 15 32-4" stroke="#cf9cff" strokeWidth="3" strokeLinecap="round"/><ellipse cx="144" cy="191" rx="10" ry="4" fill="#b278e8" opacity=".22"/><ellipse cx="260" cy="180" rx="10" ry="4" fill="#b278e8" opacity=".22"/></g>
 <path d="M131 237c37 11 99 4 136-17" stroke={`url(#${id}-gold)`} strokeWidth="3" strokeLinecap="round"/>
 <circle cx="195" cy="72" r="4" fill="#ffe6a7"/>
 </g></g>
 <g className="robot-sparks" fill="#eecf99"><path d="m328 104 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="m69 270 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>
 </svg><span className="robot-interaction-hint">Cliquez pour un petit coucou <span>✦</span></span></button>
}
