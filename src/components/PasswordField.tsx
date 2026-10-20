import {useState} from 'react';
import {Eye,EyeOff} from 'lucide-react';
export function PasswordField({label='Mot de passe',name='password',autoComplete='current-password'}:{label?:string;name?:string;autoComplete?:string}){
 const [visible,setVisible]=useState(false);
 return <label className="field">{label}<span className="password-field"><input name={name} type={visible?'text':'password'} autoComplete={autoComplete} required minLength={8} placeholder="8 caractères minimum"/><button type="button" aria-label={`${visible?'Masquer':'Afficher'} ${name==='confirm'?'la confirmation du mot de passe':'le mot de passe'}`} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
}
